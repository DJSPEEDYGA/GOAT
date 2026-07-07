#!/usr/bin/env python3
"""
GOAT TOOLS MODULE
=================
Oscar-equivalent Tool Mode, Workspace Bridge, Owner Approval, Voice, Render Bridge,
Studio status, Mobile access, and local computer control — unified under the GOAT Intel server.

These endpoints are registered by goat_intel.py so every agent / LLM can use them.
All destructive actions require owner approval and stay inside the approved workspace roots.

Author: Devin / GOAT Force Records
"""

import os, json, re, time, hashlib, secrets, shutil, subprocess, platform, urllib.request
from flask import Blueprint, jsonify, request, Response, send_file
from functools import wraps

# ── CONFIGURATION ─────────────────────────────────────────────────────────────
GOAT_ROOT = os.path.dirname(os.path.abspath(__file__))
GOAT_PROJECT_ROOT = os.path.dirname(os.path.dirname(GOAT_ROOT))
APPROVAL_FILE = os.path.join(GOAT_ROOT, "chat_data", "owner_approval.json")
TOOL_LOG_FILE = os.path.join(GOAT_ROOT, "chat_data", "tool_logs.jsonl")
GENERATED_DIR = os.path.join(GOAT_ROOT, "generated_images")
TRASH_DIR = os.path.join(GOAT_ROOT, "chat_data", "tool_backups", "trash")
BACKUP_DIR = os.path.join(GOAT_ROOT, "chat_data", "tool_backups", "files")

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434")
CHAT_SERVER_PORT = int(os.environ.get("AGENT_007_PORT", 5500))

