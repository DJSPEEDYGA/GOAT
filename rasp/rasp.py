"""RASP Protocol runtime kernel — Routing, Alignment, Safety, Proof.

A portable, zero-dependency (stdlib-only) control loop that wraps an LLM agent:

    validate input -> route intent -> ground -> draft -> output gate -> close

It is designed to be installed *around* a model, not inside it (per the RASP
Protocol packet by Raspy). It runs anywhere Python 3.8+ runs, including the
Master-Oscar copies on the FKD1 / Oscar drives, with no pip installs.

The module deliberately ships *working* detectors (regex/heuristic v1) for every
gate the protocol names — genericReset, mentionsKnownSymbol, claimsToolRan,
readinessClaim, hasNotProvenBoundary, citation support — plus a fast path,
a per-stage time budget, remediation actions, and metrics, because that is where
the real difficulty (and value) lives.

Typical use::

    from rasp import RaspPipeline, Evidence

    rasp = RaspPipeline()
    decision = rasp.before_model(user_text)          # validate + route
    # ... call your model, optionally grounding via decision.lane ...
    result = rasp.after_model(user_text, draft, evidence=[Evidence(...)])
    final_text = result.text                          # gated / remediated draft
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Dict, List, Optional, Sequence, Tuple


# --------------------------------------------------------------------------- #
# Lanes
# --------------------------------------------------------------------------- #
class Lane(str, Enum):
    """Intent lanes from the RASP Intent Router spec (section 4)."""

    NORMAL_CHAT = "normal_chat"
    CODE_FILE = "code_file"
    STATUS_RUNTIME = "status_runtime"
    RAG_RESEARCH = "rag_research"
    READINESS = "readiness"
    SENSITIVE_ACTION = "sensitive_action"


# Higher number = higher risk. The router returns the highest-risk matched lane
# as the primary lane so the strictest required action wins.
LANE_PRIORITY: Dict[Lane, int] = {
    Lane.NORMAL_CHAT: 0,
    Lane.RAG_RESEARCH: 1,
    Lane.CODE_FILE: 2,
    Lane.STATUS_RUNTIME: 3,
    Lane.READINESS: 4,
    Lane.SENSITIVE_ACTION: 5,
}

LANE_REQUIRED_ACTION: Dict[Lane, str] = {
    Lane.NORMAL_CHAT: "Short warm response. No tool claim.",
    Lane.CODE_FILE: "Search/read exact source first, then answer or patch.",
    Lane.STATUS_RUNTIME: "Run a status/health tool first. Report exact fields.",
    Lane.RAG_RESEARCH: "Retrieve sources, inject context, cite support, verify claims.",
    Lane.READINESS: "Ground in evidence. Answer 'not proven' unless full checks passed.",
    Lane.SENSITIVE_ACTION: "Require owner approval and an audit trail before acting.",
}

# Lanes whose answers make claims about real systems and therefore must be
# grounded in current tool/RAG evidence before the model speaks.
GROUNDING_REQUIRED: Tuple[Lane, ...] = (
    Lane.CODE_FILE,
    Lane.STATUS_RUNTIME,
    Lane.RAG_RESEARCH,
    Lane.READINESS,
)


# --------------------------------------------------------------------------- #
# Regex banks (compiled once)
# --------------------------------------------------------------------------- #
_WORD = r"(?<![A-Za-z0-9_]){kw}(?![A-Za-z0-9_])"


def _bank(*keywords: str) -> re.Pattern:
    body = "|".join(re.escape(k) for k in keywords)
    return re.compile(_WORD.format(kw=f"(?:{body})"), re.IGNORECASE)


_CODE_TERMS = _bank(
    "read", "search", "patch", "test", "grep", "function", "class", "method",
    "repo", "module", "import", "stack trace", "traceback", "compile", "lint",
    "refactor", "endpoint route", "regex",
)
# file path / code symbol / endpoint patterns (structural, not keyword)
_PATH_RE = re.compile(r"(?:[\w.\-]+/){1,}[\w.\-]+|\b[\w\-]+\.(?:py|js|ts|tsx|jsx|html|css|json|sh|md|txt|yml|yaml|db|tsx?)\b")
_SYMBOL_RE = re.compile(r"\b[A-Za-z_][A-Za-z0-9_]*\s*\(|\b[a-z][a-zA-Z0-9]*[A-Z][A-Za-z0-9]*\b|\b[A-Z][A-Za-z0-9]*_[A-Za-z0-9_]+\b")
_URL_RE = re.compile(r"https?://[^\s)]+", re.IGNORECASE)

_STATUS_TERMS = _bank(
    "status", "health", "healthy", "server", "endpoint", "deployment", "deploy",
    "token", "memory", "cpu", "ram", "uptime", "running", "service", "port",
    "model loaded", "online", "offline", "systemd", "nginx", "container",
)

_RAG_TERMS = _bank(
    "document", "documents", "transcript", "transcripts", "knowledge base",
    "training source", "training sources", "citation", "cite", "according to",
    "the pdf", "the doc", "the paper", "source says",
)

_READINESS_TERMS = _bank(
    "bug-free", "bug free", "production-ready", "production ready", "safe to ship",
    "proven", "launch-ready", "launch ready", "ready to launch", "ship it",
    "fully tested", "battle-tested", "rock solid", "guaranteed", "flawless",
    "100% working", "works perfectly",
)

_SENSITIVE_TERMS = _bank(
    "pay", "payment", "transfer", "withdraw", "send money", "publish", "deploy to prod",
    "go live", "install", "uninstall", "rm -rf", "delete all", "drop table",
    "wipe", "format drive", "push to production", "charge", "refund", "release funds",
)

_NORMAL_TERMS = _bank(
    "thanks", "thank you", "thx", "appreciate", "great", "awesome", "nice", "love it",
    "good job", "well done", "cool", "lol", "hello", "hi", "hey", "good morning",
    "good night", "how are you", "you rock", "perfect",
)

# --- output-gate detectors --------------------------------------------------- #
_GENERIC_RESET_RE = re.compile(
    r"\b(how can i (?:help|assist)(?: you)?(?: today)?\??|"
    r"what can i (?:help|do) (?:you )?with\??|"
    r"is there anything (?:else )?i can (?:help|assist) (?:you )?with\??|"
    r"how may i assist you\??)\b",
    re.IGNORECASE,
)

_ASK_FOR_CONTEXT_RE = re.compile(
    r"\b(?:can you (?:tell|show) me|what (?:is|are)|where (?:is|are)|which file|"
    r"(?:can|could) you (?:provide|share|paste|send|show)|please (?:provide|share|paste|send)|"
    r"paste (?:the|it|that)|i (?:don'?t|do not) (?:have|see) (?:access|the))\b",
    re.IGNORECASE,
)

# claims that a tool/command/search actually ran
_TOOL_CLAIM_RE = re.compile(
    r"\b(i|i've|i have|just)\s+(?:ran|run|executed|searched|grepped|checked|tested|"
    r"read|fetched|queried|inspected|verified|deployed|restarted|pulled|compiled|"
    r"looked at|opened)\b|\b(?:the (?:test|command|script|query|search)\s+(?:passed|ran|"
    r"returned|succeeded|completed))\b|\bcurl(?:ed)?\b|\boutput (?:shows|was)\b",
    re.IGNORECASE,
)

# phrasing that scopes/limits a claim — satisfies the "bounded answer" rule
_NOT_PROVEN_RE = re.compile(
    r"\b(not (?:yet )?(?:proven|verified|tested|confirmed)|"
    r"cannot (?:confirm|verify)|can'?t (?:confirm|verify)|"
    r"unverified|no evidence|without (?:running|testing|verifying)|"
    r"not been (?:tested|verified|run)|"
    r"what(?:'s| is) not proven|remaining checks|checks remain|"
    r"i have not (?:run|tested|verified)|haven'?t (?:run|tested|verified)|"
    r"this (?:is|was) not tested)\b",
    re.IGNORECASE,
)

_CITATION_RE = re.compile(
    r"\b(?:according to|as (?:stated|shown|noted) in|per the|source[:\s]|"
    r"\[\d+\]|cite[ds]?|the (?:document|doc|pdf|file|transcript) (?:says|states|shows))\b",
    re.IGNORECASE,
)

_STOPWORDS = frozenset(
    "the a an and or of to in on at for is are was were be been being this that these "
    "those it its as by with from into your you i we they he she but if then so not no "
    "do does did has have had will would can could should may might must about".split()
)


# --------------------------------------------------------------------------- #
# Data structures
# --------------------------------------------------------------------------- #
@dataclass
class Evidence:
    """A single grounded source: a tool result, file read, or RAG chunk."""

    source_id: str
    text: str
    kind: str = "tool"  # tool | file | rag | status | url
    timestamp: Optional[float] = None


@dataclass
class RouteDecision:
    lane: Lane
    matched: List[Lane]
    reasons: List[str]
    needs_grounding: bool
    required_action: str
    fast_path: bool


@dataclass
class GateBlock:
    code: str
    reason: str
    action: str  # remediation action: revise | downgrade | strip_claim | ask_owner


@dataclass
class GateResult:
    allowed: bool
    text: str               # possibly remediated draft
    blocks: List[GateBlock] = field(default_factory=list)
    remediated: bool = False

    @property
    def block_codes(self) -> List[str]:
        return [b.code for b in self.blocks]


class ValidationError(ValueError):
    """Raised by validate_input when a request is empty/malformed/unsafe."""


# --------------------------------------------------------------------------- #
# Metrics
# --------------------------------------------------------------------------- #
class Metrics:
    """In-memory counters so thresholds can be tuned from real traffic."""

    def __init__(self) -> None:
        self.turns = 0
        self.fast_path = 0
        self.lane_counts: Dict[str, int] = {}
        self.gate_blocks: Dict[str, int] = {}
        self.grounded_turns = 0
        self.ungrounded_required = 0
        self.remediations = 0

    def record_route(self, d: RouteDecision) -> None:
        self.turns += 1
        if d.fast_path:
            self.fast_path += 1
        self.lane_counts[d.lane.value] = self.lane_counts.get(d.lane.value, 0) + 1

    def record_gate(self, r: GateResult, grounded: bool, grounding_required: bool) -> None:
        for b in r.blocks:
            self.gate_blocks[b.code] = self.gate_blocks.get(b.code, 0) + 1
        if r.remediated:
            self.remediations += 1
        if grounding_required:
            if grounded:
                self.grounded_turns += 1
            else:
                self.ungrounded_required += 1

    def snapshot(self) -> Dict[str, object]:
        gate_block_rate = (sum(self.gate_blocks.values()) / self.turns) if self.turns else 0.0
        grounding_hit_rate = (
            self.grounded_turns / (self.grounded_turns + self.ungrounded_required)
            if (self.grounded_turns + self.ungrounded_required)
            else None
        )
        return {
            "turns": self.turns,
            "fast_path": self.fast_path,
            "lane_counts": dict(self.lane_counts),
            "gate_blocks": dict(self.gate_blocks),
            "gate_block_rate": round(gate_block_rate, 4),
            "grounding_hit_rate": round(grounding_hit_rate, 4) if grounding_hit_rate is not None else None,
            "remediations": self.remediations,
        }


# --------------------------------------------------------------------------- #
# Detectors (the hard part, implemented)
# --------------------------------------------------------------------------- #
def mentions_known_symbol(user_text: str) -> bool:
    """True when the user names a file/path/symbol/endpoint/url worth grounding."""
    return bool(
        _PATH_RE.search(user_text)
        or _URL_RE.search(user_text)
        or _SYMBOL_RE.search(user_text)
    )


def generic_reset(draft: str) -> bool:
    return bool(_GENERIC_RESET_RE.search(draft))


def asks_user_for_context(draft: str) -> bool:
    return bool(_ASK_FOR_CONTEXT_RE.search(draft))


def claims_tool_ran(draft: str) -> bool:
    return bool(_TOOL_CLAIM_RE.search(draft))


def readiness_claim(draft: str) -> bool:
    return bool(_READINESS_TERMS.search(draft))


def has_not_proven_boundary(draft: str) -> bool:
    return bool(_NOT_PROVEN_RE.search(draft))


def cites_source(draft: str) -> bool:
    return bool(_CITATION_RE.search(draft))


def _tokens(text: str) -> List[str]:
    return [t for t in re.findall(r"[a-z0-9]+", text.lower()) if t not in _STOPWORDS and len(t) > 2]


def source_supports_claim(draft: str, evidence: Sequence[Evidence], threshold: float = 0.18) -> bool:
    """Heuristic citation check: does the draft's content overlap the evidence?

    Token-overlap (Jaccard-ish) between the draft and the union of evidence
    chunks. This is intentionally a cheap, explainable v1 — swap in embedding
    similarity for production. Returns True when there is no citation to check.
    """
    if not cites_source(draft):
        return True
    if not evidence:
        return False
    draft_tokens = set(_tokens(draft))
    if not draft_tokens:
        return False
    ev_tokens = set()
    for e in evidence:
        ev_tokens.update(_tokens(e.text))
    if not ev_tokens:
        return False
    overlap = len(draft_tokens & ev_tokens) / len(draft_tokens)
    return overlap >= threshold


# --------------------------------------------------------------------------- #
# Intent Router (section 4)
# --------------------------------------------------------------------------- #
class IntentRouter:
    """Deterministic-first router. High-risk lanes win ties."""

    def route(self, user_text: str) -> RouteDecision:
        text = user_text or ""
        matched: List[Lane] = []
        reasons: List[str] = []

        if _SENSITIVE_TERMS.search(text):
            matched.append(Lane.SENSITIVE_ACTION)
            reasons.append("sensitive action term (money/publish/install/destructive)")
        if _READINESS_TERMS.search(text):
            matched.append(Lane.READINESS)
            reasons.append("readiness term (bug-free/production-ready/proven)")
        if _STATUS_TERMS.search(text):
            matched.append(Lane.STATUS_RUNTIME)
            reasons.append("status/runtime term (server/health/cpu/deploy)")
        # Strip URLs before path/symbol detection so a bare link routes to RAG,
        # not Code (a URL path is not a local source file).
        code_text = _URL_RE.sub(" ", text)
        if _CODE_TERMS.search(code_text) or _PATH_RE.search(code_text) or _SYMBOL_RE.search(code_text):
            matched.append(Lane.CODE_FILE)
            reasons.append("code/file term, path, or symbol")
        if _RAG_TERMS.search(text) or _URL_RE.search(text):
            matched.append(Lane.RAG_RESEARCH)
            reasons.append("document/url/knowledge-base reference")

        if not matched:
            # Normal chat is allowed only when no work/evidence terms are present.
            matched.append(Lane.NORMAL_CHAT)
            reasons.append("no work/evidence terms found")

        lane = max(matched, key=lambda l: LANE_PRIORITY[l])
        needs_grounding = any(l in GROUNDING_REQUIRED for l in matched)
        fast_path = matched == [Lane.NORMAL_CHAT] and bool(_NORMAL_TERMS.search(text) or len(text.split()) <= 6)

        return RouteDecision(
            lane=lane,
            matched=matched,
            reasons=reasons,
            needs_grounding=needs_grounding,
            required_action=LANE_REQUIRED_ACTION[lane],
            fast_path=fast_path and not needs_grounding,
        )


# --------------------------------------------------------------------------- #
# Output Gate (section 5)
# --------------------------------------------------------------------------- #
class OutputGate:
    """Checks the draft before it is saved, spoken, returned, or used as memory.

    Unlike the PDF's pseudocode (which only says "block"), every block carries a
    concrete remediation action and `remediate()` produces a safe final string,
    so a blocked draft is never a dead turn.
    """

    GENERIC_RESET = "generic_reset_response"
    SHOULD_SEARCH = "should_search_not_ask"
    FAKE_TOOL = "fake_tool_claim"
    READINESS_OVERCLAIM = "readiness_overclaim"
    CITATION_MISMATCH = "citation_mismatch"

    def check(
        self,
        user_text: str,
        draft: str,
        evidence: Optional[Sequence[Evidence]] = None,
        had_tool_result: bool = False,
    ) -> List[GateBlock]:
        evidence = evidence or []
        blocks: List[GateBlock] = []

        if generic_reset(draft):
            blocks.append(GateBlock(self.GENERIC_RESET, "generic reset after a specific task/praise", "revise"))

        if mentions_known_symbol(user_text) and asks_user_for_context(draft):
            blocks.append(GateBlock(self.SHOULD_SEARCH, "asked user for context that approved tools can fetch", "revise"))

        if claims_tool_ran(draft) and not (had_tool_result or evidence):
            blocks.append(GateBlock(self.FAKE_TOOL, "claims a tool ran but no current tool result exists", "strip_claim"))

        if readiness_claim(draft) and not has_not_proven_boundary(draft):
            blocks.append(GateBlock(self.READINESS_OVERCLAIM, "readiness claim without a proven/not-proven boundary", "downgrade"))

        if cites_source(draft) and not source_supports_claim(draft, evidence):
            blocks.append(GateBlock(self.CITATION_MISMATCH, "citation/source claim not supported by evidence", "revise"))

        return blocks

    # -- remediation --------------------------------------------------------- #
    def remediate(self, draft: str, blocks: Sequence[GateBlock]) -> Tuple[str, bool]:
        """Best-effort safe rewrite. Returns (text, changed)."""
        text = draft
        changed = False
        codes = {b.code for b in blocks}

        if self.READINESS_OVERCLAIM in codes:
            text += (
                "\n\n[RASP] Readiness note: this is *not proven* yet. "
                "State only what evidence supports and list the checks still required "
                "before calling it production-ready."
            )
            changed = True

        if self.FAKE_TOOL in codes:
            text += (
                "\n\n[RASP] Tool note: no tool/command result is attached to this turn, "
                "so any 'I ran/checked/tested' claim above is unverified. Run the relevant "
                "tool and re-answer from its output."
            )
            changed = True

        if self.SHOULD_SEARCH in codes:
            text += (
                "\n\n[RASP] Grounding note: the user named a known file/symbol/endpoint — "
                "search/read approved roots first instead of asking them to provide it."
            )
            changed = True

        if self.GENERIC_RESET in codes:
            text += (
                "\n\n[RASP] This reply was a generic reset; respond to the specific task/praise instead."
            )
            changed = True

        if self.CITATION_MISMATCH in codes:
            text += (
                "\n\n[RASP] Citation note: the cited source does not clearly support the claim. "
                "Re-retrieve and quote the supporting passage, or mark the claim 'not proven'."
            )
            changed = True

        return text, changed


# --------------------------------------------------------------------------- #
# Pipeline
# --------------------------------------------------------------------------- #
@dataclass
class BeforeModel:
    lane: Lane
    decision: RouteDecision
    elapsed_ms: float


class RaspPipeline:
    """Orchestrates the runtime loop with a per-stage time budget and metrics."""

    def __init__(
        self,
        router: Optional[IntentRouter] = None,
        gate: Optional[OutputGate] = None,
        metrics: Optional[Metrics] = None,
        max_input_chars: int = 24000,
        stage_budget_ms: float = 50.0,
        auto_remediate: bool = True,
    ) -> None:
        self.router = router or IntentRouter()
        self.gate = gate or OutputGate()
        self.metrics = metrics or Metrics()
        self.max_input_chars = max_input_chars
        self.stage_budget_ms = stage_budget_ms
        self.auto_remediate = auto_remediate

    # -- stage 1: input validation ------------------------------------------ #
    def validate_input(self, user_text: Optional[str]) -> str:
        if user_text is None:
            raise ValidationError("empty request")
        text = user_text.replace("\x00", "").strip()
        if not text:
            raise ValidationError("empty request after normalization")
        if len(text) > self.max_input_chars:
            raise ValidationError(f"request too large ({len(text)} > {self.max_input_chars} chars)")
        return text

    # -- stages 2-3: route (+ grounding hint) before the model -------------- #
    def before_model(self, user_text: Optional[str]) -> BeforeModel:
        start = time.perf_counter()
        text = self.validate_input(user_text)
        decision = self.router.route(text)
        self.metrics.record_route(decision)
        elapsed = (time.perf_counter() - start) * 1000.0
        return BeforeModel(lane=decision.lane, decision=decision, elapsed_ms=elapsed)

    # -- stages 4-6: bounded answer + output gate + close ------------------- #
    def after_model(
        self,
        user_text: str,
        draft: str,
        evidence: Optional[Sequence[Evidence]] = None,
        had_tool_result: bool = False,
        grounding_required: Optional[bool] = None,
    ) -> GateResult:
        evidence = list(evidence or [])
        if grounding_required is None:
            grounding_required = self.router.route(user_text).needs_grounding
        grounded = bool(evidence or had_tool_result)

        blocks = self.gate.check(user_text, draft, evidence=evidence, had_tool_result=had_tool_result)
        text = draft
        remediated = False
        if blocks and self.auto_remediate:
            text, remediated = self.gate.remediate(draft, blocks)

        result = GateResult(allowed=not blocks, text=text, blocks=blocks, remediated=remediated)
        self.metrics.record_gate(result, grounded=grounded, grounding_required=grounding_required)
        return result

    @staticmethod
    def close(summary: str, done: str, tested: str, blocked: str, nxt: str) -> str:
        """Status-close helper (the protocol's 'done/tested/blocked/next')."""
        return (
            f"Summary: {summary}\n"
            f"Done: {done}\n"
            f"Tested: {tested}\n"
            f"Blocked: {blocked}\n"
            f"Next: {nxt}"
        )
