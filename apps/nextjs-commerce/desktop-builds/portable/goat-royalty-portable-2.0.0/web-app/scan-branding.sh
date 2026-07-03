#!/bin/bash

echo "=========================================="
echo "GOAT BRANDING SCANNER"
echo "=========================================="
echo ""

cd /workspace/nextjs-commerce/web-app

# List all HTML files
echo "📄 Scanning all HTML files..."
echo ""

for file in *.html; do
    if [ -f "$file" ]; then
        # Check for GOAT branding elements
        has_mp_logo=$(grep -c 'money-penny-logo' "$file" 2>/dev/null || echo 0)
        has_goat_logo=$(grep -c 'goat-logo' "$file" 2>/dev/null || echo 0)
        has_bg=$(grep -c 'goat-background' "$file" 2>/dev/null || echo 0)
        has_nav=$(grep -c 'top-nav' "$file" 2>/dev/null || echo 0)
        
        total=$((has_mp_logo + has_goat_logo + has_bg + has_nav))
        
        if [ $total -eq 0 ]; then
            echo "❌ $file - NO BRANDING"
        elif [ $total -lt 2 ]; then
            echo "⚠️  $file - PARTIAL BRANDING ($total elements)"
        else
            echo "✅ $file - FULL BRANDING ($total elements)"
        fi
    fi
done | sort

echo ""
echo "=========================================="
echo "Scan Complete"
