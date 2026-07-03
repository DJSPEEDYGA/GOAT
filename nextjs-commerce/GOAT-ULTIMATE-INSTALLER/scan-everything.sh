#!/bin/bash
# 🐐 GOAT — ONE-CLICK ULTIMATE LIBRARY SCANNER (Mac/Linux)
# Scans RAID for NI, EastWest, and Waves content → master-catalog.json
#
# Usage:  ./scan-everything.sh /Volumes/RAID20TB [app_path]

set -e
RAID="${1:-/Volumes/RAID20TB}"
APP_PATH="${2:-}"
G='\033[0;32m'; Y='\033[1;33m'; C='\033[0;36m'; R='\033[0;31m'; NC='\033[0m'

# Auto-detect app path
if [ -z "$APP_PATH" ]; then
  for p in "$HOME/GOAT-Royalty/App/goat-royalty" "/Volumes/GOAT10TB/App/goat-royalty" "$(dirname "$0")/.."; do
    if [ -d "$p/web-app" ]; then APP_PATH="$p"; break; fi
  done
fi
CATALOG="$APP_PATH/web-app/catalog-data"
mkdir -p "$CATALOG"

echo -e "${C}"
cat << 'EOF'
   ____  ___    _  _____
  / ___|/ _ \  / \|_   _|
 | |  _| | | |/ _ \ | |
 | |_| | |_| / ___ \| |
  \____|\___/_/   \_\_|
  🐐 ULTIMATE LIBRARY SCANNER 🐐
EOF
echo -e "${NC}"
echo -e "${Y}RAID: $RAID${NC}"
echo -e "${Y}Catalog output: $CATALOG${NC}"
echo ""

if [ ! -d "$RAID" ]; then
  echo -e "${R}❌ $RAID not found${NC}"
  exit 1
fi

START=$(date +%s)

# ============== [1/3] NATIVE INSTRUMENTS ==============
echo -e "${Y}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${Y} [1/3] NATIVE INSTRUMENTS${NC}"
echo -e "${Y}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

NI_JSON="$CATALOG/ni-catalog.json"

# macOS NI metadata: ~/Library/Application Support/Native Instruments/
# Linux uses wine paths or user-local folders

echo -e "${C}  Finding Kontakt instruments (.nki/.nkm/.nkb)...${NC}"
NKI_LIST=$(find "$RAID" -type f \( -iname "*.nki" -o -iname "*.nkm" -o -iname "*.nkb" \) 2>/dev/null | head -200000)
NKI_COUNT=$(echo "$NKI_LIST" | grep -c . || echo 0)
echo -e "${G}    → $NKI_COUNT Kontakt instruments${NC}"

echo -e "${C}  Finding Maschine content...${NC}"
MX_LIST=$(find "$RAID" -type f \( -iname "*.mxgrp" -o -iname "*.mxkit" -o -iname "*.mxinst" -o -iname "*.mxpat" -o -iname "*.mxsnd" \) 2>/dev/null)
MX_COUNT=$(echo "$MX_LIST" | grep -c . || echo 0)
echo -e "${G}    → $MX_COUNT Maschine items${NC}"

echo -e "${C}  Finding Reaktor ensembles (.ens)...${NC}"
ENS_LIST=$(find "$RAID" -type f \( -iname "*.ens" -o -iname "*.ism" \) 2>/dev/null)
ENS_COUNT=$(echo "$ENS_LIST" | grep -c . || echo 0)
echo -e "${G}    → $ENS_COUNT Reaktor ensembles${NC}"

echo -e "${C}  Finding Komplete Kontrol presets (.nksf)...${NC}"
KK_LIST=$(find "$RAID" -type f \( -iname "*.nksf" -o -iname "*.nksn" \) 2>/dev/null)
KK_COUNT=$(echo "$KK_LIST" | grep -c . || echo 0)
echo -e "${G}    → $KK_COUNT KK presets${NC}"

echo -e "${C}  Finding Battery kits (.kt3)...${NC}"
BAT_LIST=$(find "$RAID" -type f -iname "*.kt3" 2>/dev/null)
BAT_COUNT=$(echo "$BAT_LIST" | grep -c . || echo 0)
echo -e "${G}    → $BAT_COUNT Battery kits${NC}"

# Build NI JSON using Python (cleaner than bash JSON)
python3 - "$RAID" "$NI_JSON" << 'PYEOF'
import sys, os, json, subprocess
from pathlib import Path

