#!/bin/bash
# GOAT Royalty App - macOS Launcher
echo ""
echo "========================================"
echo " GOAT ROYALTY APP v1.0.0"
echo " by Harvey L. Miller Jr. (DJ Speedy)"
echo "========================================"
echo ""

URL="https://sites.super.myninja.ai/ded9966f-cabf-45d4-8882-ef2a965c9895/3441f8fd/index.html"

# Try Chrome
if [ -d "/Applications/Google Chrome.app" ]; then
    open -a "Google Chrome" "$URL"
    exit 0
fi

# Fallback
open "$URL"
