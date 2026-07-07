# Dr. Devin (Patch) Integration Guide

Dr. Devin aka "Patch" is now a shared system doctor for every GOAT agent. It gives each agent:

1. **Portable Model Linker** — point the agent at a new drive/path when you move the big `Money-Penny-Models` or `Agent-007-Models` folders.
2. **Self-Healing Health Checks** — test the chat server, Ollama endpoint, and model catalog.
3. **Live Web Terminal** — run shell commands from inside any GOAT launcher page.
4. **Touch Studio** — drag knobs, faders, XY pads, and tap drum pads from any launcher.
5. **Generative UI** — render agent UI blocks as live cards in chat or panels.
6. **Safe Self-Coding Assistant** — generate code patches in a sandbox; nothing is applied automatically.
7. **Customize / Settings** — accent color and logo, saved per browser.
8. **MCP Marketplace** — toggle integrations like GitHub, Linear, Notion, Slack, Spotify, etc.
9. **Hugging Face Hub** — browse, queue, and download HF models from the launcher.
10. **NVIDIA ACE** — on-device NPC pipeline: Audio2Face, ASR, LLM, TTS, Game Agent SDK.
11. **NVIDIA Thor / Jetson Deploy** — build deploy packages for edge AI devices.
12. **Unified Command Center** — `goat-devin-center.html` combines Desktop/Cloud/Terminal/Launcher controls.

## Files Added

- `web-app/goat-devin-center.html` — unified GOAT Devin Center (spaces/sessions, chat, settings, MCP, Hugging Face, ACE, Thor, terminal, studio, generative UI)
- `web-app/goat-launcher-hub.html` — master launcher hub with one-click agent cards
- `web-app/dr-devin.html` — full Patch console page (includes AGENT-007 command deck, Studio, Generative UI, Customize)
- `web-app/launch-agents/launch-<agent>.command` — macOS double-click launchers for each agent
- `web-app/launch-agents/launch-<agent>.sh` — Linux launchers for each agent
- `web-app/lib/agents/patch/patch-core.js` — shared capabilities module
- `web-app/lib/agents/patch/patch-widget.js` — floating Patch button for any page
- `web-app/lib/agents/patch/patch-terminal-server.py` — local terminal backend
- `web-app/lib/agents/patch/goat-touch-studio.js` — reusable touch controls
- `web-app/lib/agents/patch/goat-generative-ui.js` — render JSON UI blocks as live cards
- `web-app/lib/agents/patch/hf-download.py` — download Hugging Face models
- `web-app/lib/agents/patch/ace-setup.sh` — set up NVIDIA ACE environment
- `web-app/lib/agents/patch/thor-setup.sh` — deploy to NVIDIA Thor / Jetson
- `web-app/data/patch-model-links.json` — default model/data directory links + HF, ACE, Thor config
- `web-app/index.html` — linked to Devin Center and Dr. Devin, loads all Patch modules
- `web-app/moneypenny.html` — Devin Center + Dr. Devin links, Patch modules loaded

## How to Add Patch to Any Agent Page

Add these four lines right before `</body>` in any `.html` file:

```html
<script src="lib/agents/patch/patch-core.js"></script>
<script src="lib/agents/patch/goat-touch-studio.js"></script>
<script src="lib/agents/patch/goat-generative-ui.js"></script>
<script src="lib/agents/patch/patch-widget.js" data-agent="moneypenny"></script>
```

Change `data-agent="moneypenny"` to the agent that owns the page (e.g., `agent007`, `oscar`, `nexus`, `codex`).

## How to Start the Live Terminal

The terminal is a small Python server that the browser talks to. Start it from the project root:

```bash
python3 web-app/lib/agents/patch/patch-terminal-server.py --port 9999
```

It binds to `127.0.0.1` only, so it is not exposed to the internet.

## Agent Launcher Scripts

Every agent now has a one-click launcher in `web-app/launch-agents/`:

| Agent | macOS | Linux | Icon | Default URL |
|-------|-------|-------|------|-------------|
| Ms. Money Penny | `launch-moneypenny.command` | `launch-moneypenny.sh` | 💎 | `http://127.0.0.1:8090/moneypenny.html` |
| Oscar | `launch-oscar.command` | `launch-oscar.sh` | 🎵 | `http://127.0.0.1:3333/` |
| Agent-007 | `launch-agent007.command` | `launch-agent007.sh` | 🎯 | `http://127.0.0.1:8090/agent-007.html` |
| Ms. Vanessa | `launch-vanessa.command` | `launch-vanessa.sh` | 🎙️ | `http://127.0.0.1:8090/vanessa.html` (fallback to hub) |
| Nexus | `launch-nexus.command` | `launch-nexus.sh` | 🔗 | `http://127.0.0.1:8090/nexus.html` (fallback to hub) |
| Lexi | `launch-lexi.command` | `launch-lexi.sh` | ⚖️ | `http://127.0.0.1:8090/lexi.html` (fallback to hub) |
| Sir Codex | `launch-codex.command` | `launch-codex.sh` | 🤖 | `http://127.0.0.1:8090/codex.html` (fallback to hub) |
| Dr. Devin | `launch-devin.command` | `launch-devin.sh` | 🩺 | `http://127.0.0.1:8090/goat-devin-center.html` |

