from __future__ import annotations

import re
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="TradeFlow AI and Voice API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

LANGUAGES = {"en": "English", "hi": "Hindi", "kn": "Kannada", "mr": "Marathi", "gu": "Gujarati", "ta": "Tamil"}
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
    "das": 10, "एक": 1, "एक": 1, "दो": 2, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "दस": 10,
    "दोन": 2, "तीन": 3, "दहा": 10,
    "ಒಂದು": 1, "ಎರಡು": 2, "ಮೂರು": 3, "ಹತ್ತು": 10,
    "એક": 1, "બે": 2, "ત્રણ": 3, "દસ": 10,
    "ஒன்று": 1, "இரண்டு": 2, "மூன்று": 3, "பத்து": 10,
}
ACTION_WORDS.update({"ಖರೀದಿಸಿ": "BUY", "ಖರೀದಿ": "BUY", "வாங்கு": "BUY", "ખરીદો": "BUY", "खरेदी": "BUY", "विक्री": "SELL", "விற்க": "SELL", "விற்பனை": "SELL", "વેચો": "SELL", "विका": "SELL", "ಮಾರಾಟ": "SELL"})
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

def normalize_numbers(text: str) -> str:
    out = text
    for word, value in sorted(NUMBER_WORDS.items(), key=lambda item: -len(item[0])):
        out = re.sub(rf"(?<!\w){re.escape(word)}(?!\w)", str(value), out, flags=re.IGNORECASE)
    out = re.sub(r"(?i)(\d+(?:\.\d+)?)\s*(crore|crores|करोड़)\b", lambda m: str(float(m.group(1)) * 10_000_000).rstrip("0").rstrip("."), out)
    out = re.sub(r"(?i)(\d+(?:\.\d+)?)\s*(lakh|lakhs|लाख)\b", lambda m: str(float(m.group(1)) * 100_000).rstrip("0").rstrip("."), out)
    out = re.sub(r"(?i)(\d+(?:\.\d+)?)\s*(thousand|k)\b", lambda m: str(float(m.group(1)) * 1000).rstrip("0").rstrip("."), out)
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
        "mode": "demo", "data_label": "Demo knowledge; not live market data",
    }
    result.update(values)
    currency_values = result.pop("currency_values_inr", [])
    if currency_values:
        result["extracted_entities"] = {**result.get("extracted_entities", {}), "currency_values_inr": currency_values}
    return result

@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "demo", "languages": LANGUAGES, "voice": {"wispr": False, "browser_recognition": True, "sarvam_tts": False, "browser_tts": True}}

@app.get("/api/research/predefined")
def predefined_queries():
    return {"items": list(PREDEFINED.keys())}

@app.post("/api/education/explain")
def explain(request: ExplainRequest):
    key = re.sub(r"[^a-z0-9 ]", "", request.term.casefold()).strip()
    for glossary_key, item in GLOSSARY.items():
        if key == glossary_key or key in (item["term"].casefold(), item["term"].casefold().replace("-", " ")):
            return {**item, "language": request.language if request.language in LANGUAGES else "en", "source": "local glossary", "mode": "demo"}
    return {"term": request.term, "definition": "This term is not in the local demo glossary yet. Connect the explanation service to request a generated explanation.", "example": "No example is available in demo mode.", "language": request.language if request.language in LANGUAGES else "en", "source": "fallback", "mode": "demo"}

