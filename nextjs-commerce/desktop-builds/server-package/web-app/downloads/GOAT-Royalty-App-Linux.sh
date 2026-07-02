#!/bin/bash
# GOAT Royalty App - Linux Launcher
echo ""
echo "========================================"
echo " GOAT ROYALTY APP v1.0.0"
echo " by Harvey L. Miller Jr. (DJ Speedy)"
echo "========================================"
echo ""

URL="https://sites.super.myninja.ai/ded9966f-cabf-45d4-8882-ef2a965c9895/3441f8fd/index.html"

# Try Chrome
if command -v google-chrome &> /dev/null; then
    google-chrome --app="$URL" --start-maximized &
    exit 0
fi

# Try Chromium
if command -v chromium-browser &> /dev/null; then
    chromium-browser --app="$URL" --start-maximized &
    exit 0
fi

# Fallback
xdg-open "$URL" &
exit 0
