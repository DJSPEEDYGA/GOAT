#!/usr/bin/env bash
# Apply GemCore schema to a SQLite database file.
# Usage: ./scripts/migrate.sh [path-to-db]   (default: data/gemcore.db)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB="${1:-$HERE/data/gemcore.db}"
sqlite3 "$DB" < "$HERE/database/schema.sql"
sqlite3 "$DB" "INSERT OR IGNORE INTO schema_migrations(version) VALUES (1);"
echo "migrated: $DB"
