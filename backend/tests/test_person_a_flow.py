import os
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

# Point tests at a clean temporary SQLite DB before importing app modules
TEST_DB_PATH = Path(__file__).parent / "test_tradeflow.db"
if TEST_DB_PATH.exists():
    TEST_DB_PATH.unlink()

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["ENABLE_YFINANCE"] = "false"
os.environ["POLLINATIONS_API_KEY"] = ""

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.db import SessionLocal, engine
from app.core.models import Order, MarketSymbol
from app.portfolio.service import calculate_portfolio_metrics
from app.rules.service import evaluate_rules_and_expiry


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
    engine.dispose()
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


def test_pure_portfolio_decimal_calculations():
    now = datetime.now(timezone.utc)
    res = calculate_portfolio_metrics(
        available_balance=Decimal("100000.00"),
        raw_holdings=[
            ("INFY", "Infosys", 10, Decimal("1500.00"), Decimal("1600.00"), "demo", now),
            ("TCS", "TCS", 5, Decimal("3500.00"), Decimal("3400.00"), "demo", now),
        ],
    )
    assert res.invested_amount.value == Decimal("32500.00")
    assert res.holdings_value.value == Decimal("33000.00")
    assert res.total_portfolio_value.value == Decimal("133000.00")
    assert res.total_pnl.value == Decimal("500.00")
    assert len(res.top_holdings) == 2
    assert res.top_holdings[0].symbol == "TCS"  # 17000 > 16000


def test_register_csrf_and_market_endpoints(client: TestClient):
    # Register new user
    r = client.post("/api/auth/register", json={
        "name": "Test Investor",
        "email": "investor_test@tradeflow.in",
        "password": "StrongPassword123!",
    })
    assert r.status_code == 201
    csrf = r.json()["csrf_token"]
    assert csrf

    # CSRF must be enforced on POST
    r_no_csrf = client.post("/api/watchlist", json={"symbol": "INFY"})
    assert r_no_csrf.status_code == 403

    # With CSRF it succeeds
    r_wl = client.post("/api/watchlist", json={"symbol": "INFY"}, headers={"X-CSRF-Token": csrf})
    assert r_wl.status_code == 200
    assert any(item["symbol"] == "INFY" for item in r_wl.json())

    # Market envelope checks
    r_stock = client.get("/api/market/stocks/INFY")
    assert r_stock.status_code == 200
    data = r_stock.json()
    assert data["price"]["source"] == "demo"
    assert data["price"]["currency"] == "INR"
    assert data["price"]["status"] == "ok"

    r_hist = client.get("/api/market/stocks/INFY/history?range=1Y")
    assert r_hist.status_code == 200
    assert len(r_hist.json()["candles"]) >= 300


def test_order_preview_approve_idempotency_and_safety(client: TestClient):
    # Login as seeded demo user
    r_login = client.post("/api/auth/login", json={
        "email": "demo@tradeflow.in",
        "password": "Demo1234!",
    })
    assert r_login.status_code == 200
    csrf = r_login.json()["csrf_token"]
    headers = {"X-CSRF-Token": csrf}

    # Preview BUY 10 INFY
    r_prev = client.post("/api/orders/preview", json={
        "symbol": "INFY",
        "side": "BUY",
        "quantity": 10,
        "order_type": "MARKET",
    }, headers=headers)
    assert r_prev.status_code == 200
    preview = r_prev.json()
    assert preview["status"] == "PENDING_APPROVAL"
    order_id = preview["order_id"]

    # Tampered payload_hash -> 409 Conflict
    r_bad_hash = client.post(
        f"/api/orders/{order_id}/approve",
        json={"version": preview["version"], "payload_hash": "sha256:tampered", "method": "UI"},
        headers={**headers, "Idempotency-Key": "key-tampered-1"},
    )
    assert r_bad_hash.status_code == 409

    # Approve twice with same Idempotency-Key -> identical result, filled once
    idp_headers = {**headers, "Idempotency-Key": "key-approve-infy-1"}
    approve_body = {"version": preview["version"], "payload_hash": preview["payload_hash"], "method": "UI"}
    r_app1 = client.post(f"/api/orders/{order_id}/approve", json=approve_body, headers=idp_headers)
    assert r_app1.status_code == 200
    assert r_app1.json()["status"] == "FILLED"

    r_app2 = client.post(f"/api/orders/{order_id}/approve", json=approve_body, headers=idp_headers)
    assert r_app2.status_code == 200
    assert r_app2.json() == r_app1.json()

    # Reusing same Idempotency-Key with different payload -> 409 Conflict
    r_reuse = client.post(
        f"/api/orders/{order_id}/approve",
        json={"version": preview["version"], "payload_hash": preview["payload_hash"], "method": "VOICE"},
        headers=idp_headers,
    )
    assert r_reuse.status_code == 409


