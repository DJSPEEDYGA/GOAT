# 🐐 GOAT Ultimate Installer & RAID Scanner

Complete toolkit for connecting the GOAT Royalty app to your existing Native Instruments, EastWest, and Waves libraries.

---

## 🎯 What This Does

You already own the sounds — this scanner finds them on your RAID, indexes everything, and makes them browseable and playable inside the GOAT app's Sound Library page.

**Fully supported:**
- 🎹 **Native Instruments** — Kontakt (.nki/.nkm/.nkb), Maschine (.mxgrp/.mxkit), Reaktor (.ens), Komplete Kontrol (.nksf), Battery (.kt3)
- 🎻 **EastWest** — Opus/Play libraries, Hollywood Orchestra, Choirs, Stormdrum, SPACES II impulses, ICONIC synths
- 🌊 **Waves** — Every plugin installed via Waves Central (VST/VST3/AAX), signature bundles (CLA, Scheps, Mercury, SSL 4000)

---

## 🚀 Quick Start

### Windows (PowerShell as Administrator)

```powershell
# Scan everything in one shot
.\scan-everything.ps1 -Raid "R:\"

# Or scan individually
.\scan-native-instruments.ps1 -Raid "R:\"
.\scan-eastwest.ps1 -Raid "R:\"
.\scan-waves.ps1
```

### macOS / Linux

```bash
# Scan everything in one shot
./scan-everything.sh /Volumes/RAID20TB

# The script uses Python 3 (pre-installed on macOS 12+)
```

---

## 📂 What Gets Created

After scanning, three JSON files land in `web-app/catalog-data/`:

| File | Purpose |
|------|---------|
| `ni-catalog.json` | Full Native Instruments inventory |
| `eastwest-catalog.json` | All EastWest libraries + SPACES impulses |
| `waves-catalog.json` | Every Waves plugin + bundle detection |
| `master-catalog.json` | Unified summary + grand totals |
| `browse-index.json` | Compact index for fast browsing |

---

## 🎛️ Using the Sound Library in the App

After scanning, open `web-app/goat-sound-library.html` (or just click the **📚 SOUND LIBRARY** tile on the Touch Hub).

Features:
- Left sidebar: Browse by vendor (NI / EastWest / Waves)
- Quick scenes: Cinematic, Trap, R&B, Hip-Hop (auto-curated)
- Search across all 100,000+ items
- Filter chips: Strings / Brass / Drums / Synths / Vocals / Piano / Bass
- **Click any instrument → Play preview**
- **"Open in Studio"** → Sends the file path to GOAT MPC / Sampler / Plugin Rack / Channel Strip

---

## 🧠 How It Works

1. **Registry read** (Windows): Parses Native Access + EW Installation Center + Waves License XML
2. **Deep filesystem scan**: Walks your RAID and indexes by file extension (`.nki`, `.ewi`, `.vst3`, etc.)
3. **Library auto-detection**: Matches folder names against 30+ known EW/NI library names
4. **Bundle inference**: Cross-references plugin names against Mercury/Diamond/CLA/SSL 4000 presets
5. **JSON catalog output**: Loads in <100ms into the GOAT Sound Library browser

---

## ⚙️ Re-scan after adding new content

Just run the scanner again — it overwrites the catalog. The Sound Library page auto-reloads on next open.

For continuous sync, schedule the script via Task Scheduler (Windows) or cron (Mac/Linux):

```bash
# Mac/Linux cron (nightly at 3am)
0 3 * * * /path/to/scan-everything.sh /Volumes/RAID20TB
```

```powershell
# Windows Task Scheduler (one-liner)
schtasks /create /tn "GOAT Scanner" /tr "powershell.exe -File C:\path\to\scan-everything.ps1 -Raid R:\" /sc daily /st 03:00
```

---

## 🐛 Troubleshooting

**"No catalog found" in Sound Library page**
→ Run the scanner first. JSONs must be in `web-app/catalog-data/`.

**Scan takes too long**
→ 20TB with millions of files can take 20-40 minutes first run. Subsequent runs are faster because NTFS/APFS cache warms up.

**Some libraries missing**
→ The scanner recognizes 30+ known library names automatically. For custom/unknown ones, they still appear under "All NI" or "All EastWest" — just without the fancy category badge.

**Waves plugins not detected on Mac**
→ Ensure Waves installed via Waves Central to `/Library/Audio/Plug-Ins/Components` (default). Custom paths won't be scanned.

---

## 🔒 Privacy

Everything runs locally. Nothing leaves your machine. The JSON catalogs sit on your drive alongside the GOAT app — no cloud sync, no telemetry.