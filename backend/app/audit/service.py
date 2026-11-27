import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.models import AuditEvent

GENESIS_HASH = "0" * 64


def record_audit_event(
    db: Session,
    actor_id: str,
    event_type: str,
    entity_id: str,
    details: dict | None = None,
) -> AuditEvent:
    """Append an audit event with a SHA-256 hash chain over the previous event."""
    last_event = db.query(AuditEvent).order_by(AuditEvent.seq.desc()).first()
    prev_hash = last_event.event_hash if last_event else GENESIS_HASH

    ts = datetime.now(timezone.utc)
    details_str = json.dumps(details or {}, sort_keys=True, default=str)
    chain_input = f"{prev_hash}|{ts.isoformat()}|{actor_id}|{event_type}|{entity_id}|{details_str}"
    event_hash = hashlib.sha256(chain_input.encode("utf-8")).hexdigest()

    event = AuditEvent(
        actor_id=actor_id,
        event_type=event_type,
        entity_id=entity_id,
        details=details_str,
        timestamp=ts,
        previous_hash=prev_hash,
        event_hash=event_hash,
    )
    db.add(event)
    db.flush()
    return event