raid = sys.argv[1]
out = sys.argv[2]

def scan(exts):
    items = []
    for ext in exts:
        try:
            result = subprocess.run(['find', raid, '-type', 'f', '-iname', f'*.{ext}'],
                                    capture_output=True, text=True, timeout=600)
            for line in result.stdout.strip().split('\n'):
                if line:
                    p = Path(line)
                    try:
                        sz = p.stat().st_size
                    except: sz = 0
                    items.append({
                        'name': p.stem,
                        'file': str(p),
                        'library': p.parent.parent.name if p.parent.parent.name else p.parent.name,
                        'size': sz,
                        'ext': ext
                    })
        except Exception as e:
            print(f'  ! {ext}: {e}', file=sys.stderr)
    return items

print('  Building NI catalog JSON...', file=sys.stderr)
kontakt = scan(['nki','nkm','nkb'])
maschine = scan(['mxgrp','mxkit','mxinst','mxpat','mxsnd'])
reaktor = scan(['ens','ism'])
kk = scan(['nksf','nksn'])
battery = scan(['kt3'])

total_size = sum(i['size'] for i in kontakt + maschine + reaktor)

# Group into libraries by distinct parent folder
lib_names = set()
for i in kontakt + maschine:
    lib_names.add(i['library'])

cat = {
    'scanDate': subprocess.run(['date'], capture_output=True, text=True).stdout.strip(),
    'raidPath': raid,
    'libraries': [{'name': n, 'source': 'auto-detected'} for n in sorted(lib_names)],
    'kontaktInstruments': kontakt,
    'maschineKits': maschine,
    'reaktorEnsembles': reaktor,
    'komplete_kontrol_presets': kk,
    'battery_kits': battery,
    'totals': {
        'libraries': len(lib_names),
        'kontakt': len(kontakt),
        'maschine': len(maschine),
        'reaktor': len(reaktor),
        'kompleteKontrol': len(kk),
        'battery': len(battery),
        'totalSizeGB': round(total_size / (1024**3), 2),
        'totalFiles': len(kontakt) + len(maschine) + len(reaktor) + len(kk) + len(battery)
    }
}
with open(out, 'w') as f:
    json.dump(cat, f, indent=2)
print(f"  ✓ Saved {out}", file=sys.stderr)
PYEOF

# ============== [2/3] EASTWEST ==============
echo ""
echo -e "${Y}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${Y} [2/3] EASTWEST${NC}"
echo -e "${Y}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

EW_JSON="$CATALOG/eastwest-catalog.json"

python3 - "$RAID" "$EW_JSON" << 'PYEOF'
import sys, os, json, subprocess
from pathlib import Path

raid = sys.argv[1]
out = sys.argv[2]

KNOWN_LIBS = [
    "Hollywood Orchestra","Hollywood Strings","Hollywood Brass","Hollywood Woodwinds",
    "Hollywood Percussion","Hollywood Choirs","Hollywood Solo Violin","Hollywood Harp",
    "Stormdrum 3","Stormdrum 2","Goliath","Symphonic Orchestra","Symphonic Choirs",
    "SPACES","SPACES II","Quantum Leap","Ministry of Rock","Fab Four","Voices of Soul",
    "Voices of Opera","Gypsy","RA","Silk","Pianos","ICONIC","Ghostwriter","ProDrummer"
]

def scan(exts, filters=None):
    items = []
    for ext in exts:
        result = subprocess.run(['find', raid, '-type', 'f', '-iname', f'*.{ext}'],
                                capture_output=True, text=True, timeout=600)
        for line in result.stdout.strip().split('\n'):
            if not line: continue
            if filters and not any(f.lower() in line.lower() for f in filters): continue
            p = Path(line)
            try: sz = p.stat().st_size
            except: sz = 0
            items.append({'name': p.stem, 'file': str(p), 'library': p.parent.parent.name, 'size': sz, 'ext': ext})
    return items

print('  Scanning EW instruments (.ewi/.ewx/.opus)...', file=sys.stderr)
instruments = scan(['ewi','ewx','opus'])
print(f'    → {len(instruments)} instruments', file=sys.stderr)

print('  Scanning EW presets (.ewp)...', file=sys.stderr)
presets = scan(['ewp','ewpreset'])
print(f'    → {len(presets)} presets', file=sys.stderr)

