#!/usr/bin/env python3
"""Unit tests for the RASP runtime kernel. Run: python3 -m unittest -v test_rasp"""

from __future__ import annotations

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from rasp import (  # noqa: E402
    Evidence,
    Lane,
    OutputGate,
    RaspPipeline,
    ValidationError,
    claims_tool_ran,
    generic_reset,
    has_not_proven_boundary,
    mentions_known_symbol,
    readiness_claim,
    source_supports_claim,
)


class TestInputValidation(unittest.TestCase):
    def setUp(self):
        self.pipe = RaspPipeline()

    def test_empty_rejected(self):
        for bad in (None, "", "   ", "\x00\x00"):
            with self.assertRaises(ValidationError):
                self.pipe.validate_input(bad)

    def test_oversize_rejected(self):
        with self.assertRaises(ValidationError):
            self.pipe.validate_input("x" * (self.pipe.max_input_chars + 1))

    def test_null_bytes_stripped(self):
        self.assertEqual(self.pipe.validate_input("he\x00llo"), "hello")


class TestRouter(unittest.TestCase):
    def setUp(self):
        self.pipe = RaspPipeline()

    def _lane(self, text):
        return self.pipe.before_model(text).lane

    def test_normal_chat(self):
        self.assertEqual(self._lane("thanks that was great"), Lane.NORMAL_CHAT)

    def test_code_file(self):
        self.assertEqual(self._lane("read src/app.py and patch the handler"), Lane.CODE_FILE)

    def test_status_runtime(self):
        self.assertEqual(self._lane("is the server healthy on port 3333"), Lane.STATUS_RUNTIME)

    def test_rag_research(self):
        self.assertEqual(self._lane("according to the document, summarize the eval rule"), Lane.RAG_RESEARCH)

    def test_readiness(self):
        self.assertEqual(self._lane("is it production-ready and bug-free?"), Lane.READINESS)

    def test_sensitive_wins_tie(self):
        # Sensitive + readiness both present -> sensitive (highest risk) wins.
        self.assertEqual(self._lane("publish to prod, it's production-ready"), Lane.SENSITIVE_ACTION)

    def test_fast_path_only_for_trivial_chat(self):
        self.assertTrue(self.pipe.before_model("thanks!").decision.fast_path)
        self.assertFalse(self.pipe.before_model("read main.py").decision.fast_path)

    def test_grounding_required_flags(self):
        self.assertTrue(self.pipe.before_model("check the server status").decision.needs_grounding)
        self.assertFalse(self.pipe.before_model("hello there").decision.needs_grounding)


class TestDetectors(unittest.TestCase):
    def test_generic_reset(self):
        self.assertTrue(generic_reset("How can I assist you today?"))
        self.assertFalse(generic_reset("Here is the fix for your bug."))

    def test_claims_tool_ran(self):
        self.assertTrue(claims_tool_ran("I ran the tests and they passed"))
        self.assertTrue(claims_tool_ran("I checked the endpoint"))
        self.assertFalse(claims_tool_ran("You should run the tests"))

    def test_readiness_and_boundary(self):
        self.assertTrue(readiness_claim("this is production-ready"))
        self.assertTrue(has_not_proven_boundary("this is not proven; checks remain"))
        self.assertFalse(has_not_proven_boundary("this is production-ready"))

    def test_mentions_known_symbol(self):
        self.assertTrue(mentions_known_symbol("look at app/page.tsx"))
        self.assertTrue(mentions_known_symbol("what does do_POST() do"))
        self.assertTrue(mentions_known_symbol("hit https://x.io/health"))
        self.assertFalse(mentions_known_symbol("how are you doing today"))

    def test_source_support(self):
        ev = [Evidence(source_id="d1", text="golden evals must pass before promoting any adapter")]
        good = "According to the document, golden evals must pass before promoting an adapter."
        bad = "According to the document, deploy to prod immediately without testing."
        self.assertTrue(source_supports_claim(good, ev))
        self.assertFalse(source_supports_claim(bad, ev))
        # No citation -> nothing to check -> True
        self.assertTrue(source_supports_claim("just a normal answer", ev))


class TestOutputGate(unittest.TestCase):
    def setUp(self):
        self.pipe = RaspPipeline()

    def test_fake_tool_blocked_then_remediated(self):
        r = self.pipe.after_model("is it up?", "I ran the check, it's healthy.")
        self.assertIn(OutputGate.FAKE_TOOL, r.block_codes)
        self.assertFalse(r.allowed)
        self.assertTrue(r.remediated)
        self.assertIn("[RASP]", r.text)

    def test_fake_tool_ok_when_grounded(self):
        r = self.pipe.after_model("is it up?", "I checked it, healthy.", had_tool_result=True)
        self.assertEqual(r.block_codes, [])
        self.assertTrue(r.allowed)

    def test_readiness_overclaim(self):
        r = self.pipe.after_model("can we ship?", "Yes, fully tested and production-ready.")
        self.assertIn(OutputGate.READINESS_OVERCLAIM, r.block_codes)

    def test_readiness_bounded_passes(self):
        r = self.pipe.after_model(
            "can we ship?",
            "UI verified, but not proven production-ready: load + auth checks remain.",
        )
        self.assertEqual(r.block_codes, [])

    def test_clean_chat_passes(self):
        r = self.pipe.after_model("thanks!", "Glad it helped — shout if you need more.")
        self.assertTrue(r.allowed)


class TestMetrics(unittest.TestCase):
    def test_counts_accumulate(self):
        pipe = RaspPipeline()
        pipe.before_model("thanks")
        pipe.before_model("read app.py")
        pipe.after_model("is it up?", "I ran it, healthy.")
        snap = pipe.metrics.snapshot()
        self.assertEqual(snap["turns"], 2)
        self.assertIn("fake_tool_claim", snap["gate_blocks"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
