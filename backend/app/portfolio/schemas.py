from decimal import Decimal
from pydantic import BaseModel
from app.market.schemas import DataEnvelope


class HoldingItem(BaseModel):
    symbol: str
    name: str
    quantity: int
    average_price: Decimal
    current_price: DataEnvelope
    invested_value: Decimal
    current_value: Decimal
    pnl: Decimal
    pnl_pct: Decimal
    allocation_pct: Decimal


class PortfolioResponse(BaseModel):
    available_balance: DataEnvelope
    invested_amount: DataEnvelope
    holdings_value: DataEnvelope
    total_portfolio_value: DataEnvelope
    total_pnl: DataEnvelope
    total_pnl_pct: Decimal
    holdings: list[HoldingItem]
    top_holdings: list[HoldingItem]
