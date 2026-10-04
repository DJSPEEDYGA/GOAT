-- GemCore persistent schema (SQLite-compatible; portable to Postgres).
-- Evidence rule: captures are immutable originals; annotations/observations
-- live on separate rows and never modify a capture.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  status TEXT NOT NULL DEFAULT 'intake',
  demo INTEGER NOT NULL DEFAULT 0,          -- demo submissions can never certify
  item_json TEXT NOT NULL DEFAULT '{}'      -- collectible descriptor
);

CREATE TABLE captures (                      -- immutable original evidence
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id),
  created_at TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('front','back')),
  mode TEXT NOT NULL CHECK (mode IN ('visible','raking','transmitted','macro','microscope','uv','ir')),
  sha256 TEXT NOT NULL,                      -- integrity checksum of the original
  hash_only INTEGER NOT NULL DEFAULT 0,      -- 1 when the blob is stored elsewhere
  device_meta_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE annotations (                   -- overlay layer, separate from originals
  id TEXT PRIMARY KEY,
  capture_id TEXT NOT NULL REFERENCES captures(id),
  type TEXT NOT NULL DEFAULT 'defect',
  x REAL, y REAL, w REAL, h REAL,            -- normalized coords on the original
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL REFERENCES submissions(id),
  lane TEXT NOT NULL,                        -- centering|corners|edges|surface|dimensions|authenticity
  score REAL,                                -- internal 0..1000
  detail_json TEXT NOT NULL DEFAULT '{}',
  capture_id TEXT REFERENCES captures(id),
  created_at TEXT NOT NULL
);

CREATE TABLE observations (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id),
  capture_id TEXT NOT NULL REFERENCES captures(id),  -- must cite evidence
  lane TEXT,
  severity REAL NOT NULL DEFAULT 0.3,
  confidence REAL,
  source TEXT NOT NULL DEFAULT 'human',      -- human|visioncore
  reviewer_disposition TEXT NOT NULL DEFAULT 'pending', -- pending|confirmed|rejected
  reviewer TEXT,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE TABLE qc_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL REFERENCES submissions(id),
  approved INTEGER NOT NULL,
  reviewer TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE certificates (
  cert_id TEXT PRIMARY KEY REFERENCES submissions(id),
  sealed_at TEXT NOT NULL,
  public_grade REAL NOT NULL,
  internal_index INTEGER NOT NULL,
  algorithm_version TEXT NOT NULL,
  qr_payload TEXT NOT NULL
);

CREATE TABLE audit_log (                     -- append-only trail
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL REFERENCES submissions(id),
  action TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  detail_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX idx_captures_sub ON captures(submission_id);
CREATE INDEX idx_observations_sub ON observations(submission_id);
CREATE INDEX idx_measurements_sub ON measurements(submission_id);
CREATE INDEX idx_audit_sub ON audit_log(submission_id);
