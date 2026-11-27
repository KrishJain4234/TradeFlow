from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel


DataSource = Literal["live", "delayed", "cached", "demo"]
DataStatus = Literal["ok", "stale", "unavailable"]


class DataEnvelope(BaseModel):
    value: Decimal | None
    currency: str = "INR"
    source: DataSource = "demo"
    as_of: datetime
    status: DataStatus = "ok"


class IndexQuote(BaseModel):
    symbol: str
    name: str
    price: DataEnvelope
    change: Decimal
    change_pct: Decimal


class StockQuoteResponse(BaseModel):
    symbol: str
    name: str
    sector: str
    price: DataEnvelope
    prev_close: Decimal
    change: Decimal
    change_pct: Decimal
    pe_ratio: Decimal
    market_cap_cr: Decimal


class CandlePoint(BaseModel):
    date: datetime
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int


class StockHistoryResponse(BaseModel):
    symbol: str
    range: str
    source: DataSource
    as_of: datetime
    candles: list[CandlePoint]


class WatchlistAddRequest(BaseModel):
    symbol: str


class WatchlistItemResponse(BaseModel):
    symbol: str
    name: str
    price: DataEnvelope
    change: Decimal
    change_pct: Decimal