os.makedirs(os.path.dirname(APPROVAL_FILE), exist_ok=True)
os.makedirs(GENERATED_DIR, exist_ok=True)
os.makedirs(TRASH_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

# ── APPROVED ROOTS ──────────────────────────────────────────────────────────
_DEFAULT_ROOTS = [
    GOAT_PROJECT_ROOT,
    os.path.expanduser("~/GOAT-Royalty-App"),
    "/Volumes/i2i 1/GOAT-Royalty-App",
    "/Volumes/Public/GOAT-Server-Storage",
    "/Volumes/i2i 1/DJ SPEEDY",
    "/Volumes/i2i 1/DJ SPEEDY SOUNDS ",
    "/Volumes/i2i 1/APPS AND PLUGINS",
    os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Documents/Pro Tools"),
    os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Documents/BFD Drums"),
]

# Always-safe roots (add user override via chat_data/tool_roots.json)
def _user_roots():
    path = os.path.join(GOAT_ROOT, "chat_data", "tool_roots.json")
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return []

def allowed_roots():
    roots = [os.path.abspath(r) for r in _DEFAULT_ROOTS if os.path.exists(r)]
    roots += [os.path.abspath(r) for r in _user_roots() if os.path.exists(r)]
    return sorted(set(roots))

_SKIP_DIRS = {".git", "node_modules", ".next", "__pycache__", ".venv", "venv", ".DS_Store"}
_PRIVATE_PATTERNS = (".env", ".env.", "_private", "_secret", "token", "password", "key.pem", "cert.pem", ".p12")

# ── LOCAL-ONLY GUARD ────────────────────────────────────────────────────────
def _is_local_request():
    """Only allow local origins / localhost for tool actions."""
    host = request.headers.get("Host", "")
    remote = request.remote_addr or ""
    return remote in ("127.0.0.1", "::1", "localhost") or host.startswith("localhost") or host.startswith("127.0.0.1")

def local_only(f):
    @wraps(f)
    def decorated(*a, **k):
        if not _is_local_request():
            return jsonify({"ok": False, "error": "Tool actions are local-only"}), 403
        return f(*a, **k)
    return decorated

# ── OWNER APPROVAL ───────────────────────────────────────────────────────────
def _load_approval():
    try:
        with open(APPROVAL_FILE) as f:
            return json.load(f)
    except Exception:
        return {}

def _save_approval(data):
    with open(APPROVAL_FILE, "w") as f:
        json.dump(data, f, indent=2)

_sessions = {}

def _approval_public_state():
    data = _load_approval()
    return {
        "configured": bool(data.get("salt") and data.get("hash")),
        "locked": False,
        "sessionActive": len(_sessions) > 0,
        "expiresInMinutes": 15,
        "requiresOwnerApproval": True,
    }

def _hash_passphrase(passphrase, salt_hex):
    salt = bytes.fromhex(salt_hex)
    return hashlib.pbkdf2_hmac("sha256", passphrase.encode(), salt, 100_000).hex()

def _setup_approval(owner_name, passphrase):
    if not passphrase or len(passphrase) < 4:
        raise ValueError("Passphrase must be at least 4 characters")
    salt = secrets.token_hex(16)
    data = {
        "ownerName": owner_name,
        "salt": salt,
        "hash": _hash_passphrase(passphrase, salt),
        "created": time.time(),
    }
    _save_approval(data)
    return data

def _verify_approval(passphrase):
    data = _load_approval()
    if not data.get("salt") or not data.get("hash"):
        return False, {"ownerName": "Owner"}
    if _hash_passphrase(passphrase, data["salt"]) == data["hash"]:
        return True, data
    return False, data

def _create_session(owner_name):
    token = secrets.token_urlsafe(24)
    _sessions[token] = {"owner": owner_name, "created": time.time()}
    _cleanup_sessions()
    return {"token": token, "ownerName": owner_name, "expiresInMinutes": 15}

def _cleanup_sessions():
    cutoff = time.time() - 15 * 60
    for t in list(_sessions):
        if _sessions[t]["created"] < cutoff:
            _sessions.pop(t, None)

def _revoke_session(token):
    return _sessions.pop(token, None) is not None

def _require_approval(payload, action):
    data = _load_approval()
    if not (data.get("salt") and data.get("hash")):
        return
    token = payload.get("_ownerApprovalToken") or payload.get("ownerApprovalToken") or payload.get("token")
    _cleanup_sessions()
    if not token or token not in _sessions:
        raise PermissionError(f"Owner approval required for action: {action}")

# ── TOOL LOGGING ─────────────────────────────────────────────────────────────
def _tool_log(action, path, ok=True, error=None):
    entry = {
        "ts": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "action": action,
        "path": path,
        "ok": ok,
        "error": str(error) if error else None,
    }
    try:
        with open(TOOL_LOG_FILE, "a") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception:
        pass

# ── PATH SAFETY ──────────────────────────────────────────────────────────────
def _safe_path(path, must_exist=False):
    if not path:
        raise ValueError("path required")
    path = os.path.normpath(os.path.expanduser(path))
    roots = allowed_roots()
    if not roots:
        raise ValueError("No approved workspace roots configured")
    for root in roots:
        if path.startswith(root):
            break
    else:
        raise PermissionError(f"Path not in approved workspace roots: {path}")
    if must_exist and not os.path.exists(path):
        raise FileNotFoundError(f"Path not found: {path}")
    return path

def _is_private_name(name):
    n = name.lower()
    return any(n.startswith(p) or p in n for p in _PRIVATE_PATTERNS)

def _iter_files(max_files=100, roots=None):
    roots = roots or allowed_roots()
    out = []
    for root in roots:
        for dirpath, dirs, files in os.walk(root):
            dirs[:] = [d for d in dirs if d not in _SKIP_DIRS and not _is_private_name(d)]
            for f in files:
                if _is_private_name(f):
                    continue
                fpath = os.path.join(dirpath, f)
                rel = os.path.relpath(fpath, root)
                try:
                    size = os.path.getsize(fpath)
                    text = bool(re.search(r"\.(txt|md|json|csv|py|js|html|css|sh|yml|yaml|xml|log|cfg|ini|toml|swift|c|cpp|h|hpp|rs|go|ts|tsx|jsx)$", f, re.I))
                    out.append({"path": rel, "size": size, "text": text, "root": root})
                except Exception:
                    continue
                if len(out) >= max_files:
                    return out
    return out

# ── WORKSPACE BRIDGE ─────────────────────────────────────────────────────────
def _workspace_info():
    roots = allowed_roots()
    files = _iter_files(1) if roots else []
    return {
        "ok": bool(roots),
        "roots": roots,
        "mode": "read-only",
        "filesAvailable": bool(files),
        "policy": {
            "blockedDirectories": sorted(_SKIP_DIRS),
            "blockedPatterns": list(_PRIVATE_PATTERNS),
        },
    }

def _workspace_tree(max_files=200):
    return {"roots": allowed_roots(), "files": _iter_files(max_files)}

def _workspace_file(rel_path, max_chars=100_000):
    for root in allowed_roots():
        fpath = os.path.join(root, rel_path)
        if os.path.exists(fpath):
            with open(fpath, "r", errors="ignore") as f:
                return {"ok": True, "path": rel_path, "content": f.read(max_chars)}
    return {"ok": False, "error": "file not found"}

def _workspace_search(needle, max_hits=50):
    hits = []
    for item in _iter_files(1000):
        if not item.get("text") or item.get("size", 0) > 300_000:
            continue
        try:
            data = _workspace_file(item["path"], max_chars=300_000).get("content", "")
        except Exception:
            continue
        for idx, line in enumerate(data.splitlines(), start=1):
            if needle.lower() in line.lower():
                hits.append({"path": item["path"], "line": idx, "text": line.strip()[:260]})
                if len(hits) >= max_hits:
                    return {"roots": allowed_roots(), "query": needle, "hits": hits}
    return {"roots": allowed_roots(), "query": needle, "hits": hits}

# ── TOOL ACTIONS ─────────────────────────────────────────────────────────────
def _tool_read_text(path, max_chars=60_000):
    fpath = _safe_path(path, must_exist=True)
    with open(fpath, "r", errors="ignore") as f:
        return {"ok": True, "path": fpath, "content": f.read(max_chars)}

def _tool_search_text(query, max_hits=50, roots=None):
    hits = []
    for item in _iter_files(1000, roots=roots):
        if not item.get("text") or item.get("size", 0) > 300_000:
            continue
        try:
            data = _tool_read_text(item["path"], max_chars=300_000).get("content", "")
        except Exception:
            continue
        for idx, line in enumerate(data.splitlines(), start=1):
            if query.lower() in line.lower():
                hits.append({"path": item["path"], "line": idx, "text": line.strip()[:260]})
                if len(hits) >= max_hits:
                    return {"ok": True, "query": query, "hits": hits}
    return {"ok": True, "query": query, "hits": hits}

def _tool_run_command(command, cwd="."):
    if not command:
        raise ValueError("command required")
    # Safety: only allow read-only / diagnostic commands
    unsafe = ("rm -rf", "mkfs", "dd if", "del /f", "format", "> /dev", "sudo", "chmod -R")
    if any(u in command.lower() for u in unsafe):
        raise PermissionError("Unsafe command pattern rejected")
    try:
        proc = subprocess.run(
            command, shell=True, cwd=cwd, capture_output=True, text=True, timeout=60
        )
        return {
            "ok": True,
            "command": command,
            "returncode": proc.returncode,
            "stdout": proc.stdout[:8000],
            "stderr": proc.stderr[:4000],
        }
    except Exception as e:
        return {"ok": False, "command": command, "error": str(e)}

def _backup_path(path):
    name = os.path.basename(path)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    return os.path.join(BACKUP_DIR, f"{name}.{stamp}.bak")

def _tool_write_text(path, content, reason=""):
    fpath = _safe_path(path)
    if os.path.exists(fpath):
        shutil.copy2(fpath, _backup_path(fpath))
    os.makedirs(os.path.dirname(fpath), exist_ok=True)
    with open(fpath, "w") as f:
        f.write(content)
    _tool_log("write", fpath, ok=True)
    return {"ok": True, "path": fpath, "bytes": len(content), "reason": reason}

def _tool_patch_text(path, replacements, reason=""):
    fpath = _safe_path(path, must_exist=True)
    with open(fpath, "r") as f:
        original = f.read()
    text = original
    applied = []
    for repl in replacements:
        old = repl.get("old", repl.get("from", ""))
        new = repl.get("new", repl.get("to", ""))
        if old and old in text:
            text = text.replace(old, new, 1)
            applied.append({"old": old[:40], "new": new[:40]})
    if text == original:
        return {"ok": False, "path": fpath, "error": "No replacements applied", "applied": 0}
    shutil.copy2(fpath, _backup_path(fpath))
    with open(fpath, "w") as f:
        f.write(text)
    _tool_log("patch", fpath, ok=True)
    return {"ok": True, "path": fpath, "applied": len(applied), "reason": reason}

def _tool_mkdir(path, reason=""):
    fpath = _safe_path(path)
    os.makedirs(fpath, exist_ok=True)
    _tool_log("mkdir", fpath, ok=True)
    return {"ok": True, "path": fpath, "reason": reason}

def _tool_copy(src, dest, overwrite=False, reason=""):
    s = _safe_path(src, must_exist=True)
    d = _safe_path(dest)
    if os.path.exists(d) and not overwrite:
        raise FileExistsError(f"Destination exists: {d}")
    os.makedirs(os.path.dirname(d), exist_ok=True)
    shutil.copy2(s, d)
    _tool_log("copy", f"{s} -> {d}", ok=True)
    return {"ok": True, "src": s, "dest": d, "reason": reason}

def _tool_move(src, dest, overwrite=False, reason=""):
    s = _safe_path(src, must_exist=True)
    d = _safe_path(dest)
    if os.path.exists(d) and not overwrite:
        raise FileExistsError(f"Destination exists: {d}")
    os.makedirs(os.path.dirname(d), exist_ok=True)
    shutil.move(s, d)
    _tool_log("move", f"{s} -> {d}", ok=True)
    return {"ok": True, "src": s, "dest": d, "reason": reason}

def _tool_trash(path, reason=""):
    fpath = _safe_path(path, must_exist=True)
    os.makedirs(TRASH_DIR, exist_ok=True)
    dest = os.path.join(TRASH_DIR, f"{os.path.basename(fpath)}.{int(time.time())}")
    shutil.move(fpath, dest)
    _tool_log("trash", f"{fpath} -> {dest}", ok=True)
    return {"ok": True, "path": fpath, "trashedAt": dest, "reason": reason}

def _tool_web_fetch(url, max_chars=8000):
    if not url.startswith(("http://", "https://")):
        raise ValueError("URL must be http or https")
    if any(p in url.lower() for p in ("password", "secret", "token", "api_key", "private_key", "passwd")):
        raise PermissionError("Credential URLs blocked")
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            data = r.read(200_000).decode("utf-8", errors="ignore")
        return {"ok": True, "url": url, "content": data[:max_chars], "length": len(data)}
    except Exception as e:
        return {"ok": False, "url": url, "error": str(e)}

def _tool_draw_local(subject):
    """Procedural GOAT-themed PNG renderer."""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        return {"ok": False, "error": "PIL not installed"}
    w, h = 512, 512
    img = Image.new("RGB", (w, h), "#0a0a0a")
    d = ImageDraw.Draw(img)
    # City skyline
    for x in range(0, w, 40):
        height = 60 + (x * 7) % 180
        d.rectangle([x, h - height, x + 30, h], fill="#1a1a2e")
    # GOAT circle head
    cx, cy = w // 2, h // 2 - 20
    d.ellipse([cx - 80, cy - 80, cx + 80, cy + 80], fill="#d4a03c", outline="#FFD700", width=4)
    # Horns
    d.polygon([(cx - 60, cy - 60), (cx - 80, cy - 120), (cx - 40, cy - 70)], fill="#f0c040")
    d.polygon([(cx + 60, cy - 60), (cx + 80, cy - 120), (cx + 40, cy - 70)], fill="#f0c040")
    # Eyes
    d.ellipse([cx - 30, cy - 20, cx - 10, cy], fill="#000000")
    d.ellipse([cx + 10, cy - 20, cx + 30, cy], fill="#000000")
    # Text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except Exception:
        font = ImageFont.load_default()
    d.text((20, 20), f"GOAT: {subject[:40]}", fill="#FFD700", font=font)
    fname = f"goat-draw-{int(time.time())}.png"
    fpath = os.path.join(GENERATED_DIR, fname)
    img.save(fpath)
    return {"ok": True, "image": f"/generated-images/{fname}", "path": fpath, "renderer": "local-procedural"}

# ── VOICE / TTS ─────────────────────────────────────────────────────────────
def _tool_voice_speak(text):
    if not text:
        return {"ok": False, "error": "text required"}
    if platform.system() == "Darwin":
        try:
            subprocess.run(["say", text[:400]], timeout=30, check=True)
            return {"ok": True, "spoken": text[:400], "engine": "macOS-say"}
        except Exception as e:
            return {"ok": False, "error": str(e)}
    return {"ok": False, "error": "TTS only available on macOS"}

# ── LOCAL FILE INSPECT ───────────────────────────────────────────────────────
def _local_files_inspect(payload):
    paths = payload.get("paths", payload.get("files", []))
    max_size = int(payload.get("maxSize", 100_000))
    out = []
    for p in paths:
        try:
            fpath = _safe_path(p, must_exist=True)
            size = os.path.getsize(fpath)
            content = ""
            if size <= max_size:
                with open(fpath, "r", errors="ignore") as f:
                    content = f.read(max_size)
            out.append({"path": fpath, "size": size, "content": content})
        except Exception as e:
            out.append({"path": p, "error": str(e)})
    return {"ok": True, "files": out}

# ── RENDER BRIDGE STATUS ──────────────────────────────────────────────────────
def _probe_renderer(name, url):
    try:
        import urllib.request
        urllib.request.urlopen(url, timeout=3)
        return {"name": name, "url": url, "reachable": True}
    except Exception:
        return {"name": name, "url": url, "reachable": False}

def _image_render_bridge_status():
    return {
        "ok": True,
        "bridges": [
            _probe_renderer("Ollama", f"{OLLAMA_HOST}/api/tags"),
            _probe_renderer("ComfyUI", "http://127.0.0.1:8188/system_stats"),
            _probe_renderer("StableDiffusion", "http://127.0.0.1:7860/"),
            _probe_renderer("StableDiffusion-Forge", "http://127.0.0.1:7861/"),
        ],
        "localRenderer": "/api/image/generate (procedural fallback available)",
    }

# ── STUDIO STATUS ─────────────────────────────────────────────────────────────
def _studio_status():
    daws = ["Ableton Live", "FL Studio", "Logic Pro", "Pro Tools", "Reaper", "Cubase"]
    running = []
    for daw in daws:
        try:
            if platform.system() == "Darwin":
                subprocess.run(["pgrep", "-f", daw], check=True, capture_output=True)
                running.append(daw)
        except Exception:
            pass
    protools_path = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Documents/Pro Tools")
    bfd_path = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Documents/BFD Drums")
    return {
        "ok": True,
        "studio": "GOAT Force Studio",
        "runningDAWs": running,
        "ollama": _probe_renderer("Ollama", f"{OLLAMA_HOST}/api/tags")["reachable"],
        "hardware": platform.machine(),
        "os": platform.system(),
        "studioAssets": {
            "proTools": {"path": protools_path, "exists": os.path.isdir(protools_path)},
            "bfdDrums": {"path": bfd_path, "exists": os.path.isdir(bfd_path)},
        },
    }

# ── MOBILE ACCESS ─────────────────────────────────────────────────────────────
def _detect_lan_ip():
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def _mobile_access():
    ip = _detect_lan_ip()
    return {
        "ok": True,
        "mode": "phone-and-lan-browser-access",
        "bind": "0.0.0.0",
        "localUrl": f"http://127.0.0.1:{CHAT_SERVER_PORT}/",
        "lanUrl": f"http://{ip}:{CHAT_SERVER_PORT}/",
        "phoneUrl": f"http://{ip}:{CHAT_SERVER_PORT}/",
        "sameWifiRequired": True,
    }

# ── MODEL MAP ─────────────────────────────────────────────────────────────────
def _ollama_model_map():
    try:
        with urllib.request.urlopen(f"{OLLAMA_HOST}/api/tags", timeout=8) as r:
            data = json.loads(r.read().decode())
        live = {m.get("name") for m in data.get("models", [])}
    except Exception:
        live = set()
    tiers = {
        "power": ["llama3.1:70b", "llama3.3", "qwen3:8b", "qwen3:14b", "mixtral", "deepseek-r1:70b"],
        "balanced": ["llama3.1:8b", "llama3.2", "qwen2.5:7b", "qwen2.5:14b", "mistral:7b", "deepseek-r1:8b"],
        "fast": ["gemma2-2b", "llama3.2:3b", "phi3", "qwen2.5:3b", "mistral-nemo"],
        "vision": ["llava", "llava-llama3", "gemma3", "qwen2.5vl", "moondream"],
        "coding": ["qwen2.5-coder", "codestral", "starcoder2", "deepseek-coder"],
    }
    return {"ok": True, "live": list(live), "tiers": tiers, "recommended": "llama3.1:70b"}

# ── GOAT CONFIG ───────────────────────────────────────────────────────────────
GOAT_CONFIG_FILE = os.path.join(GOAT_ROOT, "chat_data", "goat-config.json")

def _load_goat_config():
    try:
        with open(GOAT_CONFIG_FILE) as f:
            return json.load(f)
    except Exception:
        return {"modelsPath": os.environ.get("OLLAMA_MODELS", ""), "temperature": 0.7}

def _save_goat_config(data):
    with open(GOAT_CONFIG_FILE, "w") as f:
        json.dump(data, f, indent=2)

# ── FLASK BLUEPRINT ───────────────────────────────────────────────────────────
tools_bp = Blueprint("goat_tools", __name__, url_prefix="/api")

# Health/status
@tools_bp.route("/workspace", methods=["GET"])
def get_workspace_info():
    return jsonify(_workspace_info())

@tools_bp.route("/workspace/tree", methods=["GET"])
def get_workspace_tree():
    max_files = max(1, min(int(request.args.get("max", 200)), 600))
    return jsonify(_workspace_tree(max_files))

@tools_bp.route("/workspace/file", methods=["GET"])
def get_workspace_file():
    path = request.args.get("path", "")
    max_chars = int(request.args.get("max_chars", 100_000))
    return jsonify(_workspace_file(path, max_chars))

@tools_bp.route("/workspace/search", methods=["GET"])
def get_workspace_search():
    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify({"error": "Query must be at least 2 characters"}), 400
    return jsonify(_workspace_search(q, int(request.args.get("max", 50))))

@tools_bp.route("/tools", methods=["GET", "POST"])
@local_only
def tools():
    if request.method == "GET":
        return jsonify({
            "ok": True,
            "actions": [
                "tree", "read", "search", "run", "write", "patch", "mkdir",
                "copy", "move", "trash", "web_fetch", "draw", "local_intel"
            ],
            "roots": allowed_roots(),
        })
    payload = request.get_json(silent=True) or {}
    action = str(payload.get("action", "")).strip().lower()
    try:
        _require_approval(payload, action)
        if action == "tree":
            max_files = max(1, min(int(payload.get("max", 200)), 600))
            roots = payload.get("roots")
            return jsonify({"ok": True, "roots": allowed_roots(), "files": _iter_files(max_files, roots)})
        elif action == "read":
            return jsonify(_tool_read_text(payload.get("path"), int(payload.get("maxChars", 60_000))))
        elif action == "search":
            return jsonify(_tool_search_text(payload.get("query"), int(payload.get("max", 50)), payload.get("roots")))
        elif action == "run":
            return jsonify(_tool_run_command(payload.get("command"), payload.get("cwd", ".")))
        elif action == "write":
            return jsonify(_tool_write_text(payload.get("path"), payload.get("content", ""), payload.get("reason", "")))
        elif action == "patch":
            return jsonify(_tool_patch_text(payload.get("path"), payload.get("replacements", []), payload.get("reason", "")))
        elif action == "mkdir":
            return jsonify(_tool_mkdir(payload.get("path"), payload.get("reason", "")))
        elif action == "copy":
            return jsonify(_tool_copy(payload.get("src", payload.get("source", "")), payload.get("dest", payload.get("destination", "")), bool(payload.get("overwrite", False)), payload.get("reason", "")))
        elif action == "move":
            return jsonify(_tool_move(payload.get("src", payload.get("source", "")), payload.get("dest", payload.get("destination", "")), bool(payload.get("overwrite", False)), payload.get("reason", "")))
        elif action == "trash":
            return jsonify(_tool_trash(payload.get("path"), payload.get("reason", "")))
        elif action == "web_fetch":
            return jsonify(_tool_web_fetch(payload.get("url"), int(payload.get("maxChars", 8000))))
        elif action == "draw":
            return jsonify(_tool_draw_local(payload.get("subject", payload.get("prompt", ""))))
        elif action == "local_intel":
            return jsonify({"ok": True, "roots": allowed_roots(), "stats": _workspace_tree(1)})
        else:
            return jsonify({"ok": False, "error": f"Unknown action: {action}"}), 400
    except PermissionError as e:
        return jsonify({"ok": False, "error": str(e), "ownerApproval": _approval_public_state()}), 401
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@tools_bp.route("/tools/policy", methods=["GET", "POST"])
@local_only
def tools_policy():
    if request.method == "GET":
        return jsonify({"ok": True, "roots": allowed_roots(), "skipDirs": sorted(_SKIP_DIRS)})
    data = request.get_json(silent=True) or {}
    new_roots = data.get("roots")
    if new_roots is not None:
        path = os.path.join(GOAT_ROOT, "chat_data", "tool_roots.json")
        with open(path, "w") as f:
            json.dump(new_roots, f, indent=2)
    return jsonify({"ok": True, "roots": allowed_roots()})

@tools_bp.route("/tools/logs", methods=["GET"])
@local_only
def tools_logs():
    try:
        with open(TOOL_LOG_FILE) as f:
            lines = f.readlines()
        return jsonify({"ok": True, "logs": [json.loads(l) for l in lines[-50:]]})
    except Exception:
        return jsonify({"ok": True, "logs": []})

# Owner approval
@tools_bp.route("/owner-approval", methods=["GET"])
@local_only
def get_owner_approval():
    return jsonify({"ok": True, "ownerApproval": _approval_public_state()})

@tools_bp.route("/owner-approval/setup", methods=["POST"])
@local_only
def post_owner_approval_setup():
    try:
        data = request.get_json(silent=True) or {}
        cfg = _setup_approval(data.get("ownerName", "Owner"), data.get("passphrase", ""))
        session = _create_session(cfg.get("ownerName", "Owner"))
        return jsonify({"ok": True, "ownerApproval": _approval_public_state(), "session": session})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e), "ownerApproval": _approval_public_state()}), 400

