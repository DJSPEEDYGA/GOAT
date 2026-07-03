#!/bin/bash
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$ROOT/config/oscar-fkd1.env" ] && source "$ROOT/config/oscar-fkd1.env"
open "$ROOT/Master-Oscar/README-MEETING-START-HERE.txt"
exec "$ROOT/Launch Raspy Oscar.command"
