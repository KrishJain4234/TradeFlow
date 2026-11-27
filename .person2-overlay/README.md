# TradeFlow — Person 2: AI and Voice

This workspace contains the AI and voice slice of TradeFlow, implemented against the supplied PRD. The current checkout was empty, so this starts as a small React + TypeScript + Vite frontend and FastAPI service that can be run independently while the rest of the team builds the wider app.

## Progress

- [~] FR-02 voice assistant: typed chat, browser speech recognition when available, visible transcript, mic start/stop, five-second silence stop, hands-free conversation loop, and browser speech synthesis. Wispr streaming and Sarvam/Windows speech adapters are still pending.
- [~] FR-03 language and parsing foundation: six language preferences, common number/action-word mappings across supported languages, aliases/personal dictionary, and original/normalized transcript fields. Full translation, broader language coverage, and generated replies in each preferred language still need provider work.
- [~] FR-04 deterministic research: predefined demo query cards and local knowledge answers; open-ended research honestly reports unavailable services. Connected retrieval, citations, and timestamps are still pending.
- [~] FR-08 local glossary endpoint and explanation popup with listen/pause/replay controls. The glossary fallback works without keys; Sarvam and Windows speech output adapters remain pending.
- [~] Section 8 agent contract: structured response fields, default `STAY` action, deterministic demo intent handler, and no direct order execution. The full controlled tool adapters and route allowlist integration are pending.
- [x] Section 12.1: documented 60-case voice test matrix in `docs/voice-testing.md`.
- [ ] Provider integrations (Wispr Flow, Sarvam, Anthropic, live market/news sources) require credentials and server-side adapters; no secrets are placed in the browser. The API currently runs deterministic demo mode only.

## Run locally

Backend (Python 3.12+):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend (Node 20+):

```powershell
npm install
npm run dev
```

The frontend expects the API at `http://localhost:8000`. Start both services for the demo. The deterministic assistant works without API keys. Browser speech recognition and speech synthesis vary by browser and operating system; typed chat remains available in all cases. A user-selected language is currently passed through as context; the demo does not translate arbitrary replies.

## Demo queries

- `Explain P/E ratio`
- `Give me a company overview of Infosys`
- `Explain key financial ratios`
- `Show recent announcements for TCS`
- `Summarize the IT sector`
- `Summarize weekly price movement for Reliance`
- `Reliance kyun gir raha hai today?` (responds with an API-unavailable message in demo mode)

No demo response claims to be live market data. Order and alert intents are recognized for structured routing but are never submitted or executed by this AI slice.