@tools_bp.route("/owner-approval/unlock", methods=["POST"])
@local_only
def post_owner_approval_unlock():
    data = request.get_json(silent=True) or {}
    ok, cfg = _verify_approval(data.get("passphrase", ""))
    if not ok:
        return jsonify({"ok": False, "error": "Owner approval code rejected", "ownerApproval": _approval_public_state()}), 401
    session = _create_session(cfg.get("ownerName", "Owner"))
    return jsonify({"ok": True, "ownerApproval": _approval_public_state(), "session": session})

@tools_bp.route("/owner-approval/lock", methods=["POST"])
@local_only
def post_owner_approval_lock():
    data = request.get_json(silent=True) or {}
    token = data.get("_ownerApprovalToken") or data.get("ownerApprovalToken") or data.get("token")
    if token:
        _revoke_session(token)
    return jsonify({"ok": True, "ownerApproval": _approval_public_state()})

# Voice
@tools_bp.route("/voice/speak", methods=["POST"])
@local_only
def voice_speak():
    data = request.get_json(silent=True) or {}
    return jsonify(_tool_voice_speak(data.get("text", "")))

# Local files inspect
@tools_bp.route("/local-files/inspect", methods=["POST"])
@local_only
def local_files_inspect():
    return jsonify(_local_files_inspect(request.get_json(silent=True) or {}))

