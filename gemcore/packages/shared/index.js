'use strict';
// Shared constants for the GemCore standalone app.

const CAPTURE_MODES = ['visible', 'raking', 'transmitted', 'macro', 'microscope', 'uv', 'ir'];
const CAPTURE_SIDES = ['front', 'back'];

// Grading lanes — evaluated separately, never averaged blindly.
const LANES = ['centering', 'corners', 'edges', 'surface', 'dimensions', 'authenticity'];

const STATUSES = {
  INTAKE: 'intake',
  CAPTURING: 'capturing',
  ANALYZED: 'analyzed',
  QC_REQUIRED: 'qc-required',
  QC_APPROVED: 'qc-approved',
  CERTIFIED: 'certified',
  RETURNED: 'returned-ungraded',
};

// Public 1–10 grade + internal 0–1000 condition index.
const PUBLIC_GRADE_MIN = 1;
const PUBLIC_GRADE_MAX = 10;
const CONDITION_INDEX_MAX = 1000;

const RUBRIC_VERSION = 'gemcore-rubric-0.1.0';
const ALGORITHM_VERSION = 'gemcore-engine-0.1.0';

module.exports = {
  CAPTURE_MODES,
  CAPTURE_SIDES,
  LANES,
  STATUSES,
  PUBLIC_GRADE_MIN,
  PUBLIC_GRADE_MAX,
  CONDITION_INDEX_MAX,
  RUBRIC_VERSION,
  ALGORITHM_VERSION,
};
