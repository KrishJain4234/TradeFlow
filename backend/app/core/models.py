import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import (
    String, Integer, BigInteger, Numeric, DateTime, ForeignKey, Text, UniqueConstraint, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def gen_uuid(prefix: str = "") -> str:
    uid = uuid.uuid4().hex[:12]
    return f"{prefix}{uid}" if prefix else uid


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("usr_"))
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="CLIENT", nullable=False)  # CLIENT | BROKER
    broker_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("ses_"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    csrf_token: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("prt_"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    available_balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("500000.00"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    holdings: Mapped[list["Holding"]] = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")


class Holding(Base):
    __tablename__ = "holdings"
    __table_args__ = (UniqueConstraint("portfolio_id", "symbol", name="uq_holding_portfolio_symbol"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("hld_"))
    portfolio_id: Mapped[str] = mapped_column(String(36), ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_price: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0.00"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="holdings")


class Watchlist(Base):
    __tablename__ = "watchlists"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("wtl_"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(80), default="Default", nullable=False)

    items: Mapped[list["WatchlistItem"]] = relationship("WatchlistItem", back_populates="watchlist", cascade="all, delete-orphan")


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"
    __table_args__ = (UniqueConstraint("watchlist_id", "symbol", name="uq_watchlist_symbol"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("wli_"))
    watchlist_id: Mapped[str] = mapped_column(String(36), ForeignKey("watchlists.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)

    watchlist: Mapped["Watchlist"] = relationship("Watchlist", back_populates="items")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("ord_"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    side: Mapped[str] = mapped_column(String(10), nullable=False)  # BUY | SELL
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    order_type: Mapped[str] = mapped_column(String(20), default="MARKET", nullable=False)  # MARKET | LIMIT
    indicative_price: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    estimated_total: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    charges: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0.00"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="PENDING_APPROVAL", nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    payload_hash: Mapped[str] = mapped_column(String(80), nullable=False)
    required_approvals: Mapped[str] = mapped_column(Text, default='["CLIENT"]', nullable=False)
    approvals_received: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("apr_"))
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # CLIENT | BROKER
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # APPROVED | REJECTED
    method: Mapped[str] = mapped_column(String(20), default="UI", nullable=False)  # UI | VOICE
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    payload_hash: Mapped[str] = mapped_column(String(80), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ConditionalRule(Base):
    __tablename__ = "conditional_rules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("rul_"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    condition: Mapped[str] = mapped_column(String(30), nullable=False)  # PRICE_ABOVE | PRICE_BELOW
    target_price: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False, index=True)  # ACTIVE | PAUSED | TRIGGERED
    last_triggered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("ntf_"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(30), nullable=False)  # RULE_TRIGGERED | ORDER_FILLED | BROKER_APPROVAL
    message: Mapped[str] = mapped_column(Text, nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    seq: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: gen_uuid("aud_"))
    actor_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(60), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    details: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    previous_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    event_hash: Mapped[str] = mapped_column(String(64), nullable=False)


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    __table_args__ = (UniqueConstraint("scope", "key", "user_id", name="uq_idempotency_scope_key_user"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("idp_"))
    scope: Mapped[str] = mapped_column(String(60), nullable=False)
    key: Mapped[str] = mapped_column(String(120), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    request_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    status_code: Mapped[int] = mapped_column(Integer, nullable=False)
    response_body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class LedgerAccount(Base):
    __tablename__ = "ledger_accounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("lac_"))
    portfolio_id: Mapped[str] = mapped_column(String(36), ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    account_type: Mapped[str] = mapped_column(String(30), default="CASH_INR", nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("lgr_"))
    transaction_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    account_id: Mapped[str] = mapped_column(String(36), ForeignKey("ledger_accounts.id", ondelete="CASCADE"), index=True)
    debit: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0.00"), nullable=False)
    credit: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0.00"), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class OutboxEvent(Base):
    """Phase 2 seam: transactional outbox table for Kafka/RabbitMQ migration."""
    __tablename__ = "outbox_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: gen_uuid("obx_"))
    aggregate_type: Mapped[str] = mapped_column(String(50), nullable=False)
    aggregate_id: Mapped[str] = mapped_column(String(50), nullable=False)
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class MarketSymbol(Base):
    __tablename__ = "market_symbols"

    symbol: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    sector: Mapped[str] = mapped_column(String(80), nullable=False)
    current_price: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    prev_close: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    pe_ratio: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("25.00"), nullable=False)
    market_cap_cr: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("100000.00"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class MarketCandle(Base):
    __tablename__ = "market_candles"
    __table_args__ = (Index("ix_candle_symbol_date", "symbol", "date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(String(20), ForeignKey("market_symbols.symbol", ondelete="CASCADE"), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    open: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    high: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    low: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    close: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    volume: Mapped[int] = mapped_column(BigInteger, nullable=False)