def test_expired_order_returns_410(client: TestClient):
    r_login = client.post("/api/auth/login", json={"email": "demo@tradeflow.in", "password": "Demo1234!"})
    csrf = r_login.json()["csrf_token"]
    headers = {"X-CSRF-Token": csrf}

    r_prev = client.post("/api/orders/preview", json={
        "symbol": "WIPRO", "side": "BUY", "quantity": 5, "order_type": "MARKET"
    }, headers=headers)
    assert r_prev.status_code == 200
    preview = r_prev.json()

    # Force expiry in DB
    db = SessionLocal()
    try:
        ord_row = db.query(Order).filter(Order.id == preview["order_id"]).first()
        ord_row.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
        db.commit()
    finally:
        db.close()

    r_exp = client.post(
        f"/api/orders/{preview['order_id']}/approve",
        json={"version": preview["version"], "payload_hash": preview["payload_hash"], "method": "UI"},
        headers={**headers, "Idempotency-Key": "key-expired-1"},
    )
    assert r_exp.status_code == 410


def test_rule_trigger_and_no_double_fire(client: TestClient):
    r_login = client.post("/api/auth/login", json={"email": "demo@tradeflow.in", "password": "Demo1234!"})
    csrf = r_login.json()["csrf_token"]
    headers = {"X-CSRF-Token": csrf}

    # TCS seeded price is 3480.50; rule TCS <= 3500 should trigger immediately on evaluation
    r_rule = client.post("/api/rules", json={
        "symbol": "TCS",
        "condition": "PRICE_BELOW",
        "target_price": 3500.00,
    }, headers=headers)
    assert r_rule.status_code == 201
    rule_id = r_rule.json()["id"]

    db = SessionLocal()
    try:
        res1 = evaluate_rules_and_expiry(db)
        assert res1["triggered"] >= 1
        res2 = evaluate_rules_and_expiry(db)
        assert res2["triggered"] == 0  # Never double-fires
    finally:
        db.close()

    r_rules = client.get("/api/rules")
    matched = [x for x in r_rules.json() if x["id"] == rule_id][0]
    assert matched["status"] == "TRIGGERED"

    r_notifs = client.get("/api/notifications")
    assert any("TCS" in n["message"] for n in r_notifs.json())


def test_broker_approval_and_audit_chain(client: TestClient):
    # Login as broker
    r_login = client.post("/api/auth/login", json={
        "email": "broker@tradeflow.in",
        "password": "Broker1234!",
    })
    assert r_login.status_code == 200
    csrf = r_login.json()["csrf_token"]
    headers = {"X-CSRF-Token": csrf}

    r_reqs = client.get("/api/broker/requests")
    assert r_reqs.status_code == 200
    pending = [r for r in r_reqs.json() if r["status"] == "PENDING_APPROVAL"]
    assert len(pending) >= 1

    target_order_id = pending[0]["order_id"]
    r_app = client.post(f"/api/broker/requests/{target_order_id}/approve", headers=headers)
    assert r_app.status_code == 200
    assert r_app.json()["status"] == "FILLED"

    # Verify cryptographic audit hash chain
    r_verify = client.get("/api/audit/verify")
    assert r_verify.status_code == 200
    assert r_verify.json()["valid"] is True
