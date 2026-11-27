# TradeFlow

TradeFlow is a voice-first financial access prototype for Indian retail investors. It combines a simulated investing platform with a conversational assistant for market learning, research, and review-only financial actions. Text remains available when speech services are unavailable, and financial actions stay behind explicit user approval.

**Current branch:** `marmik`
**Primary market:** India
**Application type:** React web applications, FastAPI backend, PostgreSQL database
**Product brief:** [TradeFlow PRD](TradeFlow_PRD_v1.6_Stock_Page_Translation_Routing.md)
**Two-day build plan and team split:** [Build plan PDF](TradeFlow%20%E2%80%93%202-Day%20Build%20Plan%20%26%20Team%20Split.pdf)

## Project at a glance

The product is intended for first-time investors, retail investors, active traders, and sub-brokers. The hackathon MVP demonstrates a familiar market dashboard, conversational access, sample account data, simulated order preparation/approval, conditional alerts, and a broker review workflow. It is not a live brokerage and does not connect to an exchange for order execution.

The repository currently contains two frontend applications:

1. **Platform console (`frontend/`)** — the incoming React/TypeScript application used by Docker Compose. It contains the approvals, rules, and broker-console views and calls the authenticated platform APIs.
2. **Voice dashboard prototype (repository root `src/`)** — the earlier TradeFlow dashboard prototype with the floating AI/voice panel. This is a separate Vite app. Docker Compose does not currently serve it, and its dashboard figures are static presentation data.

