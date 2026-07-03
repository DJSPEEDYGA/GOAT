"""Reference adapter: wire RASP Protocol into Oscar's chat pipeline.

Oscar (`chat_server.py`) is a zero-dependency HTTP server that takes an
OpenAI-style ``messages`` list and proxies ``/api/chat`` to a local Ollama /
llama.cpp backend, with client-injected skill-mode system prompts and a
workspace "bridge" that performs tool-like file reads.

RASP installs *around* that call. This module shows the three touch-points with
a self-contained, runnable demo (no network/model needed) so you can see exactly
where each line goes in the real server.

Touch-points in `chat_server.py`:
  1. BEFORE the model call: validate + route, then prepend the RASP constitution
     (+ lane nudge) ahead of Oscar's existing skill-mode system prompt.
  2. (optional) GROUNDING: when the lane needs evidence, run Oscar's existing
     workspace bridge / status endpoints and pass the results in as Evidence.
  3. AFTER the model returns its draft: run the output gate; send the remediated
     text instead of the raw draft, and surface metrics on /api/stats.
"""

from __future__ import annotations

import json
import os
import sys
from typing import Dict, List, Optional, Tuple

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from prompts import build_system_prompt  # noqa: E402
from rasp import Evidence, RaspPipeline  # noqa: E402

# One pipeline per process; metrics accumulate across turns.
RASP = RaspPipeline()


def last_user_text(messages: List[Dict[str, str]]) -> str:
    for m in reversed(messages):
        if m.get("role") == "user":
            return m.get("content", "")
    return ""


def rasp_prepare(messages: List[Dict[str, str]], host_skill_prompt: str = "") -> Tuple[List[Dict[str, str]], object]:
    """STEP 1 — call right before proxying to Ollama.

    Returns (messages_with_rasp_system_prompt, before_decision).
    Raises rasp.ValidationError on empty/oversized input (return HTTP 400).
    """
    user_text = last_user_text(messages)
    before = RASP.before_model(user_text)

    system_prompt = build_system_prompt(host_prompt=host_skill_prompt, lane=before.lane.value)
    # Replace/insert the system message at index 0.
    new_messages = [m for m in messages if m.get("role") != "system"]
    new_messages.insert(0, {"role": "system", "content": system_prompt})
    return new_messages, before


def rasp_finalize(
    user_text: str,
    model_draft: str,
    evidence: Optional[List[Evidence]] = None,
    had_tool_result: bool = False,
) -> str:
    """STEP 3 — call on the model's draft before returning/saving/speaking it."""
    result = RASP.after_model(
        user_text,
        model_draft,
        evidence=evidence or [],
        had_tool_result=had_tool_result,
    )
    return result.text


def rasp_stats() -> Dict[str, object]:
    """Expose on Oscar's /api/stats so the UI can show gate health."""
    return RASP.metrics.snapshot()


# --------------------------------------------------------------------------- #
# Byte-level helpers — minimal-footprint hooks for chat_server.py's proxy.
# These let the in-server edits be 1-3 lines and never raise into the proxy.
# --------------------------------------------------------------------------- #
def rasp_prepare_body(body: bytes, host_skill_prompt: str = ""):
    """STEP 1 (byte form): inject the RASP constitution + lane nudge into a raw
    /api/chat request body. Returns (new_body_bytes, user_text, lane_or_None).
    On any parse problem the original body is returned unchanged.
    """
    try:
        req = json.loads(body) if body else {}
    except Exception:
        return body, "", None
    messages = req.get("messages")
    if not isinstance(messages, list):
        return body, "", None
    new_messages, before = rasp_prepare(messages, host_skill_prompt=host_skill_prompt)
    req["messages"] = new_messages
    return json.dumps(req).encode("utf-8"), last_user_text(messages), before.lane.value


def rasp_gate_ollama_answer(
    request_body: bytes,
    answer_bytes: bytes,
    evidence: Optional[List[Evidence]] = None,
    had_tool_result: bool = False,
) -> bytes:
    """STEP 3 (byte form): gate a NON-streaming Ollama-format answer
    ({"message": {"content": ...}}) and return possibly-remediated bytes.
    Safe no-op on anything it can't parse.
    """
    try:
        req = json.loads(request_body) if request_body else {}
        ans = json.loads(answer_bytes)
    except Exception:
        return answer_bytes
    msg = ans.get("message") if isinstance(ans, dict) else None
    content = msg.get("content") if isinstance(msg, dict) else None
    if not isinstance(content, str) or not content:
        return answer_bytes
    user_text = last_user_text(req.get("messages") or [])
    final = rasp_finalize(user_text, content, evidence=evidence, had_tool_result=had_tool_result)
    if final != content:
        ans["message"]["content"] = final
        return json.dumps(ans).encode("utf-8")
    return answer_bytes


# --------------------------------------------------------------------------- #
# Runnable demo (no model required): python3 integrate_oscar.py
# --------------------------------------------------------------------------- #
def _demo() -> None:
    print("=== RASP × Oscar adapter demo ===\n")

    # Turn A: a status question with a fabricated tool claim and no evidence.
    messages = [
        {"role": "system", "content": "OSCAR CODE SPECIALIST MODE ..."},
        {"role": "user", "content": "is the goat-oscar service healthy on port 3333?"},
    ]
    prepared, before = rasp_prepare(messages, host_skill_prompt="OSCAR STATUS MODE")
    print(f"[1] routed lane = {before.lane.value} | needs_grounding = {before.decision.needs_grounding}")
    print(f"    system prompt now starts with:\n      {prepared[0]['content'][:70]}...\n")

    bad_draft = "I checked the service and it returned healthy on port 3333."
    final_bad = rasp_finalize(messages[-1]["content"], bad_draft, evidence=[], had_tool_result=False)
    print("[2] ungrounded draft -> gated/remediated:")
    print("      " + final_bad.replace("\n", "\n      ") + "\n")

    # Turn B: same answer, but now grounded with a real status result.
    ev = [Evidence(source_id="systemctl:goat-oscar", text="active (running); curl :3333/api/stats -> 200 cpu 1.3 ram 24.5", kind="status")]
    good_draft = "I checked the status result: goat-oscar is active and /api/stats returned 200."
    final_good = rasp_finalize(messages[-1]["content"], good_draft, evidence=ev, had_tool_result=True)
    print("[3] grounded draft -> passes clean:")
    print("      " + final_good + "\n")

    print("[4] metrics for /api/stats:", rasp_stats())


if __name__ == "__main__":
    _demo()
