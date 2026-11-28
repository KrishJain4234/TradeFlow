from __future__ import annotations

import re
import unicodedata
from typing import Literal

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field

from . import providers
from .agent import run_agent
from .limits import enforce_rate_limit

router = APIRouter()

LANGUAGES = {
    "en": "English", "hi": "Hindi", "kn": "Kannada", "mr": "Marathi", "gu": "Gujarati", "ta": "Tamil",
    "bn": "Bengali", "te": "Telugu", "ml": "Malayalam", "pa": "Punjabi", "ur": "Urdu", "or": "Odia",
    "as": "Assamese", "ne": "Nepali", "sa": "Sanskrit", "sd": "Sindhi", "si": "Sinhala",
    "es": "Spanish", "fr": "French", "de": "German", "pt": "Portuguese", "it": "Italian", "nl": "Dutch",
    "ru": "Russian", "zh": "Chinese", "ja": "Japanese", "ko": "Korean", "ar": "Arabic", "tr": "Turkish",
    "vi": "Vietnamese", "th": "Thai", "id": "Indonesian", "ms": "Malay", "tl": "Tagalog", "pl": "Polish",
    "uk": "Ukrainian", "cs": "Czech", "sk": "Slovak", "ro": "Romanian", "hu": "Hungarian", "el": "Greek",
    "sv": "Swedish", "da": "Danish", "no": "Norwegian", "nn": "Norwegian Nynorsk", "fi": "Finnish",
    "is": "Icelandic", "he": "Hebrew", "fa": "Persian", "ps": "Pashto", "sw": "Swahili", "am": "Amharic",
    "af": "Afrikaans", "sq": "Albanian", "hy": "Armenian", "az": "Azerbaijani", "eu": "Basque",
    "be": "Belarusian", "bs": "Bosnian", "bg": "Bulgarian", "ca": "Catalan", "hr": "Croatian",
    "et": "Estonian", "gl": "Galician", "ka": "Georgian", "ht": "Haitian Creole", "ha": "Hausa",
    "haw": "Hawaiian", "ig": "Igbo", "ga": "Irish", "jv": "Javanese", "kk": "Kazakh", "km": "Khmer",
    "ky": "Kyrgyz", "lo": "Lao", "la": "Latin", "lv": "Latvian", "lt": "Lithuanian",
    "lb": "Luxembourgish", "mk": "Macedonian", "mg": "Malagasy", "mt": "Maltese", "mi": "Maori",
    "mn": "Mongolian", "my": "Myanmar (Burmese)", "oc": "Occitan", "sr": "Serbian", "sn": "Shona",
    "sl": "Slovenian", "so": "Somali", "su": "Sundanese", "tg": "Tajik", "tt": "Tatar", "bo": "Tibetan",
    "tk": "Turkmen", "uz": "Uzbek", "cy": "Welsh", "xh": "Xhosa", "yi": "Yiddish", "yo": "Yoruba",
    "zu": "Zulu", "ba": "Bashkir", "br": "Breton", "fo": "Faroese", "ln": "Lingala",
}
ALIASES = {
    "reliance": "RELIANCE", "ril": "RELIANCE", "रिलायंस": "RELIANCE",
    "infosys": "INFY", "infy": "INFY", "इन्फोसिस": "INFY",
    "tcs": "TCS", "tata consultancy": "TCS", "hdfc bank": "HDFCBANK",
}
ACTION_WORDS = {
    "buy": "BUY", "purchase": "BUY", "kharido": "BUY", "kharidna": "BUY", "खरीदो": "BUY", "खरीदना": "BUY",
    "sell": "SELL", "becho": "SELL", "bechna": "SELL", "बेचो": "SELL", "बेचना": "SELL",
}
NUMBER_WORDS = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "das": 10, "ek": 1, "do": 2, "teen": 3, "char": 4, "paanch": 5,
    "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "दस": 10, "डेढ़": 1.5,
    "दोन": 2, "तीन": 3, "दहा": 10, "पाच": 5,
    "ಒಂದು": 1, "ಎರಡು": 2, "ಮೂರು": 3, "ಹತ್ತು": 10, "ಐದು": 5,
    "એક": 1, "બે": 2, "ત્રણ": 3, "દસ": 10, "પાંચ": 5,
    "ஒன்று": 1, "இரண்டு": 2, "மூன்று": 3, "பத்து": 10, "ஐந்து": 5,
}
ACTION_WORDS.update({"खरेदी": "BUY", "विक्री": "SELL", "खरेदी करा": "BUY", "विका": "SELL", "ખરીદો": "BUY", "વેચો": "SELL", "ಖರೀದಿಸಿ": "BUY", "ಖರೀದಿ": "BUY", "ಮಾರಾಟ": "SELL", "வாங்கு": "BUY", "விற்பனை": "SELL", "விற்க": "SELL"})
GLOSSARY = {
    "pe ratio": {"term": "P/E ratio", "definition": "The price-to-earnings ratio compares a share's price with the company's earnings per share. It describes how much investors pay for each rupee of annual earnings.", "example": "If a share costs ₹200 and earns ₹10 per share, its P/E ratio is 20."},
    "eps": {"term": "EPS", "definition": "Earnings per share (EPS) is a company's profit divided by its number of shares.", "example": "₹100 crore profit across 10 crore shares gives EPS of ₹10."},
    "market capitalisation": {"term": "Market capitalisation", "definition": "The market value of a company’s listed shares, calculated as share price multiplied by shares outstanding.", "example": "10 crore shares priced at ₹100 each imply a market capitalisation of ₹1,000 crore."},
    "dividend yield": {"term": "Dividend yield", "definition": "Annual dividend per share divided by the current share price, expressed as a percentage.", "example": "A ₹5 annual dividend on a ₹100 share is a 5% yield."},
    "bull market": {"term": "Bull market", "definition": "A period when market prices broadly rise and investor confidence is generally positive.", "example": "A sustained broad-market rise may be described as a bull market."},
    "bear market": {"term": "Bear market", "definition": "A period of broad, sustained market declines and generally weak sentiment.", "example": "A prolonged fall across many stocks may be described as a bear market."},
    "mutual fund": {"term": "Mutual fund", "definition": "An investment pool that combines money from investors and invests it according to a stated strategy.", "example": "An index mutual fund may hold a basket designed to track an index."},
    "bonds": {"term": "Bond", "definition": "A bond is a loan to a government or company that may pay interest and return principal under its terms.", "example": "A bond with a 7% coupon pays ₹7 yearly per ₹100 face value, subject to its terms."},
    "portfolio diversification": {"term": "Portfolio diversification", "definition": "Spreading investments across assets to reduce reliance on any one holding or risk.", "example": "Holding different sectors can reduce exposure to a single industry."},
    "stop loss": {"term": "Stop-loss", "definition": "An instruction intended to trigger an exit when a specified price condition is reached; actual execution can differ from the trigger price.", "example": "A stop trigger at ₹90 may initiate an order if the price reaches that level."},
}

