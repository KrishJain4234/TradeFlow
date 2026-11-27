from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.models import User
from app.auth.deps import get_current_user, require_csrf
from app.market.schemas import (
    IndexQuote, StockQuoteResponse, StockHistoryResponse, WatchlistAddRequest, WatchlistItemResponse
)
from app.market.service import (
    get_indices, get_stock_quote, list_all_stocks, get_stock_history,
    get_user_watchlist, add_watchlist_symbol, remove_watchlist_symbol
)

router = APIRouter(tags=["market"])


@router.get("/api/market/indices", response_model=list[IndexQuote])
def read_indices():
    return get_indices()


@router.get("/api/market/stocks", response_model=list[StockQuoteResponse])
def read_all_stocks(db: Session = Depends(get_db)):
    return list_all_stocks(db)


@router.get("/api/market/stocks/{symbol}", response_model=StockQuoteResponse)
def read_stock(symbol: str, db: Session = Depends(get_db)):
    quote = get_stock_quote(db, symbol)
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Symbol '{symbol}' not found")
    return quote


@router.get("/api/market/stocks/{symbol}/history", response_model=StockHistoryResponse)
def read_stock_history(
    symbol: str,
    range: str = Query("1M", pattern="^(1D|1W|1M|6M|1Y)$"),
    db: Session = Depends(get_db),
):
    quote = get_stock_quote(db, symbol)
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Symbol '{symbol}' not found")
    candles = get_stock_history(db, symbol, range)
    return StockHistoryResponse(
        symbol=quote.symbol,
        range=range,
        source=quote.price.source,
        as_of=datetime.now(timezone.utc),
        candles=candles,
    )


@router.get("/api/watchlist", response_model=list[WatchlistItemResponse])
def read_watchlist(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_watchlist(db, user.id)


@router.post("/api/watchlist", response_model=list[WatchlistItemResponse])
def add_watchlist(
    payload: WatchlistAddRequest,
    user: User = Depends(require_csrf),
    db: Session = Depends(get_db),
):
    try:
        return add_watchlist_symbol(db, user.id, payload.symbol)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/api/watchlist/{symbol}", response_model=list[WatchlistItemResponse])
def delete_watchlist(
    symbol: str,
    user: User = Depends(require_csrf),
    db: Session = Depends(get_db),
):
    return remove_watchlist_symbol(db, user.id, symbol)