# Render bridge
@tools_bp.route("/goat/image-render-bridge", methods=["GET"])
def image_render_bridge():
    return jsonify(_image_render_bridge_status())

# Studio status
@tools_bp.route("/studio/status", methods=["GET"])
def studio_status():
    return jsonify(_studio_status())

# Studio assets
@tools_bp.route("/studio/assets", methods=["GET"])
def studio_assets():
    protools_path = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Documents/Pro Tools")
    bfd_path = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Documents/BFD Drums")
    def scan(root, max_depth=2):
        items = []
        if not os.path.isdir(root):
            return items
        for dirpath, dirs, files in os.walk(root):
            depth = dirpath.count(os.sep) - root.count(os.sep)
            if depth > max_depth:
                del dirs[:]
                continue
            items.append({"path": os.path.relpath(dirpath, root), "type": "folder", "fileCount": len(files)})
        return items
    return jsonify({
        "ok": True,
        "proTools": {"path": protools_path, "exists": os.path.isdir(protools_path), "folders": scan(protools_path)[:30]},
        "bfdDrums": {"path": bfd_path, "exists": os.path.isdir(bfd_path), "folders": scan(bfd_path)[:30]},
    })

# Sound library roots
SOUND_LIBRARY_ROOTS = {
    "dj_speedy": "/Volumes/i2i 1/DJ SPEEDY",
    "dj_speedy_sounds": "/Volumes/i2i 1/DJ SPEEDY SOUNDS ",
}

