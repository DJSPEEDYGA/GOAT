# GOAT Royalty — Click Launchers & Installers

Nice-looking one-click launchers for every platform, all with a
**Models Drive** link so big AI models (Ollama etc.) live on your own
drive and are **never re-downloaded**.

## Build everything

```bash
./build-all.sh      # needs: makensis genisoimage dpkg-deb imagemagick zip rsync
```

Outputs in `dist/`:

| Artifact | Platform | What it is |
|---|---|---|
| `GOAT-Royalty-Setup.exe` | Windows | Installer — Start Menu + Desktop shortcuts, goat icon, uninstaller |
| `GOAT-Royalty.dmg` | macOS | Disk image with `GOAT Launcher.app` + `Set Models Drive.command` |
| `goat-royalty_1.0.0_all.deb` | Ubuntu/Debian | `sudo dpkg -i` → app menu entry, `goat-royalty` and `goat-models-drive` commands |
| `GOAT-Portable.zip` | Any | Portable drive edition — unzip onto a USB/external drive, double-click `Start-GOAT.*` |

## Models Drive (set once, never re-download)

Every launcher reads a one-line config with the path to your big models
drive and exports `OLLAMA_MODELS=<drive>/ollama` + `GOAT_MODELS_DIR=<drive>`:

- Windows: `models-drive.txt` next to the launcher (or prompted on first run)
- macOS: folder picker on first launch, saved to `~/.goat/models-drive.txt`
- Linux: prompted on first run, saved to `~/.goat/models-drive.txt`; change any time with `goat-models-drive`
- Portable: `models-drive.txt` in the drive root — edit it by hand any time

You can point every computer at the same external drive and models
download exactly once.