PREDEFINED = {
    "company overview": "Demo knowledge: Infosys is an Indian IT services and consulting company. This short profile is static demo content, not current investment research.",
    "key financial ratios": "Demo knowledge: P/E compares price with earnings; EPS is profit per share; debt-to-equity compares borrowings with shareholder equity. Compare companies within relevant sectors and periods.",
    "recent announcements": "Demo mode has no connected exchange announcement feed. Connect an approved source to retrieve current announcements.",
    "sector summary": "Demo knowledge: An IT sector review commonly considers global technology spending, currency movement, wage costs, deal wins and client demand. These are research prompts, not claims about today's market.",
    "weekly price movement": "Demo mode has no live or historical price feed connected. No current weekly movement is available.",
}

class AssistantRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    language: str = "en"
    dictionary: dict[str, str] = Field(default_factory=dict)
    input_method: Literal["typed", "speech"] = "typed"

class ExplainRequest(BaseModel):
    term: str = Field(min_length=1, max_length=100)
    language: str = "en"
    context: str | None = Field(default=None, max_length=500)

class TranscriptionRequest(BaseModel):
    audio: str = Field(min_length=16, max_length=34_000_000)
    language: str = "en"
    dictionary: dict[str, str] = Field(default_factory=dict)

class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2500)
    language: str = "en"

class AssistantMessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    language: str = "en"

