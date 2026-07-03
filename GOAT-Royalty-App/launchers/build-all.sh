#!/usr/bin/env bash
# ============================================================
#  GOAT ROYALTY — build all click launchers/installers
#  Outputs into launchers/dist/:
#    GOAT-Royalty-Setup.exe   (Windows installer, NSIS)
#    GOAT-Royalty.dmg         (macOS disk image)
#    goat-royalty_1.0.0_all.deb  (Ubuntu/Debian package)
#    GOAT-Portable.zip        (portable drive edition)
#  Requires: makensis, genisoimage, dpkg-deb, imagemagick, zip
# ============================================================
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "$HERE/.." && pwd)"                # GOAT-Royalty-App
WEBAPP="$APP/web-app"
DIST="$HERE/dist"
STAGE="$HERE/stage"
VERSION="1.0.0"

rm -rf "$DIST" "$STAGE"
mkdir -p "$DIST" "$STAGE"

echo "==> Staging web-app (excluding heavy _next build artifacts)"
rsync -a --exclude '_next' --exclude '__next.*' "$WEBAPP/" "$STAGE/web-app/"

echo "==> Icons"
SRC_ICON="$WEBAPP/assets/launcher/goat-app-icon.webp"
convert "$SRC_ICON" -resize 512x512 "$STAGE/goat.png"
convert "$STAGE/goat.png" -define icon:auto-resize=256,128,64,48,32,16 "$HERE/windows/goat.ico"
png2icns "$STAGE/goat.icns" "$STAGE/goat.png" >/dev/null 2>&1 || cp "$STAGE/goat.png" "$STAGE/goat.icns"

# ---------------- Windows .exe (NSIS) ----------------
echo "==> Building Windows installer (.exe)"
( cd "$HERE/windows" && makensis -V2 goat-installer.nsi )

# ---------------- Ubuntu .deb ----------------
echo "==> Building Ubuntu package (.deb)"
DEB="$STAGE/deb"
mkdir -p "$DEB/DEBIAN" "$DEB/opt/goat-royalty" "$DEB/usr/bin" "$DEB/usr/share/applications"
cp -r "$STAGE/web-app" "$DEB/opt/goat-royalty/web-app"
install -m755 "$HERE/linux/goat-launcher.sh" "$DEB/opt/goat-royalty/goat-launcher.sh"
install -m755 "$HERE/linux/goat-models-drive" "$DEB/usr/bin/goat-models-drive"
cp "$STAGE/goat.png" "$DEB/opt/goat-royalty/goat.png"
cp "$HERE/linux/goat-royalty.desktop" "$DEB/usr/share/applications/goat-royalty.desktop"
ln -sf /opt/goat-royalty/goat-launcher.sh "$DEB/usr/bin/goat-royalty"
cat > "$DEB/DEBIAN/control" <<EOF
Package: goat-royalty
Version: $VERSION
Section: sound
Priority: optional
Architecture: all
Depends: python3, xdg-utils
Maintainer: DJ Speedy (Harvey L. Miller Jr.) <harvey@bsmmusic.com>
Description: GOAT Royalty - every GOAT app, one launcher
 Cinematic launcher for the GOAT ecosystem: royalties, catalog,
 Oscar AI, Money Penny, studio and business tools. Links your big
 Models Drive so AI models are never re-downloaded.
EOF
dpkg-deb --build --root-owner-group "$DEB" "$DIST/goat-royalty_${VERSION}_all.deb" >/dev/null

# ---------------- Portable drive edition ----------------
echo "==> Building portable drive edition (.zip)"
PORT="$STAGE/GOAT-Portable"
mkdir -p "$PORT"
cp -r "$STAGE/web-app" "$PORT/web-app"
cp "$HERE/windows/GOAT-Launcher.bat" "$PORT/Start-GOAT.bat"
cp "$HERE/windows/set-models-drive.bat" "$PORT/set-models-drive.bat"
install -m755 "$HERE/linux/goat-launcher.sh" "$PORT/start-goat.sh"
install -m755 "$HERE/linux/goat-models-drive" "$PORT/set-models-drive.sh"
cp "$HERE/portable/README-PORTABLE.txt" "$PORT/README-PORTABLE.txt"
cp "$HERE/portable/models-drive.txt.example" "$PORT/models-drive.txt.example"
# macOS double-click starter
cat > "$PORT/Start-GOAT.command" <<'EOF'
#!/usr/bin/env bash
cd "$(dirname "$0")"
exec ./start-goat.sh
EOF
chmod +x "$PORT/Start-GOAT.command"
( cd "$STAGE" && zip -qr "$DIST/GOAT-Portable.zip" "GOAT-Portable" )

# ---------------- macOS .dmg ----------------
echo "==> Building macOS disk image (.dmg)"
DMG="$STAGE/dmg"
mkdir -p "$DMG"
cp -r "$HERE/macos/GOAT Launcher.app" "$DMG/GOAT Launcher.app"
chmod +x "$DMG/GOAT Launcher.app/Contents/MacOS/goat-launcher"
mkdir -p "$DMG/GOAT Launcher.app/Contents/Resources"
cp -r "$STAGE/web-app" "$DMG/GOAT Launcher.app/Contents/Resources/web-app"
cp "$STAGE/goat.icns" "$DMG/GOAT Launcher.app/Contents/Resources/goat.icns"
cp "$HERE/macos/Set Models Drive.command" "$DMG/Set Models Drive.command"
chmod +x "$DMG/Set Models Drive.command"
cp "$HERE/portable/README-PORTABLE.txt" "$DMG/README.txt"
genisoimage -quiet -V "GOAT Royalty" -D -R -apple -no-pad \
  -o "$DIST/GOAT-Royalty.dmg" "$DMG"

echo
echo "==> Done. Artifacts in $DIST:"
ls -lh "$DIST"
