import hashlib
import json
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.models import (
    Order, Approval, Portfolio, Holding, LedgerAccount, LedgerEntry,
    IdempotencyKey, Notification, OutboxEvent, MarketSymbol, gen_uuid
)
from app.core.security import compute_payload_hash
from app.audit.service import record_audit_event
from app.market.service import get_stock_quote, make_envelope
from app.orders.schemas import OrderPreviewRequest, OrderApproveRequest, OrderResponse

Q2 = Decimal("0.01")


def _order_to_response(order: Order, name: str = "", source: str = "demo") -> OrderResponse:
    return OrderResponse(
        order_id=order.id,
        version=order.version,
        payload_hash=order.payload_hash,
        symbol=order.symbol,
        name=name or order.symbol,
        side=order.side,
        quantity=order.quantity,
        order_type=order.order_type,
        indicative_price=make_envelope(order.indicative_price, source=source, as_of=order.created_at, status="ok"),
        estimated_total=order.estimated_total,
        charges=order.charges,
        expires_at=order.expires_at,
        status=order.status,
        required_approvals=json.loads(order.required_approvals),
        approvals_received=json.loads(order.approvals_received),
        created_at=order.created_at,
    )


def create_order_preview(db: Session, user_id: str, req: OrderPreviewRequest) -> OrderResponse:
    quote = get_stock_quote(db, req.symbol)
    if not quote or quote.price.value is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Symbol '{req.symbol}' not found")

    price = quote.price.value.quantize(Q2, rounding=ROUND_HALF_UP)
    estimated_total = (Decimal(req.quantity) * price).quantize(Q2, rounding=ROUND_HALF_UP)
    charges = max(Decimal("1.00"), (estimated_total * Decimal("0.001")).quantize(Q2, rounding=ROUND_HALF_UP))

    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    if req.side == "BUY":
        if portfolio.available_balance < (estimated_total + charges):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance. Required: ₹{estimated_total + charges}, Available: ₹{portfolio.available_balance}",
            )
    else:
        holding = db.query(Holding).filter(
            Holding.portfolio_id == portfolio.id, Holding.symbol == quote.symbol
        ).first()
        if not holding or holding.quantity < req.quantity:
            avail_qty = holding.quantity if holding else 0
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient holdings for {quote.symbol}. Required: {req.quantity}, Available: {avail_qty}",
            )

    version = 1
    payload_str = f"{user_id}:{quote.symbol}:{req.side}:{req.quantity}:{req.order_type}:{price}:{version}"
    payload_hash = compute_payload_hash(payload_str)
    required = ["CLIENT", "BROKER"] if req.requires_broker_approval else ["CLIENT"]
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.ORDER_EXPIRY_MINUTES)

    order = Order(
        user_id=user_id,
        symbol=quote.symbol,
        side=req.side,
        quantity=req.quantity,
        order_type=req.order_type,
        indicative_price=price,
        estimated_total=estimated_total,
        charges=charges,
        status="PENDING_APPROVAL",
        version=version,
        payload_hash=payload_hash,
        required_approvals=json.dumps(required),
        approvals_received=json.dumps([]),
        expires_at=expires_at,
    )
    db.add(order)
    db.flush()

    record_audit_event(db, user_id, "ORDER_PREVIEWED", order.id, {
        "symbol": order.symbol, "side": order.side, "quantity": order.quantity, "total": str(estimated_total)
    })
    db.commit()
    db.refresh(order)
    return _order_to_response(order, name=quote.name, source=quote.price.source)


def execute_simulated_fill(db: Session, order: Order, actor_id: str) -> None:
    """Atomically fill order, update portfolio/holdings, and write immutable ledger & outbox rows."""
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == order.user_id).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    ledger_acc = db.query(LedgerAccount).filter(LedgerAccount.portfolio_id == portfolio.id).first()
    if not ledger_acc:
        ledger_acc = LedgerAccount(portfolio_id=portfolio.id, account_type="CASH_INR")
        db.add(ledger_acc)
        db.flush()

    txn_id = gen_uuid("txn_")

    if order.side == "BUY":
        total_debit = (order.estimated_total + order.charges).quantize(Q2, rounding=ROUND_HALF_UP)
        if portfolio.available_balance < total_debit:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance at execution time")
        portfolio.available_balance = (portfolio.available_balance - total_debit).quantize(Q2, rounding=ROUND_HALF_UP)

        holding = db.query(Holding).filter(
            Holding.portfolio_id == portfolio.id, Holding.symbol == order.symbol
        ).first()
        if holding:
            new_qty = holding.quantity + order.quantity
            total_cost = (Decimal(holding.quantity) * holding.average_price) + order.estimated_total
            holding.average_price = (total_cost / Decimal(new_qty)).quantize(Q2, rounding=ROUND_HALF_UP)
            holding.quantity = new_qty
        else:
            db.add(Holding(
                portfolio_id=portfolio.id,
                symbol=order.symbol,
                quantity=order.quantity,
                average_price=order.indicative_price,
            ))

        db.add(LedgerEntry(
            transaction_id=txn_id,
            account_id=ledger_acc.id,
            debit=total_debit,
            credit=Decimal("0.00"),
            description=f"BUY {order.quantity} {order.symbol} @ {order.indicative_price} (incl. charges {order.charges})",
        ))
    else:  # SELL
        holding = db.query(Holding).filter(
            Holding.portfolio_id == portfolio.id, Holding.symbol == order.symbol
        ).first()
        if not holding or holding.quantity < order.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient holdings at execution time")
        holding.quantity -= order.quantity
        if holding.quantity == 0:
            db.delete(holding)

        net_credit = (order.estimated_total - order.charges).quantize(Q2, rounding=ROUND_HALF_UP)
        portfolio.available_balance = (portfolio.available_balance + net_credit).quantize(Q2, rounding=ROUND_HALF_UP)

        db.add(LedgerEntry(
            transaction_id=txn_id,
            account_id=ledger_acc.id,
            debit=Decimal("0.00"),
            credit=net_credit,
            description=f"SELL {order.quantity} {order.symbol} @ {order.indicative_price} (net of charges {order.charges})",
        ))

    order.status = "FILLED"

    db.add(Notification(
        user_id=order.user_id,
        type="ORDER_FILLED",
        message=f"Order Filled: {order.side} {order.quantity} {order.symbol} @ ₹{order.indicative_price}",
    ))
    db.add(OutboxEvent(
        aggregate_type="ORDER",
        aggregate_id=order.id,
        event_type="ORDER_FILLED",
        payload=json.dumps({
            "order_id": order.id,
            "user_id": order.user_id,
            "symbol": order.symbol,
            "side": order.side,
            "quantity": order.quantity,
            "price": str(order.indicative_price),
            "txn_id": txn_id,
        }),
    ))
    record_audit_event(db, actor_id, "ORDER_FILLED", order.id, {
        "symbol": order.symbol, "side": order.side, "quantity": order.quantity, "txn_id": txn_id
    })


