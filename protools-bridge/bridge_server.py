#!/usr/bin/env python3
"""
GOAT Force DAW Bridge Server
Dr. Devin (Agent 007) — Pro Tools / FL Studio / MPC / Logic / LUNA Automation Bridge
Runs on http://localhost:7007

Endpoints:
  GET  /                      → Dashboard HTML
  GET  /api/sessions          → Session catalog JSON
  GET  /api/scan              → Rescan sessions
  POST /api/pt/open           → Open a PTX session in Pro Tools
  POST /api/pt/control        → Pro Tools control command
  POST /api/fl/control        → FL Studio control command (param: version 2024|2025)
  POST /api/mpc/control       → MPC control command (param: app mpc3|mpc|beats)
  POST /api/logic/control     → Logic Pro control command
  POST /api/luna/control      → LUNA control command
  POST /api/analyze           → Run loudness analysis on audio file(s)
  GET  /api/status            → Server status
"""

import http.server
import json
import os
import subprocess
import threading
import sys
import urllib.parse
from datetime import datetime
from pathlib import Path

# Add ai_control to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

PORT = 7007
BRIDGE_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.join(BRIDGE_DIR, "scripts")
ANALYSIS_DIR = os.path.join(BRIDGE_DIR, "analysis")
CATALOG_PATH = os.path.join(BRIDGE_DIR, "sessions_catalog.json")

def run_script(args, timeout=15):
    """Run a shell command and return stdout/stderr."""
    try:
        result = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
        return {"ok": result.returncode == 0, "output": result.stdout.strip(), "error": result.stderr.strip()}
    except subprocess.TimeoutExpired:
        return {"ok": False, "output": "", "error": "Command timed out"}
    except Exception as e:
        return {"ok": False, "output": "", "error": str(e)}

def load_catalog():
    if os.path.exists(CATALOG_PATH):
        with open(CATALOG_PATH) as f:
            return json.load(f)
    return {"groups": {}, "total_sessions": 0, "scanned_at": "never"}

def scan_sessions():
    scanner = os.path.join(ANALYSIS_DIR, "scan_sessions.py")
    result = run_script(["python3", scanner, "--out", CATALOG_PATH], timeout=60)
    return result

def analyze_audio(filepath):
    analyzer = os.path.join(ANALYSIS_DIR, "loudness_analyzer.py")
    result = run_script(["python3", analyzer, "--json", filepath], timeout=60)
    if result["ok"] and result["output"]:
        try:
            return {"ok": True, "data": json.loads(result["output"])}
        except Exception:
            pass
    return result


def run_ai_agent(task, daw="protools", fl_version="2025", mpc_app="mpc3", use_vision=False):
    """Run the AI DAW agent in a subprocess so it doesn't block the server."""
    agent_script = os.path.join(BRIDGE_DIR, "ai_control", "daw_agent.py")
    args = ["python3", agent_script, task, "--daw", daw,
            "--fl-version", fl_version, "--mpc-app", mpc_app]
    if use_vision:
        args.append("--vision")
    result = run_script(args, timeout=120)
    if result["ok"] and result["output"]:
        try:
            return {"ok": True, "data": json.loads(result["output"])}
        except Exception:
            return {"ok": True, "data": {"log": [result["output"]]}}
    return result


def check_ai_permissions():
    """Check if accessibility permissions are granted."""
    script = os.path.join(BRIDGE_DIR, "ai_control", "computer_control.py")
    result = run_script(["python3", script], timeout=10)
    if result["ok"] and result["output"]:
        try:
            return json.loads(result["output"])
        except Exception:
            return {"ok": True, "message": result["output"]}
    return {"ok": False, "error": result.get("error", "Unknown")}


# ── OLLAMA MODEL MANAGEMENT ──────────────────────────────────────────────────

OLLAMA_BIN = "/usr/local/bin/ollama"
ZSHRC_PATH = os.path.expanduser("~/.zshrc")
OLLAMA_MODELS_KEY = "OLLAMA_MODELS"

# All 56 known GOAT Force models
ALL_GOAT_MODELS = [
    "llama3.1:70b", "llama3.1:8b", "llama3.1:405b",
    "llama3.2:3b", "llama3.2-vision:11b", "llama3.2-vision:90b",
    "llama3.3:70b", "llava:7b", "llava-llama3:8b",
    "mistral:7b", "mistral-nemo:12b", "mixtral:8x7b",
    "deepseek-r1:8b", "deepseek-r1:14b", "deepseek-r1:32b", "deepseek-r1:70b",
    "qwen2.5:7b", "qwen2.5:14b", "qwen2.5:32b",
    "qwen2.5-coder:7b", "qwen2.5-coder:14b", "qwen2.5-coder:32b",
    "qwen2.5vl:7b", "qwen2.5vl:32b", "qwen2.5vl:72b",
    "qwen3:8b", "qwen3:14b", "qwen3:30b", "qwen3:32b", "qwen3:235b",
    "qwen3-vl:32b", "qwen3-vl:235b",
    "gemma3:4b", "gemma3:12b",
    "phi3:mini", "phi4:14b",
    "nemotron-mini:4b", "nemotron3:33b", "nemotron-3-nano:30b",
    "starcoder2:7b", "starcoder2:15b",
    "codegemma:7b", "codestral:22b",
    "moondream:1.8b", "smollm2:135m",
    "mxbai-embed-large:latest", "nomic-embed-text:latest", "bge-m3:latest",
    "gpt-oss:20b", "gpt-oss:120b", "gpt-oss-safeguard:120b",
    "dolphin-local:latest", "gemma2-2b-local:latest", "phi3-local:latest",
    "nemomix-local:latest", "qwen-9b-uncensored-local:latest",
]


