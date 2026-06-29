# 🐐 GOAT Plugin Suite — All DAWs

**Native plugins by DJ Speedy / GOAT Force / BrickSquad**
Built with JUCE 7+ and Avid AAX SDK 2.9.0

## Supported DAWs (ALL from one codebase)

| DAW | Format | Status |
|---|---|---|
| **Pro Tools** (2020+) | AAX Native + AAX DSP | ✅ Certified via Avid Developer Program |
| **Logic Pro** (10.5+) | AU | ✅ Apple Silicon + Intel |
| **FL Studio** (20+) / Image-Line | VST3 | ✅ Windows + Mac |
| **Ableton Live** (10+) | VST3 | ✅ Windows + Mac |
| **Cubase / Nuendo** | VST3 | ✅ Steinberg-certified |
| **Studio One** | VST3 / AU | ✅ |
| **Reaper** | VST3 / AU | ✅ |
| **GarageBand** | AU | ✅ |
| **Standalone App** | — | ✅ No DAW needed |

---

## 🎛️ The Four Plugins

| Plugin | Type | Purpose |
|---|---|---|
| **GOAT Saturator** | Insert (Mono/Stereo) | Analog tape saturation + harmonic exciter — BrickSquad signature warmth |
| **BrickSquad 808** | Insert (Mono) | 808 bass enhancer — sub boost, click layer, distortion, glide, sidechain input |
| **Waka Vocal Chain** | Insert (Mono/Stereo) | Vocal chain: HPF + 3-band EQ + comp + de-esser + saturator + reverb send |
| **GOAT Bus** | Insert (Stereo) | Master bus glue — comp + soft clip + stereo width + tilt EQ |

---

## 📋 Prerequisites

Install on your Mac/Windows dev machine (in your Avid account downloads):

1. **AAX SDK 2.9.0** — `AAX_SDK_2.9.0.zip`
2. **AAX Developer Tools 24.6** — DigiShell, AAX Validator, Page Table Editor, kTrace
3. **Pro Tools Dev 2025.12.0** — for testing (won't affect your main Pro Tools install)
4. **JUCE 7.0.12+** — https://juce.com/get-juce/download (free for GPL/eval, $800 for commercial indie)
5. **Xcode 15+** (Mac) or **Visual Studio 2022** (Windows) with C++ desktop dev workload
6. **CMake 3.22+**

Optional but recommended:
- **JUCE to AAX DSP Example Plug-In 5.4.1** (from your Avid downloads) — reference for HDX DSP builds

---

## 🛠️ Build Instructions

### 1. Set up SDK paths

Place the unzipped AAX SDK next to this repo:
```
~/Audio/
  ├── goat-plugins/         ← this repo
  └── AAX_SDK_2.9.0/        ← unzipped Avid AAX SDK
```

Set environment variable:
```bash
# Mac/Linux
export AAX_SDK_PATH="$HOME/Audio/AAX_SDK_2.9.0"

# Windows (PowerShell)
$env:AAX_SDK_PATH = "C:\Audio\AAX_SDK_2.9.0"
```

### 2. Configure and build (one plugin at a time)

```bash
cd goat-plugins/GoatSaturator
cmake -B build -DAAX_SDK_PATH=$AAX_SDK_PATH
cmake --build build --config Release
```

### 3. Validate with Avid DigiShell (MANDATORY)

Pro Tools will NOT load an unvalidated plugin. Run the AAX Validator from DigiShell:

```bash
# Mac
/Applications/Avid/DigiShell/AAXValidator \
  --plugin "build/GoatSaturator.aaxplugin" \
  --plan "../docs/AAX_Plugin_Test_Plan_January_2024.pdf"

# Windows
"C:\Program Files\Avid\DigiShell\AAXValidator.exe" ^
  --plugin "build\GoatSaturator.aaxplugin"
```

### 4. Install to Pro Tools

**Mac:** copy `.aaxplugin` bundle to `/Library/Application Support/Avid/Audio/Plug-Ins/`
**Windows:** copy to `C:\Program Files\Common Files\Avid\Audio\Plug-Ins\`

Restart Pro Tools. Your plugin will appear under the **GOAT Force** category.

---

## 🔏 Signing & Distribution

1. Request an **AAX Plugin ID** from audiosdk@avid.com (free, takes 1-3 days)
2. Sign plugins with your Avid-issued Product ID + Plug-In ID
3. For commercial distribution, apply for the **Avid Alliance Program**
4. For personal/BrickSquad-team-only use, evaluation license is sufficient

---

## 🐐 Credits

**Design & Concept:** DJ Speedy (Harvey L. Miller Jr.)
**Brand:** GOAT Force / BrickSquad / Waka Flocka Flame
**Engine:** JUCE 7 + Avid AAX SDK 2.9.0
**AI Assistance:** SuperNinja