def normalize_numbers(text: str) -> str:
    out = "".join(str(unicodedata.digit(char)) if char.isdigit() else char for char in text)
    # Python's \w treats many combining marks in Indic scripts as boundaries.
    # Tokenize Unicode letters/numbers explicitly so e.g. Hindi "खरीदो" stays intact.
    tokens = []
    current = ""
    for char in out:
        if unicodedata.category(char)[0] in "LMN" or char == "_":
            current += char
        else:
            if current:
                tokens.append(current)
                current = ""
            tokens.append(char)
    if current:
        tokens.append(current)
    for index, token in enumerate(tokens):
        if token.casefold() == "do" and index + 2 < len(tokens) and tokens[index + 1].isspace() and tokens[index + 2].casefold() == "not":
            continue
        value = NUMBER_WORDS.get(token.casefold())
        if value is not None:
            tokens[index] = str(value)
    out = "".join(tokens)
    end = r"(?=$|[^\w\u0900-\u0dff])"
    out = re.sub(rf"(?i)(\d+(?:\.\d+)?)\s*(crore|crores|करोड़|करोड|ಕೋಟಿ|கோடி|કરોડ){end}", lambda m: str(float(m.group(1)) * 10_000_000).rstrip("0").rstrip("."), out)
    out = re.sub(rf"(?i)(\d+(?:\.\d+)?)\s*(lakh|lakhs|लाख|ಲಕ್ಷ|લાખ){end}", lambda m: str(float(m.group(1)) * 100_000).rstrip("0").rstrip("."), out)
    out = re.sub(rf"(?i)(\d+(?:\.\d+)?)\s*(thousand|k|हजार|हज़ार|ಸಾವಿರ|ஆயிரம்|હજાર){end}", lambda m: str(float(m.group(1)) * 1000).rstrip("0").rstrip("."), out)
    return out

def resolve_symbol(text: str, dictionary: dict[str, str]) -> str | None:
    candidates = {**ALIASES, **{k.casefold(): v.upper() for k, v in dictionary.items()}}
    matches = [(len(alias), symbol) for alias, symbol in candidates.items() if re.search(rf"(?<!\w){re.escape(alias)}(?!\w)", text, re.IGNORECASE)]
    if not matches:
        return None
    longest = max(length for length, _ in matches)
    symbols = {symbol for length, symbol in matches if length == longest}
    return next(iter(symbols)) if len(symbols) == 1 else None

def response(intent: str, message: str, language: str, **values) -> dict:
    result = {
        "intent": intent, "message": message, "language": language if language in LANGUAGES else "en",
        "requires_clarification": False, "clarification_question": None, "action_type": None,
        "action_payload": None, "requires_approval": False, "sources": [], "ui_action": "STAY",
        "route_target": None, "suggested_actions": [], "extracted_entities": {},
        "original_language": language if language in LANGUAGES else "en", "normalized_text_language": "en",
        "response_language": language if language in LANGUAGES else "en", "language_fallback": False,
        "mode": "demo", "data_label": "Demo knowledge; not live market data",
    }
    result.update(values)
    if language != "en" and result.get("response_language") == language:
        try:
            translated = providers.translate_text(message, target=language, source="en")
        except Exception:
            translated = None
        if translated:
            result["message"] = translated["text"]
            result["response_language"] = language
        else:
            result["response_language"] = "en"
            result["language_fallback"] = True
            result["message"] = f"English fallback (translation service unavailable): {message}"
    currency_values = result.pop("currency_values_inr", [])
    if currency_values:
        result["extracted_entities"] = {**result.get("extracted_entities", {}), "currency_values_inr": currency_values}
    return result

@router.post("/api/voice/wispr/transcribe")
def transcribe_wispr(request: TranscriptionRequest, http_request: Request):
    enforce_rate_limit(http_request, "wispr", 5)
    try:
        return providers.wispr_transcribe(request.audio, request.language, request.dictionary)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Wispr Flow transcription failed; use browser speech or typed input.") from exc

@router.post("/api/voice/speak")
def speak(request: SpeechRequest, http_request: Request):
    enforce_rate_limit(http_request, "tts", 20)
    result = providers.synthesize(request.text, request.language)
    if not result:
        raise HTTPException(status_code=503, detail="Server speech unavailable; use browser speech synthesis.")
    audio, content_type, provider = result
    return Response(content=audio, media_type=content_type, headers={"X-TradeFlow-TTS-Provider": provider})

@router.get("/api/research/predefined")
def predefined_queries():
    return {"items": list(PREDEFINED.keys())}