def get_ollama_models_path():
    """Read current OLLAMA_MODELS from env or ~/.zshrc."""
    # Live env first
    env = os.environ.get(OLLAMA_MODELS_KEY, "").strip()
    if env:
        return env
    # Parse ~/.zshrc
    try:
        with open(ZSHRC_PATH) as f:
            for line in f:
                line = line.strip()
                if line.startswith(f"export {OLLAMA_MODELS_KEY}="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    return val
    except Exception:
        pass
    return ""


def set_ollama_models_path(new_path):
    """
    Update OLLAMA_MODELS in ~/.zshrc and set it in the current process env.
    Then restart Ollama so it picks up the new path.
    """
    new_path = new_path.strip()

    # Verify path exists
    if not os.path.isdir(new_path):
        try:
            os.makedirs(new_path, exist_ok=True)
        except Exception as e:
            return {"ok": False, "error": f"Path does not exist and could not be created: {e}"}

    # Update ~/.zshrc
    export_line = f'export {OLLAMA_MODELS_KEY}="{new_path}"'
    try:
        with open(ZSHRC_PATH, "r") as f:
            lines = f.readlines()

        updated = False
        new_lines = []
        for line in lines:
            if line.strip().startswith(f"export {OLLAMA_MODELS_KEY}="):
                new_lines.append(export_line + "\n")
                updated = True
            else:
                new_lines.append(line)
        if not updated:
            new_lines.append(f"\n{export_line}\n")

        with open(ZSHRC_PATH, "w") as f:
            f.writelines(new_lines)
    except Exception as e:
        return {"ok": False, "error": f"Could not update ~/.zshrc: {e}"}

    # Set in current process
    os.environ[OLLAMA_MODELS_KEY] = new_path

    # Restart Ollama with new env
    restart = _restart_ollama(new_path)
    return {
        "ok": True,
        "path": new_path,
        "zshrc_updated": True,
        "ollama_restart": restart,
        "message": f"OLLAMA_MODELS set to: {new_path}"
    }


def _restart_ollama(models_path):
    """Kill and restart Ollama with the new OLLAMA_MODELS path."""
    try:
        # Kill running Ollama
        subprocess.run(["pkill", "-x", "ollama"], capture_output=True)
        import time; time.sleep(1.5)

        # Relaunch with env var
        env = os.environ.copy()
        env[OLLAMA_MODELS_KEY] = models_path
        subprocess.Popen(
            ["/Applications/Ollama.app/Contents/Resources/ollama", "serve"],
            env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        time.sleep(2)
        # Verify
        r = subprocess.run(["curl", "-s", "http://localhost:11434/api/tags"],
                           capture_output=True, text=True, timeout=5)
        return r.returncode == 0
    except Exception as e:
        return False


def get_ollama_status():
    """Return current model path, mounted volumes, available models."""
    current_path = get_ollama_models_path()

    # Get running models from Ollama API
    models_running = []
    ollama_online = False
    try:
        r = subprocess.run(
            ["curl", "-s", "--max-time", "3", "http://localhost:11434/api/tags"],
            capture_output=True, text=True
        )
        if r.returncode == 0:
            data = json.loads(r.stdout)
            models_running = [m["name"] for m in data.get("models", [])]
            ollama_online = True
    except Exception:
        pass

    # Get mounted volumes
    volumes = []
    try:
        for v in os.listdir("/Volumes"):
            vpath = f"/Volumes/{v}"
            if os.path.isdir(vpath):
                try:
                    stat = os.statvfs(vpath)
                    free_gb = round(stat.f_bavail * stat.f_frsize / 1024**3, 1)
                    total_gb = round(stat.f_blocks * stat.f_frsize / 1024**3, 1)
                    volumes.append({
                        "name": v,
                        "path": vpath,
                        "free_gb": free_gb,
                        "total_gb": total_gb,
                        "is_current": current_path.startswith(vpath)
                    })
                except Exception:
                    volumes.append({"name": v, "path": vpath, "free_gb": 0, "total_gb": 0, "is_current": False})
    except Exception:
        pass

    return {
        "ok": True,
        "ollama_online": ollama_online,
        "current_path": current_path,
        "models_loaded": len(models_running),
        "models": models_running,
        "all_models": ALL_GOAT_MODELS,
        "volumes": volumes,
    }


# Track active downloads
_downloads = {}

def start_model_download(model_name):
    """Pull a model in a background thread. Returns download ID."""
    if model_name not in ALL_GOAT_MODELS and ":" not in model_name:
        return {"ok": False, "error": f"Unknown model: {model_name}"}

    dl_id = model_name.replace(":", "_").replace("/", "_")
    if _downloads.get(dl_id, {}).get("status") == "downloading":
        return {"ok": True, "id": dl_id, "message": "Already downloading"}

    _downloads[dl_id] = {
        "model": model_name, "status": "downloading",
        "progress": "", "started": datetime.now().strftime("%H:%M:%S")
    }

    def _pull():
        env = os.environ.copy()
        path = get_ollama_models_path()
        if path:
            env[OLLAMA_MODELS_KEY] = path
        try:
            proc = subprocess.Popen(
                [OLLAMA_BIN, "pull", model_name],
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                text=True, env=env
            )
            last_line = ""
            for line in proc.stdout:
                line = line.strip()
                if line:
                    last_line = line
                    _downloads[dl_id]["progress"] = line
            proc.wait()
            if proc.returncode == 0:
                _downloads[dl_id]["status"] = "done"
                _downloads[dl_id]["progress"] = "Complete"
            else:
                _downloads[dl_id]["status"] = "error"
                _downloads[dl_id]["progress"] = last_line or "Failed"
        except Exception as e:
            _downloads[dl_id]["status"] = "error"
            _downloads[dl_id]["progress"] = str(e)

    t = threading.Thread(target=_pull, daemon=True)
    t.start()
    return {"ok": True, "id": dl_id, "model": model_name, "status": "downloading"}


def start_download_all():
    """Queue all 56 models for download sequentially in a background thread."""
    def _pull_all():
        for model in ALL_GOAT_MODELS:
            dl_id = model.replace(":", "_").replace("/", "_")
            if _downloads.get(dl_id, {}).get("status") == "done":
                continue
            start_model_download(model)
            # Wait for this one to finish before starting next
            import time
            while _downloads.get(dl_id, {}).get("status") == "downloading":
                time.sleep(2)

    t = threading.Thread(target=_pull_all, daemon=True)
    t.start()
    return {"ok": True, "message": f"Queued {len(ALL_GOAT_MODELS)} models for download", "total": len(ALL_GOAT_MODELS)}

class BridgeHandler(http.server.BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        pass  # Silence default logging

    def send_json(self, data, code=200):
        body = json.dumps(data, indent=2).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_html(self, html):
        body = html.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]

        if path == "/" or path == "/dashboard":
            self.send_html(get_dashboard_html())

        elif path == "/api/status":
            self.send_json({
                "status": "online",
                "server": "GOAT Force Pro Tools Bridge",
                "agent": "Dr. Devin (Agent 007)",
                "port": PORT,
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "scripts_dir": SCRIPTS_DIR,
            })

        elif path == "/api/sessions":
            self.send_json(load_catalog())

        elif path == "/api/scan":
            result = scan_sessions()
            if result["ok"]:
                self.send_json({"ok": True, "message": result["output"], "catalog": load_catalog()})
            else:
                self.send_json({"ok": False, "error": result["error"]}, 500)

        elif path == "/dj-speedy-studio.html":
            studio_file = os.path.join(BRIDGE_DIR, "dj-speedy-studio.html")
            if os.path.exists(studio_file):
                with open(studio_file, "r", encoding="utf-8") as f:
                    self.send_html(f.read())
            else:
                self.send_json({"error": "Studio page not found"}, 404)

        else:
            self.send_json({"error": "Not found"}, 404)

    def do_POST(self):
        path = self.path.split("?")[0]
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            data = json.loads(body) if body else {}
        except Exception:
            data = {}

        if path == "/api/pt/open":
            session_path = data.get("path", "")
            if not session_path:
                self.send_json({"ok": False, "error": "No path provided"}, 400)
                return
            script = os.path.join(SCRIPTS_DIR, "pt_open_session.applescript")
            result = run_script(["osascript", script, session_path], timeout=20)
            self.send_json(result)

        elif path == "/api/pt/control":
            command = data.get("command", "")
            if not command:
                self.send_json({"ok": False, "error": "No command provided"}, 400)
                return
            ctrl_script = os.path.join(SCRIPTS_DIR, "pt_controls.sh")
            args = ["/bin/bash", ctrl_script, command]
            if command == "open" and data.get("path"):
                args.append(data["path"])
            result = run_script(args, timeout=20)
            self.send_json(result)

        elif path == "/api/fl/control":
            command = data.get("command", "")
            version = data.get("version", "2025")
            if not command:
                self.send_json({"ok": False, "error": "No command provided"}, 400)
                return
            fl_script = os.path.join(SCRIPTS_DIR, "fl_controls.sh")
            args = data.get("args", [])
            result = run_script(["/bin/bash", fl_script, command, version] + args, timeout=20)
            self.send_json(result)

        elif path == "/api/mpc/control":
            command = data.get("command", "")
            app = data.get("app", "mpc3")
            if not command:
                self.send_json({"ok": False, "error": "No command provided"}, 400)
                return
            mpc_script = os.path.join(SCRIPTS_DIR, "mpc_controls.sh")
            result = run_script(["/bin/bash", mpc_script, command, app], timeout=20)
            self.send_json(result)

        elif path == "/api/logic/control":
            command = data.get("command", "")
            if not command:
                self.send_json({"ok": False, "error": "No command provided"}, 400)
                return
            logic_script = os.path.join(SCRIPTS_DIR, "logic_controls.sh")
            args = data.get("args", [])
            result = run_script(["/bin/bash", logic_script, command] + args, timeout=20)
            self.send_json(result)

        elif path == "/api/luna/control":
            command = data.get("command", "")
            if not command:
                self.send_json({"ok": False, "error": "No command provided"}, 400)
                return
            luna_script = os.path.join(SCRIPTS_DIR, "luna_controls.sh")
            result = run_script(["/bin/bash", luna_script, command], timeout=20)
            self.send_json(result)

        elif path == "/api/analyze":
            filepath = data.get("path", "")
            if not filepath:
                self.send_json({"ok": False, "error": "No path provided"}, 400)
                return
            result = analyze_audio(filepath)
            self.send_json(result)

        elif path == "/api/ai/run":
            task = data.get("task", "")
            if not task:
                self.send_json({"ok": False, "error": "No task provided"}, 400)
                return
            daw = data.get("daw", "protools")
            fl_version = data.get("fl_version", "2025")
            mpc_app = data.get("mpc_app", "mpc3")
            use_vision = data.get("vision", False)
            result = run_ai_agent(task, daw, fl_version, mpc_app, use_vision)
            self.send_json(result)

        elif path == "/api/ai/permissions":
            result = check_ai_permissions()
            self.send_json(result)

        # ── Ollama model management ──────────────────────────────────────────
        elif path == "/api/ollama/status":
            self.send_json(get_ollama_status())

        elif path == "/api/ollama/set_path":
            new_path = data.get("path", "").strip()
            if not new_path:
                self.send_json({"ok": False, "error": "No path provided"}, 400)
                return
            self.send_json(set_ollama_models_path(new_path))

        elif path == "/api/ollama/download":
            model = data.get("model", "").strip()
            if not model:
                self.send_json({"ok": False, "error": "No model specified"}, 400)
                return
            self.send_json(start_model_download(model))

        elif path == "/api/ollama/download_all":
            self.send_json(start_download_all())

        elif path == "/api/ollama/download_status":
            self.send_json({"ok": True, "downloads": _downloads})

        elif path == "/api/ollama/cancel":
            model = data.get("model", "").strip()
            dl_id = model.replace(":", "_").replace("/", "_")
            if dl_id in _downloads:
                _downloads[dl_id]["status"] = "cancelled"
            self.send_json({"ok": True})

        else:
            self.send_json({"error": "Not found"}, 404)


def get_dashboard_html():
    catalog = load_catalog()
    groups = catalog.get("groups", {})
    scanned = catalog.get("scanned_at", "never")
    total = catalog.get("total_sessions", 0)

    # Build session list HTML
    sessions_html = ""
    priority_groups = ["Waka Hard Liquor", "HEAD2SOLID SESSIONS", "Icky Sessions",
                       "Jimmy Rocket", "EMPHAMUS VERSE", "JimmyMGHU", "JNOTE SESSIONS",
                       "PRIORITY SESSIONS", "LOUDIENE SESSIONS", "WOOH", "Other"]

    for grp in priority_groups:
        sessions = groups.get(grp, [])
        if not sessions:
            continue
        sessions_html += f'<div class="group"><h3>{grp} <span class="count">({len(sessions)})</span></h3><div class="session-list">'
        for s in sessions[:20]:  # cap at 20 per group for perf
            escaped = s["path"].replace('"', '\\"').replace("'", "\\'")
            sessions_html += f'''
            <div class="session-card">
                <div class="session-name">{s["name"]}</div>
                <div class="session-meta">{s["modified"]} &bull; {s["size_mb"]} MB</div>
                <div class="session-btns">
                    <button class="btn btn-open" onclick="openSession('{escaped}')">Open in Pro Tools</button>
                </div>
            </div>'''
        sessions_html += '</div></div>'

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GOAT Force — DAW Bridge</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ background: #030205; color: #e0e0e0; font-family: 'Helvetica Neue', Arial, sans-serif; min-height: 100vh; }}
  header {{ background: linear-gradient(90deg, #030205, #1a1a2e); border-bottom: 2px solid #FFD700; padding: 14px 24px; display: flex; align-items: center; gap: 16px; }}
  header h1 {{ color: #FFD700; font-size: 1.3rem; letter-spacing: 2px; text-transform: uppercase; }}
  header .agent {{ color: #aaa; font-size: 0.82rem; }}
  .status-badge {{ background: #0f3; color: #000; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; font-weight: bold; margin-left: auto; }}
  .main {{ display: flex; height: calc(100vh - 54px); }}
  .sidebar {{ width: 200px; background: #08080f; border-right: 1px solid #1a1a2e; padding: 14px 10px; overflow-y: auto; flex-shrink: 0; }}
  .sidebar-section {{ margin-bottom: 18px; }}
  .sidebar h2 {{ color: #FFD700; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #1a1a2e; }}
  .sidebar h2.fl {{ color: #ff8c00; }}
  .sidebar h2.mpc {{ color: #e040fb; }}
  .ctrl-btn {{ display: block; width: 100%; margin-bottom: 6px; padding: 8px 10px; background: #0e0e1a; border: 1px solid #252535; color: #ccc; border-radius: 5px; cursor: pointer; text-align: left; font-size: 0.8rem; transition: all 0.12s; }}
  .ctrl-btn:hover {{ background: #FFD700; color: #000; border-color: #FFD700; font-weight: bold; }}
  .ctrl-btn.fl:hover {{ background: #ff8c00; color: #000; border-color: #ff8c00; }}
  .ctrl-btn.mpc-btn:hover {{ background: #e040fb; color: #000; border-color: #e040fb; }}
  .ctrl-btn.red {{ border-color: #4a0a0e; color: #ff6b6b; }}
  .ctrl-btn.red:hover {{ background: #c1121f; color: #fff; border-color: #c1121f; }}
  .ctrl-btn.gold {{ border-color: #554400; color: #FFD700; }}
  .daw-select {{ width: 100%; background: #0e0e1a; border: 1px solid #252535; color: #ccc; padding: 5px 8px; border-radius: 4px; font-size: 0.78rem; margin-bottom: 8px; }}
  .daw-select:focus {{ outline: none; border-color: #FFD700; }}
  .content {{ flex: 1; overflow-y: auto; padding: 18px 22px; }}
  .panel {{ background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 10px; padding: 18px; margin-bottom: 18px; }}
  .panel h2 {{ color: #FFD700; font-size: 0.92rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #1a1a2e; padding-bottom: 7px; }}
  .panel h2.fl-title {{ color: #ff8c00; }}
  .panel h2.mpc-title {{ color: #e040fb; }}
  .daw-grid {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }}
  .daw-card {{ background: #0e0e1a; border: 1px solid #1e1e30; border-radius: 10px; padding: 14px; }}
  .daw-card h3 {{ font-size: 0.82rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #1a1a2e; }}
  .daw-card h3.pt {{ color: #58a6ff; }}
  .daw-card h3.fl {{ color: #ff8c00; }}
  .daw-card h3.mpc {{ color: #e040fb; }}
  .daw-card h3.logic {{ color: #00c853; }}
  .daw-card h3.luna {{ color: #7c4dff; }}
  .daw-btn-row {{ display: flex; flex-wrap: wrap; gap: 6px; }}
  .daw-btn {{ padding: 7px 13px; border-radius: 5px; border: none; cursor: pointer; font-size: 0.78rem; font-weight: bold; transition: all 0.12s; }}
  .daw-btn.pt-btn {{ background: #1d3557; color: #58a6ff; }}
  .daw-btn.pt-btn:hover {{ background: #58a6ff; color: #000; }}
  .daw-btn.fl-btn {{ background: #3d1e00; color: #ff8c00; }}
  .daw-btn.fl-btn:hover {{ background: #ff8c00; color: #000; }}
  .daw-btn.mpc-btn {{ background: #2a0a35; color: #e040fb; }}
  .daw-btn.mpc-btn:hover {{ background: #e040fb; color: #000; }}
  .daw-btn.logic-btn {{ background: #0d2b1d; color: #00c853; }}
  .daw-btn.logic-btn:hover {{ background: #00c853; color: #000; }}
  .daw-btn.luna-btn {{ background: #1a1a3e; color: #7c4dff; }}
  .daw-btn.luna-btn:hover {{ background: #7c4dff; color: #000; }}
  .fl-ver-row {{ display: flex; gap: 6px; margin-bottom: 8px; align-items: center; }}
  .fl-ver-row label {{ color: #888; font-size: 0.75rem; }}
  .fl-ver-row select {{ background: #0e0e1a; border: 1px solid #333; color: #ccc; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; }}
  .mpc-app-row {{ display: flex; gap: 6px; margin-bottom: 8px; align-items: center; }}
  .mpc-app-row label {{ color: #888; font-size: 0.75rem; }}
  .mpc-app-row select {{ background: #0e0e1a; border: 1px solid #333; color: #ccc; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; }}
  .stats-row {{ display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 14px; }}
  .stat-card {{ background: #0e0e1a; border: 1px solid #1e1e30; border-radius: 8px; padding: 12px 18px; min-width: 130px; }}
  .stat-card .val {{ color: #FFD700; font-size: 1.5rem; font-weight: bold; }}
  .stat-card .lbl {{ color: #666; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; }}
  .analyze-box {{ display: flex; gap: 10px; margin-bottom: 14px; }}
  .analyze-box input {{ flex: 1; background: #0e0e1a; border: 1px solid #252535; color: #ddd; padding: 9px 13px; border-radius: 6px; font-size: 0.88rem; }}
  .analyze-box input:focus {{ outline: none; border-color: #FFD700; }}
  .btn {{ padding: 9px 18px; border-radius: 6px; border: none; cursor: pointer; font-size: 0.85rem; font-weight: bold; transition: all 0.15s; }}
  .btn-gold {{ background: #FFD700; color: #000; }}
  .btn-gold:hover {{ background: #f0c040; }}
  .btn-open {{ background: #1d3557; color: #58a6ff; border: 1px solid #1d3557; font-size: 0.75rem; padding: 5px 11px; border-radius: 4px; cursor: pointer; }}
  .btn-open:hover {{ background: #58a6ff; color: #000; }}
  .group {{ margin-bottom: 20px; }}
  .group h3 {{ color: #f0c040; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }}
  .group .count {{ color: #555; font-size: 0.78rem; }}
  .session-list {{ display: flex; flex-wrap: wrap; gap: 9px; }}
  .session-card {{ background: #0e0e1a; border: 1px solid #1e1e30; border-radius: 7px; padding: 11px 13px; min-width: 230px; max-width: 310px; flex: 1; }}
  .session-card:hover {{ border-color: #FFD700; }}
  .session-name {{ color: #ddd; font-size: 0.85rem; font-weight: bold; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
  .session-meta {{ color: #444; font-size: 0.72rem; margin-bottom: 7px; }}
  .result-box {{ background: #050508; border: 1px solid #252535; border-radius: 7px; padding: 13px; font-family: monospace; font-size: 0.8rem; color: #0f3; max-height: 300px; overflow-y: auto; white-space: pre-wrap; margin-top: 10px; }}
  .result-box.err {{ color: #c1121f; }}
  .log {{ background: #050508; border: 1px solid #1a1a2e; border-radius: 7px; padding: 10px; font-family: monospace; font-size: 0.78rem; color: #58a6ff; max-height: 160px; overflow-y: auto; margin-top: 10px; }}
  .scan-meta {{ color: #444; font-size: 0.75rem; margin-bottom: 10px; }}
  .pad-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px; }}
  .pad {{ background: #1a0a22; border: 2px solid #3a1a4a; border-radius: 6px; padding: 14px 0; text-align: center; color: #e040fb; font-weight: bold; font-size: 0.8rem; cursor: pointer; transition: all 0.1s; }}
  .pad:hover {{ background: #e040fb; color: #000; border-color: #e040fb; }}
  .pad:active {{ transform: scale(0.95); }}
</style>
</head>
<body>
<header>
  <div>
    <h1>GOAT Force — DAW Bridge</h1>
    <div class="agent">Dr. Devin &mdash; Agent 007 &bull; Pro Tools &bull; FL Studio &bull; MPC &bull; localhost:{PORT}</div>
  </div>
  <div class="status-badge" id="status-badge">ONLINE</div>
</header>

<div class="main">
  <!-- Sidebar -->
  <div class="sidebar">

    <div class="sidebar-section">
      <h2>Pro Tools</h2>
      <button class="ctrl-btn gold" onclick="ptControl('play')">&#9654; Play / Stop</button>
      <button class="ctrl-btn" onclick="ptControl('rewind')">&#9664;&#9664; Rewind</button>
      <button class="ctrl-btn" onclick="ptControl('record')">&#9679; Record</button>
      <button class="ctrl-btn" onclick="ptControl('save')">&#128190; Save</button>
      <button class="ctrl-btn" onclick="ptControl('bounce')">&#9660; Bounce to Disk</button>
      <button class="ctrl-btn" onclick="ptControl('mix_window')">&#127925; Mix Window</button>
      <button class="ctrl-btn" onclick="ptControl('edit_window')">&#9998; Edit Window</button>
      <button class="ctrl-btn" onclick="ptControl('undo')">&#8617; Undo</button>
      <button class="ctrl-btn" onclick="ptControl('redo')">&#8618; Redo</button>
      <button class="ctrl-btn red" onclick="ptControl('close')">&#10005; Close</button>
    </div>

    <div class="sidebar-section">
      <h2 class="fl">FL Studio</h2>
      <select class="daw-select" id="fl-ver-sidebar">
        <option value="2025">FL Studio 2025</option>
        <option value="2024">FL Studio 2024</option>
      </select>
      <button class="ctrl-btn fl" onclick="flControl('launch')">&#128640; Launch FL</button>
      <button class="ctrl-btn fl" onclick="flControl('play')">&#9654; Play / Stop</button>
      <button class="ctrl-btn fl" onclick="flControl('record')">&#9679; Record</button>
      <button class="ctrl-btn fl" onclick="flControl('save')">&#128190; Save</button>
      <button class="ctrl-btn fl" onclick="flControl('export_wav')">&#9660; Export WAV</button>
      <button class="ctrl-btn fl" onclick="flControl('export_mp3')">&#9660; Export MP3</button>
      <button class="ctrl-btn fl" onclick="flControl('export_stems')">&#9660; Export Stems</button>
      <button class="ctrl-btn fl" onclick="flControl('mixer')">&#127925; Mixer</button>
      <button class="ctrl-btn fl" onclick="flControl('piano_roll')">&#127929; Piano Roll</button>
      <button class="ctrl-btn fl" onclick="flControl('playlist')">&#9776; Playlist</button>
      <button class="ctrl-btn fl" onclick="flControl('undo')">&#8617; Undo</button>
    </div>

    <div class="sidebar-section">
      <h2 class="mpc">MPC</h2>
      <select class="daw-select" id="mpc-app-sidebar">
        <option value="mpc3">MPC 3</option>
        <option value="mpc">MPC</option>
        <option value="beats">MPC Beats</option>
      </select>
      <button class="ctrl-btn mpc-btn" onclick="mpcControl('launch')">&#128640; Launch MPC</button>
      <button class="ctrl-btn mpc-btn" onclick="mpcControl('play')">&#9654; Play / Stop</button>
      <button class="ctrl-btn mpc-btn" onclick="mpcControl('record')">&#9679; Record</button>
      <button class="ctrl-btn mpc-btn" onclick="mpcControl('save')">&#128190; Save</button>
      <button class="ctrl-btn mpc-btn" onclick="mpcControl('export')">&#9660; Export</button>
      <button class="ctrl-btn mpc-btn" onclick="mpcControl('export_stems')">&#9660; Export Stems</button>
      <button class="ctrl-btn mpc-btn" onclick="mpcControl('undo')">&#8617; Undo</button>
    </div>

    <div class="sidebar-section">
      <h2>Bridge</h2>
      <button class="ctrl-btn" onclick="rescan()">&#128257; Rescan Sessions</button>
    </div>

  </div>

  <!-- Main Content -->
  <div class="content">

    <!-- Stats -->
    <div class="panel">
      <h2>The C Room — Overview</h2>
      <div class="stats-row">
        <div class="stat-card"><div class="val">{total}</div><div class="lbl">PT Sessions</div></div>
        <div class="stat-card"><div class="val" style="color:#ff8c00">2</div><div class="lbl">FL Versions</div></div>
        <div class="stat-card"><div class="val" style="color:#e040fb">3</div><div class="lbl">MPC Apps</div></div>
        <div class="stat-card"><div class="val" style="color:#0f3">LIVE</div><div class="lbl">Bridge Status</div></div>
      </div>
      <div class="scan-meta">Sessions last scanned: {scanned}</div>
      <div id="ctrl-log" class="log">Ready. All DAWs connected — Pro Tools / FL Studio 2024+2025 / MPC / Logic Pro / LUNA</div>
    </div>

    <!-- DAW Quick Controls -->
    <div class="panel">
      <h2>DAW Quick Controls</h2>
      <div class="daw-grid">

        <!-- Pro Tools -->
        <div class="daw-card">
          <h3 class="pt">Pro Tools</h3>
          <div class="daw-btn-row">
            <button class="daw-btn pt-btn" onclick="ptControl('play')">&#9654; Play</button>
            <button class="daw-btn pt-btn" onclick="ptControl('stop')">&#9632; Stop</button>
            <button class="daw-btn pt-btn" onclick="ptControl('record')">&#9679; Rec</button>
            <button class="daw-btn pt-btn" onclick="ptControl('rewind')">&#9664;&#9664;</button>
            <button class="daw-btn pt-btn" onclick="ptControl('save')">Save</button>
            <button class="daw-btn pt-btn" onclick="ptControl('bounce')">Bounce</button>
            <button class="daw-btn pt-btn" onclick="ptControl('mix_window')">Mix</button>
            <button class="daw-btn pt-btn" onclick="ptControl('edit_window')">Edit</button>
            <button class="daw-btn pt-btn" onclick="ptControl('zoom_in')">Z+</button>
            <button class="daw-btn pt-btn" onclick="ptControl('zoom_out')">Z-</button>
            <button class="daw-btn pt-btn" onclick="ptControl('undo')">Undo</button>
            <button class="daw-btn pt-btn" onclick="ptControl('redo')">Redo</button>
          </div>
        </div>

        <!-- FL Studio -->
        <div class="daw-card">
          <h3 class="fl">FL Studio</h3>
          <div class="fl-ver-row">
            <label>Version:</label>
            <select id="fl-ver-main">
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div class="daw-btn-row">
            <button class="daw-btn fl-btn" onclick="flControl('launch')">Launch</button>
            <button class="daw-btn fl-btn" onclick="flControl('play')">&#9654; Play</button>
            <button class="daw-btn fl-btn" onclick="flControl('stop')">&#9632; Stop</button>
            <button class="daw-btn fl-btn" onclick="flControl('record')">&#9679; Rec</button>
            <button class="daw-btn fl-btn" onclick="flControl('rewind')">&#9664;&#9664;</button>
            <button class="daw-btn fl-btn" onclick="flControl('save')">Save</button>
            <button class="daw-btn fl-btn" onclick="flControl('export_wav')">WAV</button>
            <button class="daw-btn fl-btn" onclick="flControl('export_mp3')">MP3</button>
            <button class="daw-btn fl-btn" onclick="flControl('export_stems')">Stems</button>
            <button class="daw-btn fl-btn" onclick="flControl('mixer')">Mixer</button>
            <button class="daw-btn fl-btn" onclick="flControl('piano_roll')">Piano Roll</button>
            <button class="daw-btn fl-btn" onclick="flControl('playlist')">Playlist</button>
            <button class="daw-btn fl-btn" onclick="flControl('browser')">Browser</button>
            <button class="daw-btn fl-btn" onclick="flControl('undo')">Undo</button>
            <button class="daw-btn fl-btn" onclick="flControl('redo')">Redo</button>
          </div>
        </div>

        <!-- MPC -->
        <div class="daw-card">
          <h3 class="mpc">MPC</h3>
          <div class="mpc-app-row">
            <label>App:</label>
            <select id="mpc-app-main">
              <option value="mpc3">MPC 3</option>
              <option value="mpc">MPC</option>
              <option value="beats">MPC Beats</option>
            </select>
          </div>
          <div class="daw-btn-row">
            <button class="daw-btn mpc-btn" onclick="mpcControl('launch')">Launch</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('play')">&#9654; Play</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('stop')">&#9632; Stop</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('record')">&#9679; Rec</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('rewind')">&#9664;&#9664;</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('save')">Save</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('export')">Export</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('export_stems')">Stems</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('undo')">Undo</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('redo')">Redo</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('zoom_in')">Z+</button>
            <button class="daw-btn mpc-btn" onclick="mpcControl('zoom_out')">Z-</button>
          </div>
          <div class="pad-grid" style="margin-top:10px">
            <div class="pad" onclick="mpcControl('pad_1')">1</div>
            <div class="pad" onclick="mpcControl('pad_2')">2</div>
            <div class="pad" onclick="mpcControl('pad_3')">3</div>
            <div class="pad" onclick="mpcControl('pad_4')">4</div>
          </div>
        </div>

        <!-- Logic Pro -->
        <div class="daw-card" id="logic">
          <h3 class="logic">Logic Pro</h3>
          <div class="daw-btn-row">
            <button class="daw-btn logic-btn" onclick="logicControl('launch')">Launch</button>
            <button class="daw-btn logic-btn" onclick="logicControl('play')">&#9654; Play</button>
            <button class="daw-btn logic-btn" onclick="logicControl('stop')">&#9632; Stop</button>
            <button class="daw-btn logic-btn" onclick="logicControl('record')">&#9679; Rec</button>
            <button class="daw-btn logic-btn" onclick="logicControl('rewind')">&#9664;&#9664;</button>
            <button class="daw-btn logic-btn" onclick="logicControl('save')">Save</button>
            <button class="daw-btn logic-btn" onclick="logicControl('save_as')">Save As</button>
            <button class="daw-btn logic-btn" onclick="logicControl('bounce')">Bounce</button>
            <button class="daw-btn logic-btn" onclick="logicControl('new')">New</button>
            <button class="daw-btn logic-btn" onclick="logicControl('open')">Open</button>
            <button class="daw-btn logic-btn" onclick="logicControl('close')">Close</button>
            <button class="daw-btn logic-btn" onclick="logicControl('mixer')">Mixer</button>
            <button class="daw-btn logic-btn" onclick="logicControl('library')">Library</button>
            <button class="daw-btn logic-btn" onclick="logicControl('piano_roll')">Piano Roll</button>
            <button class="daw-btn logic-btn" onclick="logicControl('smart_controls')">Smart</button>
            <button class="daw-btn logic-btn" onclick="logicControl('select_all')">Sel All</button>
            <button class="daw-btn logic-btn" onclick="logicControl('duplicate')">Dup</button>
            <button class="daw-btn logic-btn" onclick="logicControl('delete')">Del</button>
            <button class="daw-btn logic-btn" onclick="logicControl('split')">Split</button>
            <button class="daw-btn logic-btn" onclick="logicControl('cycle')">Cycle</button>
            <button class="daw-btn logic-btn" onclick="logicControl('metronome')">Metro</button>
            <button class="daw-btn logic-btn" onclick="logicControl('count_in')">Count</button>
            <button class="daw-btn logic-btn" onclick="logicControl('tap_tempo')">Tap</button>
            <button class="daw-btn logic-btn" onclick="logicControl('flex')">Flex</button>
            <button class="daw-btn logic-btn" onclick="logicControl('zoom_in')">Z+</button>
            <button class="daw-btn logic-btn" onclick="logicControl('zoom_out')">Z-</button>
            <button class="daw-btn logic-btn" onclick="logicControl('undo')">Undo</button>
            <button class="daw-btn logic-btn" onclick="logicControl('redo')">Redo</button>
            <button class="daw-btn logic-btn" onclick="logicControl('screenset_1')">SS1</button>
            <button class="daw-btn logic-btn" onclick="logicControl('screenset_2')">SS2</button>
          </div>
        </div>

        <!-- LUNA -->
        <div class="daw-card">
          <h3 class="luna">LUNA</h3>
          <div class="daw-btn-row">
            <button class="daw-btn luna-btn" onclick="lunaControl('launch')">Launch</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('play')">&#9654; Play</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('stop')">&#9632; Stop</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('record')">&#9679; Rec</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('rewind')">&#9664;&#9664;</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('save')">Save</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('bounce')">Bounce</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('mixer')">Mixer</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('timeline')">Timeline</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('browser')">Browser</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('undo')">Undo</button>
            <button class="daw-btn luna-btn" onclick="lunaControl('redo')">Redo</button>
          </div>
        </div>

      </div>
    </div>

    <!-- AI Computer Control -->
    <div class="panel" id="ai-panel">
      <h2 style="color:#0f9;">AI Computer Control &mdash; Dr. Devin</h2>
      <div style="color:#888;font-size:0.82rem;margin-bottom:14px;">
        The AI sees your screen, moves the mouse, and controls the DAW for you.
        Requires <strong style="color:#FFD700">Accessibility + Screen Recording</strong> permissions.
        <button class="btn" style="background:#111;border:1px solid #333;color:#aaa;padding:4px 10px;font-size:0.75rem;margin-left:10px" onclick="checkPermissions()">Check Permissions</button>
        <span id="perm-status" style="margin-left:8px;font-size:0.75rem"></span>
      </div>

      <!-- Quick Task Buttons -->
      <div style="margin-bottom:14px">
        <div style="color:#666;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Quick Tasks</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <button class="daw-btn pt-btn" onclick="aiQuickTask('Open mix window and prepare for mixing', 'protools')">PT: Open Mix Window</button>
          <button class="daw-btn pt-btn" onclick="aiQuickTask('Bounce session to disk', 'protools')">PT: Bounce to Disk</button>
          <button class="daw-btn pt-btn" onclick="aiQuickTask('Save the current session', 'protools')">PT: Save Session</button>
          <button class="daw-btn fl-btn" onclick="aiQuickTask('Open the mixer window', 'fl')">FL: Open Mixer</button>
          <button class="daw-btn fl-btn" onclick="aiQuickTask('Open piano roll for beat editing', 'fl')">FL: Piano Roll</button>
          <button class="daw-btn fl-btn" onclick="aiQuickTask('Export project as WAV', 'fl')">FL: Export WAV</button>
          <button class="daw-btn fl-btn" onclick="aiQuickTask('Set up beat making session', 'fl')">FL: Beat Session</button>
          <button class="daw-btn mpc-btn" onclick="aiQuickTask('Export project and stems', 'mpc')">MPC: Export</button>
          <button class="daw-btn mpc-btn" onclick="aiQuickTask('Save the current project', 'mpc')">MPC: Save</button>
          <button class="daw-btn logic-btn" onclick="aiQuickTask('Open the mixer and balance levels', 'logic')">Logic: Mix Window</button>
          <button class="daw-btn logic-btn" onclick="aiQuickTask('Bounce the current project to WAV', 'logic')">Logic: Bounce</button>
          <button class="daw-btn logic-btn" onclick="aiQuickTask('Set up a new beat making session', 'logic')">Logic: Beat Session</button>
          <button class="daw-btn logic-btn" onclick="aiQuickTask('Open the piano roll for melody editing', 'logic')">Logic: Piano Roll</button>
          <button class="daw-btn logic-btn" onclick="aiQuickTask('Apply Flex Time to selected vocal', 'logic')">Logic: Flex Vocal</button>
          <button class="daw-btn logic-btn" onclick="aiQuickTask('Normalize and balance all tracks', 'logic')">Logic: Auto Mix</button>
          <button class="daw-btn luna-btn" onclick="aiQuickTask('Open the LUNA mixer and set levels', 'luna')">LUNA: Mix Window</button>
          <button class="daw-btn luna-btn" onclick="aiQuickTask('Bounce the current LUNA session', 'luna')">LUNA: Bounce</button>
        </div>
      </div>

      <!-- Custom AI Task -->
      <div style="margin-bottom:10px">
        <div style="color:#666;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Custom AI Task (tell the AI what to do)</div>
        <div style="display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap">
          <input type="text" id="ai-task-input" placeholder='e.g. "Mix the vocals — bring up the reverb, compress the drums, balance levels"'
            style="flex:1;min-width:300px;background:#0e0e1a;border:1px solid #252535;color:#ddd;padding:9px 13px;border-radius:6px;font-size:0.88rem" />
          <select id="ai-daw-select" style="background:#0e0e1a;border:1px solid #333;color:#ccc;padding:8px;border-radius:5px;font-size:0.82rem">
            <option value="protools">Pro Tools</option>
            <option value="fl">FL Studio</option>
            <option value="mpc">MPC</option>
            <option value="logic">Logic Pro</option>
            <option value="luna">LUNA</option>
          </select>
          <label style="display:flex;align-items:center;gap:5px;color:#888;font-size:0.8rem;cursor:pointer">
            <input type="checkbox" id="ai-vision-toggle" style="accent-color:#0f9"> AI Vision
          </label>
          <button class="btn" style="background:#0f9;color:#000;font-weight:bold" onclick="runAITask()">Run AI</button>
        </div>
        <div style="color:#555;font-size:0.75rem;line-height:1.5">
          <strong style="color:#888">Vision mode</strong> = AI takes a screenshot, sees your screen, and decides what to click.
          Without vision = AI uses scripted keyboard shortcuts (faster, more reliable).<br>
          <strong style="color:#FFD700">Examples:</strong>
          "Mix the Hard Liquor session — compress drums, add reverb to vocals, bounce to WAV" |
          "In FL Studio make a trap beat at 140 BPM" |
          "In MPC record a new sequence and export stems"
        </div>
      </div>

      <!-- AI Output Log -->
      <div id="ai-output" class="log" style="color:#0f9;max-height:220px">Waiting for AI task...</div>
    </div>

    <!-- Loudness Analyzer -->
    <div class="panel">
      <h2>Loudness &amp; Mastering Analyzer</h2>
      <div class="analyze-box">
        <input type="text" id="analyze-path" placeholder="Drag or paste path to audio file (WAV, AIFF, MP3, etc.)..." />
        <button class="btn btn-gold" onclick="analyzeFile()">Analyze</button>
      </div>
      <div id="analyze-result"></div>
    </div>

    <!-- Sessions -->
    <div class="panel">
      <h2>Sessions — The C Room (Pro Tools)</h2>
      {sessions_html if sessions_html else '<p style="color:#555">No sessions found. Click Rescan Sessions.</p>'}
    </div>

  </div>
</div>

<script>
const PORT = {PORT};

function log(msg, ok=true) {{
  const el = document.getElementById('ctrl-log');
  const ts = new Date().toLocaleTimeString();
  el.textContent = `[${{ts}}] ${{msg}}\n` + el.textContent;
}}

async function ptControl(cmd) {{
  log(`PT: ${{cmd}}...`);
  try {{
    const r = await fetch('/api/pt/control', {{
      method: 'POST', headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify({{ command: cmd }})
    }});
    const d = await r.json();
    log(d.ok ? `[PT OK] ${{d.output || cmd}}` : `[PT ERR] ${{d.error}}`, d.ok);
  }} catch(e) {{ log(`[PT ERR] ${{e.message}}`, false); }}
}}

async function flControl(cmd) {{
  const ver = document.getElementById('fl-ver-main')?.value ||
              document.getElementById('fl-ver-sidebar')?.value || '2025';
  log(`FL ${{ver}}: ${{cmd}}...`);
  try {{
    const r = await fetch('/api/fl/control', {{
      method: 'POST', headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify({{ command: cmd, version: ver }})
    }});
    const d = await r.json();
    log(d.ok ? `[FL OK] ${{d.output || cmd}}` : `[FL ERR] ${{d.error}}`, d.ok);
  }} catch(e) {{ log(`[FL ERR] ${{e.message}}`, false); }}
}}

async function mpcControl(cmd) {{
  const app = document.getElementById('mpc-app-main')?.value ||
              document.getElementById('mpc-app-sidebar')?.value || 'mpc3';
  log(`MPC (${{app}}): ${{cmd}}...`);
  try {{
    const r = await fetch('/api/mpc/control', {{
      method: 'POST', headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify({{ command: cmd, app: app }})
    }});
    const d = await r.json();
    log(d.ok ? `[MPC OK] ${{d.output || cmd}}` : `[MPC ERR] ${{d.error}}`, d.ok);
  }} catch(e) {{ log(`[MPC ERR] ${{e.message}}`, false); }}
}}

async function logicControl(cmd) {{
  log(`Logic: ${{cmd}}...`);
  try {{
    const r = await fetch('/api/logic/control', {{
      method: 'POST', headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify({{ command: cmd }})
    }});
    const d = await r.json();
    log(d.ok ? `[Logic OK] ${{d.output || cmd}}` : `[Logic ERR] ${{d.error}}`, d.ok);
  }} catch(e) {{ log(`[Logic ERR] ${{e.message}}`, false); }}
}}

async function lunaControl(cmd) {{
  log(`LUNA: ${{cmd}}...`);
  try {{
    const r = await fetch('/api/luna/control', {{
      method: 'POST', headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify({{ command: cmd }})
    }});
    const d = await r.json();
    log(d.ok ? `[LUNA OK] ${{d.output || cmd}}` : `[LUNA ERR] ${{d.error}}`, d.ok);
  }} catch(e) {{ log(`[LUNA ERR] ${{e.message}}`, false); }}
}}

async function openSession(path) {{
  log(`Opening PT session: ${{path}}...`);
  try {{
    const r = await fetch('/api/pt/open', {{
      method: 'POST', headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify({{ path }})
    }});
    const d = await r.json();
    log(d.ok ? `[PT OK] Session opened` : `[PT ERR] ${{d.error}}`, d.ok);
  }} catch(e) {{ log(`[PT ERR] ${{e.message}}`, false); }}
}}

async function rescan() {{
  log('Rescanning sessions...');
  try {{
    const r = await fetch('/api/scan');
    const d = await r.json();
    log(d.ok ? `[OK] ${{d.message}}` : `[ERR] ${{d.error}}`, d.ok);
    if (d.ok) setTimeout(() => location.reload(), 1500);
  }} catch(e) {{ log(`[ERR] ${{e.message}}`, false); }}
}}

async function analyzeFile() {{
  const path = document.getElementById('analyze-path').value.trim();
  if (!path) {{ alert('Enter an audio file path first'); return; }}
  const el = document.getElementById('analyze-result');
  el.innerHTML = '<div class="result-box">Analyzing... (may take 10-30s)</div>';
  try {{
    const r = await fetch('/api/analyze', {{
      method: 'POST', headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify({{ path }})
    }});
    const d = await r.json();
    if (d.ok && d.data) {{
      const data = d.data[0] || d.data;
      let html = `<div class="result-box">`;
      html += `FILE: ${{data.file}}\\n`;
      html += `Duration: ${{data.duration_str}} | ${{data.sample_rate}} Hz | ${{data.channels}}ch | ${{data.bit_depth}}bit\\n`;
      html += `\\nLOUDNESS:\\n`;
      html += `  Integrated: ${{data.integrated_lufs}} LUFS\\n`;
      html += `  True Peak:  ${{data.true_peak_dbtp}} dBTP\\n`;
      html += `  Peak dBFS:  ${{data.peak_dbfs}} dBFS\\n`;
      html += `  Dynamic Range: ${{data.dynamic_range_db}} dB\\n`;
      if (data.dsp_compliance) {{
        html += `\\nDSP PLATFORM COMPLIANCE:\\n`;
        for (const [platform, info] of Object.entries(data.dsp_compliance)) {{
          const icon = info.ready ? '[OK]' : '[--]';
          html += `  ${{icon}} ${{platform.padEnd(22)}} target: ${{info.target_lufs}} LUFS  → ${{info.action}}\\n`;
        }}
      }}
      html += `</div>`;
      el.innerHTML = html;
    }} else {{
      el.innerHTML = `<div class="result-box err">Error: ${{JSON.stringify(d)}}</div>`;
    }}
  }} catch(e) {{
    el.innerHTML = `<div class="result-box err">Error: ${{e.message}}</div>`;
  }}
}}

async function checkPermissions() {{
  const el = document.getElementById('perm-status');
  el.textContent = 'Checking...';
  el.style.color = '#888';
  try {{
    const r = await fetch('/api/ai/permissions', {{ method: 'POST', headers: {{ 'Content-Type': 'application/json' }}, body: '{{}}' }});
    const d = await r.json();
    if (d.ok) {{
      el.textContent = 'Accessibility OK';
      el.style.color = '#0f9';
    }} else {{
      el.textContent = d.message || 'Permission needed';
      el.style.color = '#ff6b6b';
      aiLog('PERMISSION ISSUE: ' + (d.message || d.error));
      if (d.fix) aiLog('FIX: ' + d.fix);
    }}
  }} catch(e) {{ el.textContent = 'Error'; el.style.color = '#ff6b6b'; }}
}}

function aiLog(msg) {{
  const el = document.getElementById('ai-output');
  const ts = new Date().toLocaleTimeString();
  el.textContent = `[${{ts}}] ${{msg}}\n` + el.textContent;
}}

async function aiQuickTask(task, daw) {{
  document.getElementById('ai-task-input').value = task;
  document.getElementById('ai-daw-select').value = daw;
  await runAITask();
}}

async function runAITask() {{
  const task = document.getElementById('ai-task-input').value.trim();
  const daw = document.getElementById('ai-daw-select').value;
  const vision = document.getElementById('ai-vision-toggle').checked;
  if (!task) {{ alert('Enter a task for the AI'); return; }}

  const flVer = document.getElementById('fl-ver-main')?.value || '2025';
  const mpcApp = document.getElementById('mpc-app-main')?.value || 'mpc3';

  aiLog(`AI Task [${{daw.toUpperCase()}}${{vision ? ' + VISION' : ''}}]: ${{task}}`);
  aiLog('Running... (this may take up to 2 min with vision)');

  try {{
    const r = await fetch('/api/ai/run', {{
      method: 'POST',
      headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify({{ task, daw, fl_version: flVer, mpc_app: mpcApp, vision }})
    }});
    const d = await r.json();
    if (d.ok && d.data) {{
      const data = d.data;
      if (data.log) data.log.forEach(l => aiLog(l));
      if (data.steps) {{
        if (Array.isArray(data.steps)) {{
          data.steps.forEach((s, i) => aiLog(`Step ${{i+1}}: ${{typeof s === 'string' ? s : JSON.stringify(s)}}`));
        }}
      }}
      aiLog(data.ok === false ? `[FAILED] ${{data.error}}` : '[DONE] Task complete');
    }} else {{
      aiLog(`[ERR] ${{JSON.stringify(d)}}`);
    }}
  }} catch(e) {{
    aiLog(`[ERR] ${{e.message}}`);
  }}
}}

// Sync sidebar selects with main selects
document.getElementById('fl-ver-sidebar')?.addEventListener('change', e => {{
  const main = document.getElementById('fl-ver-main');
  if (main) main.value = e.target.value;
}});
document.getElementById('fl-ver-main')?.addEventListener('change', e => {{
  const sidebar = document.getElementById('fl-ver-sidebar');
  if (sidebar) sidebar.value = e.target.value;
}});
document.getElementById('mpc-app-sidebar')?.addEventListener('change', e => {{
  const main = document.getElementById('mpc-app-main');
  if (main) main.value = e.target.value;
}});
document.getElementById('mpc-app-main')?.addEventListener('change', e => {{
  const sidebar = document.getElementById('mpc-app-sidebar');
  if (sidebar) sidebar.value = e.target.value;
}});

// Drag & drop for analyze box
const analyzeInput = document.getElementById('analyze-path');
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => {{
  e.preventDefault();
  const f = e.dataTransfer.files[0];
  if (f) analyzeInput.value = f.path || f.name;
}});
</script>
</body>
</html>'''


if __name__ == "__main__":
    import sys
    print(f"\n  GOAT Force Pro Tools Bridge — Dr. Devin (Agent 007)")
    print(f"  Starting on http://localhost:{PORT}")
    print(f"  Open your browser to http://localhost:{PORT}\n")

    # Run initial session scan in background
    def bg_scan():
        print("  Scanning sessions in background...")
        r = scan_sessions()
        print(f"  {r.get('output', r.get('error', 'Scan done'))}")
    t = threading.Thread(target=bg_scan, daemon=True)
    t.start()

    server = http.server.HTTPServer(("localhost", PORT), BridgeHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Bridge stopped.")
        sys.exit(0)
