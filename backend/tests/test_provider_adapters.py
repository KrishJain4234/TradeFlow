import base64
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import agent, providers


class ProviderAdapterTests(unittest.TestCase):
    def test_wispr_sends_audio_and_dictionary_server_side(self):
        audio = base64.b64encode(b"RIFF" + b"\0" * 24).decode()
        response = MagicMock()
        response.json.return_value = {"text":"Buy 10 shares of Reliance", "detected_language":"en"}
        with patch.dict(os.environ, {"WISPR_API_KEY":"server-only"}), patch("app.providers.httpx.post", return_value=response) as post:
            result = providers.wispr_transcribe(audio,"en",{"my Reliance":"RELIANCE"})
        self.assertEqual(result["text"],"Buy 10 shares of Reliance")
        call = post.call_args
        self.assertEqual(call.kwargs["headers"]["Authorization"],"Bearer server-only")
        self.assertIn("my Reliance",call.kwargs["json"]["context"]["dictionary_context"])
        self.assertEqual(call.kwargs["json"]["audio"],audio)

    def test_wispr_requires_wav_and_never_runs_without_key(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(RuntimeError):
                providers.wispr_transcribe("UklGRg==","en",{})
        with patch.dict(os.environ, {"WISPR_API_KEY":"configured"}):
            with self.assertRaises(ValueError):
                providers.wispr_transcribe("d2VibQ==","en",{})

    def test_sarvam_translation_uses_private_key_and_selected_target(self):
        response = MagicMock()
        response.json.return_value = {"translated_text":"Why is Reliance falling today?","source_language_code":"hi-IN"}
        with patch.dict(os.environ,{"SARVAM_API_KEY":"server-only"}), patch("app.providers.httpx.post",return_value=response) as post:
            translated=providers.translate_text("Reliance kyun gir raha hai?",target="en",source="auto")
        self.assertIn("Why is Reliance",translated["text"])
        self.assertEqual(post.call_args.kwargs["headers"]["api-subscription-key"],"server-only")
        self.assertEqual(post.call_args.kwargs["json"]["target_language_code"],"en-IN")

    def test_sarvam_speech_decodes_provider_audio(self):
        encoded=base64.b64encode(b"mock-mp3").decode()
        response=MagicMock();response.json.return_value={"audios":[encoded]}
        with patch.dict(os.environ,{"SARVAM_API_KEY":"server-only"}), patch("app.providers.httpx.post",return_value=response):
            result=providers.sarvam_speech("नमस्ते","hi")
        self.assertEqual(result,(b"mock-mp3","audio/mpeg"))

    def test_windows_tts_is_second_choice_and_browser_remains_final_fallback(self):
        with patch("app.providers.sarvam_speech",side_effect=RuntimeError("provider offline")), patch("app.providers.windows_speech",return_value=(b"wav","audio/wav")):
            self.assertEqual(providers.synthesize("hello","en"),(b"wav","audio/wav","windows"))
        with patch("app.providers.sarvam_speech",return_value=None), patch("app.providers.windows_speech",return_value=None):
            self.assertIsNone(providers.synthesize("hello","en"))

    def test_agent_is_demo_without_key_and_order_tool_never_submits(self):
        with patch.dict(os.environ,{},clear=True):
            self.assertIsNone(agent.run_agent("show me a stock","en",{}))
        result=agent._run_tool("prepare_order",{"symbol":"INFY","side":"BUY","quantity":3},{})
        self.assertTrue(result["requires_approval"])
        self.assertFalse(result["submitted"])


if __name__ == "__main__":
    unittest.main()
