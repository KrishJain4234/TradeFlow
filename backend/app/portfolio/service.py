from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Sequence
from sqlalchemy.orm import Session
from app.core.models import Portfolio, Holding
from app.market.service import get_stock_quote, make_envelope
from app.portfolio.schemas import HoldingItem, PortfolioResponse


def calculate_portfolio_metrics(
    available_balance: Decimal,
    raw_holdings: Sequence[tuple[str, str, int, Decimal, Decimal, str, datetime]],
) -> PortfolioResponse:
    """
    Pure Python Decimal calculation for portfolio value, P/L, allocation, and top holdings.
    raw_holdings tuple: (symbol, name, quantity, avg_price, current_price, source, as_of)
    """
    q2 = Decimal("0.01")
    total_invested = Decimal("0.00")
    total_holdings_val = Decimal("0.00")

    intermediate = []
    for symbol, name, qty, avg_price, cur_price, source, as_of in raw_holdings:
        if qty <= 0:
            continue
        inv = (Decimal(qty) * avg_price).quantize(q2, rounding=ROUND_HALF_UP)
        cur = (Decimal(qty) * cur_price).quantize(q2, rounding=ROUND_HALF_UP)
        pnl = (cur - inv).quantize(q2, rounding=ROUND_HALF_UP)
        pnl_pct = ((pnl / inv) * Decimal("100")).quantize(q2, rounding=ROUND_HALF_UP) if inv > 0 else Decimal("0.00")

        total_invested += inv
        total_holdings_val += cur
        intermediate.append((symbol, name, qty, avg_price, cur_price, source, as_of, inv, cur, pnl, pnl_pct))

    holdings_items: list[HoldingItem] = []
    for symbol, name, qty, avg_price, cur_price, source, as_of, inv, cur, pnl, pnl_pct in intermediate:
        alloc_pct = (
            ((cur / total_holdings_val) * Decimal("100")).quantize(q2, rounding=ROUND_HALF_UP)
            if total_holdings_val > 0 else Decimal("0.00")
        )
        holdings_items.append(
            HoldingItem(
                symbol=symbol,
                name=name,
                quantity=qty,
                average_price=avg_price.quantize(q2, rounding=ROUND_HALF_UP),
                current_price=make_envelope(cur_price, source=source, as_of=as_of, status="ok"),
                invested_value=inv,
                current_value=cur,
                pnl=pnl,
                pnl_pct=pnl_pct,
                allocation_pct=alloc_pct,
            )
        )

    total_portfolio_val = (available_balance + total_holdings_val).quantize(q2, rounding=ROUND_HALF_UP)
    total_pnl = (total_holdings_val - total_invested).quantize(q2, rounding=ROUND_HALF_UP)
    total_pnl_pct = (
        ((total_pnl / total_invested) * Decimal("100")).quantize(q2, rounding=ROUND_HALF_UP)
        if total_invested > 0 else Decimal("0.00")
    )

    now = datetime.now(timezone.utc)
    top_holdings = sorted(holdings_items, key=lambda h: h.current_value, reverse=True)[:5]

    return PortfolioResponse(
        available_balance=make_envelope(available_balance.quantize(q2, rounding=ROUND_HALF_UP), "demo", now, "ok"),
        invested_amount=make_envelope(total_invested, "demo", now, "ok"),
        holdings_value=make_envelope(total_holdings_val, "demo", now, "ok"),
        total_portfolio_value=make_envelope(total_portfolio_val, "demo", now, "ok"),
        total_pnl=make_envelope(total_pnl, "demo", now, "ok"),
        total_pnl_pct=total_pnl_pct,
        holdings=holdings_items,
        top_holdings=top_holdings,
    )


def get_user_portfolio(db: Session, user_id: str) -> PortfolioResponse:
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
    if not portfolio:
        return calculate_portfolio_metrics(Decimal("0.00"), [])

    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
    raw = []
    for h in holdings:
        quote = get_stock_quote(db, h.symbol)
        if quote and quote.price.value is not None:
            raw.append((
                h.symbol,
                quote.name,
                h.quantity,
                h.average_price,
                quote.price.value,
                quote.price.source,
                quote.price.as_of,
            ))
    return calculate_portfolio_metrics(portfolio.available_balance, raw)
