import time
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.models import MarketSymbol, MarketCandle, Watchlist, WatchlistItem
from app.market.schemas import (
    DataEnvelope, IndexQuote, StockQuoteResponse, CandlePoint, WatchlistItemResponse
)

# In-memory 60-second TTL cache for optional yfinance quotes
_YF_CACHE: dict[str, tuple[float, Decimal]] = {}
_YF_CACHE_TTL = 60.0


def _try_yfinance_price(symbol: str) -> tuple[Decimal | None, str]:
    """Optional yfinance lookup behind ENABLE_YFINANCE flag with 60s cache."""
    if not settings.ENABLE_YFINANCE:
        return None, "demo"

    now = time.monotonic()
    if symbol in _YF_CACHE:
        ts, cached_price = _YF_CACHE[symbol]
        if now - ts < _YF_CACHE_TTL:
            return cached_price, "cached"

    try:
        import yfinance as yf
        ticker = yf.Ticker(f"{symbol}.NS")
        hist = ticker.history(period="1d")
        if not hist.empty:
            val = Decimal(str(round(float(hist["Close"].iloc[-1]), 2)))
            _YF_CACHE[symbol] = (now, val)
            return val, "delayed"
    except Exception:
        pass
    return None, "demo"


def make_envelope(value: Decimal | None, source: str = "demo", as_of: datetime | None = None, status: str = "ok") -> DataEnvelope:
    return DataEnvelope(
        value=value,
        currency="INR",
        source=source,  # type: ignore[arg-type]
        as_of=as_of or datetime.now(timezone.utc),
        status=status,  # type: ignore[arg-type]
    )


def get_indices() -> list[IndexQuote]:
    now = datetime.now(timezone.utc)
    return [
        IndexQuote(
            symbol="NIFTY50",
            name="NIFTY 50",
            price=make_envelope(Decimal("24185.65"), "demo", now, "ok"),
            change=Decimal("142.30"),
            change_pct=Decimal("0.59"),
        ),
        IndexQuote(
            symbol="SENSEX",
            name="BSE SENSEX",
            price=make_envelope(Decimal("79642.10"), "demo", now, "ok"),
            change=Decimal("418.75"),
            change_pct=Decimal("0.53"),
        ),
    ]


def get_stock_quote(db: Session, symbol: str) -> StockQuoteResponse | None:
    sym = symbol.upper().strip()
    row = db.query(MarketSymbol).filter(MarketSymbol.symbol == sym).first()
    if not row:
        return None

    yf_price, source = _try_yfinance_price(sym)
    current = yf_price if yf_price is not None else row.current_price
    as_of = datetime.now(timezone.utc) if yf_price is not None else (
        row.updated_at.replace(tzinfo=timezone.utc) if row.updated_at.tzinfo is None else row.updated_at
    )

    change = (current - row.prev_close).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    change_pct = (
        ((change / row.prev_close) * Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if row.prev_close > 0 else Decimal("0.00")
    )

    return StockQuoteResponse(
        symbol=row.symbol,
        name=row.name,
        sector=row.sector,
        price=make_envelope(current, source=source, as_of=as_of, status="ok"),
        prev_close=row.prev_close,
        change=change,
        change_pct=change_pct,
        pe_ratio=row.pe_ratio,
        market_cap_cr=row.market_cap_cr,
    )


def list_all_stocks(db: Session) -> list[StockQuoteResponse]:
    rows = db.query(MarketSymbol).order_by(MarketSymbol.symbol).all()
    results = []
    for row in rows:
        quote = get_stock_quote(db, row.symbol)
        if quote:
            results.append(quote)
    return results


def get_stock_history(db: Session, symbol: str, range_key: str = "1M") -> list[CandlePoint]:
    sym = symbol.upper().strip()
    days_map = {"1D": 2, "1W": 7, "1M": 30, "6M": 180, "1Y": 365}
    days = days_map.get(range_key.upper(), 30)
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    candles = (
        db.query(MarketCandle)
        .filter(MarketCandle.symbol == sym, MarketCandle.date >= cutoff)
        .order_by(MarketCandle.date.asc())
        .all()
    )
    return [
        CandlePoint(
            date=c.date, open=c.open, high=c.high, low=c.low, close=c.close, volume=c.volume
        )
        for c in candles
    ]


def get_user_watchlist(db: Session, user_id: str) -> list[WatchlistItemResponse]:
    wl = db.query(Watchlist).filter(Watchlist.user_id == user_id).first()
    if not wl:
        return []
    items = db.query(WatchlistItem).filter(WatchlistItem.watchlist_id == wl.id).all()
    result = []
    for item in items:
        q = get_stock_quote(db, item.symbol)
        if q:
            result.append(
                WatchlistItemResponse(
                    symbol=q.symbol, name=q.name, price=q.price, change=q.change, change_pct=q.change_pct
                )
            )
    return result


def add_watchlist_symbol(db: Session, user_id: str, symbol: str) -> list[WatchlistItemResponse]:
    sym = symbol.upper().strip()
    if not db.query(MarketSymbol).filter(MarketSymbol.symbol == sym).first():
        raise ValueError(f"Unknown symbol: {sym}")

    wl = db.query(Watchlist).filter(Watchlist.user_id == user_id).first()
    if not wl:
        wl = Watchlist(user_id=user_id, name="My Watchlist")
        db.add(wl)
        db.flush()

    exists = db.query(WatchlistItem).filter(
        WatchlistItem.watchlist_id == wl.id, WatchlistItem.symbol == sym
    ).first()
    if not exists:
        db.add(WatchlistItem(watchlist_id=wl.id, symbol=sym))
        db.commit()
    return get_user_watchlist(db, user_id)


def remove_watchlist_symbol(db: Session, user_id: str, symbol: str) -> list[WatchlistItemResponse]:
    sym = symbol.upper().strip()
    wl = db.query(Watchlist).filter(Watchlist.user_id == user_id).first()
    if wl:
        db.query(WatchlistItem).filter(
            WatchlistItem.watchlist_id == wl.id, WatchlistItem.symbol == sym
        ).delete()
        db.commit()
    return get_user_watchlist(db, user_id)