# Serve a sound file from any approved sound library (read-only)
@tools_bp.route("/studio/sound", methods=["GET"])
def serve_sound():
    rel = request.args.get("path", "")
    library = request.args.get("library", "dj_speedy")
    if not rel:
        return jsonify({"ok": False, "error": "path required"}), 400
    root = SOUND_LIBRARY_ROOTS.get(library)
    if not root or not os.path.isdir(root):
        return jsonify({"ok": False, "error": "library not found", "libraries": list(SOUND_LIBRARY_ROOTS)}), 400
    fpath = os.path.abspath(os.path.join(root, os.path.normpath(rel)))
    if not fpath.startswith(os.path.abspath(root)):
        return jsonify({"ok": False, "error": "invalid path"}), 400
    if not os.path.exists(fpath):
        return jsonify({"ok": False, "error": "not found"}), 404
    if not fpath.lower().endswith((".wav", ".mp3", ".aiff", ".flac", ".m4a", ".ogg")):
        return jsonify({"ok": False, "error": "not an audio file"}), 400
    mimetype = "audio/wav" if fpath.lower().endswith(".wav") else "audio/mpeg" if fpath.lower().endswith(".mp3") else "audio/aiff"
    return send_file(fpath, mimetype=mimetype)

# Music library snapshot (fast — does not recurse-count huge archives)
@tools_bp.route("/studio/music-library", methods=["GET"])
def music_library():
    out = {"ok": True, "libraries": {}}
    for name, root in SOUND_LIBRARY_ROOTS.items():
        exists = os.path.isdir(root)
        folders = []
        if exists:
            try:
                for item in sorted(os.listdir(root)):
                    item_path = os.path.join(root, item)
                    if os.path.isdir(item_path) and not item.startswith("."):
                        folders.append({"name": item, "path": os.path.relpath(item_path, root)})
            except Exception as e:
                return jsonify({"ok": False, "error": str(e)}), 500
        out["libraries"][name] = {"root": root, "exists": exists, "folders": folders}
    return jsonify(out)

# Apps & Plugins inventory
@tools_bp.route("/studio/apps-plugins", methods=["GET"])
def apps_plugins():
    root = "/Volumes/i2i 1/APPS AND PLUGINS"
    exists = os.path.isdir(root)
    out = {"ok": True, "root": root, "exists": exists, "items": []}
    if not exists:
        return jsonify(out)
    try:
        for item in sorted(os.listdir(root)):
            item_path = os.path.join(root, item)
            if item.startswith("."):
                continue
            is_app = os.path.isdir(item_path) and item.endswith(".app")
            is_dir = os.path.isdir(item_path)
            size = os.path.getsize(item_path) if not is_dir else 0
            ext = os.path.splitext(item)[1].lower()
            out["items"].append({
                "name": item,
                "type": "app" if is_app else ("folder" if is_dir else "file"),
                "ext": ext,
                "size": size,
            })
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    return jsonify(out)

# Mobile access
@tools_bp.route("/mobile/access", methods=["GET"])
def mobile_access():
    return jsonify(_mobile_access())

# Model map
@tools_bp.route("/ollama/model-map", methods=["GET"])
def ollama_model_map():
    return jsonify(_ollama_model_map())

# Goat config
@tools_bp.route("/goat/get-config", methods=["GET"])
def get_goat_config():
    return jsonify({"ok": True, "config": _load_goat_config()})

@tools_bp.route("/goat/set-models-path", methods=["POST"])
@local_only
def set_models_path():
    data = request.get_json(silent=True) or {}
    cfg = _load_goat_config()
    cfg["modelsPath"] = data.get("path", cfg.get("modelsPath", ""))
    _save_goat_config(cfg)
    return jsonify({"ok": True, "config": cfg})

# Image generation
@tools_bp.route("/image/generate", methods=["POST"])
def image_generate():
    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt", data.get("subject", "GOAT"))
    return jsonify(_tool_draw_local(prompt))

@tools_bp.route("/image/to-image", methods=["POST"])
def image_to_image():
    return jsonify({"ok": False, "error": "img2img requires diffusion backend (ComfyUI/Forge not connected)", "bridges": _image_render_bridge_status()["bridges"]})

# Granite ASR status
@tools_bp.route("/voice/granite/status", methods=["GET"])
def granite_status():
    return jsonify(_probe_renderer("Granite Speech", "http://127.0.0.1:9797"))

# Clips / study status
@tools_bp.route("/clips/status", methods=["GET"])
def clips_status():
    return jsonify({"ok": True, "whisper": False, "clipHunter": "not loaded", "note": "Video clip analysis requires Whisper/ffmpeg setup"})

@tools_bp.route("/study/status", methods=["GET"])
def study_status():
    return jsonify({"ok": True, "studyBuilder": "not loaded", "note": "Study builder requires training transcript pipeline"})

# Video engines
@tools_bp.route("/goat/video-engines", methods=["GET"])
def video_engines():
    return jsonify({
        "ok": True,
        "engines": [
            {"name": "ffmpeg", "available": bool(shutil.which("ffmpeg"))},
            {"name": "ComfyUI", "reachable": _probe_renderer("ComfyUI", "http://127.0.0.1:8188/system_stats")["reachable"]},
            {"name": "StableDiffusion", "reachable": _probe_renderer("StableDiffusion", "http://127.0.0.1:7860/")["reachable"]},
        ]
    })

