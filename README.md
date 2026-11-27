# TradeFlow

## Person 2 — AI and Voice

The Person 2 implementation is on the `marmik` branch and is integrated into the TradeFlow dashboard voice panel.

### Implemented

- FR-02: mic start/stop, browser speech recognition when supported, editable transcript, five-second silence handling, typed fallback, hands-free loop, and browser speech synthesis.
- FR-03: English, Hindi, Kannada, Marathi, Gujarati, and Tamil preferences; Sarvam translation; Unicode digit, number-word, Indian-scale, and currency parsing; personal stock aliases saved in this browser.
- FR-04: predefined demo queries work without credentials. Yahoo Finance prototype adapters provide bounded-timeout quote, company profile, and news lookups when network access is available; results identify their source and freshness.
- FR-08: local explain-term glossary with definition/example and listen/pause/replay controls. Speech output tries Sarvam, then Windows SAPI, then browser speech synthesis.
- Section 8: Anthropic Messages API integration with an allowlisted tool loop and structured response contract. Without a key it uses the local demo handler. Order preparation is review-only; alert creation is draft-only; no broker submission tool exists.
- Section 12.1: the 60-case transcript matrix in [`docs/voice-testing.md`](docs/voice-testing.md) has been executed against the parser/intent handler. All 14 backend/provider tests pass. Device microphone, accent/noise, and manual playback checks still require supported hardware and a real browser session.
- Wispr Flow server-side transcription adapter accepts base64 WAV and includes the personal dictionary; browser SpeechRecognition remains the no-key fallback. Wispr credentials and account approval are required for live use.

Provider adapters are implemented, but this workspace has no Wispr, Sarvam, or Anthropic credentials, and outbound network access prevented live Yahoo Finance verification. Copy `.env.example` to `.env` and fill in approved keys to enable the corresponding integrations. Wispr API access is approval-only. Keys stay on the backend and are never sent to the frontend. No keys are needed for Demo Mode.

### Run

In one terminal, start the API (Python 3.12+):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --app-dir backend --reload
```

In another terminal, start the dashboard (Node 20+):

```powershell
npm ci
npm run dev
```

The frontend uses `http://localhost:8000` by default. Set `VITE_API_URL` to override it. Browser speech input support varies; typed requests always remain available.

### Verify

```powershell
python -m unittest discover -s backend/tests -v
npm run build
```

Try: `Explain P/E ratio`, `Reliance ke 10 shares buy karo`, `Company overview of Infosys`, or `Why is Reliance falling today?`. Demo market/research content is labeled; no answer claims access to live market data.
