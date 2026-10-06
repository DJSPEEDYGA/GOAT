#!/usr/bin/env bash
# Apply GemCore schema + versioned migrations to a SQLite database file.
# Usage: ./scripts/migrate.sh [path-to-db]   (default: data/gemcore.db)
# Note: the API also auto-migrates on boot; this script is for manual/CLI use.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB="${1:-$HERE/data/gemcore.db}"
sqlite3 "$DB" < "$HERE/database/schema.sql"
for f in "$HERE"/database/migrations/*.sql; do
  v="$(basename "$f" | grep -oE '^[0-9]+')"
  applied="$(sqlite3 "$DB" "SELECT COUNT(*) FROM schema_migrations WHERE version=$v;")"
  if [ "$applied" = "0" ]; then sqlite3 "$DB" < "$f"; fi
done
echo "migrated: $DB"