The backend exposes both the platform APIs and the AI/voice API. The two frontends have not yet been consolidated into a single complete PRD experience. See [Current implementation and gaps](#current-implementation-and-gaps) before treating any screen or provider data as production-ready.

## Product modules and implementation status

| PRD area | What the repository contains | Status / limit |
|---|---|---|
| FR-01 Dashboard | Seeded indices, stocks, stock history, watchlist, portfolio, and dashboard API. The root dashboard prototype displays hard-coded sample cards. | Partial. The Compose console does not yet include the full dashboard/stock-detail UI; sample root-dashboard values are not live data. |
| FR-02 Voice assistant | Floating composer in the root dashboard; microphone control, editable transcript, browser speech recognition fallback, five-second silence handling, typed input, hands-free conversation loop, Wispr REST adapter, and speech playback fallback. | Partial. Wispr uses a backend REST transcription call, not the PRD's token/WebSocket streaming design. Voice order approval is not wired through the voice panel end to end. |
| FR-03 Languages | English, Hindi, Kannada, Marathi, Gujarati, and Tamil; Sarvam translation adapter; Unicode digit/number-word/Indian-scale normalization; original and normalized text metadata. | Partial. The personal nickname/ticker dictionary is stored in browser local storage; persistent user voice profiles and dictionary CRUD APIs are not implemented. |
| FR-04 Research | Local predefined research answers, Anthropic tool-use adapter, Yahoo Finance prototype quote/profile/news adapters, seeded stock information and history. | Partial. Provider credentials and network are required for live retrieval. Seeded and cached prices must be treated as demo/delayed data; no exchange-authoritative feed is connected. |
| FR-05 Order preparation | AI may return an order preview payload. Platform order APIs validate symbols, holdings/balance, compute charges using `Decimal`, create approval-bound previews, and process simulated fills after approval. | Partial integration. The AI tool does not create the platform order record itself. No real broker/exchange submission exists. |
| FR-06 Alerts/rules | Persistent above/below rules, pause/resume/delete endpoints, periodic in-process evaluator, notifications, and expiry handling. | Partial. Current platform rule creation is a manual API/UI workflow. Rule actions do not automatically prepare or submit orders; external live price monitoring is not production-grade. |
| FR-07 Portfolio | Deterministic `Decimal` calculations for balances, holdings, valuation, P/L, allocation, and top holdings; authenticated portfolio API. | Backend implemented; a connected portfolio screen and AI-to-portfolio tool are not complete in the current frontends/agent. |
| FR-08 Explain terms | Local glossary endpoint and popup in the root voice panel; Sarvam, Windows SAPI, and browser speech fallback chain. | Partial. Explanations use the local glossary; no contextual term links are integrated across the platform console. |
| FR-09 Broker console | Broker-scoped client/request APIs, approval and rejection endpoints, and a broker-console page. | Prototype implementation. It uses demo client data and simulated approvals, not broker connectivity or a regulated mandate. |
| FR-10 Notifications/activity | Persisted notifications, mark-read endpoint, audit event feed, and hash-chain verification endpoint. | Backend implemented; a complete activity/audit history UI and all event types are not present. |
| FR-11 Settings/security | Registration/login/logout, expiring server-side sessions, Argon2 password hashing, HttpOnly session cookie, CSRF token checks, role and user scoping, audit events. | Partial. No full settings screen, MFA/step-up flow, TLS deployment, managed secrets, or production security review is included. |
| Stock detail and safe navigation | Stock quote/history APIs and structured assistant fields for UI actions/suggestions. | Partial. A dedicated connected stock-detail page, allowlisted route handling, and order/conversation restoration across navigation are not completed. |

## Main user workflows

### Market and account data

- Seed data makes the platform usable without external keys.
- Market routes return source and timestamp envelopes (`demo`, `delayed`, or `cached`). `ENABLE_YFINANCE` gates the platform quote lookup, with a 60-second in-memory quote cache.
- A separate AI research provider adapter can request Yahoo Finance quotes, company information, and headlines. Network/provider failures must be surfaced as unavailable; the assistant should not invent current prices, headlines, or holdings.
- Portfolio calculations use Python `Decimal`; they are performed in application code rather than delegated to the language model.

### Orders and approval

The platform order flow is simulated:

1. An authenticated user requests a preview.
2. The backend checks the stock, available demo balance or holding quantity, and computes the indicative total and charges.
3. The preview is bound to an order version and payload hash, has a five-minute approval window, and is audit logged.
4. The client explicitly approves or rejects it. Some orders require both client and broker approval.
5. Once all required approvals are present, the service performs a simulated fill and updates the demo portfolio, holdings, ledger, and audit history.

Approval requests require the current order version/hash. The client approval API requires an `Idempotency-Key`. This service is a simulator; it is not a real exchange order gateway. Voice transcription is never authentication. The platform approval route requires an authenticated active session and CSRF check, but the voice UI is not yet connected to that approval flow.

### Rules, notifications, and broker workflow

- Rules are user-scoped and can be created, paused/resumed, or deleted.
- The FastAPI lifespan starts one in-process background task that evaluates rules and order expiry at the configured interval (30 seconds by default).
- A triggered rule creates a notification and audit event. The MVP does not use Celery/RabbitMQ for jobs or Kafka for event streaming.
- Broker endpoints are scoped to broker-linked clients. Broker approval can complete the simulated order workflow; broker actions are recorded.

## AI and voice behavior

### Supported request types

The deterministic fallback recognizes glossary terms, predefined research queries, common stock aliases, portfolio/watchlist phrasing, order requests, alert requests, and open-ended research prompts. With `ANTHROPIC_API_KEY`, the agent can use an allowlisted tool set for market price, company information, news, the supplied personal dictionary, review-only order payloads, draft-only alert payloads, and glossary explanations.

The AI tool loop currently reports portfolio/watchlist retrieval as not connected. `prepare_order` returns a structured preview payload but does not write a record to the platform order service. `create_price_alert` returns a draft and does not create a platform rule. The platform APIs for these workflows are separate.

Assistant responses use a structured contract with intent, visible message, language, clarification state/question, action type/payload, approval requirement, sources, UI action, route target, suggested actions, extracted entities, original/normalized text metadata, and Demo/Integrated mode labels. The client should only act on allowlisted UI routes; response prose is not executable navigation.

### Local glossary

The no-key glossary contains P/E ratio, EPS, market capitalisation, dividend yield, bull market, bear market, mutual fund, bonds, portfolio diversification, and stop-loss. Unknown terms return an explicit fallback instead of a fabricated definition.

### Voice provider chain

1. **Speech input:** Wispr Flow REST transcription when `WISPR_API_KEY` is configured; otherwise browser SpeechRecognition where supported; typed text remains available.
2. **Translation:** Sarvam translation when configured; otherwise local keyword and numeric handling with English fallback where a translation is required.
3. **Speech output:** Sarvam TTS, then Windows SAPI, then browser SpeechSynthesis. The user still sees the text if playback is unavailable.
4. **Hands-free:** the root prototype can listen and speak in a conversation loop. It does not establish identity or complete order approval through speech.

Supported language codes are `en`, `hi`, `kn`, `mr`, `gu`, and `ta`. The browser nickname/ticker dictionary is vocabulary input only and is not an identity credential.

### AI safety constraints

- The AI cannot approve or submit orders; its tool can only return a review-only payload.
- Platform approval is a separate authenticated API workflow.
- Missing or ambiguous trade fields should trigger clarification; negation and number conflicts must not produce a ready-to-submit action.
- Market/research claims require provider results and source timestamps. Demo data must remain labelled.
- Retrieved content is treated as evidence, not tool instructions.
- The system is not an investment adviser and does not promise returns.

## Architecture and technology

| Layer | Technology / responsibility |
|---|---|
| Platform frontend | React 18, TypeScript, Vite 5, React Router, Tailwind CSS (`frontend/`) |
| Voice dashboard prototype | React, TypeScript, Vite, Lucide icons (`src/` at repository root) |
| API | Python 3.12, FastAPI, Pydantic |
| Persistence | PostgreSQL 16, SQLAlchemy 2, Alembic scaffold |
| Authentication | Argon2 password hashing, hashed session tokens, HttpOnly/SameSite cookies, CSRF tokens, role and object checks |
| Financial calculations | Python `Decimal`, PostgreSQL `NUMERIC(18,2)`, simulated ledger |
| AI | Anthropic Messages API tool use (optional) and deterministic Demo Mode |
| Speech/translation | Wispr Flow REST, Sarvam REST, Windows SAPI, browser Web Speech APIs |
| Market data | Seeded demo database; optional yfinance prototype lookup and Yahoo Finance research adapters |
| Runtime | Docker Compose for PostgreSQL, API, and the platform console |

RabbitMQ/Celery and Kafka are described in the PRD as later options; they are not configured in this repository. An outbox model exists, but a durable event publisher/consumer pipeline is not implemented. PostgreSQL is the source of truth for the platform's financial state.

The PRD's later production phases are reliable asynchronous tasks and retry/dead-letter operations; transactional outbox/inbox and event consumers if multiple consumers justify them; then authorised broker integration, reconciliation, step-up authentication, penetration/compliance review, and disaster-recovery readiness. These are plans, not currently deployed infrastructure.

## Repository layout

```text
backend/
  app/
    auth/           registration, login, sessions, CSRF and authorization
    market/         indices, stocks, history, watchlists and quote service
    portfolio/      deterministic portfolio metrics and API
    orders/         previews, approval/rejection, simulated fills and history
    rules/          rule API and periodic rule/expiry evaluation
    broker/         broker/client scoping and approval workflow
    notifications/  user notification API
    audit/          event history and hash-chain verification
    core/           config, SQLAlchemy models/database, security and demo seed
    ai_voice.py     assistant, glossary, speech, Wispr and research routes
    agent.py        Anthropic tool schemas, allowlist and orchestration
    providers.py    Wispr, Sarvam, Windows TTS and Yahoo Finance adapters
    limits.py       in-memory per-client request limits
  tests/            assistant, provider, transcript-matrix and platform checks
  alembic/          migration environment/scaffold
frontend/           platform console (approvals, rules, broker console)
src/                separate root dashboard and voice-panel prototype
docs/
  SECURITY.md       implemented security architecture and production gaps
  UI_SPEC.md        visual reference notes and responsive design direction
  voice-testing.md  60-case voice acceptance matrix and run notes
TradeFlow_PRD...md  product, functional, technical and security requirements
docker-compose.yml  PostgreSQL, API and platform-console services
```

## API reference

The FastAPI app is defined in `backend/app/main.py`. The platform routers and AI/voice router are included in the same app.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | App/provider status |
| GET | `/api/dashboard` | Authenticated dashboard summary |
| POST | `/api/auth/register` | Create a client account |
| POST | `/api/auth/login` | Start a session and return CSRF token |
| POST | `/api/auth/logout` | Revoke session and clear cookies |
| GET | `/api/auth/me` | Current authenticated user |
| GET | `/api/market/indices` | Demo index values |
| GET | `/api/market/stocks` | List seeded stock quotes |
| GET | `/api/market/stocks/{symbol}` | Stock details and quote envelope |
| GET | `/api/market/stocks/{symbol}/history?range=1D\|1W\|1M\|6M\|1Y` | Stock candles |
| GET / POST | `/api/watchlist` | Read/add current user's watchlist |
| DELETE | `/api/watchlist/{symbol}` | Remove a watchlist item |
| GET | `/api/portfolio` | Current user's portfolio and metrics |
| GET | `/api/orders` | Current user's order history |
| POST | `/api/orders/preview` | Prepare a simulated order preview |
| POST | `/api/orders/{order_id}/approve` | Client approval; requires `Idempotency-Key` |
| POST | `/api/orders/{order_id}/reject` | Client rejection |
| GET / POST | `/api/rules` | List/create conditional rules |
| POST | `/api/rules/{rule_id}/pause` | Pause/resume rule |
| DELETE | `/api/rules/{rule_id}` | Delete rule |
| GET | `/api/broker/clients` | Broker's linked clients |
| GET | `/api/broker/requests` | Broker approval queue/history |
| POST | `/api/broker/requests/{order_id}/approve` | Broker approval |
| POST | `/api/broker/requests/{order_id}/reject` | Broker rejection |
| GET | `/api/notifications` | Current user's notifications |
| POST | `/api/notifications/{notif_id}/read` | Mark notification read |
| GET | `/api/audit` | Current user's permitted audit history |
| GET | `/api/audit/verify` | Verify audit hash chain |
| GET | `/api/research/predefined` | List local research prompts |
| POST | `/api/assistant` | AI/voice assistant request (`text`, language, dictionary, input method) |
| POST | `/api/assistant/message` | Platform message contract (`message`, language), forwarded to assistant |
| POST | `/api/voice/wispr/transcribe` | Server-side Wispr WAV transcription |
| POST | `/api/voice/speak` | Server speech output (Sarvam/Windows fallback) |
| POST | `/api/education/explain` | Explain a glossary term |

Changing platform endpoints require an authenticated session and CSRF token. Broker endpoints enforce broker role and linked-client scope. Refer to the source router schemas for request/response fields and validation.

## Database and seeded demo data

SQLAlchemy models cover:

- Users and sessions.
- Portfolios, holdings, and watchlists.
- Market symbols and daily candles.
- Orders, approvals, idempotency keys, ledger accounts, and ledger entries.
- Conditional rules and notifications.
- Audit events and outbox events.

The seed routine creates sample market history and demo users/holdings, including:

| Role | Email | Password |
|---|---|---|
| Demo client | `demo@tradeflow.in` | `Demo1234!` |
| Demo broker | `broker@tradeflow.in` | `Broker1234!` |
| Seeded broker clients | `client1@tradeflow.in`, `client2@tradeflow.in` | `Client1234!` |

These are local demonstration credentials only. Never reuse them outside a disposable development environment. Demo prices and portfolios are sample records, not market data or advice.

## Configuration

Copy `.env.example` to `.env` for local configuration. Docker Compose reads this file from the repository root.

| Variable | Purpose | Default / note |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy connection | Compose uses PostgreSQL service `postgres`; host-run API should use `localhost` |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Compose PostgreSQL initialization | Demo-only values in example file |
| `SECRET_KEY` | Application/session security configuration | Replace for any shared deployment |
| `SESSION_COOKIE_NAME` | Session cookie name | `tradeflow_session` |
| `CORS_ORIGINS` | Allowed frontend origins | Local Vite ports |
| `ENABLE_YFINANCE` | Enable optional platform quote lookups | `false` by default |
| `ANTHROPIC_API_KEY` | Enable the Anthropic tool-use agent | Empty means Demo Mode |
| `ANTHROPIC_MODEL` | Anthropic model selection | Read by AI adapter; provider account must support it |
| `SARVAM_API_KEY` | Translation and speech provider | Empty means speech/translation fallbacks |
| `SARVAM_TTS_MODEL`, `SARVAM_TTS_SPEAKER` | Sarvam speech settings | Optional adapter settings |
| `WISPR_API_KEY` | Wispr transcription | Requires provider access/approval |

Keep `.env` private. Provider keys are read by the backend and must not be placed in frontend build variables.

## Run locally

### Recommended: Docker Compose

Requirements: Docker Desktop with Compose support.

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Compose starts PostgreSQL, the FastAPI backend, and the **platform console**. The API is at `http://localhost:8000`, API docs at `http://localhost:8000/docs`, and platform console at `http://localhost:5173`.

The separate **voice dashboard prototype** can be served from a second terminal on another port while the API is running:

```powershell
npm ci
npm run dev -- --port 5174
```

Open `http://localhost:5174` and use the “Ask TradeFlow” voice button. Browser mic permission and speech-recognition support vary by browser. The root app uses `VITE_API_URL` or defaults to `http://localhost:8000`.

### Run without Docker

Start PostgreSQL separately, set `DATABASE_URL` to a reachable PostgreSQL URL in `.env`, then run the backend from the repository root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload
```

Run the platform console in a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

To run the voice dashboard as well, use a third terminal from the repository root and a free port such as `5174`:

```powershell
npm ci
npm run dev -- --port 5174
```

## Tests and build checks

Run backend tests from the repository root after installing the backend requirements:

```powershell
pytest backend/tests -q
```

The suite includes the platform flow, provider-adapter mocks, deterministic Demo Mode checks, and a 60-transcript parser/intent matrix. These tests do not make live calls to Wispr, Sarvam, Anthropic, or Yahoo Finance and do not exercise a physical microphone.

Build each separate frontend from the repository root:

```powershell
npm ci
npm run build
```

```powershell
cd frontend
npm ci
npm run build
```

The documented manual matrix is [`docs/voice-testing.md`](docs/voice-testing.md). Accent/noise, microphone permission, browser speech recognition, and physical speech playback require an actual supported browser/device session.

## Current implementation and gaps

The project is an MVP prototype, not the full PRD completion. In particular:

- The Compose-served console and root voice dashboard are separate applications; merge work has unified their API but not their full UI navigation.
- The stock-detail page, connected full dashboard/portfolio views, settings/preferences page, and complete route-aware conversation restoration are still missing.
- Wispr integration is REST-based; the PRD's short-lived token and streaming WebSocket flow is not implemented.
- Personal dictionaries and selected language live in browser local storage, not the authenticated database voice-profile APIs.
- AI portfolio/watchlist tools explicitly report unavailable rather than reading account tables. Voice-generated order and alert payloads are not persisted through the platform order/rule APIs.
- Hands-free conversation is available in the prototype; authenticated, order-specific voice approval is not wired through the assistant UI.
- Platform quotes are seeded/demo unless the optional quote lookup is enabled. News, company-profile, and live-market tools need provider/network access and freshness validation.
- The rule evaluator can currently receive seeded quotes whose envelope status is `ok`; demo rule triggers must not be treated as live market signals.
- No production broker, exchange execution, order routing, investment advice, MFA/step-up, production TLS/secrets management, or independent security review is included.
- Celery/RabbitMQ, Kafka consumers, transactional outbox publishing, notification delivery workers, and production monitoring are not implemented. The current rule/expiry evaluator is in-process.
- No public deployment or hosted production environment is configured in this repository.

## Security design notes

The MVP uses server-side session records, hashed session tokens, Argon2 password hashing, HttpOnly/SameSite cookies, CSRF checks for mutations, user/broker scoping, order version/hash binding, expiry checks, approval idempotency, `Decimal` financial arithmetic, a simulated ledger, and hash-chained audit events. The full design and production-hardening checklist are in [`docs/SECURITY.md`](docs/SECURITY.md).

These controls do not make the app production-ready by themselves. Use only demo data in local development; replace development secrets, review deployment/network settings, and complete the PRD's security and operational gates before any real financial integration.

## Product goals and success measures

TradeFlow aims to make common market and account tasks easier to ask about in natural language, support the six MVP languages and mixed-language speech, explain finance terms plainly, provide traceable market information, and keep people in control of financial actions. Voice is an access path, not a requirement; every critical spoken action needs an equivalent visible review/control.

The PRD proposes measuring transcription accuracy, intent classification accuracy, task completion, time to complete common tasks, voice adoption, glossary usage, research source validity, approval/rejection rates, user feedback, and repeat use. No production analytics or telemetry dashboard is included here. Order count alone is not a success measure.

## MVP scope and future scope

The repository demonstrates simulated investing and workflow controls. The following remain outside this hackathon MVP: real broker API integration and exchange execution, production broker/client onboarding, production investment advice, advanced algorithmic strategies, languages beyond the six MVP languages, Telegram/WhatsApp agents, native mobile apps, and production-grade compliance/security operations. Real execution must not be enabled by substituting credentials into the current prototype.

## Project references

- [Product requirements and architecture, including FR-01 through FR-11 and later production plans](TradeFlow_PRD_v1.6_Stock_Page_Translation_Routing.md) (the filename says v1.6; its document header labels the PRD v1.5)
- [Team split and two-day build plan](TradeFlow%20%E2%80%93%202-Day%20Build%20Plan%20%26%20Team%20Split.pdf)
- [Security architecture](docs/SECURITY.md)
- [UI reference and responsive design notes](docs/UI_SPEC.md)
- [Voice acceptance matrix](docs/voice-testing.md)
