import hashlib
from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.models import User, AuditEvent
from app.auth.deps import get_current_user
from app.audit.service import GENESIS_HASH

router = APIRouter(prefix="/api/audit", tags=["audit"])


class AuditEventResponse(BaseModel):
    id: str
    actor_id: str
    event_type: str
    entity_id: str
    details: str
    timestamp: datetime
    previous_hash: str
    event_hash: str

    model_config = {"from_attributes": True}


@router.get("", response_model=list[AuditEventResponse])
def list_audit_events(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "BROKER":
        client_ids = [c.id for c in db.query(User).filter(User.broker_id == user.id).all()]
        actor_ids = [user.id] + client_ids
        return (
            db.query(AuditEvent)
            .filter(AuditEvent.actor_id.in_(actor_ids))
            .order_by(AuditEvent.seq.desc())
            .limit(100)
            .all()
        )
    return (
        db.query(AuditEvent)
        .filter(AuditEvent.actor_id == user.id)
        .order_by(AuditEvent.seq.desc())
        .limit(100)
        .all()
    )


@router.get("/verify")
def verify_audit_chain(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = db.query(AuditEvent).order_by(AuditEvent.seq.asc()).all()
    expected_prev = GENESIS_HASH
    for ev in events:
        if ev.previous_hash != expected_prev:
            return {"valid": False, "broken_at_id": ev.id, "total_checked": len(events)}
        ts_iso = ev.timestamp.isoformat()
        chain_input = f"{ev.previous_hash}|{ts_iso}|{ev.actor_id}|{ev.event_type}|{ev.entity_id}|{ev.details}"
        recomputed = hashlib.sha256(chain_input.encode("utf-8")).hexdigest()
        # Note: SQLite may drop tzinfo on read; handle gracefully if naive
        if recomputed != ev.event_hash and ev.timestamp.tzinfo is None:
            from datetime import timezone
            ts_utc = ev.timestamp.replace(tzinfo=timezone.utc).isoformat()
            chain_input_utc = f"{ev.previous_hash}|{ts_utc}|{ev.actor_id}|{ev.event_type}|{ev.entity_id}|{ev.details}"
            recomputed = hashlib.sha256(chain_input_utc.encode("utf-8")).hexdigest()
        if recomputed != ev.event_hash:
            return {"valid": False, "broken_at_id": ev.id, "total_checked": len(events)}
        expected_prev = ev.event_hash
    return {"valid": True, "total_checked": len(events)}
