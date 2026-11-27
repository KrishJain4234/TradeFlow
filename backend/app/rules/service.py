from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.models import ConditionalRule, MarketSymbol, Notification, Order
from app.audit.service import record_audit_event
from app.market.service import get_stock_quote
from app.rules.schemas import RuleCreateRequest


def create_rule(db: Session, user_id: str, payload: RuleCreateRequest) -> ConditionalRule:
    sym = payload.symbol.upper().strip()
    if not db.query(MarketSymbol).filter(MarketSymbol.symbol == sym).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Symbol '{sym}' not found")

    rule = ConditionalRule(
        user_id=user_id,
        symbol=sym,
        condition=payload.condition,
        target_price=payload.target_price,
        status="ACTIVE",
    )
    db.add(rule)
    db.flush()
    record_audit_event(db, user_id, "RULE_CREATED", rule.id, {
        "symbol": sym, "condition": payload.condition, "target_price": str(payload.target_price)
    })
    db.commit()
    db.refresh(rule)
    return rule


def toggle_pause_rule(db: Session, user_id: str, rule_id: str) -> ConditionalRule:
    rule = db.query(ConditionalRule).filter(
        ConditionalRule.id == rule_id, ConditionalRule.user_id == user_id
    ).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    if rule.status == "TRIGGERED":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Triggered rules cannot be paused")

    rule.status = "PAUSED" if rule.status == "ACTIVE" else "ACTIVE"
    record_audit_event(db, user_id, "RULE_STATUS_CHANGED", rule.id, {"status": rule.status})
    db.commit()
    db.refresh(rule)
    return rule


def delete_rule(db: Session, user_id: str, rule_id: str) -> None:
    rule = db.query(ConditionalRule).filter(
        ConditionalRule.id == rule_id, ConditionalRule.user_id == user_id
    ).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    record_audit_event(db, user_id, "RULE_DELETED", rule.id)
    db.delete(rule)
    db.commit()


def evaluate_rules_and_expiry(db: Session) -> dict[str, int]:
    """
    Evaluate all ACTIVE conditional rules (skipping stale/unavailable data, never double-firing)
    and expire any PENDING_APPROVAL orders past their 5-minute window.
    """
    now = datetime.now(timezone.utc)
    triggered_count = 0
    expired_count = 0

    active_rules = db.query(ConditionalRule).filter(ConditionalRule.status == "ACTIVE").all()
    for rule in active_rules:
        quote = get_stock_quote(db, rule.symbol)
        if not quote or quote.price.status != "ok" or quote.price.value is None:
            # Never trigger on stale or unavailable market data
            continue

        current_price = quote.price.value
        hit = (
            (rule.condition == "PRICE_ABOVE" and current_price >= rule.target_price)
            or (rule.condition == "PRICE_BELOW" and current_price <= rule.target_price)
        )
        if hit:
            rule.status = "TRIGGERED"
            rule.last_triggered_at = now
            op_text = "at or above" if rule.condition == "PRICE_ABOVE" else "at or below"
            db.add(Notification(
                user_id=rule.user_id,
                type="RULE_TRIGGERED",
                message=f"Alert Triggered: {rule.symbol} is ₹{current_price} ({op_text} ₹{rule.target_price})",
            ))
            record_audit_event(db, rule.user_id, "RULE_TRIGGERED", rule.id, {
                "symbol": rule.symbol, "price": str(current_price), "target": str(rule.target_price)
            })
            triggered_count += 1

    pending_orders = db.query(Order).filter(Order.status == "PENDING_APPROVAL").all()
    for order in pending_orders:
        exp = order.expires_at if order.expires_at.tzinfo else order.expires_at.replace(tzinfo=timezone.utc)
        if exp < now:
            order.status = "EXPIRED"
            record_audit_event(db, order.user_id, "ORDER_EXPIRED", order.id)
            expired_count += 1

    if triggered_count or expired_count:
        db.commit()

    return {"triggered": triggered_count, "expired": expired_count}
