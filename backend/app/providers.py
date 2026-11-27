from __future__ import annotations

import base64
import importlib.util
import os
import platform
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")

LANGUAGE_CODES = {
    "en": "en-IN", "hi": "hi-IN", "kn": "kn-IN", "mr": "mr-IN", "gu": "gu-IN", "ta": "ta-IN"
}
SYMBOLS = {
    "RELIANCE": "RELIANCE.NS", "INFY": "INFY.NS", "TCS": "TCS.NS", "HDFCBANK": "HDFCBANK.NS",
}


def provider_status() -> dict[str, Any]:
    return {
        "wispr": bool(os.getenv("WISPR_API_KEY")),
        "sarvam": bool(os.getenv("SARVAM_API_KEY")),
        "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
        "market_data": importlib.util.find_spec("yfinance") is not None,
        "news": importlib.util.find_spec("yfinance") is not None,
        "windows_tts": platform.system() == "Windows",
        "browser_tts": True,
    }


def wispr_transcribe(audio: str, language: str, dictionary: dict[str, str]) -> dict[str, Any]:
    key = os.getenv("WISPR_API_KEY")
    if not key:
        raise RuntimeError("Wispr Flow is not configured")
    if len(audio) > 34_000_000:
        raise ValueError("Audio exceeds the 25 MB provider limit")
    if not audio.startswith("UklGR"):
        raise ValueError("Wispr Flow requires base64 encoded WAV audio")
    language_hint = language.split("-")[0].lower()
    terms = list(dict.fromkeys([*dictionary.keys(), *dictionary.values(), "NIFTY", "SENSEX", *SYMBOLS.keys()]))[:100]
    payload = {
        "audio": audio,
        "language": [language_hint] if language_hint in {"en", "hi", "kn", "mr", "gu", "ta"} else ["en", "hi", "kn", "mr", "gu", "ta"],
        "context": {"app": {"name": "TradeFlow", "type": "ai"}, "dictionary_context": terms},
    }
    response = httpx.post("https://api.wisprflow.ai/api", headers={"Authorization": f"Bearer {key}"}, json=payload, timeout=60)
    response.raise_for_status()
    result = response.json()
    return {"text": result.get("text", ""), "language": result.get("detected_language"), "provider": "wispr"}


def translate_text(text: str, target: str, source: str = "auto") -> dict[str, str] | None:
    key = os.getenv("SARVAM_API_KEY")
    target_code = LANGUAGE_CODES.get(target)
    if not key or not target_code or len(text) > 1800:
        return None
    payload: dict[str, Any] = {
        "input": text,
        "source_language_code": source if source == "auto" else LANGUAGE_CODES.get(source, source),
        "target_language_code": target_code,
        "model": "mayura:v1",
        "mode": "modern-colloquial",
        "numerals_format": "international",
    }
    response = httpx.post(
        "https://api.sarvam.ai/translate",
        headers={"api-subscription-key": key}, json=payload, timeout=20,
    )
    response.raise_for_status()
    data = response.json()
    return {"text": data["translated_text"], "source_language": data.get("source_language_code", source)}


def sarvam_speech(text: str, language: str) -> tuple[bytes, str] | None:
    key = os.getenv("SARVAM_API_KEY")
    language_code = LANGUAGE_CODES.get(language)
    if not key or not language_code or not text.strip():
        return None
    payload = {
        "text": text[:2500],
        "language_code": language_code,
        "model": os.getenv("SARVAM_TTS_MODEL", "bulbul:v4-flash"),
        "speaker": os.getenv("SARVAM_TTS_SPEAKER", "shubh_enhi_ads"),
        "output_audio_codec": "mp3",
        "enable_preprocessing": True,
    }
    response = httpx.post(
        "https://api.sarvam.ai/text-to-speech",
        headers={"api-subscription-key": key}, json=payload, timeout=45,
    )
    response.raise_for_status()
    audio = response.json()["audios"][0]
    return base64.b64decode(audio), "audio/mpeg"


