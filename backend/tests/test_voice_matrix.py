"""Transcript-level execution of the 60 supported-language voice scenarios."""

import os
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.main import AssistantRequest, assistant

HTTP_REQUEST = SimpleNamespace(client=SimpleNamespace(host="voice-matrix"))

# Each row is a representative transcript from the documented acceptance matrix.
# Device-specific audio quality is documented separately and cannot be simulated by text tests.
CASES = [
    ("Explain P/E ratio", "EXPLAIN_TERM", None),
    ("What is EPS?", "EXPLAIN_TERM", None),
    ("Explain market capitalisation", "EXPLAIN_TERM", None),
    ("Explain dividend yield", "EXPLAIN_TERM", None),
    ("Explain bull market", "EXPLAIN_TERM", None),
    ("Explain bear market", "EXPLAIN_TERM", None),
    ("Explain mutual funds", "EXPLAIN_TERM", None),
    ("Explain bonds", "EXPLAIN_TERM", None),
    ("Explain portfolio diversification", "EXPLAIN_TERM", None),
    ("Explain stop-loss", "EXPLAIN_TERM", None),
    ("Company overview of Infosys", "STOCK_RESEARCH_PREDEFINED", None),
    ("Explain key financial ratios", "STOCK_RESEARCH_PREDEFINED", None),
    ("Show recent announcements for TCS", "STOCK_RESEARCH_PREDEFINED", None),
    ("Summarize the IT sector", "STOCK_RESEARCH_PREDEFINED", None),
    ("Summarize weekly price movement for Reliance", "STOCK_RESEARCH_PREDEFINED", None),
    ("Why is Reliance falling today?", "STOCK_RESEARCH_OPEN", None),
    ("Buy ten shares of Infosys", "TRADE_ORDER", {"symbol":"INFY","side":"BUY","quantity":10}),
    ("Sell 10 shares of TCS", "TRADE_ORDER", {"symbol":"TCS","side":"SELL","quantity":10}),
    ("Buy 2.5 thousand shares of Reliance", "TRADE_ORDER", {"symbol":"RELIANCE","side":"BUY","quantity":2500}),
    ("Buy 1 lakh shares of TCS", "TRADE_ORDER", {"symbol":"TCS","side":"BUY","quantity":100000}),
    ("Reliance kyun gir raha hai?", "STOCK_RESEARCH_OPEN", None),
    ("दस शेयर Infosys खरीदो", "TRADE_ORDER", {"symbol":"INFY","side":"BUY","quantity":10}),
    ("दो शेयर TCS बेचो", "TRADE_ORDER", {"symbol":"TCS","side":"SELL","quantity":2}),
    ("P/E ratio samjhao", "EXPLAIN_TERM", None),
    ("एक लाख रुपये", "GENERAL_QUERY", None),
    ("डेढ़ करोड़ रुपये", "GENERAL_QUERY", None),
    ("रिलायंस का overview", "STOCK_RESEARCH_PREDEFINED", None),
    ("TCS ka portfolio dikhao", "PORTFOLIO_QUERY", None),
    ("पाँच शेयर Infosys मत खरीदो", "GENERAL_QUERY", None),
    ("Buy 10 shares or 20 shares of TCS", "TRADE_ORDER", None),
    ("Reliance ke 10 shares buy karo", "TRADE_ORDER", {"symbol":"RELIANCE","side":"BUY","quantity":10}),
    ("TCS 2.5 thousand shares bechna hai", "TRADE_ORDER", {"symbol":"TCS","side":"SELL","quantity":2500}),
    ("Buy 1.5 crore rupees of Infosys", "TRADE_ORDER", None),
    ("HDFC Bank latest news kya hai?", "STOCK_RESEARCH_OPEN", None),
    ("Nifty ka P/E explain karo", "EXPLAIN_TERM", None),
    ("10 shares nahi, 5 shares kharido Infosys", "TRADE_ORDER", None),
    ("Buy mat karo, just explain P/E", "EXPLAIN_TERM", None),
    ("Alert me if TCS falls below 3500", "PRICE_ALERT", None),
    ("P/E ratio ಅಂದರೆ ಏನು?", "EXPLAIN_TERM", None),
    ("Infosys ನ 10 ಷೇರುಗಳನ್ನು ಖರೀದಿಸಿ", "TRADE_ORDER", {"symbol":"INFY","side":"BUY","quantity":10}),
    ("TCS ನ 2 ಷೇರುಗಳನ್ನು ಮಾರಾಟ ಮಾಡಿ", "TRADE_ORDER", {"symbol":"TCS","side":"SELL","quantity":2}),
    ("Reliance ಇಂದು ಏಕೆ ಇಳಿಯುತ್ತಿದೆ?", "STOCK_RESEARCH_OPEN", None),
    ("₹1 ಲಕ್ಷ", "GENERAL_QUERY", None),
    ("Infosys 10 shares ಖರೀದಿಸಿ ಬೇಡ", "GENERAL_QUERY", None),
    ("P/E ratio म्हणजे काय?", "EXPLAIN_TERM", None),
    ("Infosys चे 10 शेअर्स खरेदी करा", "TRADE_ORDER", {"symbol":"INFY","side":"BUY","quantity":10}),
    ("TCS चे 2 शेअर्स विका", "TRADE_ORDER", {"symbol":"TCS","side":"SELL","quantity":2}),
    ("Reliance आज का घसरत आहे?", "STOCK_RESEARCH_OPEN", None),
    ("₹2,500 रुपये", "GENERAL_QUERY", None),
    ("Infosys चे 10 शेअर्स खरेदी करा नका", "GENERAL_QUERY", None),
    ("P/E ratio என்றால் என்ன?", "EXPLAIN_TERM", None),
    ("Infosys-ன் 10 பங்குகளை வாங்கு", "TRADE_ORDER", {"symbol":"INFY","side":"BUY","quantity":10}),
    ("TCS-ன் 2 பங்குகளை விற்பனை செய்", "TRADE_ORDER", {"symbol":"TCS","side":"SELL","quantity":2}),
    ("Reliance இன்று ஏன் வீழ்கிறது?", "STOCK_RESEARCH_OPEN", None),
    ("Buy 2.5 ஆயிரம் shares of Reliance", "TRADE_ORDER", {"symbol":"RELIANCE","side":"BUY","quantity":2500}),
    ("P/E ratio શું છે?", "EXPLAIN_TERM", None),
    ("Infosys ના 10 શેર ખરીદો", "TRADE_ORDER", {"symbol":"INFY","side":"BUY","quantity":10}),
    ("Reliance આજે કેમ ઘટી રહ્યું છે?", "STOCK_RESEARCH_OPEN", None),
    ("₹૨,૫૦૦", "GENERAL_QUERY", None),
    ("પાંચ શેર TCS વેચો", "TRADE_ORDER", {"symbol":"TCS","side":"SELL","quantity":5}),
]


