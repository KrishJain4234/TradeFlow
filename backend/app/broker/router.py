import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.models import User, Order, Approval, Notification
from app.auth.deps import require_broker, require_broker_csrf
from app.audit.service import record_audit_event
from app.orders.service import execute_simulated_fill
from app.broker.schemas import BrokerClientResponse, BrokerRequestResponse, BrokerDecisionRequest

router = APIRouter(prefix="/api/broker", tags=["broker"])


def _get_broker_client_ids(db: Session, broker_id: str) -> dict[str, User]:
    clients = db.query(User).filter(User.broker_id == broker_id, User.role == "CLIENT").all()
    return {c.id: c for c in clients}


@router.get("/clients", response_model=list[BrokerClientResponse])
def list_clients(broker: User = Depends(require_broker), db: Session = Depends(get_db)):
    clients = db.query(User).filter(User.broker_id == broker.id, User.role == "CLIENT").all()
    return [BrokerClientResponse(id=c.id, name=c.name, email=c.email) for c in clients]


@router.get("/requests", response_model=list[BrokerRequestResponse])
def list_requests(broker: User = Depends(require_broker), db: Session = Depends(get_db)):
    client_map = _get_broker_client_ids(db, broker.id)
    if not client_map:
        return []

    orders = (
        db.query(Order)
        .filter(Order.user_id.in_(list(client_map.keys())))
        .order_by(Order.created_at.desc())
        .all()
    )
    results = []
    for o in orders:
        req_app = json.loads(o.required_approvals)
        if "BROKER" in req_app:
            results.append(
                BrokerRequestResponse(
                    order_id=o.id,
                    client_id=o.user_id,
                    client_name=client_map[o.user_id].name,
                    symbol=o.symbol,
                    side=o.side,
                    quantity=o.quantity,
                    indicative_price=o.indicative_price,
                    estimated_total=o.estimated_total,
                    status=o.status,
                    required_approvals=req_app,
                    approvals_received=json.loads(o.approvals_received),
                    expires_at=o.expires_at,
                    created_at=o.created_at,
                )
            )
    return results


@router.post("/requests/{order_id}/approve", response_model=BrokerRequestResponse)
def approve_broker_request(
    order_id: str,
    broker: User = Depends(require_broker_csrf),
    db: Session = Depends(get_db),
):
    client_map = _get_broker_client_ids(db, broker.id)
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order or order.user_id not in client_map:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found for your clients")

    now = datetime.now(timezone.utc)
    exp = order.expires_at if order.expires_at.tzinfo else order.expires_at.replace(tzinfo=timezone.utc)
    if order.status == "EXPIRED" or (order.status == "PENDING_APPROVAL" and exp < now):
        order.status = "EXPIRED"
        db.commit()
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Order has expired")

    if order.status != "PENDING_APPROVAL":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Order is in status '{order.status}'")

    required = json.loads(order.required_approvals)
    received = json.loads(order.approvals_received)

    if "BROKER" not in received:
        received.append("BROKER")
        order.approvals_received = json.dumps(received)
        db.add(Approval(
            order_id=order.id,
            user_id=broker.id,
            role="BROKER",
            status="APPROVED",
            method="UI",
            version=order.version,
            payload_hash=order.payload_hash,
        ))
        record_audit_event(db, broker.id, "ORDER_BROKER_APPROVED", order.id, {"client_id": order.user_id})

    db.add(Notification(
        user_id=order.user_id,
        type="BROKER_APPROVAL",
        message=f"Broker approved your {order.side} {order.quantity} {order.symbol} order.",
    ))

    if all(r in received for r in required):
        execute_simulated_fill(db, order, actor_id=broker.id)

    db.commit()
    db.refresh(order)

    return BrokerRequestResponse(
        order_id=order.id,
        client_id=order.user_id,
        client_name=client_map[order.user_id].name,
        symbol=order.symbol,
        side=order.side,
        quantity=order.quantity,
        indicative_price=order.indicative_price,
        estimated_total=order.estimated_total,
        status=order.status,
        required_approvals=required,
        approvals_received=json.loads(order.approvals_received),
        expires_at=order.expires_at,
        created_at=order.created_at,
    )


@router.post("/requests/{order_id}/reject", response_model=BrokerRequestResponse)
def reject_broker_request(
    order_id: str,
    payload: BrokerDecisionRequest | None = None,
    broker: User = Depends(require_broker_csrf),
    db: Session = Depends(get_db),
):
    client_map = _get_broker_client_ids(db, broker.id)
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order or order.user_id not in client_map:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found for your clients")

    if order.status != "PENDING_APPROVAL":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Order is in status '{order.status}'")

    order.status = "REJECTED"
    db.add(Approval(
        order_id=order.id,
        user_id=broker.id,
        role="BROKER",
        status="REJECTED",
        method="UI",
        version=order.version,
        payload_hash=order.payload_hash,
    ))
    record_audit_event(db, broker.id, "ORDER_BROKER_REJECTED", order.id, {
        "reason": payload.reason if payload else "broker_rejected"
    })
    db.add(Notification(
        user_id=order.user_id,
        type="BROKER_APPROVAL",
        message=f"Broker rejected your {order.side} {order.quantity} {order.symbol} order.",
    ))
    db.commit()
    db.refresh(order)

    return BrokerRequestResponse(
        order_id=order.id,
        client_id=order.user_id,
        client_name=client_map[order.user_id].name,
        symbol=order.symbol,
        side=order.side,
        quantity=order.quantity,
        indicative_price=order.indicative_price,
        estimated_total=order.estimated_total,
        status=order.status,
        required_approvals=json.loads(order.required_approvals),
        approvals_received=json.loads(order.approvals_received),
        expires_at=order.expires_at,
        created_at=order.created_at,
    )