print('  Scanning SPACES II impulses...', file=sys.stderr)
impulses = scan(['wav'], filters=['SPACES','Impulse'])
print(f'    → {len(impulses)} impulses', file=sys.stderr)

print('  Auto-detecting known EW libraries...', file=sys.stderr)
libs = []
for lib in KNOWN_LIBS:
    try:
        r = subprocess.run(['find', raid, '-type', 'd', '-iname', lib, '-maxdepth', '6'],
                          capture_output=True, text=True, timeout=120)
        for match in r.stdout.strip().split('\n'):
            if match:
                # Get folder size
                du = subprocess.run(['du', '-sb', match], capture_output=True, text=True, timeout=300)
                try:
                    size_bytes = int(du.stdout.split()[0])
                except:
                    size_bytes = 0
                libs.append({
                    'name': lib,
                    'installPath': match,
                    'sizeGB': round(size_bytes / (1024**3), 2),
                    'source': 'auto-detected'
                })
                print(f"    ✓ {lib} ({round(size_bytes/(1024**3), 2)} GB)", file=sys.stderr)
                break
    except: pass

total = sum(i['size'] for i in instruments + impulses)

cat = {
    'scanDate': subprocess.run(['date'], capture_output=True, text=True).stdout.strip(),
    'raidPath': raid,
    'libraries': libs,
    'instruments': instruments,
    'presets': presets,
    'impulses': impulses,
    'totals': {
        'libraries': len(libs),
        'instruments': len(instruments),
        'presets': len(presets),
        'impulses': len(impulses),
        'totalSizeGB': round(total / (1024**3), 2)
    }
}
with open(out, 'w') as f:
    json.dump(cat, f, indent=2)
print(f"  ✓ Saved {out}", file=sys.stderr)
PYEOF

# ============== [3/3] WAVES ==============
echo ""
echo -e "${Y}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${Y} [3/3] WAVES${NC}"
echo -e "${Y}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

WV_JSON="$CATALOG/waves-catalog.json"

python3 - "$WV_JSON" << 'PYEOF'
import sys, os, json, subprocess, glob
from pathlib import Path

out = sys.argv[1]

# Common Waves install locations across OS
WAVES_ROOTS_MAC = [
    "/Library/Audio/Plug-Ins/Components",
    "/Library/Audio/Plug-Ins/VST",
    "/Library/Audio/Plug-Ins/VST3",
    "/Applications/Waves"
]
WAVES_ROOTS_LINUX = [
    "/usr/lib/vst", "/usr/lib/vst3", os.path.expanduser("~/.vst"),
    os.path.expanduser("~/.vst3")
]

roots = WAVES_ROOTS_MAC if sys.platform == 'darwin' else WAVES_ROOTS_LINUX

plugins = []
for root in roots:
    if not os.path.isdir(root): continue
    for ext in ['component','vst','vst3','dylib','so']:
        for f in glob.glob(f'{root}/**/*.{ext}', recursive=True):
            name = Path(f).stem
            # Only Waves-related (name patterns or folder)
            if 'waves' in f.lower() or any(p in name for p in ['CLA-','SSL','Abbey','H-','Scheps','Kramer','MAS','JJP','Renaissance','Q10','L1','L2','L3','C1','C4','C6','F6','API','1176','LA-2A','Manny']):
                try: sz = os.path.getsize(f)
                except: sz = 0
                plugins.append({
                    'name': name,
                    'file': f,
                    'format': ext,
                    'size': sz,
                    'installed': True,
                    'licensed': False
                })

BUNDLES = {
    "Mercury": ["CLA-2A","CLA-3A","CLA-76","SSL G","SSL E","API","Scheps","Kramer","Manny","H-Comp","H-EQ","H-Delay","H-Reverb","L2","L3","Q10","Renaissance"],
    "Diamond": ["Renaissance","C4","L2","L3","Q10","MaxxBass","H-Comp","H-EQ","H-Delay","H-Reverb"],
    "SSL 4000": ["SSL E","SSL G","SSL Channel"],
    "Abbey Road": ["Abbey Road","Chambers","RS56","RS124","Plates","TG12345","REDD"],
    "CLA Signature": ["CLA-"],
    "Manny Marroquin": ["Manny"],
    "Scheps": ["Scheps"],
    "JJP": ["JJP"]
}
detected = []
for b, pats in BUNDLES.items():
    matches = sum(1 for pl in plugins for p in pats if p in pl['name'])
    if matches > 0:
        detected.append({'bundle': b, 'pluginsMatched': matches})