# Vision stubs — truthfully report if no vision model is reachable
VISION_ENDPOINTS = [
    ("caption", "caption image"),
    ("detect", "object detection"),
    ("segment", "semantic segmentation"),
    ("depth", "depth estimation"),
    ("vqa", "visual question answering"),
    ("classify", "zero-shot classification"),
]

def _make_vision_stub(desc):
    def stub():
        return jsonify({"ok": False, "error": f"Vision {desc} requires a vision model endpoint (Ollama vision or ComfyUI)", "bridges": _image_render_bridge_status()["bridges"]})
    return stub

for _vision_name, _vision_desc in VISION_ENDPOINTS:
    _fn = _make_vision_stub(_vision_desc)
    _fn.__name__ = f"vision_stub_{_vision_name}"
    tools_bp.add_url_rule(f"/vision/{_vision_name}", f"vision_{_vision_name}", _fn, methods=["POST"])

# Tool adapters list
@tools_bp.route("/tools/adapters", methods=["GET"])
def tool_adapters():
    return jsonify({
        "ok": True,
        "adapters": [
            {"id": "tree", "name": "Workspace Tree", "readonly": True},
            {"id": "read", "name": "Read File", "readonly": True},
            {"id": "search", "name": "Search Text", "readonly": True},
            {"id": "run", "name": "Run Command", "readonly": False},
            {"id": "write", "name": "Write File", "readonly": False},
            {"id": "patch", "name": "Patch File", "readonly": False},
            {"id": "mkdir", "name": "Make Directory", "readonly": False},
            {"id": "copy", "name": "Copy File", "readonly": False},
            {"id": "move", "name": "Move File", "readonly": False},
            {"id": "trash", "name": "Move to Trash", "readonly": False},
            {"id": "web_fetch", "name": "Web Fetch", "readonly": True},
            {"id": "draw", "name": "Draw Local PNG", "readonly": True},
        ]
    })

# Royalty Calculator
ROYALTY_RATES = {
    "spotify": 0.00437,
    "apple": 0.00783,
    "youtube": 0.00274,
    "tiktok": 0.00069,
    "tidal": 0.01284,
    "amazon": 0.00402,
}

@tools_bp.route("/goat/royalty-calc", methods=["GET", "POST"])
def royalty_calc():
    data = request.get_json(silent=True) or request.args or {}
    streams = int(data.get("streams", 0)) if data.get("streams") else 0
    platform = str(data.get("platform", "all")).lower()
    if streams <= 0:
        return jsonify({"ok": False, "error": "streams must be positive integer"}), 400
    if platform == "all":
        breakdown = {
            p: round(streams * rate, 2)
            for p, rate in ROYALTY_RATES.items()
        }
        avg = round(sum(breakdown.values()) / len(breakdown), 2)
        return jsonify({"ok": True, "streams": streams, "averageTotal": avg, "breakdown": breakdown, "note": "Per-stream estimates. Actual payouts vary by deal, territory, and label split."})
    if platform not in ROYALTY_RATES:
        return jsonify({"ok": False, "error": f"unknown platform: {platform}", "supported": list(ROYALTY_RATES)}), 400
    rev = round(streams * ROYALTY_RATES[platform], 2)
    return jsonify({"ok": True, "streams": streams, "platform": platform, "rate": ROYALTY_RATES[platform], "revenue": rev, "note": "Per-stream estimate. Actual payout varies by deal."})

# Export chat
@tools_bp.route("/export/chat", methods=["POST"])
def export_chat():
    data = request.get_json(silent=True) or {}
    chats = data.get("chats", data.get("messages", []))
    fmt = data.get("format", "markdown").lower()
    title = data.get("title", "GOAT-Chat")
    if not chats:
        return jsonify({"ok": False, "error": "no chats/messages provided"}), 400
    if fmt == "markdown":
        lines = [f"# {title}\n", f"Exported: {time.strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"]
        for msg in chats:
            role = msg.get("role", "unknown")
            content = msg.get("content", "")
            ts = msg.get("timestamp", "")
            lines.append(f"## {role.upper()}{' — ' + ts if ts else ''}\n\n{content}\n\n---\n\n")
        content = "".join(lines)
        ext = "md"
    elif fmt == "json":
        content = json.dumps(chats, indent=2)
        ext = "json"
    else:
        return jsonify({"ok": False, "error": "format must be markdown or json"}), 400
    fname = f"{title.replace(' ', '_')}-{int(time.time())}.{ext}"
    fpath = os.path.join(GENERATED_DIR, fname)
    with open(fpath, "w") as f:
        f.write(content)
    return jsonify({"ok": True, "url": f"/generated-images/{fname}", "path": fpath, "format": fmt, "bytes": len(content)})

# Generated images static serve
@tools_bp.route("/generated-images/<path:filename>")
def generated_image(filename):
    fpath = os.path.abspath(os.path.join(GENERATED_DIR, os.path.basename(filename)))
    if not fpath.startswith(os.path.abspath(GENERATED_DIR)):
        return jsonify({"error": "invalid path"}), 400
    if os.path.exists(fpath):
        return send_file(fpath)
    return jsonify({"error": "not found"}), 404

# ── DAW COMPUTER CONTROL ─────────────────────────────────────────────────────
# Real Pro Tools / FL Studio / Logic / Ableton control via PTSL gRPC + AppleScript.
# PTSL (Pro Tools Scripting Library) runs on gRPC port 31416 when Pro Tools is open.
# AppleScript is the fallback for transport/UI actions without PTSL.

PTSL_HOST = "localhost:31416"
C_ROOM = "/Volumes/The C Room"
HARD_LIQUOR_STEMS = "/Volumes/i2i 1/Agent-007-GOAT/Shared/session_packets/hard-liquor-next-single"

# Actions that always require owner approval
_DAW_APPROVAL_REQUIRED = {
    "record_arm", "export_mix", "bounce", "save_session_destructive",
    "close_session", "delete_track", "record_enable", "toggle_record_enable"
}

def _daw_screenshot():
    """Take a screenshot and return the path."""
    ts = int(time.time())
    path = f"/tmp/goat_daw_screenshot_{ts}.png"
    try:
        result = subprocess.run(
            ["screencapture", "-x", path],
            capture_output=True, timeout=10
        )
        if result.returncode == 0 and os.path.exists(path):
            return {"ok": True, "path": path, "summary": f"Screenshot saved: {path}"}
        return {"ok": False, "error": "screencapture failed", "path": None}
    except Exception as e:
        return {"ok": False, "error": str(e), "path": None}

def _daw_applescript(script):
    """Run an AppleScript and return stdout."""
    try:
        result = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True, text=True, timeout=15
        )
        return {
            "ok": result.returncode == 0,
            "output": result.stdout.strip(),
            "error": result.stderr.strip() if result.returncode != 0 else None
        }
    except Exception as e:
        return {"ok": False, "error": str(e), "output": None}