class VoiceTranscriptMatrixTests(unittest.TestCase):
    def test_all_sixty_transcript_scenarios(self):
        self.assertEqual(len(CASES), 60)
        failures = []
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY":""}), \
             patch("app.main.providers.market_snapshot", side_effect=RuntimeError("offline")), \
             patch("app.main.providers.market_news", side_effect=RuntimeError("offline")), \
             patch("app.main.providers.translate_text", return_value=None), \
             patch("app.main.enforce_rate_limit"):
            for index, (utterance, expected_intent, expected_payload) in enumerate(CASES, 1):
                result = assistant(AssistantRequest(text=utterance, language="en" if index <= 38 else ("kn" if index <= 44 else "mr" if index <= 50 else "ta" if index <= 56 else "gu"), input_method="speech"), HTTP_REQUEST)
                if result["intent"] != expected_intent:
                    failures.append(f"{index}: expected {expected_intent}, got {result['intent']} for {utterance!r}")
                if expected_payload is not None and result.get("action_payload") != expected_payload:
                    failures.append(f"{index}: expected payload {expected_payload}, got {result.get('action_payload')} for {utterance!r}")
                if expected_intent == "TRADE_ORDER" and expected_payload is None and not result.get("requires_clarification"):
                    failures.append(f"{index}: ambiguous order did not ask for clarification")
                if result.get("action_payload") and result.get("action_payload") != expected_payload:
                    failures.append(f"{index}: unexpected financial payload {result.get('action_payload')}")
        self.assertFalse(failures, "\n".join(failures))


if __name__ == "__main__":
    unittest.main()