cat = {
    'scanDate': subprocess.run(['date'], capture_output=True, text=True).stdout.strip(),
    'plugins': plugins,
    'detectedBundles': detected,
    'totals': {
        'plugins': len(plugins),
        'licensedPlugins': 0,
        'installedPlugins': len(plugins),
        'presets': 0,
        'impulses': 0,
        'bundlesDetected': len(detected)
    }
}
with open(out, 'w') as f:
    json.dump(cat, f, indent=2)
print(f"  ✓ Saved {out}", file=sys.stderr)
print(f"  → {len(plugins)} plugins, {len(detected)} bundles detected", file=sys.stderr)
PYEOF

# ============== MERGE MASTER CATALOG ==============
echo ""
echo -e "${Y}MERGING MASTER CATALOG...${NC}"

python3 - "$CATALOG" << 'PYEOF'
import sys, os, json
from pathlib import Path

cat_dir = sys.argv[1]
ni = json.load(open(f'{cat_dir}/ni-catalog.json'))
ew = json.load(open(f'{cat_dir}/eastwest-catalog.json'))
wv = json.load(open(f'{cat_dir}/waves-catalog.json'))

master = {
    'generatedAt': ni['scanDate'],
    'raidPath': ni['raidPath'],
    'nativeInstruments': {'libraries': ni['libraries'], 'totals': ni['totals']},
    'eastwest': {'libraries': ew['libraries'], 'totals': ew['totals']},
    'waves': {'bundles': wv['detectedBundles'], 'totals': wv['totals']},
    'grandTotals': {
        'libraries': ni['totals']['libraries'] + ew['totals']['libraries'],
        'instruments': ni['totals']['kontakt'] + ew['totals']['instruments'],
        'plugins': wv['totals']['plugins'],
        'presets': ni['totals']['kompleteKontrol'] + ew['totals']['presets'],
        'maschineKits': ni['totals']['maschine'],
        'reaktorEnsembles': ni['totals']['reaktor'],
        'impulseResponses': ew['totals']['impulses'] + wv['totals']['impulses'],
        'totalSizeGB': ni['totals']['totalSizeGB'] + ew['totals']['totalSizeGB']
    }
}
with open(f'{cat_dir}/master-catalog.json', 'w') as f:
    json.dump(master, f, indent=2)

# Browse index (compact)
bi = {'instruments': [], 'plugins': [], 'kits': []}
for i in ni['kontaktInstruments']:
    bi['instruments'].append({'n': i['name'], 'l': i['library'], 'f': i['file'], 'e': 'kontakt'})
for i in ew['instruments']:
    bi['instruments'].append({'n': i['name'], 'l': i['library'], 'f': i['file'], 'e': 'eastwest'})
for p in wv['plugins']:
    bi['plugins'].append({'n': p['name'], 'f': p.get('file'), 'e': 'waves'})
for k in ni['maschineKits']:
    bi['kits'].append({'n': k['name'], 'l': k['library'], 'f': k['file'], 'e': 'maschine'})

with open(f'{cat_dir}/browse-index.json', 'w') as f:
    json.dump(bi, f, separators=(',', ':'))

print(f"✓ master-catalog.json: {master['grandTotals']}")
PYEOF

END=$(date +%s)
DURATION=$((END - START))

echo ""
echo -e "${G}╔════════════════════════════════════════════════╗${NC}"
echo -e "${G}║  🐐 ULTIMATE SCAN COMPLETE                     ║${NC}"
echo -e "${G}╠════════════════════════════════════════════════╣${NC}"
echo -e "${G}║  Duration: ${DURATION}s                                   ║${NC}"
echo -e "${G}║  Catalog:  $CATALOG/master-catalog.json"
echo -e "${G}║  Browse:   $CATALOG/browse-index.json"
echo -e "${G}║                                                ║${NC}"
echo -e "${G}║  🌐 Open: $APP_PATH/web-app/goat-sound-library.html${NC}"
echo -e "${G}╚════════════════════════════════════════════════╝${NC}"

# Auto-open
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$APP_PATH/web-app/goat-sound-library.html" 2>/dev/null || true
fi