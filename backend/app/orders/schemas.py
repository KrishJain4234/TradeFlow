from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field
from app.market.schemas import DataEnvelope


class OrderPreviewRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    side: Literal["BUY", "SELL"]
    quantity: int = Field(gt=0, le=100000)
    order_type: Literal["MARKET", "LIMIT"] = "MARKET"
    requires_broker_approval: bool = False


class OrderApproveRequest(BaseModel):
    version: int
    payload_hash: str
    method: Literal["UI", "VOICE"] = "UI"


class OrderRejectRequest(BaseModel):
    reason: str | None = None


class OrderResponse(BaseModel):
    order_id: str
    version: int
    payload_hash: str
    symbol: str
    name: str
    side: str
    quantity: int
    order_type: str
    indicative_price: DataEnvelope
    estimated_total: Decimal
    charges: Decimal
    expires_at: datetime
    status: str
    required_approvals: list[str]
    approvals_received: list[str] = []
    created_at: datetime | None = None
