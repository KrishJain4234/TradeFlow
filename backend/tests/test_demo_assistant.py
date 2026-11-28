import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import AssistantRequest, ExplainRequest, assistant, explain, normalize_numbers

HTTP_REQUEST = SimpleNamespace(client=SimpleNamespace(host="127.0.0.1"))


class DemoAssistantTests(unittest.TestCase):
    def test_localized_number_and_scale_normalization(self):
        self.assertEqual(normalize_numbers("das shares, 2.5 thousand, 1 lakh and 1.5 crore"), "10 shares, 2500, 100000 and 15000000")

    def test_voice_trade_request_only_prepares_preview(self):
        answer = assistant(AssistantRequest(text="Reliance ke 10 shares buy karo", input_method="speech"), HTTP_REQUEST)
        self.assertEqual(answer["intent"], "TRADE_ORDER")
        self.assertEqual(answer["action_payload"], {"symbol": "RELIANCE", "side": "BUY", "quantity": 10})
        self.assertTrue(answer["requires_approval"])
        self.assertEqual(answer["input_method"], "speech")

    def test_negated_trade_is_not_prepared(self):
        answer = assistant(AssistantRequest(text="Do not buy 10 shares of Infosys"), HTTP_REQUEST)
        self.assertNotEqual(answer["intent"], "TRADE_ORDER")
        self.assertIsNone(answer["action_payload"])

    def test_missing_order_quantity_asks_for_clarification(self):
        answer = assistant(AssistantRequest(text="Buy Infosys shares"), HTTP_REQUEST)
        self.assertTrue(answer["requires_clarification"])
        self.assertIsNone(answer["action_payload"])

    def test_predefined_research_is_demo_labeled(self):
        answer = assistant(AssistantRequest(text="Company overview of Infosys"), HTTP_REQUEST)
        self.assertEqual(answer["intent"], "STOCK_RESEARCH_PREDEFINED")
        self.assertTrue(answer["sources"])
        self.assertIn("demo", answer["data_label"].lower())

    def test_open_research_reports_missing_services(self):
        with patch("app.main.providers.market_snapshot", side_effect=RuntimeError("offline")), patch("app.main.providers.market_news", side_effect=RuntimeError("offline")):
            answer = assistant(AssistantRequest(text="Why is Reliance falling today?"), HTTP_REQUEST)
        self.assertEqual(answer["intent"], "STOCK_RESEARCH_OPEN")
        self.assertIn("API not set", answer["message"])
        self.assertFalse(answer["sources"])

    def test_glossary_has_definition_and_example_without_api_keys(self):
        answer = explain(ExplainRequest(term="P/E ratio"))
        self.assertIn("definition", answer)
        self.assertIn("example", answer)
        self.assertEqual(answer["source"], "local glossary")


if __name__ == "__main__":
    unittest.main()