@router.post("/api/education/explain")
def explain(request: ExplainRequest):
    key = re.sub(r"[^a-z0-9 ]", "", request.term.casefold()).strip()
    for glossary_key, item in GLOSSARY.items():
        if key == glossary_key or key in (item["term"].casefold(), item["term"].casefold().replace("-", " ")):
            target_language = request.language if request.language in LANGUAGES else "en"
            result = {**item, "language": target_language, "response_language": target_language, "source": "local glossary", "mode": "demo"}
            if target_language != "en":
                try:
                    translated = providers.translate_text(f"{item['definition']}\nExample: {item['example']}", target=target_language, source="en")
                except Exception:
                    translated = None
                if translated:
                    parts = translated["text"].split("Example:", 1)
                    result["definition"] = parts[0].strip()
                    if len(parts) == 2:
                        result["example"] = parts[1].strip()
                else:
                    result["response_language"] = "en"
                    result["language_fallback"] = True
            return result
    return {"term": request.term, "definition": "This term is not in the local demo glossary yet. Connect the explanation service to request a generated explanation.", "example": "No example is available in demo mode.", "language": request.language if request.language in LANGUAGES else "en", "response_language": "en", "language_fallback": request.language != "en", "source": "fallback", "mode": "demo"}

def _extract_local_intent(
    normalized: str,
    original: str,
    language: str,
    input_method: str,
    dictionary: dict[str, str],
    translation_path: str,
    allow_incomplete_trade: bool,
) -> dict | None:
    folded = normalized.casefold()
    currencies = re.findall(r"(?:₹|rs\.?\s*)(\d[\d,]*(?:\.\d+)?)|\b(\d[\d,]*(?:\.\d+)?)\s*(?:rupees?|inr|रुपये|रुपया)\b", normalized, flags=re.IGNORECASE)
    base = {
        "original_text": original,
        "normalized_text": normalized,
        "input_method": input_method,
        "original_language": language,
        "translation_path": translation_path,
        "currency_values_inr": [float((a or b).replace(",", "")) for a, b in currencies],
    }

    # Explain terms before broad research classification.
    searchable_text = re.sub(r"[^a-z0-9]", "", folded)
    for term in GLOSSARY:
        searchable_term = re.sub(r"[^a-z0-9]", "", term)
        pe_alias = term == "pe ratio" and bool(re.search(r"\bp\s*/?\s*e\b|\bpe\b", folded))
        if searchable_term in searchable_text or term.replace(" ", "-") in folded or pe_alias:
            item = explain(ExplainRequest(term=term, language=language))
            return response("EXPLAIN_TERM", f"{item['term']}: {item['definition']} {item['example']}", language, **base, extracted_entities={"term": item["term"]}, suggested_actions=[{"id": "LISTEN", "label": "Listen"}])

    for query, answer in PREDEFINED.items():
        if query in folded:
            return response("STOCK_RESEARCH_PREDEFINED", answer, language, **base, sources=[{"label": "Local demo knowledge", "url": None, "timestamp": None}], extracted_entities={"query": query}, suggested_actions=[{"id": "MORE_DETAIL", "label": "More detail"}])

    side = next((side for word, side in ACTION_WORDS.items() if (re.search(rf"(?<![a-z0-9_]){re.escape(word)}(?![a-z0-9_])", folded) if word.isascii() else word in folded)), None)
    negative_words = ("मत", "नहीं", "ना", "नको", "नाही", "नका", "ಬೇಡ", "ಬೇಡಿ", "નહીં", "નથી", "வேண்டாம்", "இல்லை", "வேண்டாம்", "செய்யாதே")
    negated_trade = bool(re.search(r"\b(do not|don't|not|never|cancel|mat|nahi|nahin|nako|naka|beda)\b", folded)) or any(word in folded for word in negative_words)
    if "sector" in folded and any(term in folded for term in ("summary", "summarize", "overview", "sector")):
        answer = PREDEFINED.get("sector overview") or PREDEFINED.get("market overview") or "The IT sector includes software services, consulting, and technology products. This is a demo summary, not live market research."
        return response("STOCK_RESEARCH_PREDEFINED", answer, language, **base, sources=[{"label": "Local demo knowledge", "url": None, "timestamp": None}], extracted_entities={"query": "sector summary"})

    if side and negated_trade and len(re.findall(r"\d+", normalized)) >= 2:
        return response("TRADE_ORDER", "I heard conflicting trade instructions. Please state one clear side and quantity. No order was placed.", language, **base, requires_clarification=True, clarification_question="Should I prepare a buy or sell request, and for how many shares?", action_type="PREPARE_ORDER")

    if side and not negated_trade:
        symbol = resolve_symbol(folded, dictionary)
        qtys = list(re.finditer(r"(?<!\w)(\d+(?:\.\d+)?)\s*(?:shares?|शेयर(?:ों)?|षेअर्स?|शेअर्स?|ಷೇರು(?:ಗಳನ್ನು|ಗಳು|ಗಳ)?|શેર(?:ને|ો)?|பங்குகள(?:ை)?|பங்குகள்)(?=$|\s|[,.;!?])", normalized, re.IGNORECASE))
        qty = qtys[0] if len(qtys) == 1 else None
        if symbol and qty and float(qty.group(1)) > 0 and float(qty.group(1)).is_integer():
            return response("TRADE_ORDER", f"I understood {side.lower()} {int(float(qty.group(1)))} shares of {symbol}. Review this request in the order preview; the assistant does not place orders.", language, **base, action_type="PREPARE_ORDER", action_payload={"symbol": symbol, "side": side, "quantity": int(float(qty.group(1)))}, requires_approval=True, extracted_entities={"symbol": symbol, "side": side, "quantity": int(float(qty.group(1)))}, suggested_actions=[{"id": "REVIEW_ORDER", "label": "Review order"}])
        if allow_incomplete_trade:
            return response("TRADE_ORDER", "I need an unambiguous stock and whole-share quantity before preparing an order. No order was placed.", language, **base, requires_clarification=True, clarification_question="Which stock and how many whole shares?", action_type="PREPARE_ORDER", extracted_entities={"symbol": symbol, "quantity": int(float(qty.group(1))) if qty else None, "side": side})

    if any(word in folded for word in ("portfolio", "watchlist", "holdings")):
        return response("PORTFOLIO_QUERY", "Portfolio data is not connected in this AI demo. No holdings or values are being invented.", language, **base, suggested_actions=[{"id": "OPEN_PORTFOLIO", "label": "Open portfolio"}])

    if any(word in folded for word in ("alert", "notify", "notification")):
        return response("PRICE_ALERT", "I can recognize an alert request, but alert creation is not connected in this AI slice. No alert was created.", language, **base, action_type="PREPARE_ALERT", requires_clarification=True, clarification_question="Which stock, price level and direction should the alert use?")

    if "overview" in folded and resolve_symbol(folded, dictionary):
        symbol = resolve_symbol(folded, dictionary)
        info = {"INFY": "Infosys Limited is an Indian IT services and consulting company.", "TCS": "Tata Consultancy Services is an Indian IT services and consulting company.", "RELIANCE": "Reliance Industries is an Indian conglomerate with energy, retail, telecom and other businesses.", "HDFCBANK": "HDFC Bank is an Indian banking and financial-services company."}
        return response("STOCK_RESEARCH_PREDEFINED", f"Demo company overview for {symbol}: {info.get(symbol, 'Company profile data is unavailable in this local overview.')}", language, **base, sources=[{"label": "Local demo knowledge", "url": None, "timestamp": None}], extracted_entities={"symbol": symbol})

    return None


