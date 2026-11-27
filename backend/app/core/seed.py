import math
import json
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy.orm import Session
from app.core.db import Base, engine, SessionLocal
from app.core.models import (
    User, Portfolio, Holding, Watchlist, WatchlistItem,
    MarketSymbol, MarketCandle, LedgerAccount, LedgerEntry,
    Order, ConditionalRule
)
from app.core.security import hash_password, compute_payload_hash


NSE_SYMBOLS = [
    ("INFY", "Infosys Ltd", "IT Services", Decimal("1523.40"), Decimal("1508.20"), Decimal("24.80"), Decimal("632400.00")),
    ("TCS", "Tata Consultancy Services", "IT Services", Decimal("3480.50"), Decimal("3515.00"), Decimal("28.40"), Decimal("1258000.00")),
    ("RELIANCE", "Reliance Industries Ltd", "Energy & Retail", Decimal("2465.75"), Decimal("2492.10"), Decimal("26.10"), Decimal("1668000.00")),
    ("HDFCBANK", "HDFC Bank Ltd", "Banking", Decimal("1642.30"), Decimal("1630.00"), Decimal("18.90"), Decimal("1245000.00")),
    ("ICICIBANK", "ICICI Bank Ltd", "Banking", Decimal("1215.80"), Decimal("1204.50"), Decimal("19.40"), Decimal("854000.00")),
    ("TATAMOTORS", "Tata Motors Ltd", "Automotive", Decimal("945.60"), Decimal("932.40"), Decimal("11.20"), Decimal("348000.00")),
    ("ITC", "ITC Ltd", "FMCG", Decimal("478.25"), Decimal("474.90"), Decimal("27.50"), Decimal("596000.00")),
    ("SBIN", "State Bank of India", "Banking", Decimal("812.90"), Decimal("805.00"), Decimal("10.80"), Decimal("725000.00")),
    ("BHARTIARTL", "Bharti Airtel Ltd", "Telecom", Decimal("1588.40"), Decimal("1572.00"), Decimal("54.20"), Decimal("902000.00")),
    ("WIPRO", "Wipro Ltd", "IT Services", Decimal("564.15"), Decimal("558.90"), Decimal("22.30"), Decimal("295000.00")),
]


def _generate_candles(symbol: str, current_price: Decimal, days: int = 365) -> list[MarketCandle]:
    """Generate deterministic, realistic 1-year daily OHLCV candles ending at current_price."""
    candles = []
    now = datetime.now(timezone.utc).replace(hour=10, minute=0, second=0, microsecond=0)
    seed_offset = sum(ord(c) for c in symbol)
    base_float = float(current_price) * 0.86  # ~14% growth over 1 year

    prices = []
    p = base_float
    for i in range(days):
        wave = math.sin((i + seed_offset) * 0.12) * 0.014 + math.cos((i + seed_offset) * 0.05) * 0.008
        drift = 0.0004
        p = p * (1.0 + drift + wave)
        prices.append(p)

    # Scale so last close matches current_price
    scale = float(current_price) / prices[-1]
    for i, raw_p in enumerate(prices):
        close_val = round(raw_p * scale, 2)
        open_val = round(close_val * (1.0 - math.sin((i + seed_offset) * 0.3) * 0.006), 2)
        high_val = round(max(open_val, close_val) * (1.0 + abs(math.cos(i * 0.4)) * 0.009), 2)
        low_val = round(min(open_val, close_val) * (1.0 - abs(math.sin(i * 0.4)) * 0.009), 2)
        vol = 1200000 + ((i * 7919 + seed_offset * 101) % 3500000)
        candle_date = now - timedelta(days=(days - 1 - i))
        candles.append(
            MarketCandle(
                symbol=symbol,
                date=candle_date,
                open=Decimal(f"{open_val:.2f}"),
                high=Decimal(f"{high_val:.2f}"),
                low=Decimal(f"{low_val:.2f}"),
                close=Decimal(f"{close_val:.2f}"),
                volume=vol,
            )
        )
    return candles


