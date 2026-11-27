from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field


class RuleCreateRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    condition: Literal["PRICE_ABOVE", "PRICE_BELOW"]
    target_price: Decimal = Field(gt=0)


class RuleResponse(BaseModel):
    id: str
    symbol: str
    condition: str
    target_price: Decimal
    status: str
    last_triggered_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