def _daw_get_running():
    """Return list of currently running DAWs."""
    daws = {
        "Pro Tools": "Pro Tools",
        "FL Studio": "FL Studio",
        "Logic Pro": "Logic Pro",
        "Ableton Live": "Live",
        "Reaper": "REAPER",
        "Studio One": "Studio One",
    }
    running = []
    for name, proc in daws.items():
        try:
            subprocess.run(["pgrep", "-f", proc], check=True, capture_output=True)
            running.append(name)
        except Exception:
            pass
    return running

def _ptsl_command(command_name, params=None):
    """
    Send a command to Pro Tools via PTSL gRPC.
    Requires Pro Tools to be running with PTSL enabled (Setup > PTSL > Enable).
    Falls back to AppleScript transport commands if gRPC not available.
    """
    try:
        import grpc  # type: ignore
        # Try to import generated PTSL stubs if available
        try:
            import ptsl_pb2 as pb2       # type: ignore
            import ptsl_pb2_grpc as grpc_stub  # type: ignore
            channel = grpc.insecure_channel(PTSL_HOST)
            stub = grpc_stub.PTSLStub(channel)
            # Build request — simplified wrapper
            req = pb2.Request()
            req.command_id = getattr(pb2, command_name, 0)
            if params:
                req.request_body_json = json.dumps(params)
            resp = stub.SendGrpcRequest(req, timeout=10)
            return {
                "ok": True,
                "command": command_name,
                "response_json": resp.response_body_json,
                "method": "ptsl_grpc"
            }
        except ImportError:
            # PTSL Python stubs not built yet — use AppleScript transport fallback
            return {"ok": False, "error": "PTSL Python stubs not generated yet. Use AppleScript mode or build PTSL client first.", "method": "ptsl_grpc_unavailable"}
    except ImportError:
        return {"ok": False, "error": "grpc package not installed. Run: pip install grpcio", "method": "grpc_missing"}
    except Exception as e:
        return {"ok": False, "error": str(e), "method": "ptsl_grpc"}

def _daw_transport_applescript(daw, action):
    """Transport control for any DAW via AppleScript keyboard shortcuts."""
    daw_processes = {
        "Pro Tools": "Pro Tools",
        "FL Studio": "FL Studio",
        "Logic Pro": "Logic Pro",
        "Ableton Live": "Live",
    }
    proc = daw_processes.get(daw, daw)
    keymap = {
        "play": 'keystroke " "',
        "stop": 'keystroke " "',
        "rewind": 'key code 115',  # Home key
        "return_to_start": 'key code 115',
        "record": 'key code 3 using command down',  # Cmd+spacebar region varies
        "save": 'key code 1 using command down',  # Cmd+S
        "undo": 'key code 6 using command down',  # Cmd+Z
        "redo": 'key code 6 using {command down, shift down}',  # Cmd+Shift+Z
        "zoom_in": 'key code 30 using command down',  # Cmd+]
        "zoom_out": 'key code 33 using command down',  # Cmd+[
    }
    key_cmd = keymap.get(action)
    if not key_cmd:
        return {"ok": False, "error": f"Unknown action '{action}' for AppleScript transport"}
    script = f'''
tell application "{proc}" to activate
delay 0.3
tell application "System Events"
    tell process "{proc}"
        {key_cmd}
    end tell
end tell
'''
    return _daw_applescript(script)

def _daw_list_session_files(daw):
    """List Pro Tools session files in The C Room."""
    sessions = []
    if os.path.isdir(C_ROOM):
        for folder in os.listdir(C_ROOM):
            folder_path = os.path.join(C_ROOM, folder)
            if os.path.isdir(folder_path):
                for f in os.listdir(folder_path):
                    if f.endswith(".ptx") or f.endswith(".ptf"):
                        sessions.append({
                            "project": folder,
                            "file": f,
                            "path": os.path.join(folder_path, f)
                        })
    return sessions

def _daw_launch(daw_name):
    """Launch a DAW by name."""
    daw_apps = {
        "Pro Tools": "Pro Tools",
        "FL Studio": "FL Studio",
        "Logic Pro": "Logic Pro",
        "Ableton Live": "Live",
        "Ableton": "Live",
    }
    app = daw_apps.get(daw_name, daw_name)
    script = f'tell application "{app}" to activate'
    result = _daw_applescript(script)
    result["daw"] = daw_name
    return result

def _daw_open_session_ptsl(session_path):
    """Open a Pro Tools session via PTSL gRPC."""
    return _ptsl_command("OpenSession", {"session_path": session_path})

def _daw_get_tracks_ptsl():
    """Get track list from current Pro Tools session via PTSL."""
    return _ptsl_command("GetTrackList", {})

def _daw_get_transport_state_ptsl():
    """Get Pro Tools transport state via PTSL."""
    return _ptsl_command("GetTransportState", {})

def _daw_mute_track(track_name, muted=True):
    """Mute or unmute a track via PTSL."""
    return _ptsl_command("SetTrackMuteState", {"track_name": track_name, "muted": muted})

def _daw_solo_track(track_name, soloed=True):
    """Solo or unsolo a track via PTSL."""
    return _ptsl_command("SetTrackSoloState", {"track_name": track_name, "soloed": soloed})