def seed_database(db: Session) -> None:
    # 1. Seed Market Symbols & 1-year Candles
    existing_symbols = {s.symbol for s in db.query(MarketSymbol).all()}
    for sym, name, sector, price, prev_close, pe, mcap in NSE_SYMBOLS:
        if sym not in existing_symbols:
            db.add(MarketSymbol(
                symbol=sym, name=name, sector=sector,
                current_price=price, prev_close=prev_close,
                pe_ratio=pe, market_cap_cr=mcap
            ))
            db.flush()
            db.add_all(_generate_candles(sym, price, days=365))

    # 2. Seed Users (Demo Broker + Demo Investor + 2 Clients)
    broker = db.query(User).filter(User.email == "broker@tradeflow.in").first()
    if not broker:
        broker = User(
            id="usr_broker_01",
            name="Rajesh Sharma (Sub-Broker)",
            email="broker@tradeflow.in",
            password_hash=hash_password("Broker1234!"),
            role="BROKER",
            preferred_language="en",
        )
        db.add(broker)
        db.flush()

    demo_user = db.query(User).filter(User.email == "demo@tradeflow.in").first()
    if not demo_user:
        demo_user = User(
            id="usr_demo_01",
            name="Aarav Mehta",
            email="demo@tradeflow.in",
            password_hash=hash_password("Demo1234!"),
            role="CLIENT",
            broker_id=broker.id,
            preferred_language="en",
        )
        db.add(demo_user)
        db.flush()

        portfolio = Portfolio(id="prt_demo_01", user_id=demo_user.id, available_balance=Decimal("500000.00"))
        db.add(portfolio)
        db.flush()

        ledger_acc = LedgerAccount(id="lac_demo_01", portfolio_id=portfolio.id, account_type="CASH_INR")
        db.add(ledger_acc)
        db.flush()
        db.add(LedgerEntry(
            transaction_id="txn_seed_01",
            account_id=ledger_acc.id,
            debit=Decimal("0.00"),
            credit=Decimal("500000.00"),
            description="Initial Demo Capital Deposit",
        ))

        db.add_all([
            Holding(portfolio_id=portfolio.id, symbol="INFY", quantity=25, average_price=Decimal("1480.00")),
            Holding(portfolio_id=portfolio.id, symbol="TCS", quantity=10, average_price=Decimal("3520.00")),
            Holding(portfolio_id=portfolio.id, symbol="RELIANCE", quantity=30, average_price=Decimal("2410.00")),
        ])

        wl = Watchlist(id="wtl_demo_01", user_id=demo_user.id, name="My Watchlist")
        db.add(wl)
        db.flush()
        for sym in ["INFY", "TCS", "RELIANCE", "HDFCBANK", "TATAMOTORS"]:
            db.add(WatchlistItem(watchlist_id=wl.id, symbol=sym))

        # Seed a default rule
        db.add(ConditionalRule(
            id="rul_demo_01",
            user_id=demo_user.id,
            symbol="TCS",
            condition="PRICE_BELOW",
            target_price=Decimal("3500.00"),
            status="ACTIVE",
        ))

    # 3. Seed 2 additional broker clients
    clients_spec = [
        ("usr_client_01", "Priya Nair", "client1@tradeflow.in", Decimal("350000.00"), "HDFCBANK", 15, Decimal("1620.00")),
        ("usr_client_02", "Vikram Patel", "client2@tradeflow.in", Decimal("200000.00"), "TATAMOTORS", 20, Decimal("910.00")),
    ]
    for cid, cname, cemail, cbal, csym, cqty, cavg in clients_spec:
        if not db.query(User).filter(User.email == cemail).first():
            cuser = User(
                id=cid, name=cname, email=cemail,
                password_hash=hash_password("Client1234!"),
                role="CLIENT", broker_id=broker.id, preferred_language="en"
            )
            db.add(cuser)
            db.flush()
            cport = Portfolio(user_id=cuser.id, available_balance=cbal)
            db.add(cport)
            db.flush()
            clac = LedgerAccount(portfolio_id=cport.id, account_type="CASH_INR")
            db.add(clac)
            db.add(Holding(portfolio_id=cport.id, symbol=csym, quantity=cqty, average_price=cavg))

            # Seed one pending broker approval order for client1
            if cid == "usr_client_01":
                payload_hash = compute_payload_hash("HDFCBANK:BUY:50:MARKET:1642.30:1")
                db.add(Order(
                    id="ord_broker_demo_01",
                    user_id=cuser.id,
                    symbol="HDFCBANK",
                    side="BUY",
                    quantity=50,
                    order_type="MARKET",
                    indicative_price=Decimal("1642.30"),
                    estimated_total=Decimal("82115.00"),
                    charges=Decimal("82.12"),
                    status="PENDING_APPROVAL",
                    version=1,
                    payload_hash=payload_hash,
                    required_approvals=json.dumps(["CLIENT", "BROKER"]),
                    approvals_received=json.dumps(["CLIENT"]),
                    expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
                ))

    db.commit()


def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        print("TradeFlow database seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
