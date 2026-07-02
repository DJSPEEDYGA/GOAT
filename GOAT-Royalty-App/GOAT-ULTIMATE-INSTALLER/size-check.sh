#!/bin/bash
# 🐐 GOAT Size Check — Shows what's installed on your drive
# Usage: ./size-check.sh /Volumes/GOAT10TB

TARGET="${1:-$HOME/GOAT-Royalty}"

if [ ! -d "$TARGET" ]; then
  echo "❌ $TARGET not found. Run install-everything.sh first."
  exit 1
fi

cd "$TARGET"

echo ""
echo "🐐 ============================================"
echo "   GOAT ROYALTY DRIVE STATUS"
echo "   Location: $TARGET"
echo "============================================ 🐐"
echo ""

# Drive free space
if command -v df >/dev/null 2>&1; then
  DF_INFO=$(df -h "$TARGET" | tail -1)
  echo "💾 DRIVE: $DF_INFO"
  echo ""
fi

# Per-folder breakdown
echo "📁 FOLDER SIZES:"
printf "  %-35s %s\n" "App (goat-royalty code)" "$(du -sh App 2>/dev/null | cut -f1)"
printf "  %-35s %s\n" "AI-Brain (Ollama models)" "$(du -sh AI-Brain 2>/dev/null | cut -f1)"
printf "  %-35s %s\n" "Sounds (EastWest + NI + samples)" "$(du -sh Sounds 2>/dev/null | cut -f1)"
printf "  %-35s %s\n" "Plugins (installers + presets)" "$(du -sh Plugins 2>/dev/null | cut -f1)"
printf "  %-35s %s\n" "Movie-Assets (footage + SFX)" "$(du -sh Movie-Assets 2>/dev/null | cut -f1)"
printf "  %-35s %s\n" "Projects (your work)" "$(du -sh Projects 2>/dev/null | cut -f1)"
echo "  --------------------------------------"
printf "  %-35s %s\n" "TOTAL GOAT FOOTPRINT" "$(du -sh . 2>/dev/null | cut -f1)"
echo ""

# Sub-breakdowns
echo "🎵 SOUND LIBRARY DETAIL:"
if [ -d Sounds ]; then
  du -sh Sounds/*/ 2>/dev/null | sort -hr | sed 's/^/  /'
fi
echo ""

echo "🧠 AI MODELS:"
if [ -d AI-Brain/models ]; then
  du -sh AI-Brain/models/*/ 2>/dev/null | sort -hr | sed 's/^/  /' | head -10
fi
echo ""

echo "🔌 PLUGIN INSTALLERS CACHED:"
if [ -d Plugins/Installers ]; then
  ls -lh Plugins/Installers/ 2>/dev/null | tail -n +2 | awk '{printf "  %-40s %s\n", $NF, $5}'
fi
echo ""

echo "============================================"
echo "Run './install-everything.sh $TARGET' to add missing tiers."
echo "============================================"