def approve_order_by_client(
    db: Session,
    user_id: str,
    order_id: str,
    req: OrderApproveRequest,
    idempotency_key: str,
) -> OrderResponse:
    if not idempotency_key or not idempotency_key.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Idempotency-Key header is required")

    scope = f"ORDER_APPROVE:{order_id}"
    req_hash = hashlib.sha256(
        f"{order_id}:{req.version}:{req.payload_hash}:{req.method}".encode("utf-8")
    ).hexdigest()

    existing_idp = db.query(IdempotencyKey).filter(
        IdempotencyKey.scope == scope,
        IdempotencyKey.key == idempotency_key,
        IdempotencyKey.user_id == user_id,
    ).first()
    if existing_idp:
        if existing_idp.request_hash != req_hash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Idempotency-Key reused with different request payload",
            )
        return OrderResponse.model_validate_json(existing_idp.response_body)

    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    now = datetime.now(timezone.utc)
    expires_at = order.expires_at if order.expires_at.tzinfo else order.expires_at.replace(tzinfo=timezone.utc)
    if order.status == "EXPIRED" or (order.status == "PENDING_APPROVAL" and expires_at < now):
        order.status = "EXPIRED"
        record_audit_event(db, user_id, "ORDER_EXPIRED", order.id)
        db.commit()
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Order approval window has expired")

    if order.status != "PENDING_APPROVAL":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Order is already in status '{order.status}'")

    if req.version != order.version or req.payload_hash != order.payload_hash:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order version or payload_hash mismatch; fresh preview required",
        )

    received = json.loads(order.approvals_received)
    required = json.loads(order.required_approvals)

    if "CLIENT" not in received:
        received.append("CLIENT")
        order.approvals_received = json.dumps(received)
        db.add(Approval(
            order_id=order.id,
            user_id=user_id,
            role="CLIENT",
            status="APPROVED",
            method=req.method,
            version=order.version,
            payload_hash=order.payload_hash,
        ))
        record_audit_event(db, user_id, "ORDER_CLIENT_APPROVED", order.id, {"method": req.method})

    if all(r in received for r in required):
        execute_simulated_fill(db, order, actor_id=user_id)

    sym_row = db.query(MarketSymbol).filter(MarketSymbol.symbol == order.symbol).first()
    resp = _order_to_response(order, name=sym_row.name if sym_row else order.symbol)

    db.add(IdempotencyKey(
        scope=scope,
        key=idempotency_key,
        user_id=user_id,
        request_hash=req_hash,
        status_code=200,
        response_body=resp.model_dump_json(),
        expires_at=now + timedelta(hours=24),
    ))
    db.commit()
    return resp


def reject_order_by_client(db: Session, user_id: str, order_id: str, reason: str | None = None) -> OrderResponse:
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.status != "PENDING_APPROVAL":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Order cannot be rejected in status '{order.status}'")

    order.status = "REJECTED"
    db.add(Approval(
        order_id=order.id,
        user_id=user_id,
        role="CLIENT",
        status="REJECTED",
        method="UI",
        version=order.version,
        payload_hash=order.payload_hash,
    ))
    record_audit_event(db, user_id, "ORDER_REJECTED", order.id, {"reason": reason or "user_declined"})
    db.commit()

    sym_row = db.query(MarketSymbol).filter(MarketSymbol.symbol == order.symbol).first()
    return _order_to_response(order, name=sym_row.name if sym_row else order.symbol)


def list_user_orders(db: Session, user_id: str) -> list[OrderResponse]:
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    sym_map = {s.symbol: s.name for s in db.query(MarketSymbol).all()}
    return [_order_to_response(o, name=sym_map.get(o.symbol, o.symbol)) for o in orders]