@app.post("/api/assistant")
def assistant(request: AssistantRequest):
    original = request.text.strip()
    normalized = normalize_numbers(original)
    folded = normalized.casefold()
    language = request.language if request.language in LANGUAGES else "en"
    currencies = re.findall(r"(?:₹|rs\.?\s*)(\d[\d,]*(?:\.\d+)?)|\b(\d[\d,]*(?:\.\d+)?)\s*(?:rupees?|inr|रुपये|रुपया)\b", normalized, flags=re.IGNORECASE)
    base = {"original_text": original, "normalized_text": normalized, "input_method": request.input_method,
            "currency_values_inr": [float((a or b).replace(",", "")) for a, b in currencies]}

    # Explain terms before broad research classification.
    for term in GLOSSARY:
        if term in folded or term.replace(" ", "-") in folded:
            item = explain(ExplainRequest(term=term, language=language))
            return response("EXPLAIN_TERM", f"{item['term']}: {item['definition']} {item['example']}", language, **base, extracted_entities={"term": item["term"]}, suggested_actions=[{"id": "LISTEN", "label": "Listen"}])

    for query, answer in PREDEFINED.items():
        if query in folded:
            return response("STOCK_RESEARCH_PREDEFINED", answer, language, **base, sources=[{"label": "Local demo knowledge", "url": None, "timestamp": None}], extracted_entities={"query": query}, suggested_actions=[{"id": "MORE_DETAIL", "label": "More detail"}])

    side = next((side for word, side in ACTION_WORDS.items() if re.search(rf"(?<!\w){re.escape(word)}(?!\w)", folded)), None)
    negated_trade = bool(re.search(r"\b(do not|don't|not|never|cancel|मत|नहीं|ना|नको|नाही|ಬೇಡ|ಬೇಡಾ|નહીં|வேண்டாம்|இல்லை)\b", folded))
    if side and not negated_trade:
        symbol = resolve_symbol(folded, request.dictionary)
        qty = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:shares?|शेयर(?:ों)?|ಷೇರು(?:ಗಳು)?|शेअर्स?|શેર|பங்குகள்)\b", normalized, re.IGNORECASE)
        if not symbol or not qty or float(qty.group(1)) <= 0 or not float(qty.group(1)).is_integer():
            return response("TRADE_ORDER", "I need an unambiguous stock and whole-share quantity before preparing an order. No order was placed.", language, **base, requires_clarification=True, clarification_question="Which stock and how many whole shares?", action_type="PREPARE_ORDER", extracted_entities={"symbol": symbol, "quantity": int(float(qty.group(1))) if qty else None, "side": side})
        return response("TRADE_ORDER", f"I understood {side.lower()} {int(float(qty.group(1)))} shares of {symbol}. Review this request in the order preview; the assistant does not place orders.", language, **base, action_type="PREPARE_ORDER", action_payload={"symbol": symbol, "side": side, "quantity": int(float(qty.group(1)))}, requires_approval=True, extracted_entities={"symbol": symbol, "side": side, "quantity": int(float(qty.group(1)))}, suggested_actions=[{"id": "REVIEW_ORDER", "label": "Review order"}])

    if any(word in folded for word in ("portfolio", "watchlist", "holdings")):
        return response("PORTFOLIO_QUERY", "Portfolio data is not connected in this AI demo. No holdings or values are being invented.", language, **base, suggested_actions=[{"id": "OPEN_PORTFOLIO", "label": "Open portfolio"}])

    if any(word in folded for word in ("alert", "notify", "notification")):
        return response("PRICE_ALERT", "I can recognize an alert request, but alert creation is not connected in this AI slice. No alert was created.", language, **base, action_type="PREPARE_ALERT", requires_clarification=True, clarification_question="Which stock, price level and direction should the alert use?")

    if any(word in folded for word in ("why", "today", "falling", "down", "movement", "announcement", "latest", "news", "week", "kyun", "क्यों", "गिर", "समाचार", "आज", "ಕಡಿಮ", "घट", "குறை", "செய்தி", "пડ", "સમાચાર")):
        return response("STOCK_RESEARCH_OPEN", "API not set: open-ended research needs configured market/news and AI services. Try one of the predefined research queries instead.", language, **base, suggested_actions=[{"id": "PREDEFINED_RESEARCH", "label": "Browse predefined queries"}])

    return response("GENERAL_QUERY", "I can explain a glossary term or answer a predefined research query in demo mode. For current market information, connect the approved data services.", language, **base, suggested_actions=[{"id": "PREDEFINED_RESEARCH", "label": "Browse predefined queries"}])
