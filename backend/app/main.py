import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import Base, engine, SessionLocal, get_db
from app.core.seed import seed_database
from app.core.models import User
from app.auth.deps import get_current_user
from app.auth.router import router as auth_router
from app.market.router import router as market_router
from app.market.service import get_indices, get_user_watchlist
from app.portfolio.router import router as portfolio_router
from app.portfolio.service import get_user_portfolio
from app.orders.router import router as orders_router
from app.orders.service import list_user_orders
from app.rules.router import router as rules_router
from app.rules.service import evaluate_rules_and_expiry
from app.broker.router import router as broker_router
from app.audit.router import router as audit_router
from app.notifications.router import router as notifications_router

logger = logging.getLogger("tradeflow")


async def _background_worker():
    while True:
        try:
            await asyncio.sleep(settings.RULE_EVAL_INTERVAL_SECONDS)
            db = SessionLocal()
            try:
                evaluate_rules_and_expiry(db)
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as exc:
            logger.exception("Background rule evaluator error: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    task = asyncio.create_task(_background_worker())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="TradeFlow API",
    version="1.0.0",
    description="Voice-first financial access platform backend",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(market_router)
app.include_router(portfolio_router)
app.include_router(orders_router)
app.include_router(rules_router)
app.include_router(broker_router)
app.include_router(audit_router)
app.include_router(notifications_router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "yfinance_enabled": settings.ENABLE_YFINANCE,
        "anthropic_configured": bool(settings.ANTHROPIC_API_KEY),
        "sarvam_configured": bool(settings.SARVAM_API_KEY),
        "wispr_configured": bool(settings.WISPR_API_KEY),
    }


@app.get("/api/dashboard")
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {
        "indices": get_indices(),
        "watchlist": get_user_watchlist(db, user.id),
        "portfolio": get_user_portfolio(db, user.id),
        "recent_orders": list_user_orders(db, user.id)[:5],
    }


class AssistantStubRequest(BaseModel):
    message: str
    language: str = "en"


@app.post("/api/assistant/message")
def assistant_stub(payload: AssistantStubRequest):
    """Contract 2 stub endpoint for Person B & Person C parallel development."""
    return {
        "intent": "GENERAL_QUERY",
        "message": f"Demo stub received: '{payload.message}'. Person B's assistant module will replace this.",
        "language": payload.language,
        "requires_clarification": False,
        "clarification_question": None,
        "action_type": "NONE",
        "action_payload": {},
        "requires_approval": False,
        "sources": [],
        "ui_action": "STAY",
        "suggested_actions": [],
        "extracted_entities": {},
    }
