from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.models import User
from app.auth.deps import get_current_user, require_csrf
from app.orders.schemas import (
    OrderPreviewRequest, OrderApproveRequest, OrderRejectRequest, OrderResponse
)
from app.orders.service import (
    create_order_preview, approve_order_by_client, reject_order_by_client, list_user_orders
)

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("/preview", response_model=OrderResponse)
def preview_order(
    payload: OrderPreviewRequest,
    user: User = Depends(require_csrf),
    db: Session = Depends(get_db),
):
    return create_order_preview(db, user.id, payload)


@router.post("/{order_id}/approve", response_model=OrderResponse)
def approve_order(
    order_id: str,
    payload: OrderApproveRequest,
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
    user: User = Depends(require_csrf),
    db: Session = Depends(get_db),
):
    return approve_order_by_client(db, user.id, order_id, payload, idempotency_key)


@router.post("/{order_id}/reject", response_model=OrderResponse)
def reject_order(
    order_id: str,
    payload: OrderRejectRequest | None = None,
    user: User = Depends(require_csrf),
    db: Session = Depends(get_db),
):
    return reject_order_by_client(db, user.id, order_id, payload.reason if payload else None)


@router.get("", response_model=list[OrderResponse])
def get_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_user_orders(db, user.id)
