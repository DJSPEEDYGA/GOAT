'use strict';
// Grading Engine — separates authenticity from condition, weights severe
// subgrades (Beckett-style: no naive averaging), keeps market value out of
// grading entirely, and gates certification behind evidence + human QC.

const {
  LANES, STATUSES, PUBLIC_GRADE_MIN, PUBLIC_GRADE_MAX,
  CONDITION_INDEX_MAX, RUBRIC_VERSION,
} = require('../shared');

// Each lane produces an internal score 0..1000.
function laneScore(submission, lane) {
  const m = submission.measurements || {};
  const obs = (submission.observations || []).filter(o => o.reviewerDisposition !== 'rejected');
  const defects = obs.filter(o => o.lane === lane || (o.lanes || []).includes(lane));
  const base = m[lane] && typeof m[lane].score === 'number' ? m[lane].score : null;

  if (base === null && !defects.length) return null; // no data — honest null

  // Start from measured score if present, else perfect.
  let score = base === null ? CONDITION_INDEX_MAX : base;
  // Each confirmed defect deducts by its severity (0..1 → up to 200 pts).
  for (const d of defects) {
    const sev = typeof d.severity === 'number' ? d.severity : 0.3;
    score -= Math.round(sev * 200);
  }
  return Math.max(0, Math.min(CONDITION_INDEX_MAX, score));
}

// Beckett-style: the final index is pulled toward the weakest lane rather
// than a plain average. A 10 with one terrible lane should not be a 10.
function combineLanes(lanes) {
  const vals = LANES.filter(l => lanes[l] !== null).map(l => lanes[l]);
  if (!vals.length) return null;
  const min = Math.min(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  // 60% weight on weakest lane, 40% on the average.
  return Math.round(min * 0.6 + avg * 0.4);
}

function indexToPublicGrade(index) {
  if (index === null) return null;
  const g = Math.round((index / CONDITION_INDEX_MAX) * PUBLIC_GRADE_MAX * 2) / 2;
  return Math.max(PUBLIC_GRADE_MIN, Math.min(PUBLIC_GRADE_MAX, g));
}

function evaluate(submission) {
  const reasons = [];
  const lanes = {};
  for (const lane of LANES) lanes[lane] = laneScore(submission, lane);

  const captures = submission.captures || [];
  const evidence = submission.evidence || [];
  const observations = submission.observations || [];
  const qc = submission.qc || {};

  const hasEvidence = captures.length + evidence.length > 0;
  const pendingObs = observations.filter(o => o.reviewerDisposition === 'pending');
  const internalIndex = combineLanes(lanes);
  const publicGrade = indexToPublicGrade(internalIndex);

  if (submission.demo) reasons.push('demo submission — can never certify');
  if (!hasEvidence) reasons.push('no evidence captured');
  if (pendingObs.length) reasons.push(`${pendingObs.length} observation(s) awaiting reviewer decision`);
  if (!qc.approved) reasons.push('human QC approval required');
  if (internalIndex === null) reasons.push('no measurement data for any lane');

  const sealable = reasons.length === 0;

  return {
    algorithmVersion: RUBRIC_VERSION,
    evaluatedAt: new Date().toISOString(),
    lanes,                       // per-lane internal 0..1000 (null = no data)
    internalConditionIndex: internalIndex,
    publicGrade,                 // 1–10 display grade (null without data)
    authenticitySeparate: true,  // authenticity lane never folds into condition
    marketValueExcluded: true,   // market data structurally cannot enter here
    status: submission.demo ? 'demo' : (sealable ? 'sealable' : 'blocked'),
    blockers: reasons,
    qcApproved: !!qc.approved,
  };
}

// Sealing is the irreversible-ish certification step.
function seal(submission, evaluation) {
  if (!evaluation || evaluation.status !== 'sealable') {
    const why = evaluation ? evaluation.blockers.join('; ') : 'no evaluation';
    return { ok: false, reason: 'seal forbidden: ' + why };
  }
  return {
    ok: true,
    certId: submission.id,
    publicGrade: evaluation.publicGrade,
    sealedAt: new Date().toISOString(),
    algorithmVersion: RUBRIC_VERSION,
    qrPayload: '/verify/' + submission.id,
  };
}

module.exports = { evaluate, seal, laneScore, combineLanes, indexToPublicGrade };
