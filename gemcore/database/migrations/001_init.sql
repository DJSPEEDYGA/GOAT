-- Migration 001: initial GemCore schema version marker.
-- The DDL itself lives in ../schema.sql; run scripts/migrate.sh to apply.
INSERT INTO schema_migrations(version) VALUES (1);
