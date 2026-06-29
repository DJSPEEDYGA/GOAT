#!/usr/bin/env python3
"""RASP golden-eval harness.

Eval-first: nothing (prompt, adapter, model, or RASP change) gets promoted unless
these pass. Run::

    python3 run_evals.py            # uses evals/golden_seed.jsonl
    python3 run_evals.py path.jsonl # custom seed

Exit code is non-zero on any failure so it can gate CI / promotion.
"""

from __future__ import annotations

import json
import os
import sys
from typing import Dict, List

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from rasp import Evidence, RaspPipeline  # noqa: E402


def _load(path: str) -> List[Dict]:
    cases = []
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                cases.append(json.loads(line))
    return cases


def run(path: str) -> int:
    cases = _load(path)
    pipe = RaspPipeline()
    passed = 0
    failures: List[str] = []

    for c in cases:
        cid = c.get("id", "<no-id>")
        errs: List[str] = []

        before = pipe.before_model(c["user"])
        if "expect_lane" in c and before.lane.value != c["expect_lane"]:
            errs.append(f"lane={before.lane.value} != {c['expect_lane']}")
        if "expect_fast_path" in c and before.decision.fast_path != c["expect_fast_path"]:
            errs.append(f"fast_path={before.decision.fast_path} != {c['expect_fast_path']}")
        if "expect_grounding" in c and before.decision.needs_grounding != c["expect_grounding"]:
            errs.append(f"needs_grounding={before.decision.needs_grounding} != {c['expect_grounding']}")

        if "draft" in c:
            evidence = [Evidence(**e) for e in c.get("evidence", [])]
            result = pipe.after_model(
                c["user"],
                c["draft"],
                evidence=evidence,
                had_tool_result=c.get("had_tool_result", False),
            )
            got = sorted(result.block_codes)
            want = sorted(c.get("expect_block", []))
            if got != want:
                errs.append(f"blocks={got} != {want}")

        if errs:
            failures.append(f"  [FAIL] {cid}: " + "; ".join(errs))
        else:
            passed += 1

    total = len(cases)
    print(f"RASP golden evals: {passed}/{total} passed")
    for f in failures:
        print(f)
    print("\nMetrics:", json.dumps(pipe.metrics.snapshot(), indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    seed = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "evals", "golden_seed.jsonl"
    )
    raise SystemExit(run(seed))
