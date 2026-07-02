#!/usr/bin/env bash
# Push the whole Oscar master folder to the WD MyCloud (permanent home).
# Every machine then pulls from MyCloud.
#
# Usage:
#   bash deploy-to-mycloud.sh <host> <share> [user]
# Example:
#   bash deploy-to-mycloud.sh 192.168.1.50 Oscar admin
#
# Requires rsync over SSH enabled on the MyCloud (Settings → Network → SSH).
set -euo pipefail

HOST="${1:-}"
SHARE="${2:-Oscar}"
USER="${3:-admin}"

if [ -z "$HOST" ]; then
  echo "Usage: bash deploy-to-mycloud.sh <host/ip> <share> [user]" >&2
  echo "  e.g. bash deploy-to-mycloud.sh 192.168.1.50 Oscar admin" >&2
  exit 1
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # oscar-master/
REMOTE="${USER}@${HOST}:/shares/${SHARE}/oscar-master/"

echo "🚀 Deploying Oscar master → WD MyCloud"
echo "   from: $HERE"
echo "   to:   $REMOTE"
echo ""

# Make sure core is fresh before shipping.
bash "$HERE/scripts/sync-core.sh"

rsync -avz --delete \
  --exclude '__pycache__' --exclude '*.pyc' --exclude '.DS_Store' \
  "$HERE"/ "$REMOTE"

echo ""
echo "✅ Master folder is live on MyCloud at /shares/${SHARE}/oscar-master/"
echo "   On any machine: mount the share, cd in, run  bash install.sh"
