# TradeFlow Security Architecture

## 1. Security Model & Core Principles
TradeFlow is designed around **deterministic financial safety**:
1. **AI Never Executes**: The conversational AI (Claude or Demo mode) can only prepare order previews (`PENDING_APPROVAL`). Execution requires an explicit authenticated approval request from the client (and broker, where configured).
2. **Zero-API-Key Safety**: The application boots and passes all financial safety checks with zero external credentials. No secrets are committed to Git history.
3. **Decimal Precision**: All currency amounts use `NUMERIC(18, 2)` in PostgreSQL and Python `decimal.Decimal` (`ROUND_HALF_UP`). Floating-point arithmetic is prohibited for balances, prices, charges, and ledger entries.

---

## 2. Authentication, Sessions & CSRF
- **Password Hashing**: Passwords are hashed using **Argon2id** (`argon2-cffi`).
- **Session Management**: Authenticated sessions issue a cryptographically random 32-byte token (`secrets.token_urlsafe`) stored as a SHA-256 digest in `user_sessions` and delivered in an `HttpOnly`, `SameSite=Lax` cookie (`tradeflow_session`).
- **CSRF Protection**: All state-changing endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) verify the `X-CSRF-Token` request header against the active session's `csrf_token`.
- **Hands-Free Voice Guard**: Voice approvals (`method: "VOICE"`) use the exact same authenticated session cookie and CSRF boundary; logged-out sessions are rejected with `401 Unauthorized`.

---

## 3. Tenant & Object-Level Authorization
- **Client Isolation**: Every portfolio, watchlist, order, rule, and notification query filters strictly by `user_id == current_user.id`.
- **Broker Scoping**: Endpoints under `/api/broker/*` enforce `role == "BROKER"` and restrict access to clients where `User.broker_id == broker.id`. Cross-broker or cross-client access returns `403 Forbidden` or `404 Not Found`.

---

## 4. Order Safety, Expiry & Idempotency
- **Order State Machine**: `PENDING_APPROVAL` → `APPROVED` → `FILLED` (or `REJECTED` / `EXPIRED`).
- **5-Minute Approval Window**: Orders expire after 5 minutes (`expires_at`). Approving an expired order returns `410 Gone`.
- **Payload Binding (`version` + `payload_hash`)**: Every preview computes a SHA-256 hash over `(user_id, symbol, side, quantity, order_type, indicative_price, version)`. Approval requests with a mismatched version or hash return `409 Conflict`.
- **PostgreSQL Idempotency**: `POST /api/orders/{id}/approve` requires an `Idempotency-Key` header persisted in `idempotency_keys` (`UNIQUE(scope, key, user_id)`).
  - Replaying the same key + payload returns the original stored response without re-executing the trade.
  - Reusing a key with a different payload returns `409 Conflict`.

---

## 5. Immutable Ledger & Hash-Chained Audit Log
- **Ledger**: `ledger_entries` is append-only and written inside the same database transaction as the order fill and balance/holding update.
- **Audit Trail**: `audit_events` maintains a SHA-256 hash chain (`previous_hash | timestamp | actor_id | event_type | entity_id | details`). Integrity can be verified via `GET /api/audit/verify`.

---

## 6. Phase 2 Production Hardening Path
The MVP leaves clean architectural seams for production scale:
- **Durable Queues & Event Streaming**: `outbox_events` is written transactionally alongside order fills, ready for Debezium/Kafka or Celery/RabbitMQ workers to replace the single-process `asyncio` lifespan evaluator.
- **MFA & RLS**: Step-up TOTP/WebAuthn MFA for high-value approvals and PostgreSQL Row-Level Security (RLS) policies on tenant tables.
- **SBOM & DR Drills**: Automated container SBOM generation in CI and point-in-time recovery drills on managed PostgreSQL.