@router.post("/api/assistant")
def assistant(request: AssistantRequest, http_request: Request):
    enforce_rate_limit(http_request, "assistant", 30)
    original = request.text.strip()
    language = request.language if request.language in LANGUAGES else "en"
    normalized = normalize_numbers(original)

    # Run voice-profile dictionary + multilingual keyword extraction before calling any translation API.
    local_path = "local-keyword-mapping" if language != "en" else "none"
    local_match = _extract_local_intent(
        normalized,
        original,
        language,
        request.input_method,
        request.dictionary,
        translation_path=local_path,
        allow_incomplete_trade=(language == "en"),
    )
    if local_match is not None:
        return local_match

    translation_path = "none"
    if language != "en":
        try:
            translated = providers.translate_text(original, target="en", source="auto")
        except Exception:
            translated = None
        if translated:
            candidate = normalize_numbers(translated["text"])
            numeric_pattern = r"\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?"
            original_numbers = [value.replace(",", "") for value in re.findall(numeric_pattern, normalized)]
            translated_numbers = [value.replace(",", "") for value in re.findall(numeric_pattern, candidate)]
            if original_numbers != translated_numbers:
                return response("GENERAL_QUERY", "The translation changed a number. Please restate the stock quantity or price in digits; no financial action was prepared.", language, original_text=original, normalized_text=candidate, input_method=request.input_method, requires_clarification=True, clarification_question="Please confirm the numbers exactly as digits.", translation_path="pollinations", translation_conflict=True)
            normalized = candidate
            translation_path = "pollinations"
        else:
            translation_path = "local-keyword-fallback"

        translated_match = _extract_local_intent(
            normalized,
            original,
            language,
            request.input_method,
            request.dictionary,
            translation_path=translation_path,
            allow_incomplete_trade=True,
        )
        if translated_match is not None:
            return translated_match

    folded = normalized.casefold()
    currencies = re.findall(r"(?:₹|rs\.?\s*)(\d[\d,]*(?:\.\d+)?)|\b(\d[\d,]*(?:\.\d+)?)\s*(?:rupees?|inr|रुपये|रुपया)\b", normalized, flags=re.IGNORECASE)
    base = {"original_text": original, "normalized_text": normalized, "input_method": request.input_method,
            "original_language": language, "translation_path": translation_path,
            "currency_values_inr": [float((a or b).replace(",", "")) for a, b in currencies]}

    if any(word in folded for word in ("why", "today", "falling", "down", "movement", "announcement", "latest", "news", "week", "kyun", "क्यों", "गिर", "समाचार", "आज", "ಕಡಿಮ", "ಇಳಿಯ", "ಏಕೆ", "घट", "घसर", "குறை", "வீழ", "செய்தி", "пડ", "આજે", "કેમ", "समाचार")):
        agent_answer = run_agent(normalized, language, request.dictionary)
        if agent_answer:
            return response(agent_answer.get("intent", "STOCK_RESEARCH_OPEN"), agent_answer["message"], language, **base, sources=agent_answer.get("sources", []), action_type=agent_answer.get("action_type"), action_payload=agent_answer.get("action_payload"), requires_approval=agent_answer.get("requires_approval",False), requires_clarification=agent_answer.get("requires_clarification",False), extracted_entities={"query": original})
        symbol = resolve_symbol(folded, request.dictionary)
        if symbol:
            try:
                snapshot = providers.market_snapshot(symbol)
                news = providers.market_news(symbol)
                if snapshot.get("available") or news.get("available"):
                    sources = []
                    if snapshot.get("available"):
                        sources.append({"label":"Yahoo Finance prototype quote","url":f"https://finance.yahoo.com/quote/{providers.resolve_provider_symbol(symbol)}","timestamp":snapshot.get("data_timestamp")})
                    sources.extend({"label":article.get("publisher"),"url":article.get("url"),"timestamp":article.get("published_at")} for article in news.get("articles", []) if article.get("url"))
                    parts = []
                    if snapshot.get("available"):
                        parts.append(f"{symbol} was last reported at {snapshot['price']:.2f}, {snapshot['change_percent']:+.2f}% versus the previous close (data timestamp {snapshot['data_timestamp']}).")
                    if news.get("articles"):
                        parts.append("Recent headlines: " + "; ".join(article["title"] for article in news["articles"][:3] if article.get("title")))
                    parts.append("These sources do not establish a cause for the price move.")
                    return response("STOCK_RESEARCH_OPEN", " ".join(parts), language, **base, sources=sources, data_label="Yahoo Finance prototype data; not exchange-authoritative", extracted_entities={"symbol":symbol})
            except Exception:
                pass
        return response("STOCK_RESEARCH_OPEN", "API not set: open-ended research needs configured market/news and AI services. Try one of the predefined research queries instead.", language, **base, suggested_actions=[{"id": "PREDEFINED_RESEARCH", "label": "Browse predefined queries"}])

    agent_answer = run_agent(normalized, language, request.dictionary)
    if agent_answer:
        return response(agent_answer.get("intent", "AI_RESPONSE"), agent_answer["message"], language, **base, sources=agent_answer.get("sources", []), action_type=agent_answer.get("action_type"), action_payload=agent_answer.get("action_payload"), requires_approval=agent_answer.get("requires_approval",False), requires_clarification=agent_answer.get("requires_clarification",False), extracted_entities={})

    return response("GENERAL_QUERY", "I can explain a glossary term or answer a predefined research query in demo mode. For current market information, connect the approved data services.", language, **base, suggested_actions=[{"id": "PREDEFINED_RESEARCH", "label": "Browse predefined queries"}])

@router.post("/api/assistant/message")
def assistant_message(payload: AssistantMessageRequest, http_request: Request):
    """Keep the incoming dashboard contract while serving the AI voice handler."""
    return assistant(AssistantRequest(text=payload.message, language=payload.language), http_request)
