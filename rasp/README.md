# RASP Protocol — runtime kernel for Oscar (and any local LLM agent)

**RASP = Routing, Alignment, Safety, Proof.** A portable, **zero-dependency**
(Python stdlib only) control loop you install *around* a model, not inside it:

```
validate input → route intent → ground (tools/RAG) → draft → output gate → close
```

This is a working implementation of the RASP Protocol packet by Raspy. Where the
packet names a detector but leaves it abstract (`genericReset`, `claimsToolRan`,
`sourceSupportsClaim`, …), this module ships a real heuristic v1 plus a fast path,
a per-stage time budget, **remediation** (a blocked draft is never a dead turn),
metrics, and a golden-eval harness.

## Why this exists
Dropping the PDF/prompt into a folder is **not** installing RASP — the gates only
help if they run on every turn. This package makes RASP *actually run* and
*verifiable* (`run_evals.py` must pass before you promote any change).

## Files
| File | What it is |
|---|---|
| `rasp.py` | Core kernel: `IntentRouter`, `OutputGate`, `RaspPipeline`, `Evidence`, `Metrics`, detectors. |
| `prompts.py` | The RASP constitution system prompt + per-lane nudges + `build_system_prompt()`; `RASP_VERSION`. |
| `integrate_oscar.py` | Reference adapter + runnable demo showing the 3 touch-points in `chat_server.py`. |
| `run_evals.py` | Golden-eval harness (eval-first promotion gate). Non-zero exit on failure. |
| `evals/golden_seed.jsonl` | Golden cases (routing + gate expectations). Grow this with every correction. |
| `test_rasp.py` | Unit tests (`python3 -m unittest test_rasp`). |

## Quick start
```bash
cd rasp
python3 -m unittest test_rasp     # 22 unit tests
python3 run_evals.py              # golden evals (promotion gate)
python3 integrate_oscar.py        # see the adapter work, no model needed
```

## Wiring into Oscar (`chat_server.py`)
Three touch-points (see `integrate_oscar.py` for copy-pasteable code):

1. **Before the model call** — validate + route, then prepend the RASP
   constitution + lane nudge ahead of Oscar's existing skill-mode prompt:
   ```python
   from integrate_oscar import rasp_prepare, rasp_finalize, rasp_stats, last_user_text
   messages, before = rasp_prepare(messages, host_skill_prompt=skill_prompt)
   ```
2. **Grounding (optional, when `before.decision.needs_grounding`)** — run Oscar's
   existing workspace bridge / status endpoints and collect results as
   `Evidence(source_id, text, kind)`.
3. **After the model returns** — gate the draft before saving/speaking/returning:
   ```python
   final = rasp_finalize(last_user_text(messages), model_draft,
                         evidence=evidence, had_tool_result=bool(evidence))
   ```
   Expose `rasp_stats()` on `/api/stats` so the UI shows gate health.

## Lanes (intent router)
`normal_chat` · `code_file` · `status_runtime` · `rag_research` · `readiness` ·
`sensitive_action`. Highest-risk matched lane wins; `sensitive_action` and
`readiness` outrank everything so the strictest required action applies.

## Output gate checks
| Code | Blocks | Remediation |
|---|---|---|
| `generic_reset_response` | "How can I assist?" after a real task/praise | revise |
| `should_search_not_ask` | asking the user for a file/symbol approved tools can fetch | revise |
| `fake_tool_claim` | "I ran/checked/tested…" with no tool result attached | strip claim |
| `readiness_overclaim` | "production-ready/bug-free/proven" with no not-proven boundary | downgrade |
| `citation_mismatch` | a cited source that doesn't support the claim (token-overlap check) | revise |

## Design choices vs. the packet
- **Detectors implemented**, not asserted — the hard 80% the PDF leaves out.
- **Fast path**: trivial normal-chat turns skip the heavy gates (latency budget).
- **Remediation**: every block has a concrete fallback action + safe rewrite.
- **Metrics**: `gate_block_rate`, `grounding_hit_rate`, per-code block counts —
  so thresholds get tuned from real traffic.
- **Versioned constitution** (`RASP_VERSION`) with explicit precedence over host
  skill prompts, so it's rollback-able.

## Known limitations (honest)
- Heuristic/regex detectors → tune on real traffic; swap `source_supports_claim`
  for embedding similarity in production (token-overlap is the cheap v1).
- The citation/verify pass can itself be wrong; treat gate blocks as advisory +
  remediation, not hard truth.
- English-only patterns today.

## Promotion rule
Do not promote a prompt, adapter, model, or RASP change unless `run_evals.py`
exits 0. Add a golden case for every real failure you correct.