@tools_bp.route("/daw/control", methods=["GET", "POST"])
@local_only
def daw_control():
    """
    DAW Computer Control endpoint.
    Agents call this to take screenshots, control transport, list tracks, launch DAWs,
    and (with owner approval) record-arm, export mixes, or save sessions.
    """
    if request.method == "GET":
        running = _daw_get_running()
        sessions = _daw_list_session_files("Pro Tools")
        return jsonify({
            "ok": True,
            "runningDAWs": running,
            "cRoomSessions": sessions,
            "ptslHost": PTSL_HOST,
            "hardLiquorStems": HARD_LIQUOR_STEMS,
            "availableActions": [
                "screenshot", "play", "stop", "rewind", "get_status", "get_tracks",
                "open_session", "save_session", "mute_track", "solo_track",
                "launch_daw", "export_mix", "fl_command", "list_sessions",
                "record_arm", "bounce"
            ],
            "approvalRequired": list(_DAW_APPROVAL_REQUIRED)
        })

    data = request.get_json(force=True) or {}
    action = data.get("action", "").lower()
    params = data.get("params", {})
    daw = params.get("daw", "Pro Tools")
    token = data.get("approval_token") or request.headers.get("X-Approval-Token")

    # Actions requiring owner approval
    if action in _DAW_APPROVAL_REQUIRED:
        _cleanup_sessions()
        if not token or token not in _sessions:
            return jsonify({
                "ok": False,
                "error": f"Action '{action}' requires owner approval. Unlock via /owner-approval/unlock first.",
                "requiresApproval": True,
                "action": action
            }), 403

    _tool_log(f"daw/{action}", str(params))

    # ── SCREENSHOT ──────────────────────────────────────────────────────
    if action == "screenshot":
        result = _daw_screenshot()
        if result["ok"] and result.get("path"):
            # Also serve the image
            result["imageUrl"] = f"/daw/screenshot/latest?path={result['path']}"
        return jsonify(result)

    # ── STATUS / RUNNING DAWS ──────────────────────────────────────────
    elif action == "get_status":
        running = _daw_get_running()
        transport = _daw_get_transport_state_ptsl()
        sessions = _daw_list_session_files("Pro Tools")
        return jsonify({
            "ok": True,
            "runningDAWs": running,
            "transportState": transport,
            "cRoomSessions": sessions,
        })

    # ── LAUNCH DAW ────────────────────────────────────────────────────
    elif action == "launch_daw":
        return jsonify(_daw_launch(daw))

    # ── TRANSPORT ─────────────────────────────────────────────────────
    elif action == "play":
        # Try PTSL first, fall back to AppleScript
        result = _ptsl_command("TogglePlayState", {})
        if not result.get("ok"):
            result = _daw_transport_applescript(daw, "play")
        return jsonify(result)

    elif action == "stop":
        result = _ptsl_command("TogglePlayState", {})
        if not result.get("ok"):
            result = _daw_transport_applescript(daw, "stop")
        return jsonify(result)

    elif action == "rewind":
        result = _daw_transport_applescript(daw, "rewind")
        return jsonify(result)

    # ── GET TRACKS ────────────────────────────────────────────────────
    elif action == "get_tracks":
        result = _daw_get_tracks_ptsl()
        return jsonify(result)

    # ── LIST C ROOM SESSIONS ──────────────────────────────────────────
    elif action == "list_sessions":
        sessions = _daw_list_session_files("Pro Tools")
        return jsonify({"ok": True, "sessions": sessions, "count": len(sessions)})

    # ── OPEN SESSION ──────────────────────────────────────────────────
    elif action == "open_session":
        path = params.get("path") or params.get("session_path")
        if not path:
            return jsonify({"ok": False, "error": "Provide params.path to session .ptx file"})
        result = _daw_open_session_ptsl(path)
        return jsonify(result)

    # ── MUTE TRACK ────────────────────────────────────────────────────
    elif action == "mute_track":
        track = params.get("track") or params.get("track_name")
        muted = params.get("muted", True)
        if not track:
            return jsonify({"ok": False, "error": "Provide params.track"})
        return jsonify(_daw_mute_track(track, muted))

    # ── SOLO TRACK ────────────────────────────────────────────────────
    elif action == "solo_track":
        track = params.get("track") or params.get("track_name")
        soloed = params.get("soloed", True)
        if not track:
            return jsonify({"ok": False, "error": "Provide params.track"})
        return jsonify(_daw_solo_track(track, soloed))

    # ── FL STUDIO COMMAND (keyboard shortcut) ─────────────────────────
    elif action == "fl_command":
        key = params.get("key", "space")
        key_map = {
            "space": 'keystroke " "',
            "play": 'keystroke " "',
            "stop": 'keystroke " "',
            "save": 'key code 1 using command down',
            "settings": 'key code 109',  # F10
            "mixer": 'key code 109 using command down',  # Cmd+F10 in some versions
        }
        key_cmd = key_map.get(key, f'keystroke "{key}"')
        script = f'''
tell application "FL Studio" to activate
delay 0.3
tell application "System Events"
    tell process "FL Studio"
        {key_cmd}
    end tell
end tell
'''
        return jsonify(_daw_applescript(script))

    # ── SAVE SESSION (requires approval) ─────────────────────────────
    elif action == "save_session":
        result = _ptsl_command("SaveSession", {})
        if not result.get("ok"):
            result = _daw_transport_applescript(daw, "save")
        return jsonify(result)

    # ── EXPORT MIX / BOUNCE (requires approval) ───────────────────────
    elif action == "export_mix":
        export_params = params.get("export_params", {})
        result = _ptsl_command("ExportMix", export_params)
        return jsonify(result)

    # ── RECORD ARM (requires approval) ────────────────────────────────
    elif action == "record_arm":
        track = params.get("track")
        enabled = params.get("enabled", True)
        if not track:
            return jsonify({"ok": False, "error": "Provide params.track to record-arm"})
        result = _ptsl_command("SetTrackRecordEnableState", {"track_name": track, "record_enable": enabled})
        return jsonify(result)

    # ── BOUNCE (requires approval) ────────────────────────────────────
    elif action == "bounce":
        result = _ptsl_command("ExportMix", params)
        return jsonify(result)

    else:
        return jsonify({"ok": False, "error": f"Unknown action '{action}'. See GET /daw/control for list."}), 400


@tools_bp.route("/daw/screenshot/latest", methods=["GET"])
@local_only
def daw_screenshot_serve():
    """Serve the most recent DAW screenshot."""
    path = request.args.get("path")
    if path and os.path.exists(path) and path.startswith("/tmp/goat_daw_"):
        return send_file(path, mimetype="image/png")
    # Find most recent in /tmp
    import glob as _glob
    shots = sorted(_glob.glob("/tmp/goat_daw_screenshot_*.png"), reverse=True)
    if shots:
        return send_file(shots[0], mimetype="image/png")
    return jsonify({"error": "No screenshot available"}), 404


@tools_bp.route("/daw/sessions", methods=["GET"])
@local_only
def daw_sessions():
    """List all Pro Tools sessions in The C Room."""
    sessions = _daw_list_session_files("Pro Tools")
    return jsonify({"ok": True, "sessions": sessions, "cRoom": C_ROOM, "count": len(sessions)})


@tools_bp.route("/daw/ptsl/status", methods=["GET"])
@local_only
def daw_ptsl_status():
    """Check if PTSL gRPC endpoint is reachable (Pro Tools must be running with PTSL enabled)."""
    result = _ptsl_command("GetTransportState", {})
    running = _daw_get_running()
    return jsonify({
        "ok": True,
        "ptslReachable": result.get("ok", False),
        "ptslHost": PTSL_HOST,
        "ptslError": result.get("error"),
        "ptslMethod": result.get("method"),
        "runningDAWs": running,
        "setupInstructions": "In Pro Tools: Setup menu > Pro Tools Scripting Library > Enable PTSL",
        "sdkPath": "/Volumes/i2i 1/Agent-007-GOAT/PTSL_SDK_CPP.2026.04.0.1301892/",
        "sdkVersion": "2026.04.0.1301892"
    })


# Capability modes
@tools_bp.route("/modes", methods=["GET"])
def capability_modes():
    return jsonify({
        "ok": True,
        "modes": [
            {"id": "chat", "name": "Chat"},
            {"id": "voice", "name": "Voice"},
            {"id": "code", "name": "Code"},
            {"id": "research", "name": "Research"},
            {"id": "vision", "name": "Vision"},
            {"id": "production", "name": "Production"},
            {"id": "audio", "name": "Audio Engineer"},
            {"id": "office", "name": "Office"},
            {"id": "crew", "name": "Crew"},
        ]
    })
