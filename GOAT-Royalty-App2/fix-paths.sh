#!/bin/bash
# Fix absolute paths in all HTML files for static deployment
# Converts /images/, /videos/, /manifest.json etc. to relative paths

cd /workspace/goat-repo/out

# For root-level HTML files, just add ./ prefix
for f in *.html; do
  if [ -f "$f" ]; then
    sed -i 's|src="/images/|src="./images/|g' "$f"
    sed -i 's|src="/videos/|src="./videos/|g' "$f"
    sed -i 's|href="/manifest|href="./manifest|g' "$f"
    sed -i 's|href="/images/|href="./images/|g' "$f"
    # Fix any remaining absolute /_next paths
    sed -i 's|"/_next/|"./_next/|g' "$f"
  fi
done

# For subdirectory HTML files (e.g., /analytics/index.html), need ../ prefix
for f in */index.html; do
  if [ -f "$f" ]; then
    sed -i 's|src="/images/|src="../images/|g' "$f"
    sed -i 's|src="/videos/|src="../videos/|g' "$f"
    sed -i 's|href="/manifest|href="../manifest|g' "$f"
    sed -i 's|href="/images/|href="../images/|g' "$f"
    # Fix /_next paths for subdirectories
    sed -i 's|"/_next/|"../_next/|g' "$f"
    # Fix ./_next to ../_next for subdirectories (assetPrefix adds ./ but subdirs need ../)
    sed -i 's|"\.\/_next/|"../_next/|g' "$f"
  fi
done

# Fix font paths in CSS files (CSS is in _next/static/css/, fonts are in /fonts/)
for f in _next/static/css/*.css; do
  if [ -f "$f" ]; then
    sed -i 's|url(/fonts/|url(../../../fonts/|g' "$f"
  fi
done

echo "All paths fixed!"