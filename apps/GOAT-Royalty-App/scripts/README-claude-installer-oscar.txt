Claude Code Installer Suite — Oscar Edition
============================================
All files live in:  /Volumes/Oscar/Master-Oscar/Scripts/

FILES
-----
install-claude-oscar.sh       Enhanced Claude Code installer (macOS / Linux)
                              — Localized to Oscar drive paths
                              — Retry logic, SHA-256 verify, env overrides
                              — Usage: ./install-claude-oscar.sh [stable|latest|VERSION]
                              — Env:   CLAUDE_VERSION, OSCAR_ROOT, CLAUDE_RETRIES

install-claude-oscar.ps1      Same installer, Windows PowerShell version
                              — Usage: powershell -ExecutionPolicy Bypass -File install-claude-oscar.ps1
                              — Env:   CLAUDE_VERSION, OSCAR_ROOT, CLAUDE_RETRIES

installer-oscar.nsi           NSIS script → builds Claude-Code-Oscar-Installer.exe
                              — Prereq: install NSIS (https://nsis.sourceforge.io)
                              — Build:  makensis installer-oscar.nsi
                              — Packages install-claude-oscar.ps1 into a double-click .exe

build-dmg-oscar.sh            Builds a macOS .dmg installer
                              — Prereq: macOS + Xcode CLI tools (xcode-select --install)
                              — Run:    ./build-dmg-oscar.sh
                              — Output: dist/dmg/Claude-Code-Oscar-Installer.dmg
                              — Optional signing: ./build-dmg-oscar.sh --sign "Developer ID..."

build-portable-oscar.sh       Builds a cross-platform self-extracting .run archive
                              — Prereq: makeself  (brew install makeself)
                              — Run:    ./build-portable-oscar.sh
                              — Output: dist/portable/claude-code-oscar-installer.run
                              — Users:  bash claude-code-oscar-installer.run

setup-local-llm-oscar.sh      Installs Ollama, wires it to Oscar's model store,
                              and optionally pulls the default FAST-tier models.
                              — No cloud login needed once models are pulled
                              — Run:    ./setup-local-llm-oscar.sh
                              — Pull defaults too: ./setup-local-llm-oscar.sh --pull-defaults
                              — Check status:      ./setup-local-llm-oscar.sh --status
                              — Oscar model store: Shared/models/ollama_data
                              — Ollama port:       11435 (Oscar's dedicated port)

QUICK-START
-----------
# 1. Install Claude Code on this Mac (Oscar drive)
bash /Volumes/Oscar/Master-Oscar/Scripts/install-claude-oscar.sh

# 2. Start/check local Ollama for Oscar (offline LLM, no login)
bash /Volumes/Oscar/Master-Oscar/Scripts/setup-local-llm-oscar.sh --pull-defaults

# 3. Build distributable DMG (share with others)
bash /Volumes/Oscar/Master-Oscar/Scripts/build-dmg-oscar.sh

# 4. Build Windows .exe (requires NSIS on a Windows or NSIS-capable machine)
makensis /Volumes/Oscar/Master-Oscar/Scripts/installer-oscar.nsi

# 5. Build portable .run (share across macOS + Linux without install)
bash /Volumes/Oscar/Master-Oscar/Scripts/build-portable-oscar.sh

NOTE: Claude Code (Anthropic's claude CLI) always requires authentication
to Anthropic's hosted service — it cannot run 100% offline. For a fully
offline chat model, use setup-local-llm-oscar.sh to run open-source
models (Llama 3, Mistral, Qwen, etc.) via Ollama on Oscar's model store.
