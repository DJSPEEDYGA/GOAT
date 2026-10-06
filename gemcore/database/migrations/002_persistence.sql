-- Migration 002: operational persistence layer.
-- submissions.doc_json is the authoritative submission document; the
-- normalized evidence tables (captures/annotations/measurements/
-- observations/qc_reviews/certificates) are write-through projections
-- rebuilt transactionally on each save.
ALTER TABLE submissions ADD COLUMN doc_json TEXT NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS capture_blobs (
  capture_id TEXT PRIMARY KEY REFERENCES captures(id),
  data_b64 TEXT NOT NULL                       -- original dataURL/base64 payload
);

CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,                        -- clients | team | registry | meta:*
  doc_json TEXT NOT NULL DEFAULT '{}'
);

INSERT INTO schema_migrations(version) VALUES (2);
