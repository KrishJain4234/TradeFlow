from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class BrokerClientResponse(BaseModel):
    id: str
    name: str
    email: str


class BrokerRequestResponse(BaseModel):
    order_id: str
    client_id: str
    client_name: str
    symbol: str
    side: str
    quantity: int
    indicative_price: Decimal
    estimated_total: Decimal
    status: str
    required_approvals: list[str]
    approvals_received: list[str]
    expires_at: datetime
    created_at: datetime


class BrokerDecisionRequest(BaseModel):
    reason: str | None = None
