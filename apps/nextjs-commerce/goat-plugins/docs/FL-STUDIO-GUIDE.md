# 🍓 FL Studio / Image-Line Integration Guide
**GOAT Plugin Suite on FL Studio 20+ / 21+**

FL Studio is a **fully supported** DAW for the entire GOAT Plugin Suite. All 9 plugins load natively as VST3 and run perfectly in Image-Line's flagship DAW.

---

## ✅ Compatibility

| FL Studio Version | Format | Bit Depth | Status |
|---|---|---|---|
| FL Studio 21.x | VST3 | 64-bit | ✅ Fully supported |
| FL Studio 20.8+ | VST3 | 64-bit | ✅ Fully supported |
| FL Studio 20.0–20.7 | VST3 | 64-bit | ✅ Supported (VST3 wrapper) |
| FL Studio 12 | VST2 (legacy) | 64-bit | ⚠️ Build manually with VST2 SDK |
| FL Studio Mobile | — | — | ❌ Not supported (iOS/Android closed) |

---

## 📥 Installation on FL Studio

### 1. Place VST3 files in your plugin folder

**Windows:**
```
C:\Program Files\Common Files\VST3\GOAT Force\
├─ GoatSaturator.vst3
├─ BrickSquad808.vst3
├─ WakaVocalChain.vst3
├─ GoatBus.vst3
├─ GoatReverb.vst3
├─ GoatDelay.vst3
├─ GoatAutoTune.vst3
├─ BrickSquadKick.vst3
└─ WakaAdLibFX.vst3
```

**Mac:**
```
~/Library/Audio/Plug-Ins/VST3/GOAT Force/
```

### 2. Rescan plugins in FL Studio

1. Open **Options → Manage plugins** (F10)
2. Add the folder above to the plugin search paths (if not already listed)
3. Click **Find plugins** (or Find more…)
4. Wait for scan — all 9 GOAT plugins will appear in the left panel
5. ✅ Right-click each and select **Favorite** for quick access

### 3. Enable as "Generator" or "Effect"

- **Effects (7 of 9):** GOAT Saturator, Waka Vocal Chain, GOAT Bus, GOAT Reverb, GOAT Delay, GOAT AutoTune, Waka AdLib FX
- **Generators (2 of 9):** BrickSquad 808, BrickSquad Kick (these are synths — drag them into channel rack)

---

## 🎛️ Recommended Signal Chains

### 🔥 Trap Beat (FL Studio signature genre)
```
Channel Rack:
├─ Kick ─────────► [Slot 1] BrickSquad Kick
├─ 808 ──────────► [Slot 1] BrickSquad 808 ──► [Slot 2] GOAT Saturator
├─ Hats ─────────► [Slot 1] GOAT Delay (ping-pong)
└─ Vocal ────────► [Slot 1] Waka Vocal Chain ──► [Slot 2] Waka AdLib FX

Master ─────────► [Slot 1] GOAT Bus
```

### 🎤 Vocal Production (Hip-Hop / R&B)
```
Vocal Insert:
├─ Slot 1: GOAT AutoTune (Key=C Minor, Speed=0.9)
├─ Slot 2: Waka Vocal Chain (HPF 100Hz, Hi-Mid +3dB, Comp -16dB/4:1)
├─ Slot 3: GOAT Saturator (mode: GOAT, drive 30%)
├─ Slot 4: Waka AdLib FX (Mode: Throwback)
└─ Slot 5: GOAT Reverb (Plate, mix 20%)
```

### 🎚️ Mix Bus
```
Master:
└─ Slot 1: GOAT Bus (Mode: GOAT, Glue 40%, Tilt +0.5 high, Clip -0.5dB)
```

---

## 🎹 FL Studio-Specific Features

### Wrapper Settings (right-click plugin title → "Wrapper settings")
- **Processing:** Enable **Fixed buffer size** for sample-accurate automation on GOAT AutoTune
- **VST threading:** Leave as **Use fixed size buffers** for best CPU on BrickSquad 808
- **Allow threaded processing:** ✅ Yes for GOAT Bus, GOAT Reverb (improves CPU on master)

### FL Studio Mixer Routing
- Insert **GOAT Bus** only on the Master insert, never on individual tracks
- Use **BrickSquad 808** side-chain from the Kick's Insert (Mixer → Right-click Insert → Sidechain)

### Automation Clips
All parameters expose smoothly for FL Studio automation:
- Right-click any GOAT plugin knob → **Create automation clip**
- Smooth automation is built-in at 50Hz internal smoothing (no zipper noise)

---

## 🎁 Official FL Studio Preset Bank (coming Q1 2026)

We're shipping an `.flp` template called **"GOAT Starter Pack FL"** with:

- 20 channel-rack templates (Trap, Hip-Hop, Pop, Drill, Afrobeats, R&B)
- Pre-loaded GOAT plugin chains on all inserts
- 48 vocal preset chains (Waka Lead, Speedy Verse, AdLib Stack, Hard-Tune, etc.)
- 32 808 presets (Brick Wall, Sub Bomb, Distorted, etc.)
- 12 master bus presets

File size: ~45 MB  
Location: `goat-plugins/FL Studio Templates/GOAT_Starter_Pack.flp`  
Status: **In production** — available when the plugin suite ships.

---

## 🐛 Known Issues / Tips

### "Plugin didn't scan"
- Ensure you're running FL Studio **64-bit** (the 32-bit wrapper is not built)
- Check Windows Defender / macOS Gatekeeper didn't quarantine the .vst3 file
- Run FL Studio as Administrator once, re-scan, then restart normally

### Crackling on BrickSquad 808
- Increase buffer size to **512 samples** in Options → Audio
- Disable ASIO underrun protection when testing
- Ensure sample rate matches session (44.1 / 48 / 96 kHz all supported)

### AutoTune latency
- GOAT AutoTune reports ~5 ms latency — FL Studio compensates automatically
- For live performance, enable **Audio → Use Hardware Buffer**

---

## 🤝 Official Partnership with Image-Line

GOAT Force is pursuing **Image-Line partner status** for:
- Featured plugin listing in FL Studio Plugin Manager
- Bundled trial with FL Studio Producer Edition upgrades
- Co-branded Signature Bundle promotions

Contact: **speedy@brksquad.com** for licensing inquiries.

---

## 🔗 Links
- GOAT Plugin Suite: https://goatroyalty.app/plugins
- Download VST3 builds: https://github.com/DJSPEEDYGA/GOAT-Royalty-App/releases
- FL Studio: https://www.image-line.com/fl-studio-download/

---

**🐐 GOAT FORCE × IMAGE-LINE — MADE FOR FRUITY LOOPS PRODUCERS BY FRUITY LOOPS PRODUCERS**