Each script:
1. Starts Ollama if it is installed and not already running.
2. Starts the local web server (port 8090) or agent-specific server (Oscar on 3333) if needed.
3. Opens the agent's page in the default browser.

On macOS, double-click any `.command` file. On Linux, run the matching `.sh` in a terminal.

The **GOAT Launcher Hub** (`goat-launcher-hub.html`) has a visual Agent Launchpad with Ms. Money Penny first.

## How to Use the Unified GOAT Devin Center

Open `web-app/goat-devin-center.html` in a browser:

- **Left sidebar** — Spaces (Command, Agents, Studio, Models, Deploy), Sessions, and quick agent launchers.
- **Center** — Ask anything, slash commands, or quick cards for Patch Health, Touch Studio, Investor EPK, and Model Roster.
- **Right panel** — toggle Settings, MCP Marketplace, Hugging Face, NVIDIA ACE, NVIDIA Thor, Terminal, Touch Studio, or Generative UI.
- **Settings** — accent color, logo, default engine, auto-save, touch mode, voice, dark mode, plan/usage, agent toggles.
- **MCP** — install/uninstall marketplace integrations (GitHub, Linear, Notion, Slack, Spotify, etc.).
- **Hugging Face** — search and queue models (Llama, Qwen, Whisper, MusicGen, Stable Diffusion, etc.).
- **NVIDIA ACE** — select Audio2Face, ASR, LLM, TTS, and Game Agent SDK features.
- **NVIDIA Thor** — configure Jetson Thor/Orin target, enable CUDA/TensorRT, ARM64 build, generate deploy script.
- **Terminal** — run shell commands from the browser (same safety rules as `patch-terminal-server.py`).
- **Touch Studio** — knobs, faders, XY pad, drum pads, toggles.
- **Generative UI** — live sample card showing stats, buttons, toggles, badges.

## How to Use the Full Patch Console

Open `web-app/dr-devin.html` in a browser:

- **Chat** — talk to Dr. Devin. If the assistant replies with a JSON UI block, it renders as a live card.
- **Health Check** — pick an agent and click Run Check.
- **Model Linker** — edit the model/data directories and Ollama host, then Save.
- **Live Terminal** — type shell commands and run them from the browser. Forbidden commands are blocked; destructive commands require a confirmation dialog.
- **Touch Studio** — open the Command Deck → Touch Studio to drag knobs, faders, XY pads, and tap pads.
- **Generative UI** — open the Command Deck → Generative UI to see a live sample card.
- **Customize** — open the Command Deck → Customize to change accent color and logo.
- **Self-Coding** — type what you want, click Generate Patch, review the code before applying it.

## Deploy Helper Scripts

Download queued Hugging Face models:

```bash
python3 web-app/lib/agents/patch/hf-download.py
```

Set up NVIDIA ACE environment:

```bash
bash web-app/lib/agents/patch/ace-setup.sh
```

Deploy to NVIDIA Thor / Jetson (default host `thor.local`):

```bash
bash web-app/lib/agents/patch/thor-setup.sh thor.local
```

## Important Notes

- The widget saves your custom paths and settings in the browser's localStorage. They follow the browser, not the drive.
- To share a config across machines, use the **Export** button or copy the JSON from `Patch.exportConfig()` in the browser console.
- The self-coding assistant only generates code in a preview box. It never writes files or runs commands on its own.
- The live terminal blocks `rm -rf`, `mkfs`, `dd`, `sudo`, pipe-to-shell tricks, and similar destructive patterns. Plain `rm` is allowed only after you confirm the dialog.
- MCP installs in the GOAT Devin Center are stored locally in the browser. They do not yet connect to real external services unless a backend server is configured for each MCP.
- Hugging Face downloads are queued in the browser and executed by `hf-download.py` on the host.
- NVIDIA ACE and Thor setup scripts prepare the environment but still require downloading actual NVIDIA binaries and plugins from NVIDIA's official sites.
- Money Penny can use the same base as every other agent. Her extra self-healing/self-coding features should be added to her own page or to the `patch-core.js` module so all agents benefit.

## Next Steps

1. Open `web-app/goat-devin-center.html` and explore the panels.
2. Start the terminal server and try a command like `pwd` or `ollama list` from the browser.
3. Open the Hugging Face tab and queue a model, then run `hf-download.py`.
4. Open the NVIDIA ACE tab and run `ace-setup.sh` when your RTX/Thor machine is ready.
5. If you move the model folders, update the paths in `dr-devin.html` Model Linker.
6. Add the four script tags above to `agents.html`, `command-center.html`, `studio.html`, etc.
