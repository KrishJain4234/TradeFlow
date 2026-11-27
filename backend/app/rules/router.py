from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.models import User, ConditionalRule
from app.auth.deps import get_current_user, require_csrf
from app.rules.schemas import RuleCreateRequest, RuleResponse
from app.rules.service import create_rule, toggle_pause_rule, delete_rule

router = APIRouter(prefix="/api/rules", tags=["rules"])


@router.get("", response_model=list[RuleResponse])
def list_rules(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(ConditionalRule)
        .filter(ConditionalRule.user_id == user.id)
        .order_by(ConditionalRule.created_at.desc())
        .all()
    )


@router.post("", response_model=RuleResponse, status_code=status.HTTP_201_CREATED)
def add_rule(payload: RuleCreateRequest, user: User = Depends(require_csrf), db: Session = Depends(get_db)):
    return create_rule(db, user.id, payload)


@router.post("/{rule_id}/pause", response_model=RuleResponse)
def pause_rule(rule_id: str, user: User = Depends(require_csrf), db: Session = Depends(get_db)):
    return toggle_pause_rule(db, user.id, rule_id)


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_rule(rule_id: str, user: User = Depends(require_csrf), db: Session = Depends(get_db)):
    delete_rule(db, user.id, rule_id)