def windows_speech(text: str, language: str) -> tuple[bytes, str] | None:
    if platform.system() != "Windows" or not text.strip():
        return None
    try:
        import pyttsx3

        engine = pyttsx3.init("sapi5")
        prefix = LANGUAGE_CODES.get(language, "en-IN").split("-")[0].casefold()
        for voice in engine.getProperty("voices"):
            details = " ".join([str(voice.id), str(voice.name), *(str(item) for item in getattr(voice, "languages", []))]).casefold()
            if prefix in details:
                engine.setProperty("voice", voice.id)
                break
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp:
            filename = temp.name
        try:
            engine.save_to_file(text[:2500], filename)
            engine.runAndWait()
            audio = Path(filename).read_bytes()
            return audio, "audio/wav"
        finally:
            engine.stop()
            Path(filename).unlink(missing_ok=True)
    except Exception:
        return None


def synthesize(text: str, language: str) -> tuple[bytes, str, str] | None:
    try:
        audio = sarvam_speech(text, language)
        if audio:
            return audio[0], audio[1], "sarvam"
    except Exception:
        pass
    audio = windows_speech(text, language)
    if audio:
        return audio[0], audio[1], "windows"
    return None


def resolve_provider_symbol(symbol: str) -> str:
    canonical = symbol.upper().strip()
    return SYMBOLS.get(canonical, f"{canonical}.NS")


def _yahoo_ticker(symbol: str):
    import yfinance as yf
    from curl_cffi import requests

    # Bound lookup latency when the provider or network is unavailable.
    session = requests.Session(impersonate="chrome", timeout=8)
    return yf.Ticker(resolve_provider_symbol(symbol), session=session)


def market_snapshot(symbol: str) -> dict[str, Any]:
    ticker = resolve_provider_symbol(symbol)
    frame = _yahoo_ticker(symbol).history(period="5d", interval="1d", auto_adjust=False)
    if frame.empty:
        return {"available": False, "symbol": symbol, "message": "No market price data returned by the provider."}
    latest = frame.iloc[-1]
    previous = frame.iloc[-2] if len(frame.index) > 1 else latest
    stamp = frame.index[-1]
    timestamp = stamp.isoformat() if hasattr(stamp, "isoformat") else str(stamp)
    return {
        "available": True, "symbol": symbol.upper(), "provider_symbol": ticker,
        "price": float(latest["Close"]), "previous_close": float(previous["Close"]),
        "change": float(latest["Close"] - previous["Close"]),
        "change_percent": float((latest["Close"] - previous["Close"]) / previous["Close"] * 100) if previous["Close"] else None,
        "data_timestamp": timestamp, "data_label": "Yahoo Finance prototype data; verify before use",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
    }


def company_information(symbol: str) -> dict[str, Any]:
    ticker = resolve_provider_symbol(symbol)
    info = _yahoo_ticker(symbol).get_info()
    if not info:
        return {"available": False, "symbol": symbol.upper(), "message": "Company data is unavailable from the provider."}
    wanted = ("longName", "sector", "industry", "website", "marketCap", "trailingPE", "forwardPE", "dividendYield", "longBusinessSummary")
    return {
        "available": True, "symbol": symbol.upper(), "provider_symbol": ticker,
        "company": {key: info[key] for key in wanted if info.get(key) is not None},
        "data_label": "Yahoo Finance company profile; verify source freshness",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
    }


def market_news(symbol: str, limit: int = 5) -> dict[str, Any]:
    ticker = resolve_provider_symbol(symbol)
    articles = _yahoo_ticker(symbol).news or []
    results: list[dict[str, Any]] = []
    for item in articles[: max(1, min(limit, 10))]:
        content = item.get("content", item)
        canonical = content.get("canonicalUrl") or {}
        provider = content.get("provider") or {}
        results.append({
            "title": content.get("title") or item.get("title"),
            "publisher": provider.get("displayName") or item.get("publisher") or "Yahoo Finance",
            "url": canonical.get("url") or item.get("link"),
            "published_at": content.get("pubDate") or item.get("providerPublishTime"),
        })
    return {
        "available": bool(results), "symbol": symbol.upper(), "articles": results,
        "data_label": "Yahoo Finance news feed", "retrieved_at": datetime.now(timezone.utc).isoformat(),
    }
