# GOAT Force Agent Launchers

One-click launch scripts for every GOAT Force agent.

## Agent Grid

| Agent | macOS | Linux | Icon | What it opens |
|-------|-------|-------|------|---------------|
| **Ms. Money Penny** | `launch-moneypenny.command` | `launch-moneypenny.sh` | 💎 | GOAT web app → `moneypenny.html` |
| Oscar | `launch-oscar.command` | `launch-oscar.sh` | 🎵 | Oscar Console at `http://127.0.0.1:3333/` |
| Agent-007 | `launch-agent007.command` | `launch-agent007.sh` | 🎯 | GOAT web app → `agent-007.html` |
| Ms. Vanessa | `launch-vanessa.command` | `launch-vanessa.sh` | 🎙️ | GOAT web app → `vanessa.html` |
| Nexus | `launch-nexus.command` | `launch-nexus.sh` | 🔗 | GOAT web app → `nexus.html` |
| Lexi | `launch-lexi.command` | `launch-lexi.sh` | ⚖️ | GOAT web app → `lexi.html` |
| Sir Codex | `launch-codex.command` | `launch-codex.sh` | 🤖 | GOAT web app → `codex.html` |
| Dr. Devin | `launch-devin.command` | `launch-devin.sh` | 🩺 | GOAT web app → `goat-devin-center.html` |

## How to use

### macOS
1. Double-click any `.command` file.
2. If macOS warns about an unknown developer, right-click → Open.
3. The script starts Ollama and a local web server, then opens the agent in your browser.

### Linux
1. Open a terminal in this folder.
2. Run the matching `.sh` file:
   ```bash
   bash launch-moneypenny.sh
   ```

### From the browser
Open `goat-launcher-hub.html` and click the agent cards in the **Agent Launchpad** section.

## What each script does

1. Detects the project root from the script location.
2. Starts Ollama if it is installed and not already running.
3. Starts the local web server on port 8090 (or Oscar's chat server on port 3333) if not already running.
4. Opens the agent's page in the default browser.

## Notes

- If an agent page doesn't exist yet, the launcher hub will open instead.
- Money Penny is the first/default agent.
- To add a new agent, edit `/tmp/gen_launchers.py` (or any text editor) and regenerate, or copy one of the existing scripts and update the page URL.
