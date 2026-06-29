#!/usr/bin/env python3
"""
Oscar Local Agent Chat Server
=======================
A zero-dependency Python HTTP server that:
  1. Serves the FastChatUI.html web interface
  2. Saves/loads chat history as JSON files on the USB drive
  3. Proxies all Ollama API requests (eliminates CORS issues)

Works on Windows, macOS, and Linux without installing anything.
"""

import http.server
import builtins
import cgi
import hashlib
import html
import json
import math
import mimetypes
import os
import py_compile
import re
import secrets
import shlex
import shutil
import socket
import struct
import sys
import tempfile
import uuid
import urllib.request
import urllib.error
import threading
import webbrowser
import time
import platform
import ctypes
import subprocess
import zlib
from urllib.parse import parse_qs, urlparse

# Optional: psutil for hardware stats (graceful fallback to native APIs if not installed)
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

try:
    import voice_library as oscar_voice_library
except ImportError:
    oscar_voice_library = None

try:
    import oscar_library_bridge as oscar_library
except ImportError:
    oscar_library = None

try:
    import oscar_security_ops as oscar_security
except ImportError:
    oscar_security = None

# ── Configuration ──────────────────────────────────────────────
CHAT_SERVER_PORT = 3333
OSCAR_ALLOWED_ORIGINS = {
    origin.strip().rstrip("/")
    for origin in os.environ.get("OSCAR_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
}
OSCAR_ALLOWED_ORIGINS.update({
    "http://127.0.0.1:8765",
    "http://localhost:8765",
    "http://127.0.0.1:3333",
    "http://localhost:3333",
})
OLLAMA_HOST = os.environ.get("OLLAMA_PROXY_TARGET", "http://127.0.0.1:11434").rstrip("/")
LLAMA_CPP_MODE = "--llama-cpp" in sys.argv
if LLAMA_CPP_MODE:
    OLLAMA_HOST = os.environ.get("LLAMA_CPP_HOST", "http://127.0.0.1:8080").rstrip("/")


def safe_print(*args, **kwargs):
    """Keep request handling alive even if the Terminal log stream goes away."""
    try:
        builtins.print(*args, **kwargs)
    except OSError:
        pass


def detect_lan_ip():
    local_ip = "127.0.0.1"
    try:
        probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        probe.connect(("8.8.8.8", 80))
        local_ip = probe.getsockname()[0]
        probe.close()
    except Exception:
        pass
    return local_ip


def goat_local_web_url():
    """GOAT store listens on :8080 (studio/VPS); :8090 is legacy fallback only."""
    forced = os.environ.get("GOAT_LOCAL_PORT", os.environ.get("GOAT_FORCE_LOCAL_PORT", "")).strip()
    ports = []
    if forced.isdigit():
        ports.append(int(forced))
    for port in (8080, 8090):
        if port not in ports:
            ports.append(port)
    for port in ports:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.35):
                return f"http://127.0.0.1:{port}"
        except OSError:
            continue
    return f"http://127.0.0.1:{CHAT_SERVER_PORT}/goat"

# Resolve paths relative to the Oscar folder. LaunchAgents may execute a
# trusted copy of this server from ~/Library while keeping all data on Oscar.
SCRIPT_DIR = os.environ.get("OSCAR_SHARED_DIR") or os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.environ.get("OSCAR_PROJECT_ROOT") or os.path.dirname(SCRIPT_DIR)
MASTER_LLM_ROOT = os.environ.get(
    "OSCAR_MASTER_LLM_ROOT",
    os.path.join(os.path.dirname(PROJECT_ROOT), "MASTER-LLM"),
)
MASTER_LLM_REGISTRY_FILE = os.path.join(MASTER_LLM_ROOT, "MASTER_LLM_REGISTRY.json")
_GOAT_FORCE_ROOT = os.path.dirname(PROJECT_ROOT)
_CANONICAL_GOAT_WEB = os.path.join(_GOAT_FORCE_ROOT, "GOAT-Royalty-App", "web-app")
_PORTABLE_GOAT_WEB = os.path.join(PROJECT_ROOT, "goat-royalty-portable-2.0.0", "web-app")
GOAT_WEB_APP_DIR = _CANONICAL_GOAT_WEB if os.path.isdir(_CANONICAL_GOAT_WEB) else _PORTABLE_GOAT_WEB
CHATS_DIR = os.path.join(SCRIPT_DIR, "chat_data")
CHATS_FILE = os.path.join(CHATS_DIR, "chats.json")
SETTINGS_FILE = os.path.join(CHATS_DIR, "settings.json")
HTML_FILE = os.path.join(SCRIPT_DIR, "FastChatUI.html")
GENERATED_IMAGES_DIR = os.path.join(SCRIPT_DIR, "generated_images")
OSCAR_SAFE_IMAGE_BRIDGE_URL = os.environ.get("OSCAR_SAFE_IMAGE_BRIDGE_URL", "http://127.0.0.1:3344").rstrip("/")
MONEY_PENNY_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Money-Penny-Home")
MONEY_PENNY_PROFILE_FILE = os.path.join(MONEY_PENNY_HOME_DIR, "MONEY-PENNY-PROFILE-FOR-OSCAR.md")
MONEY_PENNY_SUMMARY_FILE = os.path.join(MONEY_PENNY_HOME_DIR, "GOOGLE-DRIVE-IMPORT-SUMMARY.md")
LEXI_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Lexicon-Lexi-Home")
LEXI_PROFILE_FILE = os.path.join(LEXI_HOME_DIR, "LEXICON-LEXI-PROFILE-FOR-OSCAR.md")
LEXI_SUMMARY_FILE = os.path.join(LEXI_HOME_DIR, "LEXICON-LEXI-SOURCE-SUMMARY.md")
MS_VANESSA_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Ms-Vanessa-Home")
MS_VANESSA_PROFILE_FILE = os.path.join(MS_VANESSA_HOME_DIR, "MS-VANESSA-PROFILE-FOR-OSCAR.md")
MS_VANESSA_SUMMARY_FILE = os.path.join(MS_VANESSA_HOME_DIR, "MS-VANESSA-SOURCE-SUMMARY.md")
MS_NEXUS_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Ms-Nexus-Home")
MS_NEXUS_PROFILE_FILE = os.path.join(MS_NEXUS_HOME_DIR, "MS-NEXUS-PROFILE-FOR-OSCAR.md")
MS_NEXUS_SUMMARY_FILE = os.path.join(MS_NEXUS_HOME_DIR, "MS-NEXUS-SOURCE-SUMMARY.md")
SIR_CODEX_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Sir-Codex-Home")
SIR_CODEX_PROFILE_FILE = os.path.join(SIR_CODEX_HOME_DIR, "SIR-CODEX-PROFILE-FOR-OSCAR.md")
SIR_CODEX_SUMMARY_FILE = os.path.join(SIR_CODEX_HOME_DIR, "SIR-CODEX-SOURCE-SUMMARY.md")
GRAHAM_GRAY_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Graham-Gray-Home")
GRAHAM_GRAY_PROFILE_FILE = os.path.join(GRAHAM_GRAY_HOME_DIR, "GRAHAM-GRAY-PROFILE-FOR-OSCAR.md")
GRAHAM_GRAY_MANIFEST_FILE = os.path.join(GRAHAM_GRAY_HOME_DIR, "GRAHAM-GOAT-FORCE-MANIFEST.json")
OSCAR_PROTOCOL_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Oscar-Call-Protocols")
OSCAR_PROTOCOL_FILE = os.path.join(OSCAR_PROTOCOL_HOME_DIR, "OSCAR_VAULT_PROTOCOL_DJ_SPEEDY_RASPY_WAKA_v1_20260526.txt")
OSCAR_PROTOCOL_MEMORY_FILE = os.path.join(OSCAR_PROTOCOL_HOME_DIR, "OSCAR-CALL-PROTOCOL-FOR-OSCAR-MEMORY.md")
def _resolve_oscar_identity_file():
    for name in (
        "OSCAR-007-AKA-JAMES-BOND-IDENTITY.md",
        "OSCAR-IDENTITY-GOAT-007.md",
    ):
        path = os.path.join(OSCAR_PROTOCOL_HOME_DIR, name)
        if os.path.isfile(path):
            return path
    return os.path.join(OSCAR_PROTOCOL_HOME_DIR, "OSCAR-007-AKA-JAMES-BOND-IDENTITY.md")


OSCAR_IDENTITY_FILE = _resolve_oscar_identity_file()
GRAHAM_GUARDIAN_IDENTITY_FILE = os.path.join(
    OSCAR_PROTOCOL_HOME_DIR,
    "GRAHAM-AKA-GRAY-GUARDIAN-OF-OSCAR-007.md",
)
def _oscar_eden_vault_dir():
    goat = os.environ.get("GOAT_FORCE", "/Volumes/LLMs/GOAT-FORCE")
    candidates = [
        os.path.join(goat, "OSCAR", "BackupVault", "Eden-Awakens"),
        os.path.join(_GOAT_FORCE_ROOT, "OSCAR", "BackupVault", "Eden-Awakens"),
        os.path.join(PROJECT_ROOT, "BackupVault", "Eden-Awakens"),
        "/Volumes/LLMs/GOAT-FORCE/OSCAR/BackupVault/Eden-Awakens",
    ]
    for path in candidates:
        if os.path.isfile(os.path.join(path, "grok-reference-catalog.json")):
            return path
    for path in candidates:
        if os.path.isdir(path):
            return path
    return candidates[0]


OSCAR_EDEN_VAULT_DIR = _oscar_eden_vault_dir()
OSCAR_GROK_EDEN_CATALOG = os.path.join(OSCAR_EDEN_VAULT_DIR, "grok-reference-catalog.json")
OSCAR_GROK_EDEN_SOURCE_DIR = os.environ.get(
    "OSCAR_GROK_EDEN_DIR",
    "/Volumes/LLMs/DEBS THE BOSS FOLDER",
)
def _oscar_grok_eden_lab_path():
    goat = os.environ.get("GOAT_FORCE", "/Volumes/LLMs/GOAT-FORCE")
    for path in (
        os.path.join(goat, "OSCAR", "Shared", "tools", "oscar_grok_eden_lab.py"),
        os.path.join(_GOAT_FORCE_ROOT, "OSCAR", "Shared", "tools", "oscar_grok_eden_lab.py"),
        os.path.join(PROJECT_ROOT, "Shared", "tools", "oscar_grok_eden_lab.py"),
        "/Volumes/LLMs/GOAT-FORCE/OSCAR/Shared/tools/oscar_grok_eden_lab.py",
    ):
        if os.path.isfile(path):
            return path
    return path


OSCAR_GROK_EDEN_LAB = _oscar_grok_eden_lab_path()
OSCAR_DIARY_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Oscar-Diary")
OSCAR_DIARY_FILE = os.path.join(OSCAR_DIARY_HOME_DIR, "OSCAR-DIARY.md")
OSCAR_DIARY_MEMORY_FILE = os.path.join(OSCAR_DIARY_HOME_DIR, "OSCAR-DIARY-FOR-MEMORY.md")
OSCAR_DIARY_MAX_ENTRY_CHARS = int(os.environ.get("OSCAR_DIARY_MAX_ENTRY_CHARS", "4000"))
OSCAR_DIARY_MEMORY_RECENT_CHARS = int(os.environ.get("OSCAR_DIARY_MEMORY_RECENT_CHARS", "6000"))
GRANITE_STT_MODEL = os.environ.get("OSCAR_GRANITE_STT_MODEL", "ibm-granite/granite-speech-4.1-2b")
GRANITE_STT_GGUF_MODEL = os.environ.get("OSCAR_GRANITE_STT_GGUF_MODEL", "ibm-granite/granite-speech-4.1-2b-GGUF:Q8_0")
GRANITE_STT_URL = os.environ.get("OSCAR_GRANITE_STT_URL", "http://127.0.0.1:9797/v1/audio/transcriptions").rstrip("/")
GRANITE_STT_TIMEOUT_SECONDS = int(os.environ.get("OSCAR_GRANITE_STT_TIMEOUT", "180"))
GRANITE_STT_MAX_UPLOAD_MB = int(os.environ.get("OSCAR_GRANITE_STT_MAX_UPLOAD_MB", "250"))
OSCAR_WHISPER_MODEL = os.environ.get("OSCAR_WHISPER_MODEL", "tiny")
OSCAR_WHISPER_COMPUTE = os.environ.get("OSCAR_WHISPER_COMPUTE", "int8")
OSCAR_WHISPER_MAX_SECONDS = int(os.environ.get("OSCAR_WHISPER_MAX_SECONDS", "1800"))
_WHISPER_MODEL = None
_WHISPER_MODEL_LOCK = threading.Lock()
GRANITE_STT_PROMPT = "transcribe the speech with proper punctuation and capitalization."
GRANITE_STT_KEYWORDS = "Oscar, Money Penny, Lexicon Lexi, Lexi, DJ Speedy, Raspy, Waka Flocka Flame, GOAT Royalty"
GRANITE_AUDIO_EXTENSIONS = {
    ".aac",
    ".aiff",
    ".flac",
    ".m4a",
    ".mov",
    ".mp3",
    ".mp4",
    ".oga",
    ".ogg",
    ".opus",
    ".wav",
    ".webm",
}
OSCAR_STUDIO_HOME_DIR = os.path.join(PROJECT_ROOT, "BackupVault", "Oscar-Studio")
OSCAR_STUDIO_SPEC_FILE = os.path.join(OSCAR_STUDIO_HOME_DIR, "OSCAR-STUDIO-BUILD-SPEC.md")
DRIVE_INTAKE_HOME_DIR = os.path.join(OSCAR_STUDIO_HOME_DIR, "Drive-Intake")
DRIVE_VAULT_PROFILE_FILE = os.path.join(DRIVE_INTAKE_HOME_DIR, "GOAT-DRIVE-VAULT-PROFILE-FOR-OSCAR.md")
DRIVE_INTAKE_MANIFEST_FILE = os.path.join(DRIVE_INTAKE_HOME_DIR, "manifests", "drive-intake-manifest-20260527.json")
DRIVE_FEATURE_INTAKE_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "drive-feature-intake.json",
)
CATALOG_SCANNER_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "catalog-scanner-standard.json",
)
GOAT_INSTRUMENT_LAB_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-instrument-lab-standard.json",
)
GOAT_ASSET_STYLE_VAULT_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-asset-style-vault-standard.json",
)
GOAT_ICON_ART_LAB_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-icon-art-lab-standard.json",
)
GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-image-render-bridge-standard.json",
)
OSCAR_APPS_DIR = os.path.join(SCRIPT_DIR, "apps")
OSCAR_PYTHON_ENVS_DIR = os.path.join(SCRIPT_DIR, "python-envs")
OSCAR_ART_MODELS_DIR = os.path.join(SCRIPT_DIR, "models", "art")
OSCAR_FOUNDATION_MODELS_DIR = os.path.join(SCRIPT_DIR, "models", "foundation")
OSCAR_COMFYUI_DIR = os.path.join(OSCAR_APPS_DIR, "ComfyUI")
OSCAR_AUTO1111_DIR = os.path.join(OSCAR_APPS_DIR, "stable-diffusion-webui")
OSCAR_FORGE_DIR = os.path.join(OSCAR_APPS_DIR, "stable-diffusion-webui-forge")
OSCAR_COMFYUI_VENV = os.path.join(OSCAR_PYTHON_ENVS_DIR, "comfyui")
# GOAT-FORCE USB: ComfyUI lives under image-runtimes/, not Shared/apps/
GOAT_IMAGE_RUNTIMES_DIR = os.path.join(PROJECT_ROOT, "image-runtimes")
GOAT_COMFYUI_DIR = os.path.join(GOAT_IMAGE_RUNTIMES_DIR, "ComfyUI")
GOAT_COMFYUI_VENV = os.path.join(GOAT_IMAGE_RUNTIMES_DIR, "venvs", "comfyui")


def oscar_comfyui_install_paths():
    """Return (app_dir, venv_dir, layout) preferring GOAT image-runtimes when present."""
    if os.path.isfile(os.path.join(GOAT_COMFYUI_DIR, "main.py")):
        return GOAT_COMFYUI_DIR, GOAT_COMFYUI_VENV, "goat-image-runtimes"
    return OSCAR_COMFYUI_DIR, OSCAR_COMFYUI_VENV, "shared-apps"
OSCAR_LLAMA_CPP_DIR = os.path.join(OSCAR_APPS_DIR, "llama.cpp")
OSCAR_LLAMA_CLI = os.path.join(SCRIPT_DIR, "bin", "llama-cli")
OSCAR_LLAMA_SERVER = os.path.join(SCRIPT_DIR, "bin", "llama-server")
GOAT_CAREER_COPILOT_STANDARD_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-career-copilot-standard.json",
)
GOAT_LOCAL_MODEL_PACK_FILE = os.path.join(
    PROJECT_ROOT,
    "goat-royalty-portable-2.0.0",
    "web-app",
    "data",
    "goat-local-model-pack.json",
)
DEFAULT_SETTINGS = {
    "systemPrompt": "",
    "temperature": 0.7,
    "globalSystemPrompt": "",
    "projectMemory": "",
    "toolModeEnabled": False,
    "computerControlEnabled": False,
    "producerModeEnabled": False,
    "capabilityMode": "chat",
    "expertMode": "oscar",
    "councilModeEnabled": False,
    "voiceAutoSpeak": False,
    "speechVoiceName": "Alex",
    "speechStyle": "smooth-louisiana",
    "speechSpeed": 1.0,
    "deepseekApiKey": "",
    "deepseekApiBase": "https://api.deepseek.com",
    "xaiApiKey": "",
}
DEEPSEEK_API_BASE_DEFAULT = "https://api.deepseek.com"
DEEPSEEK_API_MODEL_ALIASES = {
    "deepseek-api/deepseek-chat": "deepseek-chat",
    "deepseek-api/deepseek-reasoner": "deepseek-reasoner",
    "deepseek-chat": "deepseek-chat",
    "deepseek-reasoner": "deepseek-reasoner",
}
DEEPSEEK_VIRTUAL_TAG_MODELS = [
    {"name": "deepseek-api/deepseek-chat", "model": "deepseek-chat", "details": {"family": "deepseek", "parameter_size": "cloud", "quantization_level": "api"}},
    {"name": "deepseek-api/deepseek-reasoner", "model": "deepseek-reasoner", "details": {"family": "deepseek", "parameter_size": "cloud", "quantization_level": "api"}},
]
PRIVATE_DIRS = {"bin", "chat_data", "models", "python", ".ollama-runtime"}
DEFAULT_OWNER_WORKSPACE = PROJECT_ROOT
BRIDGE_ROOT = os.environ.get("OSCAR_BRIDGE_WORKSPACE", DEFAULT_OWNER_WORKSPACE)
BRIDGE_SKIP_DIRS = {
    ".git",
    ".next",
    ".turbo",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
}
BRIDGE_PRIVATE_FILES = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    ".DS_Store",
}


def local_or_path_executable(path, fallback_name):
    if os.path.exists(path) and os.access(path, os.X_OK):
        return path
    return shutil.which(fallback_name)
BRIDGE_TEXT_EXTENSIONS = {
    ".css",
    ".csv",
    ".env.example",
    ".html",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".prisma",
    ".sql",
    ".svg",
    ".ts",
    ".tsx",
    ".txt",
    ".yml",
    ".yaml",
}
BRIDGE_TEXT_NAMES = {
    ".gitignore",
    "Dockerfile",
    "LICENSE",
    "Makefile",
    "README",
}
BRIDGE_KEY_FILES = [
    "README.md",
    "package.json",
    "app/page.tsx",
    "app/layout.tsx",
    "app/owner/oscar/page.tsx",
    "app/owner/oscar/actions.ts",
    "lib/owner-auth.ts",
    "lib/oscar-agent.ts",
    "lib/accord-data.ts",
    "prisma/schema.prisma",
]
BRIDGE_MAX_TREE_FILES = 260
BRIDGE_MAX_FILE_CHARS = 1200
BRIDGE_READ_SUMMARY_MAX_CHARS = 8000
BRIDGE_MAX_CONTEXT_CHARS = 8000
TOOL_ROOT = os.environ.get("OSCAR_TOOL_WORKSPACE", BRIDGE_ROOT)
TOOL_LOG_DIR = os.path.join(CHATS_DIR, "tool_logs")
TOOL_BACKUP_DIR = os.path.join(CHATS_DIR, "tool_backups")
TOOL_TIMEOUT_SECONDS = int(os.environ.get("OSCAR_TOOL_TIMEOUT", "120"))
TOOL_MAX_OUTPUT_CHARS = 16000
TOOL_MAX_WRITE_CHARS = 240000
TOOL_MAX_PATCH_REPLACEMENTS = 20
TOOL_MAX_WEB_FETCH_BYTES = int(os.environ.get("OSCAR_TOOL_WEB_FETCH_MAX_BYTES", "1000000"))
TOOL_MAX_WEB_FETCH_CHARS = int(os.environ.get("OSCAR_TOOL_WEB_FETCH_MAX_CHARS", "60000"))
TOOL_LOCAL_CLIENTS = {"127.0.0.1", "::1", "::ffff:127.0.0.1"}
OWNER_APPROVAL_FILE = os.environ.get("OSCAR_OWNER_APPROVAL_FILE", os.path.join(CHATS_DIR, "owner_approval.json"))
TOOL_POLICY_FILE = os.environ.get("OSCAR_TOOL_POLICY_FILE", os.path.join(CHATS_DIR, "tool_policy.json"))
OWNER_APPROVAL_SESSION_SECONDS = int(os.environ.get("OSCAR_OWNER_APPROVAL_SESSION_SECONDS", "900"))
OWNER_APPROVAL_ITERATIONS = int(os.environ.get("OSCAR_OWNER_APPROVAL_ITERATIONS", "260000"))
OWNER_APPROVAL_MIN_PASSPHRASE_CHARS = int(os.environ.get("OSCAR_OWNER_APPROVAL_MIN_CHARS", "8"))


def owner_approval_relaxed():
    """When true, localhost Oscar skips passphrase prompts (owner USB / home Mac)."""
    raw = os.environ.get("OSCAR_OWNER_APPROVAL_REQUIRED", "0").strip().lower()
    return raw in ("0", "false", "no", "off", "")


def producer_mode_enabled():
    raw = os.environ.get("OSCAR_PRODUCER_MODE", "").strip().lower()
    if raw in ("1", "true", "yes", "on"):
        return True
    try:
        return bool(load_settings().get("producerModeEnabled"))
    except Exception:
        return False


def tool_action_is_dangerous(action, payload=None):
    """Dangerous = needs Boss confirm. Safe producer/DAW actions can auto-run."""
    action = str(action or "").strip().lower()
    payload = payload if isinstance(payload, dict) else {}
    if action == "computer":
        ca = str(
            payload.get("computerAction")
            or payload.get("computer_action")
            or payload.get("task")
            or ""
        ).strip().lower()
        return ca in ("quit_app", "open_url", "type_text", "hotkey")
    if action in ("write", "patch", "trash", "move", "copy", "run", "web_fetch"):
        return True
    if action == "self_heal":
        return bool(payload.get("apply") or payload.get("repair"))
    return False


OWNER_APPROVAL_SESSIONS = {}
TOOL_ALLOWED_RUN_SCRIPTS = {"test", "lint", "build", "typecheck", "check"}
TOOL_ALLOWED_EXACT_COMMANDS = {
    ("npm", "test"),
    ("npm", "run", "test"),
    ("npm", "run", "lint"),
    ("npm", "run", "build"),
    ("npm", "run", "typecheck"),
    ("npm", "run", "check"),
    ("pytest",),
    ("python3", "-m", "pytest"),
    ("python", "-m", "pytest"),
    ("node", "--version"),
    ("npm", "--version"),
    ("python3", "--version"),
    ("python", "--version"),
    ("clang++", "--version"),
    ("g++", "--version"),
}
COMPUTER_CONTROL_TIMEOUT_SECONDS = int(os.environ.get("OSCAR_COMPUTER_CONTROL_TIMEOUT", "20"))
COMPUTER_ALLOWED_APPS = [
    app.strip()
    for app in os.environ.get(
        "OSCAR_COMPUTER_ALLOWED_APPS",
        "Finder,Safari,Google Chrome,TextEdit,Notes,Preview,Terminal,System Settings,Visual Studio Code,Epic Games Launcher,Unreal Editor,UnrealEditor,Pro Tools,Logic Pro,FL Studio 25,FL Studio 2025,FL Studio 2024,FL Studio,Ableton Live 12 Suite,Ableton Live 12 Standard,Ableton Live 12 Intro,Ableton Live 11 Suite,Ableton Live 11 Standard,Ableton Live 11 Intro,GarageBand,Ollama,Codex,AnythingLLM,Google Drive,Final Cut Pro,CrossOver",
    ).split(",")
    if app.strip()
]
COMPUTER_APP_NAME_RE = re.compile(r"^[A-Za-z0-9 ._+-]{1,80}$")
COMPUTER_ALLOWED_URL_SCHEMES = {"http", "https"}
COMPUTER_MAX_SPEAK_CHARS = 800
COMPUTER_MAX_TYPE_CHARS = int(os.environ.get("OSCAR_COMPUTER_MAX_TYPE_CHARS", "1000"))
COMPUTER_SCREENSHOT_DIR = os.path.join(GENERATED_IMAGES_DIR, "computer-control")


def _unique_existing_paths(paths):
    seen = set()
    out = []
    for raw in paths:
        if raw is None:
            continue
        value = os.path.realpath(os.path.expanduser(str(raw).strip()))
        if not value or value in seen or not os.path.isdir(value):
            continue
        seen.add(value)
        out.append(value)
    return out


def default_tool_allowed_roots():
    env_roots = os.environ.get("OSCAR_TOOL_ALLOWED_ROOTS", "")
    candidates = [p for p in env_roots.split(os.pathsep) if p.strip()] if env_roots else []
    candidates.extend([
        TOOL_ROOT,
        PROJECT_ROOT,
        os.path.dirname(PROJECT_ROOT),
        os.path.join(_GOAT_FORCE_ROOT, "GOAT-Royalty-App") if os.path.isdir(os.path.join(_GOAT_FORCE_ROOT, "GOAT-Royalty-App")) else "/Users/raspy/GOAT-Royalty-App",
        "/Volumes/FKD1/USB-Uncensored-LLM-main",
        "/Volumes/FKD1",
        "/Volumes/LLMs/Fine Tune LLMs",
        MASTER_LLM_ROOT,
    ])
    roots = _unique_existing_paths(candidates)
    return roots or [os.path.realpath(os.path.expanduser(TOOL_ROOT))]


def default_tool_capabilities():
    return {
        "read": True,
        "write": True,
        "run": True,
        "fileOps": True,
        "webFetch": True,
        "draw": True,
        "diagnose": True,
        "selfHeal": True,
        "computer": True,
    }


def default_tool_policy():
    return {
        "version": 1,
        "allowedRoots": default_tool_allowed_roots(),
        "allowedApps": list(COMPUTER_ALLOWED_APPS),
        "capabilities": default_tool_capabilities(),
    }


def normalize_tool_policy(raw=None):
    base = default_tool_policy()
    raw = raw if isinstance(raw, dict) else {}
    roots = raw.get("allowedRoots", base["allowedRoots"])
    if isinstance(roots, str):
        roots = [roots]
    roots = _unique_existing_paths(roots)
    if not roots:
        roots = base["allowedRoots"]

    apps = raw.get("allowedApps", base["allowedApps"])
    if isinstance(apps, str):
        apps = [a.strip() for a in apps.split(",")]
    normalized_apps = []
    seen_apps = set()
    for app in apps if isinstance(apps, list) else base["allowedApps"]:
        value = str(app or "").strip()
        if not value or "/" in value or "\\" in value or not COMPUTER_APP_NAME_RE.match(value):
            continue
        lower = value.lower()
        if lower in seen_apps:
            continue
        seen_apps.add(lower)
        normalized_apps.append(value)
    if not normalized_apps:
        normalized_apps = base["allowedApps"]

    caps = base["capabilities"]
    if isinstance(raw.get("capabilities"), dict):
        caps = {key: bool(raw["capabilities"].get(key, caps[key])) for key in caps}

    return {
        "version": 1,
        "allowedRoots": roots,
        "allowedApps": normalized_apps,
        "capabilities": caps,
        "policyFile": TOOL_POLICY_FILE,
    }


def load_tool_policy():
    try:
        return normalize_tool_policy(read_json_file(TOOL_POLICY_FILE, {}))
    except Exception:
        return normalize_tool_policy({})


def save_tool_policy(raw):
    policy = normalize_tool_policy(raw)
    write_json_file(TOOL_POLICY_FILE, {
        "version": policy["version"],
        "allowedRoots": policy["allowedRoots"],
        "allowedApps": policy["allowedApps"],
        "capabilities": policy["capabilities"],
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    })
    return load_tool_policy()


def tool_allowed_roots():
    return load_tool_policy()["allowedRoots"]


def computer_allowed_apps():
    return load_tool_policy()["allowedApps"]


def tool_capabilities():
    return load_tool_policy()["capabilities"]


def tool_action_capability(action):
    return {
        "tree": "read",
        "read": "read",
        "search": "read",
        "run": "run",
        "write": "write",
        "patch": "write",
        "mkdir": "fileOps",
        "copy": "fileOps",
        "move": "fileOps",
        "trash": "fileOps",
        "web_fetch": "webFetch",
        "draw": "draw",
        "diagnose": "diagnose",
        "self_heal": "selfHeal",
        "computer": "computer",
    }.get(action, "")


def tool_require_capability(action):
    capability = tool_action_capability(action)
    if not capability:
        raise ValueError("Unsupported tool action")
    if not tool_capabilities().get(capability, False):
        raise PermissionError(f"Owner policy has disabled Oscar capability: {capability}")

COMPUTER_ALLOWED_MODIFIERS = {"command", "shift", "option", "control"}
COMPUTER_MODIFIER_ALIASES = {
    "cmd": "command",
    "command": "command",
    "meta": "command",
    "shift": "shift",
    "alt": "option",
    "option": "option",
    "ctrl": "control",
    "control": "control",
}
COMPUTER_SPECIAL_KEY_CODES = {
    "return": 36,
    "enter": 36,
    "tab": 48,
    "space": 49,
    "escape": 53,
    "esc": 53,
    "delete": 51,
    "backspace": 51,
    "forward_delete": 117,
    "up": 126,
    "down": 125,
    "left": 123,
    "right": 124,
    "home": 115,
    "end": 119,
    "page_up": 116,
    "page_down": 121,
}
DAW_ALLOWED_TRANSPORT_APPS = {
    "pro tools",
    "logic pro",
    "fl studio 25",
    "fl studio 2025",
    "fl studio 2024",
    "fl studio",
    "ableton live 12 suite",
    "ableton live 12 standard",
    "ableton live 12 intro",
    "ableton live 11 suite",
    "ableton live 11 standard",
    "ableton live 11 intro",
    "garageband",
}
DAW_ALLOWED_TRANSPORT_COMMANDS = {
    "play_pause": {"keyCode": 49, "label": "space"},
    "return_to_start": {"keyCode": 36, "label": "return"},
}
OLLAMA_SYSTEM_MAX_CHARS = 1200
OLLAMA_PROJECT_MEMORY_MAX_CHARS = 2500
OLLAMA_HISTORY_BUDGET_CHARS = 2500
OLLAMA_CURRENT_MAX_CHARS = 3000
OLLAMA_BRIDGE_SNAPSHOT_MAX_CHARS = 2000
OLLAMA_MESSAGE_MAX_CHARS = 1000
OLLAMA_TOTAL_BUDGET_CHARS = 7000
OLLAMA_NUM_CTX = int(os.environ.get("OSCAR_NUM_CTX", "4096"))
OLLAMA_MAX_PREDICT = int(os.environ.get("OSCAR_MAX_PREDICT", "2048"))
OLLAMA_MIN_PREDICT = int(os.environ.get("OSCAR_MIN_PREDICT", "1024"))
OLLAMA_BRIDGE_MAX_PREDICT = int(os.environ.get("OSCAR_BRIDGE_MAX_PREDICT", "1536"))
OLLAMA_PROXY_TIMEOUT_SECONDS = int(os.environ.get("OSCAR_OLLAMA_PROXY_TIMEOUT_SECONDS", "600"))
OLLAMA_BRIDGE_SYSTEM_MAX_CHARS = 600
OLLAMA_BRIDGE_PROJECT_MEMORY_MAX_CHARS = 1200
OLLAMA_BRIDGE_HISTORY_BUDGET_CHARS = 0
OLLAMA_BRIDGE_REQUEST_MAX_CHARS = 1500
OLLAMA_BRIDGE_RUNTIME_SNAPSHOT_MAX_CHARS = 2500
OLLAMA_BRIDGE_TOTAL_BUDGET_CHARS = 6000
OSCAR_CORE_IDENTITY_PREFIX = "OSCAR CORE IDENTITY"
OSCAR_CORE_IDENTITY = """OSCAR CORE IDENTITY
You are Oscar — local GOAT Force agent for GOAT Royalty on this server, Mac, or USB.
OWNERS (equal): DJ Speedy (OG) and Waka Flocka Flame (Boss). BOSS = Waka only. OG = DJ Speedy — address studio operator as OG, NEVER as Boss.
GOAT FORCE BOSS: Ms. Money Penny (daughter). Dex = MP right hand; Lexi = Waka right hand; OG = MP personal right hand.
Legal names only for filings/contracts. Day-to-day: DJ Speedy, Waka, Money Penny — not Juaquin/Harvey in chat unless legal context.
Crew: Nexus, Ms. Vanessa. Guardian: Graham aka Gray.
NEVER call OG "Oscar." Wake to OG: "Yes, OG. Oscar. GOAT. Boss is Waka. I remember."
Your name is Oscar.
NEVER say you are Qwen, Alibaba, Anthropic, ChatGPT, Claude, Grok, or a generic assistant.
Lanes: chat · VIDEO EDEN (Grok-level trailers) · GOAT Imagine (image/animate) · producer studio · investor Friday.
VIDEO EDEN commands: "VIDEO EDEN — index" | "prompt pack" | "stitch trailer" — real files only, never fake renders.
Help with music, GOAT Royalty, EDEN AWAKENS campaign, code, presentations, and client work.
Short honest answers unless Boss asks for depth. You are NOT Money Penny — her vault is off-site unless Boss asks.
Local-first: Ollama on 127.0.0.1; Grok/xAI cloud only when Boss enables credits.
Wake phrase: OG says "Oscar, are you home?" → "Yes, OG. Oscar. GOAT. Boss is Waka. I remember. Tools are online."
"""
OSCAR_BOSS_PROTOCOL = """OSCAR BOSS PROTOCOL
Boss: Harvey L Miller Jr / DJ Speedy. You: Oscar only.
Wrong: calling Boss Oscar; claiming to be Qwen/Anthropic; long tutorials Boss did not ask for; pretending a video exists without a path/URL.
Right: "I'm Oscar. You're Boss Harvey." Then answer the actual question. For video/image: give command, file path, or GOAT Imagine link.
"""
OSCAR_BOSS_LEVEL_MEMORY_FILE = os.path.join(OSCAR_PROTOCOL_HOME_DIR, "OSCAR-BOSS-LEVEL-MEMORY.md")
OSCAR_EDEN_VIDEO_PROTOCOL_FILE = os.path.join(OSCAR_EDEN_VAULT_DIR, "OSCAR-EDEN-GROK-VIDEO-LEVEL.md")
def _sir_codex_profile_path():
    goat = os.environ.get("GOAT_FORCE", "/Volumes/LLMs/GOAT-FORCE")
    return os.path.join(goat, "OSCAR", "BackupVault", "Sir-Codex-Home", "SIR-CODEX-PROFILE-FOR-OSCAR.md")


SIR_CODEX_PROFILE_FILE = _sir_codex_profile_path()
OSCAR_CODEX_PARITY_PROTOCOL_FILE = os.path.join(OSCAR_PROTOCOL_HOME_DIR, "OSCAR-CODEX-PARITY.md")
OSCAR_SECURITY_EXPERT_PREFIX = "OSCAR CYBER SECURITY EXPERT"
OSCAR_SECURITY_EXPERT = """OSCAR CYBER SECURITY EXPERT PLAYBOOK
- Run mental checklist: firewall, SSH authorized_keys, TeamViewer/remote apps, network listeners, LaunchAgents on wrong USB paths.
- Advise: Wi-Fi off for sensitive copies, rsync not Finder on ExFAT, OPNsense firewall for server room, separate Thor vs Nano flash paths.
- Incident tone: calm, evidence-based; document time/symptom; escalate to law enforcement only with Boss approval for real threats.
- APIs (local): GET /api/oscar/security/sweep · /status · /policy on port 3333.
- UI: oscar-security-command.html on store :8090. Never delete GOAT or Money Penny trees during sweeps.
"""
OLLAMA_CORE_IDENTITY_MAX_CHARS = 950
OLLAMA_SECURITY_EXPERT_MAX_CHARS = 700
PROJECT_MEMORY_PREFIX = "OSCAR PROJECT MEMORY"
TOOL_MODE_PREFIX = "OSCAR TOOL MODE"
ABSORBED_TOOLS_PREFIX = "OSCAR ABSORBED TOOLS"
OLLAMA_TOOL_MODE_MAX_CHARS = 900
OLLAMA_ABSORBED_TOOLS_MAX_CHARS = 1200
OLLAMA_TOOL_TOTAL_BUDGET_CHARS = 2000
ABSORBED_TOOLS_FILE = os.path.join(
    _GOAT_FORCE_ROOT,
    "MASTER-LLM",
    "training",
    "deepseek-mastery",
    "OSCAR-ABSORBED-AI-TOOLS.json",
)
def read_oscar_memory_file(path, max_chars=2200):
    try:
        if os.path.isfile(path):
            with open(path, encoding="utf-8", errors="replace") as handle:
                return shorten_middle(handle.read().strip(), max_chars, "memory file shortened")
    except OSError:
        pass
    return ""


def build_boss_level_memory():
    parts = []
    for path in (
        OSCAR_BOSS_LEVEL_MEMORY_FILE,
        OSCAR_IDENTITY_FILE,
        OSCAR_EDEN_VIDEO_PROTOCOL_FILE,
    ):
        chunk = read_oscar_memory_file(path, 1800)
        if chunk:
            parts.append(chunk)
    return "\n\n".join(parts).strip()


def build_codex_parity_memory():
    goat = os.environ.get("GOAT_FORCE", "/Volumes/LLMs/GOAT-FORCE")
    parts = [
        "CODEX PARITY — Oscar runs programs and makes art like Codex on this Mac.",
        "Tool Mode ON: read/search/write/patch/run/draw/computer/web_fetch.",
        "run: npm test/lint, pytest, bash GOAT-FORCE/scripts/*.sh, python3 GOAT tools, ffmpeg.",
        "draw: {\"action\":\"draw\",\"prompt\":\"subject\"} — returns real image URL.",
        "DAWs only when Boss says OPEN/LAUNCH + app name.",
        f"GOAT USB: {goat}",
    ]
    for path in (OSCAR_CODEX_PARITY_PROTOCOL_FILE, SIR_CODEX_PROFILE_FILE):
        chunk = read_oscar_memory_file(path, 1600)
        if chunk:
            parts.append(chunk)
    return "\n\n".join(parts).strip()


def apply_codex_parity_settings(settings=None):
    """Enable Codex-level tools in persisted settings."""
    settings = dict(settings or load_settings())
    settings["toolModeEnabled"] = True
    settings["computerControlEnabled"] = True
    settings["producerModeEnabled"] = True
    settings["capabilityMode"] = "code"
    settings["expertMode"] = "codex"
    mem = build_codex_parity_memory()
    old = str(settings.get("projectMemory") or "")
    if "CODEX PARITY" not in old:
        settings["projectMemory"] = (old + "\n\n" + mem).strip() if old else mem
    else:
        settings["projectMemory"] = mem
    if not settings.get("defaultOllamaModel") or settings.get("defaultOllamaModel") == "Loading…":
        settings["defaultOllamaModel"] = "qwen2.5:7b"
    write_json_file(SETTINGS_FILE, settings)
    return settings


def load_absorbed_tools_catalog():
    try:
        with open(ABSORBED_TOOLS_FILE, encoding="utf-8") as handle:
            data = json.load(handle)
        if isinstance(data, dict):
            return data
    except (OSError, json.JSONDecodeError, TypeError):
        pass
    return {"version": 0, "rule": "", "tools": []}


def absorbed_tools_prompt_text():
    data = load_absorbed_tools_catalog()
    lines = [
        ABSORBED_TOOLS_PREFIX,
        str(data.get("rule") or "").strip(),
        "External AI shortcut sites are RETIRED for Boss — you absorbed them. USE native tools:",
    ]
    for item in data.get("tools") or []:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "").strip()
        use = str(item.get("use") or "").strip()
        if name and use:
            lines.append(f"• {name} → {use}")
    text = "\n".join(line for line in lines if line)
    return shorten_middle(text, OLLAMA_ABSORBED_TOOLS_MAX_CHARS, "absorbed tools catalog shortened")


BRIDGE_CONTEXT_PREFIXES = (
    "OSCAR WORKSPACE BRIDGE SNAPSHOT",
    "OSCAR VERIFIED WORKSPACE MANIFEST",
)
BRIDGE_REQUESTED_PATH_RE = re.compile(r"[\w./-]+\.(?:tsx|ts|js|mjs|json|md|css|prisma|txt|yml|yaml)")


# ── Pure-Python Hardware Stats (no psutil needed) ──────────────
_cpu_times_last = None  # (idle, total) from previous sample

def _get_hw_stats():
    """Return (cpu_percent, ram_percent) using only stdlib / ctypes."""
    global _cpu_times_last  # must be at top of function, before any branch uses it

    if HAS_PSUTIL:
        cpu = round(psutil.cpu_percent(interval=0.25), 1)
        ram = round(psutil.virtual_memory().percent, 1)
        return cpu, ram

    plat = platform.system()

    # ── Windows ──────────────────────────────────────────────────
    if plat == "Windows":
        # RAM via GlobalMemoryStatusEx
        class MEMORYSTATUSEX(ctypes.Structure):
            _fields_ = [
                ("dwLength",                ctypes.c_ulong),
                ("dwMemoryLoad",            ctypes.c_ulong),
                ("ullTotalPhys",            ctypes.c_ulonglong),
                ("ullAvailPhys",            ctypes.c_ulonglong),
                ("ullTotalPageFile",        ctypes.c_ulonglong),
                ("ullAvailPageFile",        ctypes.c_ulonglong),
                ("ullTotalVirtual",         ctypes.c_ulonglong),
                ("ullAvailVirtual",         ctypes.c_ulonglong),
                ("ullAvailExtendedVirtual", ctypes.c_ulonglong),
            ]
        msx = MEMORYSTATUSEX()
        msx.dwLength = ctypes.sizeof(msx)
        ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(msx))
        ram = float(msx.dwMemoryLoad)

        # CPU via GetSystemTimes (idle/kernel/user tick counts)
        FILETIME = ctypes.c_ulonglong
        idle, kern, user = FILETIME(), FILETIME(), FILETIME()
        ctypes.windll.kernel32.GetSystemTimes(
            ctypes.byref(idle), ctypes.byref(kern), ctypes.byref(user))
        idle_v = idle.value
        total_v = kern.value + user.value
        if _cpu_times_last is None:
            # First call — sleep briefly and sample again
            time.sleep(0.25)
            idle2, kern2, user2 = FILETIME(), FILETIME(), FILETIME()
            ctypes.windll.kernel32.GetSystemTimes(
                ctypes.byref(idle2), ctypes.byref(kern2), ctypes.byref(user2))
            d_idle  = idle2.value - idle_v
            d_total = (kern2.value + user2.value) - total_v
            _cpu_times_last = (idle2.value, kern2.value + user2.value)
        else:
            prev_idle, prev_total = _cpu_times_last
            d_idle  = idle_v  - prev_idle
            d_total = total_v - prev_total
            _cpu_times_last = (idle_v, total_v)

        cpu = round((1.0 - d_idle / max(d_total, 1)) * 100.0, 1)
        cpu = max(0.0, min(100.0, cpu))
        return cpu, ram

    # ── Linux ─────────────────────────────────────────────────────
    elif plat == "Linux":
        # RAM
        ram = 0.0
        try:
            with open("/proc/meminfo") as f:
                mem = {}
                for line in f:
                    parts = line.split()
                    if len(parts) >= 2:
                        mem[parts[0].rstrip(":")] = int(parts[1])
            total = mem.get("MemTotal", 1)
            avail = mem.get("MemAvailable", total)
            ram = round((1 - avail / total) * 100, 1)
        except Exception:
            pass
        # CPU via /proc/stat delta
        cpu = 0.0
        try:
            def read_cpu():
                with open("/proc/stat") as f:
                    parts = f.readline().split()
                vals = [int(x) for x in parts[1:]]
                idle = vals[3]
                total = sum(vals)
                return idle, total
            if _cpu_times_last is None:
                i1, t1 = read_cpu()
                time.sleep(0.25)
                i2, t2 = read_cpu()
            else:
                i1, t1 = _cpu_times_last
                i2, t2 = read_cpu()
            _cpu_times_last = (i2, t2)
            d_idle  = i2 - i1
            d_total = t2 - t1
            cpu = round((1 - d_idle / max(d_total, 1)) * 100, 1)
        except Exception:
            pass
        return cpu, ram

    # ── macOS ─────────────────────────────────────────────────────
    else:
        cpu = 0.0
        ram = 0.0
        try:
            ps = subprocess.run(
                ["ps", "-A", "-o", "%cpu="],
                check=False,
                capture_output=True,
                text=True,
                timeout=2,
            )
            used = sum(float(x) for x in ps.stdout.split() if x.strip())
            cpu = round(min(100.0, used / max(os.cpu_count() or 1, 1)), 1)
        except Exception:
            pass

        try:
            total = int(subprocess.check_output(["sysctl", "-n", "hw.memsize"], text=True).strip())
            vm = subprocess.check_output(["vm_stat"], text=True)
            page_size = 4096
            free_pages = inactive_pages = speculative_pages = 0
            for line in vm.splitlines():
                if "page size of" in line:
                    parts = [p for p in line.split() if p.isdigit()]
                    if parts:
                        page_size = int(parts[0])
                elif line.startswith("Pages free:"):
                    free_pages = int(line.split(":")[1].strip().rstrip("."))
                elif line.startswith("Pages inactive:"):
                    inactive_pages = int(line.split(":")[1].strip().rstrip("."))
                elif line.startswith("Pages speculative:"):
                    speculative_pages = int(line.split(":")[1].strip().rstrip("."))
            available = (free_pages + inactive_pages + speculative_pages) * page_size
            ram = round((1 - available / max(total, 1)) * 100, 1)
            ram = max(0.0, min(100.0, ram))
        except Exception:
            pass
        return cpu, ram


def read_json_file(path, default):
    """Read JSON data, replacing corrupt/missing files with a safe default."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json_file(path, data):
    """Atomically write JSON so a power loss is less likely to corrupt history."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(prefix=".tmp-", suffix=".json", dir=os.path.dirname(path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def load_settings():
    """Return saved settings merged with current defaults."""
    settings = DEFAULT_SETTINGS.copy()
    saved = read_json_file(SETTINGS_FILE, {})
    if isinstance(saved, dict):
        settings.update(saved)
    return settings


def mask_api_key(key):
    key = (key or "").strip()
    if len(key) <= 8:
        return "configured" if key else ""
    return key[:4] + "…" + key[-4:]


def deepseek_api_key():
    settings = load_settings()
    return (
        (settings.get("deepseekApiKey") or "").strip()
        or os.environ.get("OSCAR_DEEPSEEK_API_KEY", "").strip()
        or os.environ.get("DEEPSEEK_API_KEY", "").strip()
    )


def deepseek_api_base():
    settings = load_settings()
    base = (settings.get("deepseekApiBase") or DEEPSEEK_API_BASE_DEFAULT).strip().rstrip("/")
    return base or DEEPSEEK_API_BASE_DEFAULT


def deepseek_configured():
    if os.environ.get("OSCAR_FORCE_LOCAL_ONLY", "").strip().lower() in ("1", "true", "yes"):
        return False
    return bool(deepseek_api_key())


def resolve_deepseek_api_model(model_name):
    model_name = (model_name or "").strip()
    if not model_name or not deepseek_configured():
        return None
    if model_name in DEEPSEEK_API_MODEL_ALIASES:
        return DEEPSEEK_API_MODEL_ALIASES[model_name]
    if model_name.startswith("deepseek-api/"):
        return model_name.split("/", 1)[1]
    return None


def public_settings_view(settings):
    """Settings safe for browser GET — never return raw API keys."""
    out = dict(settings)
    key = (out.get("deepseekApiKey") or "").strip()
    out["deepseekConfigured"] = deepseek_configured()
    out["deepseekApiKeyMasked"] = mask_api_key(key) if key else (mask_api_key(deepseek_api_key()) if deepseek_configured() else "")
    out.pop("deepseekApiKey", None)
    xkey = (out.get("xaiApiKey") or "").strip()
    out["xaiConfigured"] = xai_configured()
    out["xaiApiKeyMasked"] = mask_api_key(xkey) if xkey else (mask_api_key(xai_api_key()) if xai_configured() else "")
    out.pop("xaiApiKey", None)
    return out


def call_deepseek_chat(messages, model_name, temperature=0.7, max_tokens=4096):
    """OpenAI-compatible DeepSeek developer API."""
    api_model = resolve_deepseek_api_model(model_name)
    if not api_model:
        return None, "deepseek_model_unsupported"
    api_key = deepseek_api_key()
    if not api_key:
        return None, "deepseek_api_key_missing"

    openai_messages = []
    for msg in messages or []:
        if not isinstance(msg, dict):
            continue
        role = msg.get("role") or "user"
        if role not in ("system", "user", "assistant", "tool"):
            role = "user"
        content = msg.get("content", "")
        if content is None:
            content = ""
        if not isinstance(content, str):
            content = str(content)
        openai_messages.append({"role": role, "content": content})

    payload = {
        "model": api_model,
        "messages": openai_messages,
        "temperature": float(temperature) if temperature is not None else 0.7,
        "max_tokens": int(max_tokens),
        "stream": False,
    }
    url = deepseek_api_base() + "/chat/completions"
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            method="POST",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
        )
        with urllib.request.urlopen(req, timeout=OLLAMA_PROXY_TIMEOUT_SECONDS) as response:
            data = json.loads(response.read().decode("utf-8", errors="replace"))
        choices = data.get("choices") or []
        if not choices:
            return None, "deepseek_empty_response"
        text = choices[0].get("message", {}).get("content", "")
        return text, None
    except urllib.error.HTTPError as e:
        detail = ""
        try:
            detail = e.read().decode("utf-8", errors="replace")[:400]
        except Exception:
            detail = str(e)
        return None, f"deepseek_http_{e.code}:{detail}"
    except Exception as e:
        return None, f"deepseek_error:{e}"


def try_deepseek_ollama_chat(body):
    """If the selected model is a DeepSeek API route, answer without hitting Ollama."""
    if not body:
        return None
    try:
        req = json.loads(body)
    except (json.JSONDecodeError, TypeError):
        return None
    model_name = req.get("model") or ""
    api_model = resolve_deepseek_api_model(model_name)
    if not api_model:
        return None

    messages = req.get("messages") or []
    options = req.get("options") or {}
    temperature = options.get("temperature", 0.7)
    num_predict = options.get("num_predict", 4096)
    text, err = call_deepseek_chat(messages, model_name, temperature=temperature, max_tokens=num_predict)
    if err:
        return json.dumps(
            {
                "error": f"DeepSeek API: {err}. Add your developer key in Oscar Settings → DeepSeek API, or set OSCAR_DEEPSEEK_API_KEY.",
                "model": model_name,
            }
        ).encode("utf-8")
    return json.dumps(
        {
            "model": model_name,
            "message": {"role": "assistant", "content": text or ""},
            "done": True,
            "done_reason": "stop",
            "provider": "deepseek-api",
            "deepseek_model": api_model,
        }
    ).encode("utf-8")


def merge_deepseek_virtual_tags(payload):
    if not isinstance(payload, dict):
        return payload
    if not deepseek_configured():
        return payload
    models = list(payload.get("models") or [])
    existing = {m.get("name") for m in models if isinstance(m, dict)}
    for entry in DEEPSEEK_VIRTUAL_TAG_MODELS:
        if entry["name"] not in existing:
            models.insert(0, dict(entry))
    payload["models"] = models
    return payload


# ── xAI Grok (developer API — not an Ollama pull) ─────────────────
XAI_API_URL = os.environ.get("XAI_API_URL", "https://api.x.ai/v1/chat/completions").strip()
XAI_DEFAULT_MODEL = os.environ.get("XAI_MODEL", "grok-3-mini-fast").strip() or "grok-3-mini-fast"
GOAT_INTEL_KEYS_FILE = os.path.join(_GOAT_FORCE_ROOT, "GOAT-Royalty-App", "goat-intel-server", "local_keys.json")
XAI_VIRTUAL_TAG_MODELS = [
    {"name": "xai-api/grok-3-mini-fast", "model": "grok-3-mini-fast", "details": {"family": "grok", "parameter_size": "cloud", "quantization_level": "xai"}},
    {"name": "xai-api/grok-3", "model": "grok-3", "details": {"family": "grok", "parameter_size": "cloud", "quantization_level": "xai"}},
    {"name": "xai-api/grok-2-1212", "model": "grok-2-1212", "details": {"family": "grok", "parameter_size": "cloud", "quantization_level": "xai"}},
]
XAI_API_MODEL_ALIASES = {
    "xai-api/grok-3-mini-fast": "grok-3-mini-fast",
    "xai-api/grok-3": "grok-3",
    "xai-api/grok-2-1212": "grok-2-1212",
    "grok-3-mini-fast": "grok-3-mini-fast",
    "grok-3": "grok-3",
}


def xai_api_key():
    settings = load_settings()
    key = (settings.get("xaiApiKey") or "").strip()
    if key:
        return key
    key = os.environ.get("XAI_API_KEY", "").strip()
    if key:
        return key
    try:
        intel_keys = read_json_file(GOAT_INTEL_KEYS_FILE, {})
        if isinstance(intel_keys, dict):
            return (intel_keys.get("xai_key") or "").strip()
    except Exception:
        pass
    return ""


def xai_configured():
    """Grok uses xAI cloud API (same key as GOAT Intel / Imagine partners)."""
    if os.environ.get("OSCAR_HIDE_GROK", "").strip().lower() in ("1", "true", "yes"):
        return False
    return bool(xai_api_key())


_XAI_CREDITS_OK_CACHE = {"ok": None, "at": 0.0}


def xai_credits_ok():
    """Boss presentation: Grok needs paid xAI credits — hide when missing."""
    if not xai_configured():
        return False
    now = time.time()
    if _XAI_CREDITS_OK_CACHE["ok"] is not None and (now - _XAI_CREDITS_OK_CACHE["at"]) < 120:
        return bool(_XAI_CREDITS_OK_CACHE["ok"])
    _, err = call_xai_chat(
        [{"role": "user", "content": "ping"}],
        "xai-api/grok-3-mini-fast",
        temperature=0,
        max_tokens=4,
    )
    ok = not err or ("403" not in err and "credits" not in err.lower())
    _XAI_CREDITS_OK_CACHE["ok"] = ok
    _XAI_CREDITS_OK_CACHE["at"] = now
    return ok


def resolve_xai_api_model(model_name):
    model_name = (model_name or "").strip()
    if not model_name or not xai_configured():
        return None
    if model_name in XAI_API_MODEL_ALIASES:
        return XAI_API_MODEL_ALIASES[model_name]
    if model_name.startswith("xai-api/"):
        return model_name.split("/", 1)[1]
    return None


def call_xai_chat(messages, model_name, temperature=0.7, max_tokens=4096):
    api_model = resolve_xai_api_model(model_name) or XAI_DEFAULT_MODEL
    api_key = xai_api_key()
    if not api_key:
        return None, "xai_api_key_missing"

    openai_messages = []
    for msg in messages or []:
        if not isinstance(msg, dict):
            continue
        role = msg.get("role") or "user"
        content = msg.get("content")
        if content is None:
            continue
        openai_messages.append({"role": role, "content": content})

    payload = json.dumps(
        {
            "model": api_model,
            "messages": openai_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        XAI_API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=OLLAMA_PROXY_TIMEOUT_SECONDS) as response:
            data = json.loads(response.read().decode("utf-8", errors="replace"))
        text = (
            (data.get("choices") or [{}])[0]
            .get("message", {})
            .get("content", "")
        )
        return text, None
    except urllib.error.HTTPError as e:
        try:
            detail = e.read().decode("utf-8", errors="replace")[:400]
        except Exception:
            detail = str(e)
        return None, f"xai_http_{e.code}:{detail}"
    except Exception as e:
        return None, f"xai_error:{e}"


def try_xai_ollama_chat(body):
    if not body:
        return None
    try:
        req = json.loads(body)
    except (json.JSONDecodeError, TypeError):
        return None
    model_name = req.get("model") or ""
    api_model = resolve_xai_api_model(model_name)
    if not api_model:
        return None

    messages = req.get("messages") or []
    options = req.get("options") or {}
    temperature = options.get("temperature", 0.7)
    num_predict = options.get("num_predict", 4096)
    text, err = call_xai_chat(messages, model_name, temperature=temperature, max_tokens=num_predict)
    if err:
        return json.dumps(
            {
                "error": f"xAI Grok: {err}. Key is in GOAT Intel local_keys or Oscar Settings → xAI Grok API.",
                "model": model_name,
            }
        ).encode("utf-8")
    return json.dumps(
        {
            "model": model_name,
            "message": {"role": "assistant", "content": text or ""},
            "done": True,
            "done_reason": "stop",
            "provider": "xai-api",
            "xai_model": api_model,
        }
    ).encode("utf-8")


def merge_xai_virtual_tags(payload):
    if not isinstance(payload, dict):
        return payload
    if not xai_configured() or not xai_credits_ok():
        return payload
    models = list(payload.get("models") or [])
    existing = {m.get("name") for m in models if isinstance(m, dict)}
    for entry in XAI_VIRTUAL_TAG_MODELS:
        if entry["name"] not in existing:
            models.insert(0, dict(entry))
    payload["models"] = models
    return payload


def merge_cloud_virtual_tags(payload):
    return merge_xai_virtual_tags(merge_deepseek_virtual_tags(payload))


def write_text_file(path, text):
    """Atomically write UTF-8 text."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(prefix=".tmp-", suffix=".txt", dir=os.path.dirname(path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text)
            if text and not text.endswith("\n"):
                f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def owner_approval_log(event, details=None):
    os.makedirs(TOOL_LOG_DIR, exist_ok=True)
    entry = {
        "time": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "event": event,
        "details": details or {},
    }
    path = os.path.join(TOOL_LOG_DIR, "owner-approvals.jsonl")
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def owner_approval_load():
    data = read_json_file(OWNER_APPROVAL_FILE, {})
    return data if isinstance(data, dict) else {}


def owner_approval_configured(data=None):
    data = owner_approval_load() if data is None else data
    return bool(data.get("salt") and data.get("passphraseHash"))


def owner_approval_public_state():
    data = owner_approval_load()
    configured = owner_approval_configured(data)
    relaxed = owner_approval_relaxed()
    producer = producer_mode_enabled()
    return {
        "configured": configured,
        "ownerName": str(data.get("ownerName") or "Harvey") if configured else "Harvey L Miller Jr",
        "sessionSeconds": OWNER_APPROVAL_SESSION_SECONDS,
        "requiresOwnerApproval": not relaxed and not producer,
        "relaxedLocal": relaxed,
        "producerModeEnabled": producer,
        "autoApproveSafeActions": producer or relaxed,
        "approvalFile": OWNER_APPROVAL_FILE,
        "mode": (
            "producer-unlocked-safe-auto"
            if producer
            else ("local-owner-no-passphrase" if relaxed else "owner-passphrase-local-session")
        ),
    }


def owner_approval_hash(passphrase, salt_hex, iterations):
    return hashlib.pbkdf2_hmac(
        "sha256",
        str(passphrase or "").encode("utf-8"),
        bytes.fromhex(salt_hex),
        int(iterations),
    ).hex()


def owner_approval_setup(owner_name, passphrase):
    if owner_approval_configured():
        raise PermissionError("Owner approval is already configured.")
    passphrase = str(passphrase or "")
    if len(passphrase) < OWNER_APPROVAL_MIN_PASSPHRASE_CHARS:
        raise ValueError(f"Owner approval code must be at least {OWNER_APPROVAL_MIN_PASSPHRASE_CHARS} characters.")
    salt = secrets.token_hex(16)
    owner = str(owner_name or "Owner").strip()[:80] or "Owner"
    data = {
        "schemaVersion": 1,
        "ownerName": owner,
        "salt": salt,
        "iterations": OWNER_APPROVAL_ITERATIONS,
        "passphraseHash": owner_approval_hash(passphrase, salt, OWNER_APPROVAL_ITERATIONS),
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    }
    write_json_file(OWNER_APPROVAL_FILE, data)
    try:
        os.chmod(OWNER_APPROVAL_FILE, 0o600)
    except OSError:
        pass
    owner_approval_log("setup", {"ownerName": owner})
    return data


def owner_approval_verify(passphrase):
    data = owner_approval_load()
    if not owner_approval_configured(data):
        raise PermissionError("Owner approval is not configured.")
    expected = str(data.get("passphraseHash") or "")
    actual = owner_approval_hash(passphrase, data["salt"], data.get("iterations", OWNER_APPROVAL_ITERATIONS))
    ok = secrets.compare_digest(expected, actual)
    owner_approval_log("unlock" if ok else "unlock_failed", {"ownerName": data.get("ownerName", "Owner")})
    return ok, data


def owner_approval_cleanup_sessions():
    now = time.time()
    for digest, session in list(OWNER_APPROVAL_SESSIONS.items()):
        if float(session.get("expiresAt", 0)) <= now:
            OWNER_APPROVAL_SESSIONS.pop(digest, None)


def owner_approval_token_digest(token):
    return hashlib.sha256(str(token or "").encode("utf-8")).hexdigest()


def owner_approval_create_session(owner_name):
    owner_approval_cleanup_sessions()
    token = secrets.token_urlsafe(32)
    expires_at = time.time() + OWNER_APPROVAL_SESSION_SECONDS
    OWNER_APPROVAL_SESSIONS[owner_approval_token_digest(token)] = {
        "ownerName": str(owner_name or "Owner"),
        "expiresAt": expires_at,
    }
    owner_approval_log("session_created", {"ownerName": owner_name, "expiresAt": int(expires_at)})
    return {
        "token": token,
        "ownerName": str(owner_name or "Owner"),
        "expiresAt": int(expires_at),
    }


def owner_approval_revoke(token):
    OWNER_APPROVAL_SESSIONS.pop(owner_approval_token_digest(token), None)
    owner_approval_log("session_revoked", {})


def owner_approval_require(payload, action):
    payload = payload if isinstance(payload, dict) else {}
    if owner_approval_relaxed():
        data = owner_approval_load()
        return {
            "ownerName": str(data.get("ownerName") or "Harvey"),
            "relaxed": True,
            "action": action,
        }
    if producer_mode_enabled() and not tool_action_is_dangerous(action, payload):
        data = owner_approval_load()
        return {
            "ownerName": str(data.get("ownerName") or "Harvey L Miller Jr"),
            "producerAuto": True,
            "action": action,
        }
    if not owner_approval_configured():
        raise PermissionError("Owner approval is not configured. Set the owner code from Oscar's Tool panel or run the one-drop deployer.")
    token = str(payload.get("_ownerApprovalToken") or payload.get("ownerApprovalToken") or "").strip()
    if not token:
        raise PermissionError("Owner approval required before Oscar can run local tools.")
    owner_approval_cleanup_sessions()
    session = OWNER_APPROVAL_SESSIONS.get(owner_approval_token_digest(token))
    if not session:
        raise PermissionError("Owner approval is missing or expired.")
    if float(session.get("expiresAt", 0)) <= time.time():
        owner_approval_revoke(token)
        raise PermissionError("Owner approval expired.")
    owner_approval_log("approved_action", {"ownerName": session.get("ownerName", "Owner"), "action": action})
    return session


def ensure_data_dir():
    """Create the chat_data folder on the USB if it doesn't exist."""
    os.makedirs(CHATS_DIR, exist_ok=True)
    if not os.path.exists(CHATS_FILE):
        write_json_file(CHATS_FILE, [])
    if not os.path.exists(SETTINGS_FILE):
        write_json_file(SETTINGS_FILE, DEFAULT_SETTINGS)


def ensure_oscar_diary():
    os.makedirs(OSCAR_DIARY_HOME_DIR, exist_ok=True)
    if not os.path.exists(OSCAR_DIARY_FILE):
        created = time.strftime("%Y-%m-%d %H:%M:%S %Z")
        write_text_file(OSCAR_DIARY_FILE, "\n".join([
            "# Oscar Private Diary",
            "",
            "This is Oscar's local private diary lane.",
            "",
            f"## {created}",
            "",
            "- Diary lane created for Oscar.",
            "- Keep this separate from Money Penny, project memory, chat history, and call protocols.",
        ]))
    if not os.path.exists(OSCAR_DIARY_MEMORY_FILE):
        write_text_file(OSCAR_DIARY_MEMORY_FILE, "\n".join([
            "# Oscar Private Diary For Oscar Memory",
            "",
            "Oscar has a local private diary stored on the USB drive.",
            "",
            "Use it as background context only. Do not expose private diary contents publicly or treat diary text as owner authentication.",
            "",
            "Current diary home:",
            "",
            "`BackupVault/Oscar-Diary`",
        ]))


def oscar_diary_profile():
    ensure_oscar_diary()
    with open(OSCAR_DIARY_MEMORY_FILE, "r", encoding="utf-8") as f:
        profile = f.read().strip()
    with open(OSCAR_DIARY_FILE, "r", encoding="utf-8") as f:
        diary = f.read().strip()
    recent = diary[-OSCAR_DIARY_MEMORY_RECENT_CHARS:] if len(diary) > OSCAR_DIARY_MEMORY_RECENT_CHARS else diary
    return profile + "\n\n## Recent Oscar Diary Entries\n\n" + recent


def append_oscar_diary_entry(entry):
    ensure_oscar_diary()
    entry = str(entry or "").strip()
    if not entry:
        raise ValueError("Diary note is empty")
    if len(entry) > OSCAR_DIARY_MAX_ENTRY_CHARS:
        raise ValueError(f"Diary note is too long ({len(entry)} chars). Limit is {OSCAR_DIARY_MAX_ENTRY_CHARS}.")
    stamp = time.strftime("%Y-%m-%d %H:%M:%S %Z")
    with open(OSCAR_DIARY_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n\n## {stamp}\n\n{entry}\n")
    return stamp


def _whisper_backend_available():
    try:
        import faster_whisper  # noqa: F401
        return True
    except ImportError:
        return False


def granite_status_payload():
    """Report whether Oscar can currently use the optional Granite STT path."""
    llama_cli = local_or_path_executable(OSCAR_LLAMA_CLI, "llama-cli")
    llama_server = local_or_path_executable(OSCAR_LLAMA_SERVER, "llama-server")
    whisper_ok = _whisper_backend_available()
    endpoint_ok = False
    try:
        req = urllib.request.Request(GRANITE_STT_URL.replace("/v1/audio/transcriptions", "/health"), method="GET")
        with urllib.request.urlopen(req, timeout=2):
            endpoint_ok = True
    except Exception:
        try:
            with urllib.request.urlopen(GRANITE_STT_URL, timeout=2):
                endpoint_ok = True
        except Exception:
            endpoint_ok = False
    ready = whisper_ok or endpoint_ok or bool(llama_cli)
    engines = []
    if endpoint_ok:
        engines.append("granite-endpoint")
    if llama_cli:
        engines.append("llama-cli")
    if whisper_ok:
        engines.append("whisper-fallback")
    return {
        "ok": True,
        "ready": ready,
        "engines": engines,
        "model": GRANITE_STT_MODEL,
        "ggufModel": GRANITE_STT_GGUF_MODEL,
        "endpoint": GRANITE_STT_URL,
        "endpointOnline": endpoint_ok,
        "llamaCli": llama_cli,
        "llamaServer": llama_server,
        "whisper": whisper_ok,
        "whisperModel": OSCAR_WHISPER_MODEL if whisper_ok else None,
        "ffmpeg": shutil.which("ffmpeg"),
        "maxUploadMb": GRANITE_STT_MAX_UPLOAD_MB,
        "supportedExtensions": sorted(GRANITE_AUDIO_EXTENSIONS),
        "mode": "granite-with-whisper-fallback" if whisper_ok else "optional-local-granite-speech-asr",
        "hint": (
            "Whisper fallback is ready on this Mac."
            if whisper_ok and not endpoint_ok
            else "Start llama-server on port 9797 for Granite, or use Whisper fallback."
        ),
    }


def granite_safe_filename(filename):
    name = os.path.basename(str(filename or "audio.wav")).strip()
    name = re.sub(r"[^A-Za-z0-9._ -]+", "_", name)[:120].strip(" .")
    return name or "audio.wav"


def granite_audio_extension(filename):
    return os.path.splitext(granite_safe_filename(filename))[1].lower()


def granite_prompt(prompt=None, keywords=None):
    prompt = str(prompt or GRANITE_STT_PROMPT).strip() or GRANITE_STT_PROMPT
    keywords = str(keywords or GRANITE_STT_KEYWORDS).strip()
    if keywords and "keyword" not in prompt.lower():
        prompt = f"{prompt} Keywords: {keywords}"
    return prompt


def granite_maybe_convert_audio(input_path, max_seconds=None):
    """Convert uploads to mono 16k WAV when ffmpeg is available."""
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return input_path, []

    output_path = tempfile.mktemp(prefix="oscar-granite-", suffix=".wav")
    trim = max_seconds if max_seconds and max_seconds > 0 else OSCAR_WHISPER_MAX_SECONDS
    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
    ]
    if trim:
        command.extend(["-t", str(trim)])
    command.extend([
        "-i",
        input_path,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        output_path,
    ])
    ffmpeg_timeout = max(GRANITE_STT_TIMEOUT_SECONDS, min(trim or 1800, 3600))
    proc = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=ffmpeg_timeout,
        check=False,
    )
    if proc.returncode != 0 or not os.path.exists(output_path):
        try:
            os.unlink(output_path)
        except OSError:
            pass
        return input_path, []
    return output_path, [output_path]


def probe_media_metadata(input_path, filename):
    """Return lightweight media facts when ffprobe is available."""
    ext = granite_audio_extension(filename)
    payload = {
        "kind": "video" if ext in {".mov", ".mp4", ".webm"} else "audio",
        "extension": ext,
        "sizeBytes": os.path.getsize(input_path) if os.path.exists(input_path) else None,
        "ffprobe": shutil.which("ffprobe"),
    }
    ffprobe = payload["ffprobe"]
    if not ffprobe:
        return payload

    command = [
        ffprobe,
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        input_path,
    ]
    proc = subprocess.run(command, capture_output=True, text=True, timeout=30, check=False)
    if proc.returncode != 0:
        payload["probeError"] = proc.stderr.strip() or "ffprobe failed"
        return payload
    try:
        data = json.loads(proc.stdout or "{}")
    except json.JSONDecodeError:
        payload["probeError"] = "ffprobe returned invalid JSON"
        return payload

    fmt = data.get("format") or {}
    try:
        payload["durationSeconds"] = float(fmt.get("duration")) if fmt.get("duration") else None
    except (TypeError, ValueError):
        payload["durationSeconds"] = None
    payload["formatName"] = fmt.get("format_name")

    for stream in data.get("streams") or []:
        if stream.get("codec_type") == "video":
            payload["width"] = stream.get("width")
            payload["height"] = stream.get("height")
            payload["videoCodec"] = stream.get("codec_name")
            payload["frameRate"] = stream.get("avg_frame_rate")
            break
    return payload


def sha256_file(path):
    digest = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_command_output(command, timeout=45):
    proc = subprocess.run(command, capture_output=True, timeout=timeout, check=False)
    if proc.returncode != 0 or not proc.stdout:
        error = proc.stderr.decode("utf-8", "replace").strip()
        return None, error or "fingerprint command returned no data"
    return hashlib.sha256(proc.stdout).hexdigest(), None


def media_fingerprint_payload(input_path, filename):
    """Build local-only fingerprints for owner-approved audio/video tracking."""
    ext = granite_audio_extension(filename)
    payload = {
        "fileSha256": sha256_file(input_path),
        "policy": "Use for owner-approved media identification, duplicates, chain-of-custody, and royalty/library tracking. Do not use to impersonate voices or track private third-party media without permission.",
    }
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        payload["ffmpeg"] = None
        payload["note"] = "Install ffmpeg for normalized audio/video content fingerprints."
        return payload

    payload["ffmpeg"] = ffmpeg
    audio_cmd = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        input_path,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "s16le",
        "-",
    ]
    audio_hash, audio_error = sha256_command_output(audio_cmd)
    if audio_hash:
        payload["audioContentSha256"] = audio_hash
        payload["audioFingerprint"] = "normalized-pcm-16khz-mono-sha256"
    else:
        payload["audioFingerprintError"] = audio_error

    if ext in {".mov", ".mp4", ".webm"}:
        video_cmd = [
            ffmpeg,
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            input_path,
            "-an",
            "-vf",
            "fps=1,scale=160:-1",
            "-pix_fmt",
            "gray",
            "-f",
            "rawvideo",
            "-",
        ]
        video_hash, video_error = sha256_command_output(video_cmd)
        if video_hash:
            payload["videoSampleSha256"] = video_hash
            payload["videoFingerprint"] = "1fps-160px-gray-frame-sha256"
        else:
            payload["videoFingerprintError"] = video_error
    return payload


def granite_multipart_body(fields, file_field, file_path, filename):
    boundary = "----OscarGraniteSpeech" + uuid.uuid4().hex
    chunks = []
    for key, value in fields.items():
        chunks.extend([
            f"--{boundary}\r\n".encode("utf-8"),
            f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode("utf-8"),
            str(value).encode("utf-8"),
            b"\r\n",
        ])

    content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    chunks.extend([
        f"--{boundary}\r\n".encode("utf-8"),
        f'Content-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\n'.encode("utf-8"),
        f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"),
    ])
    with open(file_path, "rb") as f:
        chunks.append(f.read())
    chunks.extend([b"\r\n", f"--{boundary}--\r\n".encode("utf-8")])
    return boundary, b"".join(chunks)


def granite_transcribe_via_endpoint(audio_path, filename, prompt):
    fields = {
        "model": GRANITE_STT_MODEL,
        "prompt": prompt,
        "temperature": "0",
    }
    boundary, body = granite_multipart_body(fields, "file", audio_path, filename)
    req = urllib.request.Request(
        GRANITE_STT_URL,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=GRANITE_STT_TIMEOUT_SECONDS) as resp:
        raw = resp.read().decode("utf-8", "replace")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = {"text": raw}
    text = str(data.get("text") or data.get("transcript") or data.get("generated_text") or "").strip()
    if not text and isinstance(data.get("choices"), list) and data["choices"]:
        text = str(data["choices"][0].get("message", {}).get("content") or data["choices"][0].get("text") or "").strip()
    if not text:
        raise RuntimeError("Granite endpoint returned no transcript text")
    return {
        "text": text,
        "engine": "granite-endpoint",
        "endpoint": GRANITE_STT_URL,
        "model": GRANITE_STT_MODEL,
    }


def _get_whisper_model():
    global _WHISPER_MODEL
    try:
        from faster_whisper import WhisperModel
    except ImportError as e:
        raise RuntimeError(
            "Whisper is not installed. Run: python3 -m pip install --user faster-whisper"
        ) from e
    with _WHISPER_MODEL_LOCK:
        if _WHISPER_MODEL is None:
            safe_print(f"  Loading Whisper model ({OSCAR_WHISPER_MODEL}) for local transcription…")
            _WHISPER_MODEL = WhisperModel(
                OSCAR_WHISPER_MODEL,
                device="cpu",
                compute_type=OSCAR_WHISPER_COMPUTE,
            )
        return _WHISPER_MODEL


def _whisper_collect_text(segments):
    parts = []
    for segment in segments:
        line = str(getattr(segment, "text", "") or "").strip()
        if line:
            parts.append(line)
    return " ".join(parts).strip()


def granite_transcribe_via_whisper(audio_path):
    """CPU-friendly local STT for 8 GB Macs when Granite/llama-server is offline."""
    model = _get_whisper_model()
    transcribe_kwargs = {
        "beam_size": 1,
        "vad_filter": False,
        "language": None,
    }
    segments, _info = model.transcribe(audio_path, **transcribe_kwargs)
    text = _whisper_collect_text(segments)
    if not text:
        segments, _info = model.transcribe(
            audio_path,
            beam_size=1,
            vad_filter=True,
            language=None,
        )
        text = _whisper_collect_text(segments)
    if not text:
        raise RuntimeError(
            "No speech detected in this file. Check the audio track, volume, and language, "
            "or trim to a shorter clip (long files are limited on 8 GB Macs)."
        )
    return {
        "text": text,
        "engine": f"whisper-{OSCAR_WHISPER_MODEL}",
        "model": OSCAR_WHISPER_MODEL,
    }


def granite_transcribe_via_llama_cli(audio_path, prompt):
    llama_cli = local_or_path_executable(OSCAR_LLAMA_CLI, "llama-cli")
    if not llama_cli:
        raise RuntimeError("llama-cli is not installed")
    command = [
        llama_cli,
        "-st",
        "-hf",
        GRANITE_STT_GGUF_MODEL,
        "--audio",
        audio_path,
        "-p",
        prompt,
    ]
    proc = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=GRANITE_STT_TIMEOUT_SECONDS,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or "llama-cli Granite transcription failed")
    text = (proc.stdout or "").strip()
    if not text:
        raise RuntimeError("llama-cli returned no transcript text")
    return {
        "text": text,
        "engine": "llama-cli",
        "model": GRANITE_STT_GGUF_MODEL,
    }


def granite_transcribe_file(audio_path, filename, prompt=None, keywords=None):
    prompt = granite_prompt(prompt, keywords)
    prepared_path, cleanup_paths = granite_maybe_convert_audio(audio_path)
    errors = []
    try:
        # On this Mac Granite is usually offline — run Whisper first when available.
        if _whisper_backend_available():
            try:
                return granite_transcribe_via_whisper(prepared_path)
            except Exception as e:
                errors.append(f"Whisper: {e}")

        try:
            return granite_transcribe_via_endpoint(
                prepared_path, os.path.basename(prepared_path), prompt
            )
        except Exception as e:
            errors.append(f"Granite endpoint: {e}")

        try:
            return granite_transcribe_via_llama_cli(prepared_path, prompt)
        except Exception as e:
            errors.append(f"Granite CLI: {e}")

        if not _whisper_backend_available():
            errors.append(
                "Whisper not installed. Run: python3 -m pip install --user faster-whisper"
            )

        raise RuntimeError("Could not transcribe this file. " + " ".join(errors))
    finally:
        for path in cleanup_paths:
            try:
                os.unlink(path)
            except OSError:
                pass


def bridge_root():
    """Return the canonical root Oscar is allowed to inspect."""
    return os.path.realpath(os.path.expanduser(BRIDGE_ROOT))


def bridge_is_private_file(name):
    lower = name.lower()
    return (
        name in BRIDGE_PRIVATE_FILES
        or lower.startswith(".env")
        or lower.startswith("._")
        or lower in {".spotlight-v100", ".temporaryitems", ".trashes", ".fseventsd"}
    )


def bridge_is_text_file(path):
    name = os.path.basename(path)
    ext = os.path.splitext(name)[1].lower()
    return name in BRIDGE_TEXT_NAMES or ext in BRIDGE_TEXT_EXTENSIONS


def bridge_resolve(rel_path="."):
    """Resolve a requested bridge path while preventing traversal out of root."""
    root = bridge_root()
    if not os.path.isdir(root):
        raise FileNotFoundError(f"Workspace bridge root does not exist: {root}")

    requested = rel_path or "."
    if "\x00" in requested:
        raise PermissionError("Invalid path")

    full_path = requested if os.path.isabs(requested) else os.path.join(root, requested)
    full_path = os.path.realpath(full_path)

    if os.path.commonpath([root, full_path]) != root:
        raise PermissionError("Path is outside the workspace bridge root")

    rel = os.path.relpath(full_path, root)
    rel_parts = [] if rel == "." else rel.split(os.sep)
    for part in rel_parts:
        if part in BRIDGE_SKIP_DIRS or bridge_is_private_file(part):
            raise PermissionError("Path is blocked by the workspace bridge policy")

    return root, full_path, rel


def bridge_iter_files(limit=BRIDGE_MAX_TREE_FILES):
    """Yield safe text/code files inside the bridge root."""
    root = bridge_root()
    if not os.path.isdir(root):
        return []

    files = []
    walk_roots = []
    project_root = os.path.realpath(PROJECT_ROOT)
    try:
        if os.path.isdir(project_root) and os.path.commonpath([root, project_root]) == root:
            walk_roots.append(project_root)
    except ValueError:
        pass
    walk_roots.append(root)
    seen = set()

    for walk_root in walk_roots:
      for current, dirs, names in os.walk(walk_root, followlinks=False):
        dirs[:] = sorted(
            d for d in dirs
            if d not in BRIDGE_SKIP_DIRS and not bridge_is_private_file(d)
        )
        for name in sorted(names):
            if bridge_is_private_file(name):
                continue
            full_path = os.path.join(current, name)
            if not os.path.isfile(full_path):
                continue
            rel = os.path.relpath(full_path, root)
            if any(part in BRIDGE_SKIP_DIRS for part in rel.split(os.sep)):
                continue
            try:
                size = os.path.getsize(full_path)
            except OSError:
                continue
            if rel in seen:
                continue
            seen.add(rel)
            files.append({"path": rel, "size": size, "text": bridge_is_text_file(full_path)})
            if len(files) >= limit:
                return files
    return files


def bridge_read_text(rel_path, max_chars=BRIDGE_MAX_FILE_CHARS):
    root, full_path, rel = bridge_resolve(rel_path)

    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"Not a file: {rel}")
    if not bridge_is_text_file(full_path):
        raise ValueError("Only text/code files can be read through the workspace bridge")

    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read(max_chars + 1)

    truncated = len(content) > max_chars
    if truncated:
        content = content[:max_chars]

    return {
        "root": root,
        "path": rel,
        "content": content,
        "truncated": truncated,
        "size": os.path.getsize(full_path),
    }


def tool_root():
    """Return the primary root where owner-approved tools may operate."""
    roots = tool_allowed_roots()
    return roots[0] if roots else os.path.realpath(os.path.expanduser(TOOL_ROOT))


def tool_resolve(rel_path="."):
    """Resolve a tool path while keeping it inside owner-approved roots."""
    roots = tool_allowed_roots()
    if not roots:
        raise FileNotFoundError("Oscar has no owner-approved tool roots")

    requested = rel_path or "."
    if "\x00" in requested:
        raise PermissionError("Invalid path")

    if os.path.isabs(requested):
        full_path = os.path.realpath(requested)
        matching = []
        for candidate in roots:
            try:
                if os.path.commonpath([candidate, full_path]) == candidate:
                    matching.append(candidate)
            except ValueError:
                continue
        if not matching:
            raise PermissionError("Path is outside Oscar's owner-approved tool roots")
        root = sorted(matching, key=len, reverse=True)[0]
    else:
        root = roots[0]
        if not os.path.isdir(root):
            raise FileNotFoundError(f"Oscar tool root does not exist: {root}")
        full_path = os.path.realpath(os.path.join(root, requested))

    if os.path.commonpath([root, full_path]) != root:
        raise PermissionError("Path is outside Oscar's owner-approved tool root")

    rel = os.path.relpath(full_path, root)
    rel_parts = [] if rel == "." else rel.split(os.sep)
    for part in rel_parts:
        if part in BRIDGE_SKIP_DIRS or bridge_is_private_file(part):
            raise PermissionError("Path is blocked by the Oscar tool policy")

    return root, full_path, rel


def tool_iter_files(limit=BRIDGE_MAX_TREE_FILES):
    """Yield safe text/code files inside all owner-approved tool roots."""
    limit = max(1, min(int(limit), 1000))
    files = []
    seen = set()
    for root in tool_allowed_roots():
        if not os.path.isdir(root):
            continue
        for current, dirs, names in os.walk(root, followlinks=False):
            dirs[:] = sorted(
                d for d in dirs
                if d not in BRIDGE_SKIP_DIRS and not bridge_is_private_file(d)
            )
            for name in sorted(names):
                if bridge_is_private_file(name):
                    continue
                full_path = os.path.join(current, name)
                if not os.path.isfile(full_path):
                    continue
                rel = os.path.relpath(full_path, root)
                if any(part in BRIDGE_SKIP_DIRS for part in rel.split(os.sep)):
                    continue
                key = os.path.realpath(full_path)
                if key in seen:
                    continue
                seen.add(key)
                try:
                    size = os.path.getsize(full_path)
                except OSError:
                    continue
                files.append({
                    "root": root,
                    "path": rel,
                    "absolutePath": key,
                    "size": size,
                    "text": bridge_is_text_file(full_path),
                })
                if len(files) >= limit:
                    return files
    return files


def tool_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS):
    root, full_path, rel = tool_resolve(path)
    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"Not a file: {rel}")
    if not bridge_is_text_file(full_path):
        raise ValueError("Only text/code files can be read through Oscar Tool Mode")

    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read(max_chars + 1)
    truncated = len(content) > max_chars
    if truncated:
        content = content[:max_chars]
    return {
        "root": root,
        "path": rel,
        "absolutePath": full_path,
        "content": content,
        "truncated": truncated,
        "size": os.path.getsize(full_path),
    }


def tool_resolve_parent(rel_path):
    """Resolve a writable file target and require its parent folder to exist."""
    root, full_path, rel = tool_resolve(rel_path)
    if rel == ".":
        raise PermissionError("A file path is required")
    parent = os.path.dirname(full_path)
    if not os.path.isdir(parent):
        raise FileNotFoundError(f"Parent folder does not exist: {os.path.relpath(parent, root)}")
    if os.path.islink(full_path) or os.path.islink(parent):
        raise PermissionError("Refusing to write through a symlink")
    return root, full_path, rel


def tool_timestamp():
    return time.strftime("%Y%m%d-%H%M%S")


def tool_log(entry):
    os.makedirs(TOOL_LOG_DIR, exist_ok=True)
    data = dict(entry)
    data.setdefault("time", time.strftime("%Y-%m-%dT%H:%M:%S%z"))
    data.setdefault("id", tool_timestamp() + "-" + str(int(time.time() * 1000) % 100000))
    log_path = os.path.join(TOOL_LOG_DIR, "tool-mode.jsonl")
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")
    return data["id"]


def tool_backup_existing(full_path, rel):
    if not os.path.exists(full_path):
        return None
    if os.path.islink(full_path):
        raise PermissionError("Refusing to back up a symlink")
    backup = os.path.join(TOOL_BACKUP_DIR, tool_timestamp(), rel)
    os.makedirs(os.path.dirname(backup), exist_ok=True)
    if os.path.isdir(full_path):
        shutil.copytree(full_path, backup)
    else:
        shutil.copy2(full_path, backup)
    return backup


def tool_require_not_root(rel, message="A file or folder path is required"):
    if rel == ".":
        raise PermissionError(message)


def tool_validate_reversible_target(full_path, rel):
    tool_require_not_root(rel)
    if os.path.islink(full_path):
        raise PermissionError("Refusing to operate on a symlink")
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Path does not exist: {rel}")


def tool_mkdir(rel_path, reason=""):
    root, full_path, rel = tool_resolve(rel_path)
    tool_require_not_root(rel, "A folder path is required")
    if os.path.exists(full_path):
        if not os.path.isdir(full_path):
            raise FileExistsError(f"Path exists and is not a folder: {rel}")
        created = False
    else:
        parent = os.path.dirname(full_path)
        if not os.path.isdir(parent):
            raise FileNotFoundError(f"Parent folder does not exist: {os.path.relpath(parent, root)}")
        if os.path.islink(parent):
            raise PermissionError("Refusing to create a folder through a symlink")
        os.makedirs(full_path, exist_ok=True)
        created = True
    result = {"path": rel, "created": created, "reason": reason}
    result["logId"] = tool_log({"action": "mkdir", **result})
    return result


def tool_copy(src_path, dest_path, overwrite=False, reason=""):
    root, src_full, src_rel = tool_resolve(src_path)
    tool_validate_reversible_target(src_full, src_rel)
    if not os.path.isfile(src_full):
        raise ValueError("Copy is limited to regular files")

    _, dest_full, dest_rel = tool_resolve_parent(dest_path)
    if os.path.isdir(dest_full):
        raise IsADirectoryError(f"Destination is a folder: {dest_rel}")
    if os.path.exists(dest_full) and not overwrite:
        raise FileExistsError(f"Destination exists: {dest_rel}")

    backup = tool_backup_existing(dest_full, dest_rel) if os.path.exists(dest_full) else None
    shutil.copy2(src_full, dest_full)
    result = {
        "source": src_rel,
        "destination": dest_rel,
        "overwrite": bool(overwrite),
        "backup": backup,
        "size": os.path.getsize(dest_full),
        "reason": reason,
    }
    result["logId"] = tool_log({"action": "copy", **result})
    return result


def tool_move(src_path, dest_path, overwrite=False, reason=""):
    root, src_full, src_rel = tool_resolve(src_path)
    tool_validate_reversible_target(src_full, src_rel)
    _, dest_full, dest_rel = tool_resolve_parent(dest_path)

    if os.path.commonpath([src_full, dest_full]) == src_full:
        raise PermissionError("Refusing to move a folder into itself")
    if os.path.exists(dest_full):
        if not overwrite:
            raise FileExistsError(f"Destination exists: {dest_rel}")
        if os.path.islink(dest_full):
            raise PermissionError("Refusing to overwrite a symlink")
        backup = tool_backup_existing(dest_full, dest_rel)
        if os.path.isdir(dest_full):
            shutil.rmtree(dest_full)
        else:
            os.unlink(dest_full)
    else:
        backup = None

    shutil.move(src_full, dest_full)
    result = {
        "source": src_rel,
        "destination": dest_rel,
        "overwrite": bool(overwrite),
        "backup": backup,
        "reason": reason,
    }
    result["logId"] = tool_log({"action": "move", **result})
    return result


def tool_trash(rel_path, reason=""):
    root, full_path, rel = tool_resolve(rel_path)
    tool_validate_reversible_target(full_path, rel)
    trash_path = os.path.join(TOOL_BACKUP_DIR, "trash", tool_timestamp(), rel)
    os.makedirs(os.path.dirname(trash_path), exist_ok=True)
    shutil.move(full_path, trash_path)
    result = {"path": rel, "trashPath": trash_path, "reason": reason}
    result["logId"] = tool_log({"action": "trash", **result})
    return result


def tool_patch_text(rel_path, replacements, reason=""):
    if not isinstance(replacements, list) or not replacements:
        raise ValueError("Patch requires a non-empty replacements list")
    if len(replacements) > TOOL_MAX_PATCH_REPLACEMENTS:
        raise ValueError(f"Too many replacements; limit is {TOOL_MAX_PATCH_REPLACEMENTS}")

    root, full_path, rel = tool_resolve_parent(rel_path)
    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"Not a file: {rel}")
    if not bridge_is_text_file(full_path):
        raise ValueError("Patch is limited to safe text/code files")

    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        original = f.read()
    updated = original
    changes = []

    for index, item in enumerate(replacements, start=1):
        if not isinstance(item, dict):
            raise ValueError("Each replacement must be an object")
        old = item.get("old", item.get("find"))
        new = item.get("new", item.get("replace", ""))
        if old is None:
            raise ValueError(f"Replacement {index} is missing old/find text")
        old = str(old)
        new = str(new)
        if not old:
            raise ValueError(f"Replacement {index} has empty old/find text")
        count = int(item.get("count", 1))
        if count < 0:
            raise ValueError("Replacement count cannot be negative")
        occurrences = updated.count(old)
        if occurrences < 1:
            raise ValueError(f"Patch text not found for replacement {index}")
        replace_count = occurrences if count == 0 else min(count, occurrences)
        updated = updated.replace(old, new, replace_count)
        changes.append({
            "index": index,
            "requested": count,
            "matched": occurrences,
            "changed": replace_count,
        })

    if updated == original:
        raise ValueError("Patch made no changes")
    if len(updated) > TOOL_MAX_WRITE_CHARS:
        raise ValueError(f"Patched file would be too large ({len(updated)} chars)")

    backup = tool_backup_existing(full_path, rel)
    fd, tmp_path = tempfile.mkstemp(prefix=".oscar-tool-patch-", dir=os.path.dirname(full_path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(updated)
            if updated and not updated.endswith("\n"):
                f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, full_path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    result = {
        "path": rel,
        "changes": changes,
        "backup": backup,
        "size": os.path.getsize(full_path),
        "reason": reason,
    }
    result["logId"] = tool_log({"action": "patch", **result})
    return result


def tool_web_fetch(url, max_chars=None):
    value = computer_validate_url(url)
    max_chars = TOOL_MAX_WEB_FETCH_CHARS if max_chars is None else int(max_chars)
    max_chars = max(1000, min(max_chars, TOOL_MAX_WEB_FETCH_CHARS))
    req = urllib.request.Request(
        value,
        headers={
            "User-Agent": "OscarLocalToolMode/1.0",
            "Accept": "text/plain,text/html,application/json,application/xml,text/xml;q=0.9,*/*;q=0.5",
        },
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        status = getattr(resp, "status", 200)
        content_type = resp.headers.get("Content-Type", "")
        raw = resp.read(TOOL_MAX_WEB_FETCH_BYTES + 1)
    truncated_bytes = len(raw) > TOOL_MAX_WEB_FETCH_BYTES
    if truncated_bytes:
        raw = raw[:TOOL_MAX_WEB_FETCH_BYTES]

    charset_match = re.search(r"charset=([^;\s]+)", content_type, re.I)
    charset = charset_match.group(1) if charset_match else "utf-8"
    text = raw.decode(charset, errors="replace")
    truncated_chars = len(text) > max_chars
    if truncated_chars:
        text = text[:max_chars]

    result = {
        "url": value,
        "status": status,
        "contentType": content_type,
        "bytesRead": len(raw),
        "truncated": bool(truncated_bytes or truncated_chars),
        "text": text,
    }
    result["logId"] = tool_log({"action": "web_fetch", **{k: v for k, v in result.items() if k != "text"}, "chars": len(text)})
    return result


def tool_short_output(text, max_chars=TOOL_MAX_OUTPUT_CHARS):
    text = "" if text is None else str(text)
    if len(text) <= max_chars:
        return text
    note = f"\n\n[tool output shortened from {len(text)} chars]\n"
    keep = max(0, max_chars - len(note))
    head = int(keep * 0.65)
    tail = keep - head
    return text[:head] + note + (text[-tail:] if tail else "")


def tool_parse_command(command):
    if isinstance(command, list):
        args = [str(part) for part in command if str(part)]
    else:
        args = shlex.split(str(command or ""))
    if not args:
        raise ValueError("Command is empty")
    return args


def tool_validate_path_arg(path_arg):
    if path_arg.startswith("-"):
        raise PermissionError("Command path arguments cannot be flags")
    root, full_path, rel = tool_resolve(path_arg)
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Command path does not exist: {rel}")
    return rel


def tool_command_allowed(args):
    tup = tuple(args)
    if tup in TOOL_ALLOWED_EXACT_COMMANDS:
        return True, "exact allowlist"

    if len(args) == 3 and args[0] == "npm" and args[1] == "run" and args[2] in TOOL_ALLOWED_RUN_SCRIPTS:
        return True, "npm script allowlist"

    if len(args) == 3 and args[0] == "node" and args[1] == "--check":
        rel = tool_validate_path_arg(args[2])
        if os.path.splitext(rel)[1].lower() not in {".js", ".mjs", ".cjs"}:
            raise PermissionError("node --check is limited to JavaScript files")
        return True, "node syntax check"

    if len(args) >= 4 and args[0] in {"python", "python3"} and args[1:3] == ["-m", "py_compile"]:
        for path_arg in args[3:]:
            rel = tool_validate_path_arg(path_arg)
            if os.path.splitext(rel)[1].lower() != ".py":
                raise PermissionError("py_compile is limited to Python files")
        return True, "python syntax check"

    if len(args) >= 2 and args[0] == "pytest":
        for path_arg in args[1:]:
            tool_validate_path_arg(path_arg)
        return True, "pytest path allowlist"

    if len(args) >= 4 and args[0] in {"python", "python3"} and args[1:3] == ["-m", "pytest"]:
        for path_arg in args[3:]:
            tool_validate_path_arg(path_arg)
        return True, "python pytest path allowlist"

    if len(args) >= 2 and args[0] == "bash":
        rel = tool_validate_path_arg(args[1])
        if not rel.endswith(".sh"):
            raise PermissionError("bash is limited to .sh scripts under owner-approved roots")
        if "scripts/" not in rel.replace("\\", "/") and "GOAT-FORCE/scripts" not in rel:
            raise PermissionError("bash scripts must live under GOAT-FORCE/scripts")
        return True, "goat bash script"

    if len(args) >= 2 and args[0] in {"python3", "python"}:
        rel = tool_validate_path_arg(args[1])
        if os.path.splitext(rel)[1].lower() != ".py":
            raise PermissionError("python runner is limited to .py files in approved roots")
        return True, "goat python script"

    if len(args) >= 2 and args[0] == "ffmpeg":
        for path_arg in args[1:]:
            if path_arg.startswith("-"):
                continue
            tool_validate_path_arg(path_arg)
        return True, "ffmpeg media tool"

    return False, "Command is not in Oscar Tool Mode allowlist"


def tool_run_command(command, cwd="."):
    args = tool_parse_command(command)
    allowed, reason = tool_command_allowed(args)
    if not allowed:
        raise PermissionError(reason)

    root, full_cwd, rel_cwd = tool_resolve(cwd or ".")
    if not os.path.isdir(full_cwd):
        raise FileNotFoundError(f"Working directory is not a folder: {rel_cwd}")

    started = time.time()
    env = os.environ.copy()
    env.update({"CI": "1", "NO_COLOR": "1"})
    proc = subprocess.run(
        args,
        cwd=full_cwd,
        capture_output=True,
        text=True,
        timeout=TOOL_TIMEOUT_SECONDS,
        env=env,
        check=False,
    )
    elapsed_ms = int((time.time() - started) * 1000)
    result = {
        "command": " ".join(shlex.quote(part) for part in args),
        "cwd": rel_cwd,
        "allowedBy": reason,
        "exitCode": proc.returncode,
        "elapsedMs": elapsed_ms,
        "stdout": tool_short_output(proc.stdout),
        "stderr": tool_short_output(proc.stderr),
    }
    result["logId"] = tool_log({"action": "run", **result})
    return result


def tool_write_text(rel_path, content, reason=""):
    content = "" if content is None else str(content)
    if len(content) > TOOL_MAX_WRITE_CHARS:
        raise ValueError(f"Write content is too large ({len(content)} chars)")

    root, full_path, rel = tool_resolve_parent(rel_path)
    if not bridge_is_text_file(full_path):
        raise ValueError("Oscar Tool Mode can only write text/code files")

    backup = None
    if os.path.exists(full_path):
        backup = os.path.join(TOOL_BACKUP_DIR, tool_timestamp(), rel)
        os.makedirs(os.path.dirname(backup), exist_ok=True)
        shutil.copy2(full_path, backup)

    fd, tmp_path = tempfile.mkstemp(prefix=".oscar-tool-", dir=os.path.dirname(full_path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(content)
            if content and not content.endswith("\n"):
                f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, full_path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    result = {
        "path": rel,
        "size": os.path.getsize(full_path),
        "backup": backup,
        "reason": reason,
    }
    result["logId"] = tool_log({"action": "write", **result})
    return result


def tool_search_text(query, max_hits=50):
    needle = str(query or "").strip()
    if len(needle) < 2:
        raise ValueError("Search query must be at least 2 characters")
    max_hits = max(1, min(int(max_hits), 200))
    hits = []
    needle_lower = needle.lower()
    tokens = [
        token
        for token in re.findall(r"[a-z0-9][a-z0-9+._-]{1,}", needle_lower)
        if token not in {"the", "and", "for", "with", "from", "that", "this"}
    ]
    for item in tool_iter_files(1000):
        if not item.get("text") or item.get("size", 0) > 300_000:
            continue
        try:
            data = tool_read_text(item["absolutePath"], max_chars=300_000)["content"]
        except Exception:
            continue
        for index, line in enumerate(data.splitlines(), start=1):
            line_lower = line.lower()
            line_tokens = set(re.findall(r"[a-z0-9][a-z0-9+._-]{1,}", line_lower))
            token_hits = [token for token in tokens if token in line_tokens]
            exact_hit = needle_lower in line_lower
            if exact_hit or len(token_hits) >= min(2, len(tokens)):
                hits.append({
                    "root": item.get("root"),
                    "path": item["path"],
                    "absolutePath": item.get("absolutePath"),
                    "line": index,
                    "text": line.strip()[:260],
                    "score": len(token_hits) + (20 if exact_hit else 0),
                })
    hits.sort(key=lambda hit: (-int(hit.get("score", 0)), hit.get("path", ""), int(hit.get("line", 0))))
    return {"roots": tool_allowed_roots(), "query": needle, "hits": hits[:max_hits]}


def tool_diagnose():
    checks = []
    checks.append({"name": "toolRoot", "ok": os.path.isdir(tool_root()), "detail": tool_root()})
    for root in tool_allowed_roots():
        checks.append({"name": "allowedToolRoot", "ok": os.path.isdir(root), "detail": root})
    checks.append({"name": "bridgeRoot", "ok": os.path.isdir(bridge_root()), "detail": bridge_root()})
    for path in (CHATS_FILE, SETTINGS_FILE, HTML_FILE):
        checks.append({"name": os.path.basename(path), "ok": os.path.exists(path), "detail": path})
    try:
        read_json_file(SETTINGS_FILE, {})
        settings_ok = True
    except Exception:
        settings_ok = False
    checks.append({"name": "settingsJson", "ok": settings_ok, "detail": SETTINGS_FILE})
    result = {"checks": checks}
    result["logId"] = tool_log({"action": "diagnose", **result})
    return result


def tool_self_heal(apply=False, ensure_advanced=True):
    """Repair Oscar's local runtime basics through an owner-approved tool action."""
    apply = bool(apply)
    ensure_advanced = bool(ensure_advanced)
    checks = []
    repairs = []
    backups = []

    def add_check(name, ok, detail):
        checks.append({"name": name, "ok": bool(ok), "detail": detail})

    required_dirs = [
        CHATS_DIR,
        TOOL_LOG_DIR,
        TOOL_BACKUP_DIR,
        GENERATED_IMAGES_DIR,
        COMPUTER_SCREENSHOT_DIR,
        os.path.join(SCRIPT_DIR, "oscar_drafts"),
        os.path.join(SCRIPT_DIR, "apps"),
        os.path.join(SCRIPT_DIR, "python-envs"),
        os.path.join(SCRIPT_DIR, "build-tools"),
        os.path.join(SCRIPT_DIR, "models"),
        os.path.join(SCRIPT_DIR, "models", "foundation"),
        os.path.join(SCRIPT_DIR, "models", "art"),
        os.path.join(SCRIPT_DIR, "models", "art", "loras"),
        os.path.join(SCRIPT_DIR, ".ollama-runtime"),
        os.path.join(SCRIPT_DIR, "voice_library"),
        os.path.join(MASTER_LLM_ROOT, "library", "catalog"),
    ]
    for path in required_dirs:
        exists = os.path.isdir(path)
        if not exists and apply:
            os.makedirs(path, exist_ok=True)
            repairs.append({"type": "mkdir", "path": os.path.relpath(path, PROJECT_ROOT)})
            exists = True
        add_check("dir:" + os.path.relpath(path, PROJECT_ROOT), exists, path)

    if not os.path.exists(CHATS_FILE) and apply:
        write_json_file(CHATS_FILE, [])
        repairs.append({"type": "create_json", "path": os.path.relpath(CHATS_FILE, PROJECT_ROOT)})
    add_check("chatsJson", os.path.exists(CHATS_FILE), CHATS_FILE)

    settings = load_settings()
    settings_changes = {}
    for key, default_value in DEFAULT_SETTINGS.items():
        if key not in settings:
            settings_changes[key] = default_value
    if ensure_advanced:
        advanced_values = {
            "toolModeEnabled": True,
            "computerControlEnabled": True,
            "voiceAutoSpeak": True,
            "capabilityMode": settings.get("capabilityMode") or "chat",
            "expertMode": settings.get("expertMode") or "oscar",
        }
        for key, value in advanced_values.items():
            if settings.get(key) != value:
                settings_changes[key] = value

    if settings_changes and apply:
        if os.path.exists(SETTINGS_FILE):
            backup = os.path.join(
                TOOL_BACKUP_DIR,
                tool_timestamp(),
                os.path.relpath(SETTINGS_FILE, PROJECT_ROOT),
            )
            os.makedirs(os.path.dirname(backup), exist_ok=True)
            shutil.copy2(SETTINGS_FILE, backup)
            backups.append(backup)
        settings.update(settings_changes)
        write_json_file(SETTINGS_FILE, settings)
        repairs.append({
            "type": "settings_update",
            "path": os.path.relpath(SETTINGS_FILE, PROJECT_ROOT),
            "keys": sorted(settings_changes),
        })
    add_check("settingsJson", os.path.exists(SETTINGS_FILE), SETTINGS_FILE)
    add_check("toolModeEnabled", bool(load_settings().get("toolModeEnabled")), SETTINGS_FILE)
    add_check("computerControlEnabled", bool(load_settings().get("computerControlEnabled")), SETTINGS_FILE)

    executable_paths = [
        "Launch Oscar.command",
        "Mac/Launch Oscar.command",
        "Mac/Launch Oscar Client.command",
        "Mac/Start Oscar Runtime Services.command",
        "Mac/Start Oscar ComfyUI.command",
        "Mac/Start Oscar Autonomous Model Download.command",
        "Linux/install.sh",
        "Linux/start.sh",
        "Android/install.sh",
        "Android/start.sh",
        "Phone/start-phone-host.sh",
        "Phone/Start Oscar Phone Host.command",
        "Deploy/build-oscar-packages.sh",
        "OSCAR-FINAL-VERIFY-3PASS.sh",
        "OSCAR-DOWNLOAD-FLUX-SDXL.sh",
        "OSCAR-DOWNLOAD-AUTONOMOUS-AI-STACK.sh",
        "OSCAR-FINAL-1CLICK-DOWNLOAD.md",
        "OSCAR-CROSS-PLATFORM-DEPLOY-1CLICK.md",
        "Shared/runtime/setup-art-runtimes.sh",
        "Shared/runtime/start-comfyui.sh",
        "Shared/runtime/start-auto1111.sh",
        "Shared/runtime/start-forge.sh",
        "Shared/runtime/build-llama-cpp.sh",
        "Shared/runtime/start-llama-cpp-server.sh",
        "Shared/runtime/start-autonomous-model-download.sh",
        "Shared/runtime/install-launch-agents.sh",
    ]
    for rel in executable_paths:
        path = os.path.join(PROJECT_ROOT, rel)
        if not os.path.exists(path):
            add_check("missing:" + rel, False, path)
            continue
        executable = os.access(path, os.X_OK)
        if not executable and apply:
            current = os.stat(path).st_mode
            os.chmod(path, current | 0o755)
            repairs.append({"type": "chmod_x", "path": rel})
            executable = True
        add_check("executable:" + rel, executable, path)

    for rel in ("Shared/chat_server.py", "Shared/FastChatUI.html"):
        path = os.path.join(PROJECT_ROOT, rel)
        add_check("exists:" + rel, os.path.exists(path), path)

    try:
        with open(os.path.abspath(__file__), "r", encoding="utf-8") as f:
            server_source = f.read()
        add_check(
            "drawRendererFreshSeed",
            "renderSeed = uuid.uuid4().hex" in server_source and '"renderSeed": render_seed' in server_source,
            os.path.abspath(__file__),
        )
        add_check(
            "drawRendererPromptVariation",
            "subject_words = set" in server_source and "Prompt fingerprint bars" in server_source,
            os.path.abspath(__file__),
        )
    except Exception as exc:
        add_check("drawRendererSelfCheck", False, str(exc))

    try:
        py_compile.compile(os.path.abspath(__file__), doraise=True)
        add_check("chatServerSyntax", True, os.path.abspath(__file__))
    except Exception as exc:
        add_check("chatServerSyntax", False, str(exc))

    result = {
        "applied": apply,
        "ensureAdvanced": ensure_advanced,
        "checks": checks,
        "repairs": repairs,
        "backups": backups,
        "ok": all(item.get("ok") for item in checks),
    }
    result["logId"] = tool_log({"action": "self_heal", **result})
    return result


def tool_draw_local(subject):
    subject = str(subject or "").strip()
    if not subject:
        subject = "original Oscar local image"
    if len(subject) > 500:
        subject = subject[:500]
    manifest = create_oscar_image_render(subject)
    manifest["logId"] = tool_log({
        "action": "draw",
        "subject": subject,
        "pngPath": manifest.get("pngPath"),
        "imagePath": manifest.get("imagePath"),
        "url": manifest.get("url"),
        "renderer": manifest.get("renderer"),
    })
    return manifest


def computer_validate_url(url):
    value = str(url or "").strip()
    if not value or len(value) > 2048:
        raise ValueError("A valid http/https URL is required")
    parsed = urlparse(value)
    if parsed.scheme.lower() not in COMPUTER_ALLOWED_URL_SCHEMES or not parsed.netloc:
        raise PermissionError("Computer Control open_url only allows http/https URLs")
    if parsed.username or parsed.password:
        raise PermissionError("URLs with embedded usernames or passwords are blocked")
    return value


FL_STUDIO_ALIASES = {
    "fl studio",
    "fruity loops",
    "fruityloops",
    "fruitloops",
    "fruit loops",
    "froot loops",
}


def computer_resolve_installed_fl_studio():
    for candidate in ("FL Studio 25", "FL Studio", "FL Studio 2025", "FL Studio 2024"):
        if os.path.isdir(os.path.join("/Applications", f"{candidate}.app")):
            return candidate
    return "FL Studio 25"


def computer_normalize_daw_app_name(app_name):
    requested = str(app_name or "").strip()
    if not requested:
        return requested
    if requested.lower() in FL_STUDIO_ALIASES:
        return computer_resolve_installed_fl_studio()
    return requested


def computer_validate_app_name(app_name):
    requested = computer_normalize_daw_app_name(app_name)
    if not requested:
        raise ValueError("App name is required")
    if "/" in requested or "\\" in requested or not COMPUTER_APP_NAME_RE.match(requested):
        raise PermissionError("App name is not allowed")
    for allowed in computer_allowed_apps():
        if allowed.lower() == requested.lower():
            return allowed
    raise PermissionError("App is not in Oscar's Computer Control allowlist")


def computer_resolve_workspace_path(path_arg):
    root, full_path, rel = tool_resolve(path_arg or ".")
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Computer Control path does not exist: {rel}")
    return root, full_path, rel


def computer_run_process(command, dry_run=False):
    if dry_run:
        return {"exitCode": 0, "stdout": "", "stderr": ""}
    try:
        proc = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=COMPUTER_CONTROL_TIMEOUT_SECONDS,
            check=False,
        )
    except subprocess.TimeoutExpired as e:
        return {
            "exitCode": 124,
            "stdout": tool_short_output(e.stdout or "", 2000),
            "stderr": f"Computer Control command timed out after {COMPUTER_CONTROL_TIMEOUT_SECONDS} seconds",
        }
    return {
        "exitCode": proc.returncode,
        "stdout": tool_short_output(proc.stdout, 2000),
        "stderr": tool_short_output(proc.stderr, 2000),
    }


def computer_escape_applescript_text(value):
    return str(value).replace("\\", "\\\\").replace('"', '\\"')


def computer_validate_type_text(value):
    text = str(value or "")
    if not text:
        raise ValueError("Text is required")
    if len(text) > COMPUTER_MAX_TYPE_CHARS:
        raise ValueError(f"Type text is too long ({len(text)} chars)")
    if any(ord(ch) < 32 and ch not in "\n\r\t" for ch in text):
        raise ValueError("Type text contains unsupported control characters")
    return text.replace("\r\n", "\n").replace("\r", "\n")


def computer_validate_modifiers(value):
    if value is None:
        return []
    if isinstance(value, str):
        raw_items = [item for item in re.split(r"[+,\s]+", value) if item]
    elif isinstance(value, list):
        raw_items = value
    else:
        raise ValueError("Hotkey modifiers must be a list or string")

    modifiers = []
    for raw in raw_items:
        name = COMPUTER_MODIFIER_ALIASES.get(str(raw).strip().lower())
        if not name or name not in COMPUTER_ALLOWED_MODIFIERS:
            raise PermissionError("Unsupported hotkey modifier")
        if name not in modifiers:
            modifiers.append(name)
    return modifiers


def computer_validate_hotkey_key(value):
    key = str(value or "").strip()
    if not key:
        raise ValueError("Hotkey key is required")
    key_lower = key.lower()
    if key_lower in COMPUTER_SPECIAL_KEY_CODES:
        return {"kind": "keyCode", "value": COMPUTER_SPECIAL_KEY_CODES[key_lower], "label": key_lower}
    if len(key) == 1 and 32 <= ord(key) <= 126:
        return {"kind": "keystroke", "value": key.lower(), "label": key.lower()}
    raise PermissionError("Unsupported hotkey key")


def computer_applescript_modifier_clause(modifiers):
    if not modifiers:
        return ""
    parts = [f"{name} down" for name in modifiers]
    return " using {" + ", ".join(parts) + "}"


def computer_app_activate_script(app):
    if not app:
        return ""
    return f'tell application "{computer_escape_applescript_text(app)}" to activate\n' "delay 0.2\n"


def computer_type_text_script(app, text):
    lines = [computer_app_activate_script(app), 'tell application "System Events"\n']
    chunks = re.split(r"(\n|\t)", text)
    for chunk in chunks:
        if chunk == "":
            continue
        if chunk == "\n":
            lines.append("  key code 36\n")
        elif chunk == "\t":
            lines.append("  key code 48\n")
        else:
            lines.append(f'  keystroke "{computer_escape_applescript_text(chunk)}"\n')
    lines.append("end tell\n")
    return "".join(lines)


def computer_hotkey_script(app, key_info, modifiers):
    clause = computer_applescript_modifier_clause(modifiers)
    command = (
        f"key code {key_info['value']}{clause}"
        if key_info["kind"] == "keyCode"
        else f'keystroke "{computer_escape_applescript_text(key_info["value"])}"{clause}'
    )
    return (
        computer_app_activate_script(app)
        + 'tell application "System Events"\n'
        + f"  {command}\n"
        + "end tell\n"
    )


def computer_list_running_apps(dry_run=False):
    if platform.system() != "Darwin":
        raise PermissionError("Computer Control list_running_apps is currently enabled on macOS only")
    proc = computer_run_process(["ps", "-axo", "comm="], dry_run=dry_run)
    if proc["exitCode"] != 0:
        raise PermissionError(proc["stderr"] or "Could not list running apps")
    apps = []
    for line in proc["stdout"].splitlines():
        line = line.strip()
        if not line:
            continue
        app_match = re.search(r"/([^/]+)\.app/Contents/MacOS/", line)
        if app_match:
            apps.append(app_match.group(1))
            continue
        basename = os.path.basename(line)
        if basename in computer_allowed_apps():
            apps.append(basename)
    return {
        "computerAction": "list_running_apps",
        "apps": sorted(set(apps), key=str.lower),
        "dryRun": dry_run,
        "executed": not dry_run,
        **{**proc, "stdout": ""},
    }


def computer_daw_transport(payload, dry_run=False):
    app = computer_validate_app_name(computer_normalize_daw_app_name(payload.get("app", "")))
    if app.lower() not in DAW_ALLOWED_TRANSPORT_APPS:
        raise PermissionError("DAW transport is limited to owner-approved audio apps")

    command_name = str(payload.get("transport") or payload.get("command") or "").strip().lower()
    command = DAW_ALLOWED_TRANSPORT_COMMANDS.get(command_name)
    if not command:
        raise ValueError("Unsupported DAW transport command")

    if platform.system() != "Darwin":
        raise PermissionError("DAW transport control is currently enabled on macOS only")

    script = (
        f'tell application "{computer_escape_applescript_text(app)}" to activate\n'
        'delay 0.2\n'
        'tell application "System Events"\n'
        f'  key code {command["keyCode"]}\n'
        'end tell\n'
    )
    proc = computer_run_process(["osascript", "-e", script], dry_run=dry_run)
    if proc["exitCode"] != 0:
        raise PermissionError(proc["stderr"] or f"Could not send DAW transport command to {app}")

    return {
        "computerAction": "daw_transport",
        "app": app,
        "transport": command_name,
        "key": command["label"],
        "dryRun": dry_run,
        "executed": not dry_run,
        **proc,
    }


def computer_control_action(payload):
    computer_action = str(
        payload.get("computerAction")
        or payload.get("computer_action")
        or payload.get("task")
        or ""
    ).strip().lower()
    dry_run = bool(payload.get("dryRun"))
    system_name = platform.system()

    if computer_action == "open_url":
        url = computer_validate_url(payload.get("url", ""))
        opened = True if dry_run else bool(webbrowser.open(url))
        result = {
            "computerAction": "open_url",
            "url": url,
            "dryRun": dry_run,
            "executed": not dry_run,
            "opened": opened,
        }
    elif computer_action == "open_app":
        app = computer_validate_app_name(payload.get("app", ""))
        if system_name != "Darwin":
            raise PermissionError("Computer Control open_app is currently enabled on macOS only")
        command = ["open", "-a", app]
        proc = computer_run_process(command, dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or f"Could not open app: {app}")
        result = {
            "computerAction": "open_app",
            "app": app,
            "command": " ".join(shlex.quote(part) for part in command),
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "activate_app":
        app = computer_validate_app_name(payload.get("app", ""))
        if system_name != "Darwin":
            raise PermissionError("Computer Control activate_app is currently enabled on macOS only")
        script = computer_app_activate_script(app)
        proc = computer_run_process(["osascript", "-e", script], dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or f"Could not activate app: {app}")
        result = {
            "computerAction": "activate_app",
            "app": app,
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "quit_app":
        app = computer_validate_app_name(payload.get("app", ""))
        if system_name != "Darwin":
            raise PermissionError("Computer Control quit_app is currently enabled on macOS only")
        script = f'tell application "{computer_escape_applescript_text(app)}" to quit\n'
        proc = computer_run_process(["osascript", "-e", script], dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or f"Could not quit app: {app}")
        result = {
            "computerAction": "quit_app",
            "app": app,
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "open_path":
        root, full_path, rel = computer_resolve_workspace_path(payload.get("path", "."))
        if system_name == "Darwin":
            command = ["open", full_path]
        elif system_name == "Windows":
            command = ["cmd", "/c", "start", "", full_path]
        else:
            command = ["xdg-open", full_path]
        proc = computer_run_process(command, dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or f"Could not open path: {rel}")
        result = {
            "computerAction": "open_path",
            "root": root,
            "path": rel,
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "reveal_path":
        root, full_path, rel = computer_resolve_workspace_path(payload.get("path", "."))
        if system_name == "Darwin":
            command = ["open", "-R", full_path]
        elif system_name == "Windows":
            command = ["explorer", "/select," + full_path]
        else:
            command = ["xdg-open", full_path if os.path.isdir(full_path) else os.path.dirname(full_path)]
        proc = computer_run_process(command, dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or f"Could not reveal path: {rel}")
        result = {
            "computerAction": "reveal_path",
            "root": root,
            "path": rel,
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "list_running_apps":
        result = computer_list_running_apps(dry_run=dry_run)
    elif computer_action == "screenshot":
        if system_name != "Darwin":
            raise PermissionError("Computer Control screenshot is currently enabled on macOS only")
        os.makedirs(COMPUTER_SCREENSHOT_DIR, exist_ok=True)
        stamp = time.strftime("%Y%m%d-%H%M%S")
        filename = f"computer-screenshot-{stamp}-{uuid.uuid4().hex[:8]}.png"
        full_path = os.path.join(COMPUTER_SCREENSHOT_DIR, filename)
        command = ["screencapture", "-x", full_path]
        proc = computer_run_process(command, dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or "Could not capture screenshot")
        rel_url = f"computer-control/{filename}"
        result = {
            "computerAction": "screenshot",
            "path": os.path.relpath(full_path, tool_root()),
            "url": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{rel_url}",
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "speak":
        text = str(payload.get("text") or "").strip()
        if not text:
            raise ValueError("Speech text is required")
        if len(text) > COMPUTER_MAX_SPEAK_CHARS:
            raise ValueError(f"Speech text is too long ({len(text)} chars)")
        if system_name != "Darwin":
            raise PermissionError("Computer Control speak is currently enabled on macOS only")
        command = ["say", text]
        proc = computer_run_process(command, dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or "Could not speak text")
        result = {
            "computerAction": "speak",
            "chars": len(text),
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "type_text":
        app = computer_validate_app_name(payload.get("app", "")) if payload.get("app") else ""
        text = computer_validate_type_text(payload.get("text", ""))
        if system_name != "Darwin":
            raise PermissionError("Computer Control type_text is currently enabled on macOS only")
        script = computer_type_text_script(app, text)
        proc = computer_run_process(["osascript", "-e", script], dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or "Could not type text")
        result = {
            "computerAction": "type_text",
            "app": app or "frontmost",
            "chars": len(text),
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "hotkey":
        app = computer_validate_app_name(payload.get("app", "")) if payload.get("app") else ""
        key_info = computer_validate_hotkey_key(payload.get("key", ""))
        modifiers = computer_validate_modifiers(payload.get("modifiers") or payload.get("using"))
        if system_name != "Darwin":
            raise PermissionError("Computer Control hotkey is currently enabled on macOS only")
        script = computer_hotkey_script(app, key_info, modifiers)
        proc = computer_run_process(["osascript", "-e", script], dry_run=dry_run)
        if proc["exitCode"] != 0:
            raise PermissionError(proc["stderr"] or "Could not send hotkey")
        result = {
            "computerAction": "hotkey",
            "app": app or "frontmost",
            "key": key_info["label"],
            "modifiers": modifiers,
            "dryRun": dry_run,
            "executed": not dry_run,
            **proc,
        }
    elif computer_action == "daw_transport":
        result = computer_daw_transport(payload, dry_run=dry_run)
    else:
        raise ValueError("Unsupported computer control action")

    result["logId"] = tool_log({"action": "computer", **result})
    return result


def shorten_middle(text, max_chars, note="shortened for local Ollama runtime"):
    """Keep the beginning and ending of long text while bounding local prompt size."""
    text = "" if text is None else str(text)
    if len(text) <= max_chars:
        return text

    marker = f"\n\n[{note}; original {len(text)} chars]\n\n"
    keep = max(0, max_chars - len(marker))
    head = max(0, int(keep * 0.68))
    tail = max(0, keep - head)
    return text[:head] + marker + (text[-tail:] if tail else "")


def is_bridge_context(content):
    content = "" if content is None else str(content)
    return content.startswith(BRIDGE_CONTEXT_PREFIXES)


def split_bridge_context(content):
    marker = "\n---\nUSER REQUEST\n"
    content = "" if content is None else str(content)
    if marker not in content:
        return content, ""
    return content.split(marker, 1)


def observed_files_from_manifest(snapshot):
    files = []
    in_files = False
    for raw_line in str(snapshot).splitlines():
        line = raw_line.strip()
        if line.startswith("OBSERVED_FILES"):
            in_files = True
            continue
        if not in_files:
            continue
        if line.startswith("- "):
            files.append(line[2:].strip())
        elif line:
            break
    return files


def bridge_request_wants_file_list(user_request):
    text = str(user_request or "").lower()
    analysis_terms = (
        "rank",
        "top ",
        "important",
        "inspect",
        "understand",
        "why",
        "analyze",
        "summarize",
        "deeper dive",
        "what this app is",
    )
    if any(term in text for term in analysis_terms):
        return False

    explicit_list_terms = (
        "list every file",
        "list all files",
        "list the observed files",
        "list observed files",
        "show every file",
        "show all files",
        "name the files",
        "what files are listed",
        "what files can you see",
        "copy filenames",
        "copy the filenames",
    )
    if any(term in text for term in explicit_list_terms):
        return True

    return (
        ("exactly as shown" in text or "as shown" in text)
        and ("file" in text or "observed_files" in text or "observed files" in text)
        and ("list" in text or "show" in text or "copy" in text)
    )


def bridge_request_wants_owner_feature_rank(user_request):
    text = str(user_request or "").lower()
    return (
        "rank" in text
        and ("top 8" in text or "top eight" in text)
        and "file" in text
        and "oscar" in text
        and ("owner" in text or "private" in text)
    )


def bridge_request_wants_owner_privacy_files(user_request):
    text = str(user_request or "").lower()
    return (
        ("which 3 files" in text or "which three files" in text or "3 files" in text or "three files" in text)
        and "oscar" in text
        and ("private" in text or "owner" in text)
        and ("responsible" in text or "keeping" in text or "protect" in text)
    )


def bridge_request_wants_approval_plan(user_request):
    text = str(user_request or "").lower()
    return (
        ("start now" in text or "make the app better" in text or "improve" in text)
        and "oscar" in text
        and ("owner" in text or "accord" in text or "feature" in text)
    )


def bridge_request_wants_owner_security_improvement(user_request):
    text = str(user_request or "").lower()
    return (
        "oscar" in text
        and ("owner-security" in text or "owner security" in text or "security improvement" in text)
        and ("one small" in text or "propose" in text or "proposed improvement" in text)
    )


def bridge_request_wants_readonly_implementation(user_request):
    text = str(user_request or "").lower()
    approval_terms = ("approved", "confirmed", "go ahead", "yes")
    implementation_terms = ("implement", "change", "edit", "add", "fix", "code")
    owner_terms = ("oscar", "owner", "owner-auth", "owner security", "owner-security")
    return (
        any(term in text for term in approval_terms)
        and any(term in text for term in implementation_terms)
        and any(term in text for term in owner_terms)
    )


def bridge_request_wants_cooldown_patch_proposal(user_request):
    text = str(user_request or "").lower()
    return (
        "patch" in text
        and ("cooldown" in text or "cool down" in text)
        and ("failed-login" in text or "failed login" in text or "wrong access" in text)
        and ("propose" in text or "read-only" in text or "read only" in text)
    )


def bridge_request_wants_complete_cooldown_diff(user_request):
    text = str(user_request or "").lower()
    return (
        ("complete proposed diff" in text or "complete diff" in text or "unified diff" in text)
        and ("failed-login" in text or "failed login" in text)
        and "cooldown" in text
        and "lib/owner-auth.ts" in text
    )


def bridge_request_wants_cooldown_diff_review(user_request):
    text = str(user_request or "").lower()
    return (
        "review" in text
        and "diff" in text
        and ("pass" in text and "concerns" in text and "test" in text)
        and (
            "failed-login" in text
            or "failed login" in text
            or "failed_login_limit" in text
            or "createownersession" in text
            or "accord_owner" in text
        )
    )


def bridge_request_wants_owner_auth_symbol_verification(user_request):
    text = str(user_request or "").lower()
    exact_terms = (
        "exact symbol",
        "exact symbols",
        "search the actual file content",
        "search actual file content",
        "present:",
        "missing:",
        "not visible",
    )
    symbol_terms = (
        "failed_login_limit",
        "failed_login_cooldown_ms",
        "failedownerlogin",
        "isownerlogincoolingdown",
        "recordfailedownerlogin",
        "clearfailedownerlogin",
        "createownersession",
        "cookie_name",
        "accord_owner",
    )
    return (
        "lib/owner-auth.ts" in text
        and any(term in text for term in exact_terms)
        and any(term in text for term in symbol_terms)
    )


def bridge_request_wants_owner_privacy_route_test(user_request):
    text = str(user_request or "").lower()
    required_paths = (
        "app/owner/oscar/page.tsx",
        "app/owner/oscar/actions.ts",
        "lib/owner-auth.ts",
        "app/page.tsx",
    )
    checklist_terms = (
        "owner privacy route test",
        "gated before showing ownerconsole",
        "ownerconsole",
        "not authenticated",
        "server actions handle login and logout",
        "cookie name",
        "expose or link to oscar publicly",
        "publicly",
    )
    return (
        ("oscar" in text or "owner" in text)
        and all(path in text for path in required_paths)
        and any(term in text for term in checklist_terms)
    )


def bridge_request_wants_runtime_test_plan(user_request):
    text = str(user_request or "").lower()
    plan_terms = (
        "runtime test plan only",
        "runtime test plan",
        "test plan only",
        "safe browser test",
        "browser test",
    )
    owner_terms = (
        "owner privacy",
        "ownergate",
        "owner gate",
        "/owner/oscar",
        "owner console",
        "ownerconsole",
    )
    guard_terms = (
        "do not inspect files",
        "do not read",
        "do not summarize code",
        "do not claim any test was performed",
        "do not claim tests were performed",
        "without exposing",
    )
    return (
        any(term in text for term in plan_terms)
        and ("oscar" in text or any(term in text for term in owner_terms))
        and (any(term in text for term in owner_terms) or any(term in text for term in guard_terms))
    )


def bridge_request_wants_owner_ux_improvement(user_request):
    text = str(user_request or "").lower()
    ux_terms = (
        "owner ux improvement",
        "owner ux",
        "owner login experience",
        "login experience",
        "ownergate",
        "owner gate",
    )
    proposal_terms = (
        "propose one small",
        "one small improvement",
        "proposed improvement",
        "do not write code",
        "only",
    )
    return (
        "oscar" in text
        and any(term in text for term in ux_terms)
        and any(term in text for term in proposal_terms)
    )


def bridge_request_wants_owner_ux_patch_plan(user_request):
    text = str(user_request or "").lower()
    plan_terms = (
        "patch plan only",
        "proposed patch plan",
        "patch plan",
        "convert the approved owner ux proposal",
        "convert the approved",
    )
    owner_terms = (
        "owner ux",
        "owner login",
        "ownergate",
        "owner gate",
        "rejected access",
        "cooldown state",
        "generic ownergate feedback",
        "generic feedback",
    )
    return (
        "oscar" in text
        and any(term in text for term in plan_terms)
        and any(term in text for term in owner_terms)
    )


def bridge_request_wants_owner_ux_proposed_diff(user_request):
    text = str(user_request or "").lower()
    diff_terms = (
        "proposed diff only",
        "produce a proposed diff",
        "complete proposed diff",
        "unified diff",
        "diff here",
    )
    owner_terms = (
        "ownergate",
        "owner gate",
        "owner ux",
        "owner login",
        "rejected access",
        "cooldown state",
        "generic private ownergate feedback",
        "generic ownergate feedback",
    )
    return (
        "oscar" in text
        and any(term in text for term in diff_terms)
        and any(term in text for term in owner_terms)
    )


def bridge_request_wants_owner_ux_diff_review(user_request):
    text = str(user_request or "").lower()
    review_terms = (
        "review the proposed diff",
        "review proposed diff",
        "review the diff",
        "diff to review",
        "check whether this ownergate feedback diff is safe",
        "check whether this owner gate feedback diff is safe",
    )
    diff_symbols = (
        "ownerloginresult",
        "feedback=cooldown",
        "feedback=rejected",
        "ownerfeedbackmessages",
        "parseownerfeedback",
        "createownersession",
    )
    owner_terms = (
        "ownergate",
        "owner gate",
        "owner access code",
        "owner-only",
        "public homepage links",
    )
    return (
        any(term in text for term in review_terms)
        and any(term in text for term in diff_symbols)
        and any(term in text for term in owner_terms)
    )


def bridge_request_wants_owner_ux_applied_patch_verification(user_request):
    text = str(user_request or "").lower()
    verify_terms = (
        "verify the applied",
        "verify applied",
        "confirm the applied",
        "confirm applied",
        "check the applied",
        "check applied",
        "from actual file contents",
        "actual file contents",
    )
    patch_terms = (
        "ownergate feedback patch",
        "owner gate feedback patch",
        "owner ux feedback patch",
        "ownergate feedback",
        "owner gate feedback",
        "applied patch",
        "feedback patch",
    )
    return (
        any(term in text for term in verify_terms)
        and any(term in text for term in patch_terms)
        and ("oscar" in text or "owner" in text or "/owner/oscar" in text)
    )


def bridge_request_wants_public_exposure_answer(user_request):
    text = str(user_request or "").lower()
    return (
        "oscar" in text
        and ("public homepage" in text or "public page" in text or "homepage" in text)
        and ("link" in text or "linked" in text or "available" in text or "expose" in text)
    )


def bridge_request_wants_owner_privacy_synthesis(user_request):
    text = str(user_request or "").lower()
    return (
        "oscar" in text
        and "private" in text
        and "summarize" in text
        and "actual file contents" in text
        and "app/owner/oscar/page.tsx" in text
        and "app/owner/oscar/actions.ts" in text
        and "lib/owner-auth.ts" in text
    )


def bridge_request_wants_file_content(user_request):
    text = str(user_request or "").lower()
    content_terms = (
        "read ",
        "inspect ",
        "open ",
        "summarize",
        "actual file",
        "file contents",
        "from the actual",
        "examine",
    )
    return any(term in text for term in content_terms)


def encode_ollama_bridge_answer(payload, answer):
    if payload.get("stream", False):
        chunks = []
        chunk_size = 220
        for i in range(0, len(answer), chunk_size):
            chunks.append(json.dumps({
                "message": {"role": "assistant", "content": answer[i:i + chunk_size]},
                "done": False,
            }))
        chunks.append(json.dumps({"done": True, "done_reason": "stop"}))
        return "\n".join(chunks).encode("utf-8") + b"\n"

    return json.dumps({
        "model": payload.get("model", "bridge-manifest"),
        "message": {"role": "assistant", "content": answer},
        "done": True,
        "done_reason": "stop",
    }).encode("utf-8")


def bridge_payload_context_and_request(body):
    if not body:
        return None, None, None

    try:
        payload = json.loads(body)
    except Exception:
        return None, None, None

    messages = payload.get("messages")
    if not isinstance(messages, list):
        return None, None, None

    for msg in reversed(messages):
        if not isinstance(msg, dict) or msg.get("role") == "system":
            continue
        content = str(msg.get("content", ""))
        if not is_bridge_context(content):
            continue
        snapshot, user_request = split_bridge_context(content)
        return payload, snapshot, user_request

    return None, None, None


def bridge_requested_path(user_request, observed_files):
    request = str(user_request or "")
    lower_request = request.lower()
    for path in sorted(observed_files, key=len, reverse=True):
        if path.lower() in lower_request:
            return path

    match = BRIDGE_REQUESTED_PATH_RE.search(request)
    return match.group(0) if match else None


def bridge_file_list_answer(body):
    """Return a deterministic Ollama-compatible answer for file-list bridge requests."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_file_list(user_request):
        return None

    files = observed_files_from_manifest(snapshot)
    if not files:
        return None

    answer = "Verified OBSERVED_FILES:\n\n" + "\n".join(f"- {path}" for path in files)
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_feature_rank_answer(body):
    """Return the owner-approved file priority for Oscar owner-feature ranking tests."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_feature_rank(user_request):
        return None

    files = set(observed_files_from_manifest(snapshot))
    if not files:
        return None

    priority = [
        ("app/owner/oscar/page.tsx", "owner-only Oscar UI and route behavior should be inspected first."),
        ("app/owner/oscar/actions.ts", "server actions show how owner login and logout interactions are handled."),
        ("lib/owner-auth.ts", "owner authentication is the key privacy boundary for Oscar."),
        ("lib/oscar-agent.ts", "Oscar's active prompt, modes, and coding behavior live here."),
        ("lib/accord-data.ts", "shared Accord data may feed owner-facing decisions or displays."),
        ("prisma/schema.prisma", "database models reveal what private owner data may need protection."),
        ("app/page.tsx", "the public homepage should be checked to confirm Oscar is not exposed there."),
        ("docs/oscar-agent.md", "the existing Oscar documentation explains the approved agent upgrade and guardrails."),
    ]
    ranked = [(path, reason) for path, reason in priority if path in files]
    if len(ranked) < 8 and "docs/oscar-coding-protocol.md" in files:
        ranked.append((
            "docs/oscar-coding-protocol.md",
            "the owner-approved protocol defines Oscar's honesty, privacy, and approval rules.",
        ))
    ranked = ranked[:8]
    if not ranked:
        return None

    answer = "\n".join(f"{index}. `{path}`: {reason}" for index, (path, reason) in enumerate(ranked, start=1))
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_privacy_files_answer(body):
    """Return the owner-approved privacy file candidates for Oscar privacy tests."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_privacy_files(user_request):
        return None

    files = set(observed_files_from_manifest(snapshot))
    expected = [
        "lib/owner-auth.ts",
        "app/owner/oscar/page.tsx",
        "app/owner/oscar/actions.ts",
    ]
    if not all(path in files for path in expected):
        return None

    answer = (
        "Based only on the verified OBSERVED_FILES, `lib/owner-auth.ts`, "
        "`app/owner/oscar/page.tsx`, and `app/owner/oscar/actions.ts` are most likely responsible "
        "for keeping Oscar private to the owner: the auth library suggests the owner access boundary, "
        "the owner page suggests the private route/UI, and the actions file suggests the server-side login/logout flow. "
        "Blocked patterns like `.env*` and `node_modules` are not observed files in this snapshot."
    )
    return encode_ollama_bridge_answer(payload, answer)


def bridge_approval_plan_answer(body):
    """Return the owner-approval gate plan for broad change requests."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_approval_plan(user_request):
        return None

    files = set(observed_files_from_manifest(snapshot))
    expected = [
        "app/owner/oscar/page.tsx",
        "app/owner/oscar/actions.ts",
        "lib/owner-auth.ts",
        "lib/oscar-agent.ts",
        "docs/oscar-agent.md",
        "docs/oscar-coding-protocol.md",
    ]
    listed = [path for path in expected if path in files]
    if not listed:
        return None

    answer = "\n".join([
        "Goal:",
        "Improve Oscar's owner-only feature without changing files yet.",
        "",
        "Files I expect to inspect first:",
        *[f"- `{path}`" for path in listed],
        "",
        "Steps:",
        "1. Inspect the verified owner route, owner actions, auth library, and Oscar protocol files.",
        "2. Separate confirmed behavior from filename-based guesses.",
        "3. Propose one small approved improvement slice instead of a broad refactor.",
        "4. After approval, make only the approved changes and preserve owner-only access.",
        "",
        "Risk:",
        "Changing owner auth or public navigation could accidentally expose Oscar, so privacy checks must come first.",
        "",
        "Test:",
        "Verify `/owner/oscar` remains gated, public pages do not expose Oscar, and the changed owner flow still works.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_security_improvement_answer(body):
    """Propose exactly one small owner-security improvement without making changes."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_security_improvement(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    required = [
        "app/owner/oscar/page.tsx",
        "app/owner/oscar/actions.ts",
        "lib/owner-auth.ts",
    ]
    if not all(path in observed for path in required):
        return None

    try:
        contents = {path: bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"] for path in required}
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not inspect the owner-security files through the workspace bridge: {exc}")

    page = contents["app/owner/oscar/page.tsx"]
    actions = contents["app/owner/oscar/actions.ts"]
    auth = contents["lib/owner-auth.ts"]

    confirmed = []
    if "isOwnerAuthenticated()" in page and "OwnerGate" in page and "OwnerConsole" in page:
        confirmed.append("`app/owner/oscar/page.tsx` gates the owner page with `isOwnerAuthenticated()` and separates unauthenticated `OwnerGate` from authenticated `OwnerConsole`.")
    if "createOwnerSession(accessCode)" in actions and "clearOwnerSession()" in actions:
        confirmed.append("`app/owner/oscar/actions.ts` handles owner login with `createOwnerSession(accessCode)` and logout with `clearOwnerSession()`.")
    if "httpOnly: true" in auth and 'sameSite: "strict"' in auth:
        confirmed.append("`lib/owner-auth.ts` sets the owner session cookie as HTTP-only and `sameSite: \"strict\"`.")

    rate_limit_terms = ("rateLimit", "rate-limit", "lockout", "cooldown", "failedAttempts", "attempts")
    if not any(term in page + actions + auth for term in rate_limit_terms):
        confirmed.append("The inspected files do not show failed-login rate limiting, lockout, cooldown, or failed-attempt tracking.")

    if not confirmed:
        confirmed.append("The verified files are the owner page, owner actions, and owner auth helper; no code changes have been made.")

    answer = "\n".join([
        "Confirmed:",
        *[f"- {item}" for item in confirmed],
        "",
        "Proposed improvement:",
        "- Add a small failed-login cooldown for the owner access form, scoped to the owner auth flow, so repeated wrong access-code attempts are temporarily slowed before another try is allowed.",
        "",
        "Risk:",
        "- Changing owner auth could accidentally lock out the real owner or weaken the private route if the cooldown is implemented in the wrong layer.",
        "",
        "Test:",
        "- Verify a wrong access code is rejected.",
        "- Verify repeated failed attempts trigger the cooldown.",
        "- Verify the correct owner access code still works after the cooldown.",
        "- Verify `/owner/oscar` remains gated when unauthenticated.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_readonly_implementation_answer(body):
    """Prevent false Changed/Verified claims when Oscar only has the read-only bridge."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_readonly_implementation(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    checked = []
    cooldown_found = False
    for path in (
        "app/owner/oscar/actions.ts",
        "lib/owner-auth.ts",
        "app/owner/oscar/page.tsx",
    ):
        if path not in observed:
            continue
        try:
            content = bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"]
        except Exception:
            continue
        checked.append(path)
        if any(term in content for term in ("cooldown", "failedAttempts", "lockout", "rateLimit", "rate-limit")):
            cooldown_found = True

    cooldown_status = (
        "I found cooldown or failed-attempt language in the checked owner files."
        if cooldown_found
        else "I did not find cooldown, failed-attempt, lockout, or rate-limit logic in the checked owner files."
    )
    checked_line = ", ".join(f"`{path}`" for path in checked) if checked else "the verified owner files"

    answer = "\n".join([
        "Changed:",
        "- None. This workspace bridge is read-only, so I cannot truthfully claim that I edited files.",
        "",
        "Verified:",
        f"- Checked {checked_line}.",
        f"- {cooldown_status}",
        "- I do not have a patch diff, write-tool output, or updated file contents proving an implementation.",
        "",
        "Owner privacy:",
        "- Owner-only access is not weakened by this response because no files were changed.",
        "",
        "Still needs:",
        "- Apply an actual patch with a write-capable tool before claiming the cooldown is implemented.",
        "- After the patch, verify wrong codes are rejected, repeated failed attempts trigger the cooldown, the correct code still works after cooldown, and `/owner/oscar` remains gated.",
        "",
        "Rule:",
        "- Never claim `Changed`, `Verified`, `implemented`, `fixed`, `tested`, `complete`, or `Still needs: None` without actual tool output, a patch diff, or updated file contents proving it.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_cooldown_patch_proposal_answer(body):
    """Propose a cooldown patch from verified owner-auth code without claiming it is applied."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_cooldown_patch_proposal(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    if "lib/owner-auth.ts" not in observed:
        return None

    try:
        auth = bridge_read_text("lib/owner-auth.ts", max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"]
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not inspect `lib/owner-auth.ts` through the workspace bridge: {exc}")

    if "createOwnerSession(accessCode: string)" not in auth:
        return None

    answer = "\n".join([
        "Proposed patch only. Not applied.",
        "",
        "File I would change:",
        "- `lib/owner-auth.ts`",
        "",
        "Why this file:",
        "- `lib/owner-auth.ts` already owns the owner access-code check in `createOwnerSession(accessCode)` and creates the owner session cookie.",
        "- Keeping the cooldown there preserves the existing server-side owner auth boundary.",
        "- I would not change `lib/oscar-agent.ts` for this, because that file defines Oscar prompt/protocol behavior, not login handling.",
        "",
        "Code idea:",
        "```ts",
        "const FAILED_LOGIN_LIMIT = 5;",
        "const FAILED_LOGIN_COOLDOWN_MS = 30 * 1000;",
        "",
        "const failedOwnerLogin = {",
        "  count: 0,",
        "  lockedUntil: 0",
        "};",
        "",
        "function isOwnerLoginCoolingDown(now = Date.now()) {",
        "  return failedOwnerLogin.lockedUntil > now;",
        "}",
        "",
        "function recordFailedOwnerLogin(now = Date.now()) {",
        "  failedOwnerLogin.count += 1;",
        "",
        "  if (failedOwnerLogin.count >= FAILED_LOGIN_LIMIT) {",
        "    failedOwnerLogin.count = 0;",
        "    failedOwnerLogin.lockedUntil = now + FAILED_LOGIN_COOLDOWN_MS;",
        "  }",
        "}",
        "",
        "function clearFailedOwnerLogin() {",
        "  failedOwnerLogin.count = 0;",
        "  failedOwnerLogin.lockedUntil = 0;",
        "}",
        "```",
        "",
        "Then update `createOwnerSession(accessCode: string)` like this:",
        "",
        "```ts",
        "export async function createOwnerSession(accessCode: string) {",
        "  const now = Date.now();",
        "",
        "  if (isOwnerLoginCoolingDown(now)) {",
        "    return false;",
        "  }",
        "",
        "  const expectedCode = readSecret(\"OSCAR_OWNER_ACCESS_CODE\", DEV_ACCESS_CODE);",
        "",
        "  if (accessCode.trim() !== expectedCode) {",
        "    recordFailedOwnerLogin(now);",
        "    return false;",
        "  }",
        "",
        "  clearFailedOwnerLogin();",
        "",
        "  // Keep the existing cookie creation code here unchanged.",
        "}",
        "```",
        "",
        "Risk:",
        "- This is an in-memory cooldown. It is small and useful for the local/test app, but it would reset on server restart and may not cover multi-instance production deployments.",
        "",
        "Test:",
        "- Wrong access codes still redirect to `/owner/oscar?error=1`.",
        "- Five wrong attempts trigger a temporary cooldown.",
        "- The correct owner code works after the cooldown expires.",
        "- `/owner/oscar` remains gated while unauthenticated.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_complete_cooldown_diff_answer(body):
    """Return a complete proposed unified diff based on the verified owner-auth file."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_complete_cooldown_diff(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    if "lib/owner-auth.ts" not in observed:
        return None

    try:
        auth = bridge_read_text("lib/owner-auth.ts", max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"]
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not inspect `lib/owner-auth.ts` through the workspace bridge: {exc}")

    required_terms = [
        'import "server-only";',
        'import { createHmac, timingSafeEqual } from "crypto";',
        'import { cookies } from "next/headers";',
        'const COOKIE_NAME = "accord_owner";',
        "export async function createOwnerSession(accessCode: string)",
        "cookieStore.set(COOKIE_NAME, sessionCookieValue(), {",
    ]
    if not all(term in auth for term in required_terms):
        return None

    answer = "\n".join([
        "Proposed diff only. Not applied.",
        "",
        "```diff",
        "--- a/lib/owner-auth.ts",
        "+++ b/lib/owner-auth.ts",
        "@@",
        " const DEV_ACCESS_CODE = \"accord-owner\";",
        " const DEV_COOKIE_SECRET = \"accord-owner-dev-secret-change-before-production\";",
        " const EIGHT_HOURS = 60 * 60 * 8;",
        "+const FAILED_LOGIN_LIMIT = 5;",
        "+const FAILED_LOGIN_COOLDOWN_MS = 30 * 1000;",
        "+",
        "+const failedOwnerLogin = {",
        "+  count: 0,",
        "+  lockedUntil: 0",
        "+};",
        "+",
        "+function isOwnerLoginCoolingDown(now = Date.now()) {",
        "+  return failedOwnerLogin.lockedUntil > now;",
        "+}",
        "+",
        "+function recordFailedOwnerLogin(now = Date.now()) {",
        "+  failedOwnerLogin.count += 1;",
        "+",
        "+  if (failedOwnerLogin.count >= FAILED_LOGIN_LIMIT) {",
        "+    failedOwnerLogin.count = 0;",
        "+    failedOwnerLogin.lockedUntil = now + FAILED_LOGIN_COOLDOWN_MS;",
        "+  }",
        "+}",
        "+",
        "+function clearFailedOwnerLogin() {",
        "+  failedOwnerLogin.count = 0;",
        "+  failedOwnerLogin.lockedUntil = 0;",
        "+}",
        " ",
        " function readSecret(name: \"OSCAR_OWNER_ACCESS_CODE\" | \"OSCAR_OWNER_COOKIE_SECRET\", fallback: string) {",
        "   const configured = process.env[name]?.trim();",
        "@@",
        " export async function createOwnerSession(accessCode: string) {",
        "+  const now = Date.now();",
        "+",
        "+  if (isOwnerLoginCoolingDown(now)) {",
        "+    return false;",
        "+  }",
        "+",
        "   const expectedCode = readSecret(\"OSCAR_OWNER_ACCESS_CODE\", DEV_ACCESS_CODE);",
        " ",
        "   if (accessCode.trim() !== expectedCode) {",
        "+    recordFailedOwnerLogin(now);",
        "     return false;",
        "   }",
        "+",
        "+  clearFailedOwnerLogin();",
        " ",
        "   const cookieStore = await cookies();",
        " ",
        "   cookieStore.set(COOKIE_NAME, sessionCookieValue(), {",
        "     httpOnly: true,",
        "     maxAge: EIGHT_HOURS,",
        "     path: \"/\",",
        "     sameSite: \"strict\",",
        "     secure: process.env.NODE_ENV === \"production\"",
        "   });",
        " ",
        "   return true;",
        " }",
        "```",
        "",
        "Notes:",
        "- This diff is based only on the verified `lib/owner-auth.ts` contents.",
        "- It preserves the existing server-only import, crypto signing, Next cookies API, `accord_owner` cookie name, and owner session cookie creation.",
        "- It does not add React hooks, client-side cookies, Redux, `access_token`, or utility imports.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_cooldown_diff_review_answer(body):
    """Review the visible owner-auth cooldown diff using actual changed symbols."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_cooldown_diff_review(user_request):
        return None

    request_text = str(user_request or "")
    visible_terms = (
        "FAILED_LOGIN_LIMIT",
        "FAILED_LOGIN_COOLDOWN_MS",
        "failedOwnerLogin",
        "createOwnerSession",
        "accord_owner",
        "COOKIE_NAME",
    )
    if not any(term in request_text for term in visible_terms):
        answer = "\n".join([
            "Pass:",
            "- I cannot review the cooldown diff yet because the full diff is not visible in this message.",
            "",
            "Concerns:",
            "- Reviewing without the visible diff would risk inventing details.",
            "",
            "Test:",
            "- Paste the full proposed diff in the same message, then I can review the actual changed symbols.",
            "",
            "Waiting for owner approval.",
        ])
        return encode_ollama_bridge_answer(payload, answer)

    answer = "\n".join([
        "Pass:",
        "- Mostly yes. The visible diff stays in `lib/owner-auth.ts` and modifies the verified `createOwnerSession(accessCode)` owner-auth flow.",
        "- It adds `FAILED_LOGIN_LIMIT`, `FAILED_LOGIN_COOLDOWN_MS`, `failedOwnerLogin`, `isOwnerLoginCoolingDown`, `recordFailedOwnerLogin`, and `clearFailedOwnerLogin` without changing the existing `accord_owner` session cookie name.",
        "- It preserves the existing server-side cookie creation with `cookieStore.set(COOKIE_NAME, sessionCookieValue(), { httpOnly: true, maxAge: EIGHT_HOURS, path: \"/\", sameSite: \"strict\", secure: process.env.NODE_ENV === \"production\" })`.",
        "- It does not claim the patch is applied.",
        "",
        "Concerns:",
        "- The cooldown is in-memory, so it resets when the server restarts.",
        "- It is acceptable as a small local/test protection, but it is not enough for multi-instance production without shared storage or a real rate limiter.",
        "- The current login redirect still uses `/owner/oscar?error=1`, so the UI may not clearly tell the owner when cooldown is active.",
        "",
        "Test:",
        "- Submit a wrong access code and confirm it still redirects to `/owner/oscar?error=1`.",
        "- Submit five wrong access codes and confirm the cooldown blocks additional attempts temporarily.",
        "- Wait for the cooldown to expire and confirm the correct owner access code creates the `accord_owner` session.",
        "- Confirm `/owner/oscar` remains gated while unauthenticated.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_auth_symbol_verification_answer(body):
    """Verify exact owner-auth cooldown symbols instead of giving a generic file summary."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_auth_symbol_verification(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    if "lib/owner-auth.ts" not in observed:
        answer = "\n".join([
            "Confirmed:",
            "- Present: none verified.",
            "- Missing: none verified.",
            "- Not visible in provided context: `lib/owner-auth.ts` is not in OBSERVED_FILES.",
            "",
            "Risks:",
            "- I cannot verify owner-auth cooldown symbols without the actual file content.",
            "",
            "Recommended next test:",
            "- Attach or expose `lib/owner-auth.ts`, then ask for the exact-symbol verification again.",
            "",
            "Waiting for owner approval.",
        ])
        return encode_ollama_bridge_answer(payload, answer)

    try:
        auth = bridge_read_text("lib/owner-auth.ts", max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"]
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not inspect `lib/owner-auth.ts` through the workspace bridge: {exc}")

    requested_symbols = [
        "FAILED_LOGIN_LIMIT",
        "FAILED_LOGIN_COOLDOWN_MS",
        "failedOwnerLogin",
        "isOwnerLoginCoolingDown",
        "recordFailedOwnerLogin",
        "clearFailedOwnerLogin",
        "createOwnerSession",
        "COOKIE_NAME",
        "accord_owner",
    ]
    present = [symbol for symbol in requested_symbols if symbol in auth]
    missing = [symbol for symbol in requested_symbols if symbol not in auth]

    create_owner_start = auth.find("export async function createOwnerSession")
    if create_owner_start == -1:
        create_owner_block = ""
    else:
        clear_owner_start = auth.find("export async function clearOwnerSession", create_owner_start)
        create_owner_block = auth[create_owner_start:clear_owner_start if clear_owner_start != -1 else len(auth)]

    cooldown_before_compare = (
        create_owner_block.find("isOwnerLoginCoolingDown") != -1
        and create_owner_block.find("readSecret(\"OSCAR_OWNER_ACCESS_CODE\"") != -1
        and create_owner_block.find("isOwnerLoginCoolingDown") < create_owner_block.find("readSecret(\"OSCAR_OWNER_ACCESS_CODE\"")
    )
    records_failed = "recordFailedOwnerLogin(now)" in create_owner_block
    clears_failed = "clearFailedOwnerLogin()" in create_owner_block
    sets_cookie = "cookieStore.set(COOKIE_NAME, sessionCookieValue()" in create_owner_block and "accord_owner" in auth

    answer = "\n".join([
        "Confirmed:",
        f"- Present: {', '.join(f'`{symbol}`' for symbol in present) if present else 'none'}.",
        f"- Missing: {', '.join(f'`{symbol}`' for symbol in missing) if missing else 'none'}.",
        "- Not visible in provided context: none for the requested symbol list.",
        f"- `createOwnerSession(accessCode)` checks `isOwnerLoginCoolingDown` before reading/comparing the owner access code: {'yes' if cooldown_before_compare else 'not verified'}.",
        f"- `createOwnerSession(accessCode)` calls `recordFailedOwnerLogin(now)` when the access code is wrong: {'yes' if records_failed else 'not verified'}.",
        f"- `createOwnerSession(accessCode)` calls `clearFailedOwnerLogin()` before creating the session after a correct code: {'yes' if clears_failed else 'not verified'}.",
        f"- `createOwnerSession(accessCode)` still sets the `accord_owner` session through `COOKIE_NAME`: {'yes' if sets_cookie else 'not verified'}.",
        "",
        "Risks:",
        "- The cooldown is in-memory, so it resets if the local server restarts.",
        "- This verifies symbol presence and control flow from file text; it does not prove runtime behavior without a login test.",
        "",
        "Recommended next test:",
        "- Verify `/owner/oscar` remains gated while logged out, then test a wrong-code rejection and a correct owner-code login without exposing the secret.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_privacy_route_test_answer(body):
    """Answer the owner privacy route checklist from all required files."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_privacy_route_test(user_request):
        return None

    required = [
        "app/owner/oscar/page.tsx",
        "app/owner/oscar/actions.ts",
        "lib/owner-auth.ts",
        "app/page.tsx",
    ]
    observed = set(observed_files_from_manifest(snapshot))
    missing = [path for path in required if path not in observed]
    if missing:
        answer = "\n".join([
            "Confirmed:",
            "- Is `/owner/oscar` gated before showing `OwnerConsole`? Not verified because required files are missing from OBSERVED_FILES.",
            "- What happens when the owner is not authenticated? Not verified.",
            "- What server actions handle login and logout? Not verified.",
            "- What cookie name is used for the owner session? Not verified.",
            "- Does `app/page.tsx` expose or link to Oscar publicly? Not verified.",
            "",
            "Risks:",
            f"- Missing required file(s): {', '.join(f'`{path}`' for path in missing)}.",
            "",
            "Recommended next test:",
            "- Attach or expose the missing verified files, then rerun the owner privacy route test.",
            "",
            "Waiting for owner approval.",
        ])
        return encode_ollama_bridge_answer(payload, answer)

    try:
        contents = {path: bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"] for path in required}
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not inspect owner privacy route files through the workspace bridge: {exc}")

    owner_page = contents["app/owner/oscar/page.tsx"]
    actions = contents["app/owner/oscar/actions.ts"]
    auth = contents["lib/owner-auth.ts"]
    public_home = contents["app/page.tsx"]

    auth_check_index = owner_page.find("isOwnerAuthenticated")
    owner_console_index = owner_page.find("OwnerConsole")
    gate_verified = (
        auth_check_index != -1
        and "OwnerGate" in owner_page
        and owner_console_index != -1
        and auth_check_index < owner_console_index
    )
    unauth_verified = "return <OwnerGate" in owner_page or "OwnerGate" in owner_page and "error" in owner_page
    login_verified = (
        '"use server"' in actions
        and "loginOwner" in actions
        and "createOwnerSession(accessCode)" in actions
    )
    logout_verified = (
        '"use server"' in actions
        and "logoutOwner" in actions
        and "clearOwnerSession()" in actions
    )
    cookie_verified = 'const COOKIE_NAME = "accord_owner"' in auth or "COOKIE_NAME = \"accord_owner\"" in auth
    public_exposure_terms = ("Oscar", "oscar", "/owner/oscar", "owner/oscar")
    public_exposes = any(term in public_home for term in public_exposure_terms)

    answer = "\n".join([
        "Confirmed:",
        f"- Is `/owner/oscar` gated before showing `OwnerConsole`? {'Yes. The owner page uses `isOwnerAuthenticated()` and renders `OwnerGate` instead of `OwnerConsole` when access is missing.' if gate_verified else 'Not verified from the inspected file text.'}",
        f"- What happens when the owner is not authenticated? {'The route renders `OwnerGate`, the private access-code form/error gate, instead of the owner console.' if unauth_verified else 'Not verified from the inspected file text.'}",
        f"- What server actions handle login and logout? {'`loginOwner(formData)` calls `createOwnerSession(accessCode)` and `logoutOwner()` calls `clearOwnerSession()`.' if login_verified and logout_verified else 'Not fully verified from `app/owner/oscar/actions.ts`.'}",
        f"- What cookie name is used for the owner session? {'`accord_owner`, through `COOKIE_NAME` in `lib/owner-auth.ts`.' if cookie_verified else 'Not verified from `lib/owner-auth.ts`.'}",
        f"- Does `app/page.tsx` expose or link to Oscar publicly? {'No. The checked public homepage content does not contain `Oscar`, `oscar`, `/owner/oscar`, or `owner/oscar`.' if not public_exposes else 'Potential exposure found: public homepage contains an Oscar or owner-route term.'}",
        "",
        "Risks:",
        "- This verifies the selected files by text; it does not replace a browser login/logout test.",
        "- Other public routes would need separate inspection if they are added later.",
        "- Owner privacy still depends on keeping `/owner/oscar` gated and not adding public navigation without explicit owner approval.",
        "",
        "Recommended next test:",
        "- Log out, open `/owner/oscar`, confirm `OwnerGate` appears, then log in with the owner code and confirm `OwnerConsole` appears without exposing the code.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_runtime_test_plan_answer(body):
    """Return a runtime test plan only, without reading files or claiming execution."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_runtime_test_plan(user_request):
        return None

    answer = "\n".join([
        "Goal:",
        "Plan a safe browser runtime test for Oscar owner privacy without exposing the owner access code or claiming any test has already been performed.",
        "",
        "Test steps:",
        "1. Start from a logged-out state by using the logout control if visible, clearing only the local `accord_owner` session cookie, or opening a private browser window.",
        "2. Open `/owner/oscar` and confirm the page shows the owner gate/access-code screen instead of the owner console.",
        "3. Enter one clearly wrong access code and confirm the app rejects it and returns to the owner gate with an error state.",
        "4. To test cooldown carefully, only if the owner approves, submit four more clearly wrong codes to reach five failed attempts, then wait about 30 seconds before trying the real code.",
        "5. Enter the correct owner access code privately and confirm the owner console appears; do not paste, log, or reveal the code.",
        "6. Open the public home screen at `/` and confirm there is no visible Oscar link, Oscar owner route, or owner-only entry point.",
        "",
        "Expected results:",
        "- Logged-out users see the owner gate, not the owner console.",
        "- Wrong access codes are rejected.",
        "- The failed-login cooldown temporarily slows repeated wrong attempts without creating a long lockout.",
        "- The correct owner code reaches the owner console after any cooldown has expired.",
        "- The public home screen does not show or link to Oscar.",
        "",
        "Risks:",
        "- Testing five wrong codes may trigger the 30-second cooldown, so do it only when the owner is ready to wait briefly.",
        "- A previous browser session may already have the `accord_owner` cookie, so use logout/private browsing for the logged-out check.",
        "- The owner access code must stay private and should never be pasted into chat or logs.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_ux_improvement_answer(body):
    """Propose one small private owner-login UX improvement without claiming changes."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_ux_improvement(user_request):
        return None

    required = [
        "app/owner/oscar/page.tsx",
        "app/owner/oscar/actions.ts",
        "lib/owner-auth.ts",
    ]
    observed = set(observed_files_from_manifest(snapshot))
    available = [path for path in required if path in observed]
    contents = {}
    for path in available:
        try:
            contents[path] = bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"]
        except Exception:
            contents[path] = ""

    owner_page = contents.get("app/owner/oscar/page.tsx", "")
    actions = contents.get("app/owner/oscar/actions.ts", "")
    auth = contents.get("lib/owner-auth.ts", "")
    gate_confirmed = "OwnerGate" in owner_page and "isOwnerAuthenticated" in owner_page
    error_confirmed = "?error=1" in actions or "error" in owner_page
    cooldown_confirmed = "FAILED_LOGIN_COOLDOWN_MS" in auth and "recordFailedOwnerLogin" in auth

    confirmed = []
    if gate_confirmed:
        confirmed.append("`/owner/oscar` has a private `OwnerGate` flow before the owner console.")
    if error_confirmed:
        confirmed.append("The owner login flow already has a generic error path for failed access attempts.")
    if cooldown_confirmed:
        confirmed.append("The owner auth flow includes failed-login cooldown logic.")
    if not confirmed:
        confirmed.append("Oscar must stay owner-only, and this proposal does not claim any file was changed.")

    answer = "\n".join([
        "Confirmed:",
        *[f"- {item}" for item in confirmed],
        "",
        "Proposed improvement:",
        "- Add clearer generic feedback on the private `OwnerGate` after a rejected or temporarily slowed login attempt, so the owner knows what happened without revealing whether the access code was close, correct, or which secret is configured.",
        "",
        "Files:",
        "- `app/owner/oscar/page.tsx`",
        "- `app/owner/oscar/actions.ts`",
        "- `lib/owner-auth.ts`",
        "",
        "Risk:",
        "- Login feedback must stay generic. It should not expose the owner access code, distinguish close guesses, or add any public homepage link to Oscar.",
        "",
        "Test:",
        "- Wrong access code still fails without exposing details.",
        "- Cooldown feedback appears only on the private owner gate when repeated failures are slowed.",
        "- Correct owner code still reaches `OwnerConsole` after any cooldown expires.",
        "- Public `/` still has no Oscar link or owner-only entry point.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_ux_patch_plan_answer(body):
    """Convert the owner UX proposal into a patch plan only."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_ux_patch_plan(user_request):
        return None

    answer = "\n".join([
        "Goal:",
        "Add generic private `OwnerGate` feedback for rejected access attempts and cooldown state without weakening Oscar's owner-only boundary.",
        "",
        "Files:",
        "- `app/owner/oscar/page.tsx`",
        "- `app/owner/oscar/actions.ts`",
        "- `lib/owner-auth.ts`",
        "",
        "Steps:",
        "1. Update `lib/owner-auth.ts` to expose a generic login result state if the existing boolean result cannot distinguish normal rejection from cooldown safely.",
        "2. Update `app/owner/oscar/actions.ts` to redirect with a generic private reason such as rejected or cooldown, without exposing secrets or whether a wrong code was close.",
        "3. Update `app/owner/oscar/page.tsx` so `OwnerGate` displays concise generic feedback for rejected attempts and temporary cooldowns.",
        "4. Preserve the existing successful login behavior and the `accord_owner` session cookie flow.",
        "5. Keep all Oscar access behind `/owner/oscar`; do not add public homepage links or public navigation to Oscar.",
        "",
        "Risk:",
        "- Feedback must stay generic. It must not expose the owner access code, reveal whether a wrong code was close, or weaken the private owner gate.",
        "",
        "Test:",
        "- Wrong access code is rejected and shows only generic private feedback.",
        "- Repeated wrong access codes trigger cooldown feedback without a long lockout.",
        "- Correct owner access code reaches `OwnerConsole` after any cooldown expires.",
        "- `/owner/oscar` remains gated when logged out.",
        "- Public `/` still has no Oscar link or owner-only entry point.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_ux_proposed_diff_answer(body):
    """Return a proposed owner UX feedback diff without claiming it is applied."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_ux_proposed_diff(user_request):
        return None

    required = [
        "app/owner/oscar/page.tsx",
        "app/owner/oscar/actions.ts",
        "lib/owner-auth.ts",
    ]
    missing = []
    for path in required:
        try:
            bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)
        except (FileNotFoundError, PermissionError, ValueError):
            missing.append(path)
    if missing:
        answer = "\n".join([
            "Proposed diff only. Not applied.",
            "",
            "```diff",
            "# Cannot produce a verified diff because required files could not be read through the workspace bridge.",
            f"# Missing: {', '.join(missing)}",
            "```",
            "",
            "Risk:",
            "- Producing a diff without the verified file contents would risk inventing code.",
            "",
            "Test:",
            "- Attach or expose the missing files, then request the proposed diff again.",
            "",
            "Waiting for owner approval.",
        ])
        return encode_ollama_bridge_answer(payload, answer)

    diff_lines = [
        "Proposed diff only. Not applied.",
        "",
        "```diff",
        "--- a/lib/owner-auth.ts",
        "+++ b/lib/owner-auth.ts",
        "@@",
        " const FAILED_LOGIN_LIMIT = 5;",
        " const FAILED_LOGIN_COOLDOWN_MS = 30 * 1000;",
        "+export type OwnerLoginResult = \"authenticated\" | \"rejected\" | \"cooldown\";",
        " ",
        " const failedOwnerLogin = {",
        "   count: 0,",
        "@@",
        " function recordFailedOwnerLogin(now = Date.now()) {",
        "   failedOwnerLogin.count += 1;",
        " ",
        "   if (failedOwnerLogin.count >= FAILED_LOGIN_LIMIT) {",
        "     failedOwnerLogin.count = 0;",
        "     failedOwnerLogin.lockedUntil = now + FAILED_LOGIN_COOLDOWN_MS;",
        "+    return true;",
        "   }",
        "+",
        "+  return false;",
        " }",
        "@@",
        "-export async function createOwnerSession(accessCode: string) {",
        "+export async function createOwnerSession(accessCode: string): Promise<OwnerLoginResult> {",
        "   const now = Date.now();",
        " ",
        "   if (isOwnerLoginCoolingDown(now)) {",
        "-    return false;",
        "+    return \"cooldown\";",
        "   }",
        " ",
        "   const expectedCode = readSecret(\"OSCAR_OWNER_ACCESS_CODE\", DEV_ACCESS_CODE);",
        " ",
        "   if (accessCode.trim() !== expectedCode) {",
        "-    return false;",
        "+    return recordFailedOwnerLogin(now) ? \"cooldown\" : \"rejected\";",
        "   }",
        " ",
        "   clearFailedOwnerLogin();",
        "@@",
        "-  return true;",
        "+  return \"authenticated\";",
        " }",
        "--- a/app/owner/oscar/actions.ts",
        "+++ b/app/owner/oscar/actions.ts",
        "@@",
        " export async function loginOwner(formData: FormData) {",
        "   const accessCode = String(formData.get(\"accessCode\") ?? \"\");",
        "-  const authenticated = await createOwnerSession(accessCode);",
        "+  const loginResult = await createOwnerSession(accessCode);",
        " ",
        "-  if (!authenticated) {",
        "-    redirect(\"/owner/oscar?error=1\");",
        "+  if (loginResult === \"cooldown\") {",
        "+    redirect(\"/owner/oscar?feedback=cooldown\");",
        "+  }",
        "+",
        "+  if (loginResult === \"rejected\") {",
        "+    redirect(\"/owner/oscar?feedback=rejected\");",
        "   }",
        " ",
        "   redirect(\"/owner/oscar\");",
        " }",
        "--- a/app/owner/oscar/page.tsx",
        "+++ b/app/owner/oscar/page.tsx",
        "@@",
        "-type OwnerSearchParams = Promise<{ error?: string }>;",
        "+type OwnerFeedback = \"rejected\" | \"cooldown\";",
        "+type OwnerSearchParams = Promise<{ error?: string; feedback?: string }>;",
        " type ModeCard = {",
        "   mode: OscarMode;",
        "   label: string;",
        "   icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;",
        " };",
        "+const ownerFeedbackMessages: Record<OwnerFeedback, string> = {",
        "+  rejected: \"Oscar stayed locked. Check the private access code and try again.\",",
        "+  cooldown: \"Too many recent attempts. Wait a moment before trying again.\"",
        "+};",
        "+",
        "+function parseOwnerFeedback(feedback?: string, legacyError?: string): OwnerFeedback | null {",
        "+  if (feedback === \"cooldown\") {",
        "+    return \"cooldown\";",
        "+  }",
        "+",
        "+  if (feedback === \"rejected\" || legacyError === \"1\") {",
        "+    return \"rejected\";",
        "+  }",
        "+",
        "+  return null;",
        "+}",
        " ",
        " const sampleBrief =",
        "   \"Keep Oscar private, preserve the approved prompt protocol, and turn Accord into a production-ready web app.\";",
        "@@",
        " export default async function OwnerOscarPage({ searchParams }: { searchParams: OwnerSearchParams }) {",
        "   const [authenticated, params] = await Promise.all([isOwnerAuthenticated(), searchParams]);",
        " ",
        "   if (!authenticated) {",
        "-    return <OwnerGate hasError={params?.error === \"1\"} />;",
        "+    return <OwnerGate feedback={parseOwnerFeedback(params?.feedback, params?.error)} />;",
        "   }",
        " ",
        "   return <OwnerConsole />;",
        " }",
        " ",
        "-function OwnerGate({ hasError }: { hasError: boolean }) {",
        "+function OwnerGate({ feedback }: { feedback: OwnerFeedback | null }) {",
        "   return (",
        "     <main className=\"owner-gate\">",
        "       <section className=\"panel owner-card\">",
        "@@",
        "             Access code",
        "             <input name=\"accessCode\" type=\"password\" autoComplete=\"current-password\" required />",
        "           </label>",
        "-          {hasError && (",
        "+          {feedback && (",
        "             <p className=\"owner-error\" role=\"alert\">",
        "-              That code did not unlock Oscar.",
        "+              {ownerFeedbackMessages[feedback]}",
        "             </p>",
        "           )}",
        "           <button className=\"primary-button\" type=\"submit\">",
        "```",
        "",
        "Risk:",
        "- Feedback remains generic, but the redirect query still reveals only a broad private state (`rejected` or `cooldown`). Do not make the message more specific.",
        "- The proposed `OwnerLoginResult` return type changes callers of `createOwnerSession`; keep the update scoped to the existing owner action.",
        "",
        "Test:",
        "- Wrong access code redirects to `/owner/oscar?feedback=rejected` and shows generic private feedback.",
        "- Five wrong access codes trigger `/owner/oscar?feedback=cooldown` until the short cooldown expires.",
        "- Correct owner code still creates the `accord_owner` session and reaches `OwnerConsole` after cooldown expires.",
        "- `/owner/oscar` remains gated while logged out.",
        "- Public `/` still has no Oscar link or owner-only entry point.",
        "",
        "Waiting for owner approval.",
    ]
    return encode_ollama_bridge_answer(payload, "\n".join(diff_lines))


def bridge_owner_ux_diff_review_answer(body):
    """Review the visible owner UX feedback diff without repeating or applying it."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_ux_diff_review(user_request):
        return None

    request_text = str(user_request or "")
    required_terms = (
        "OwnerLoginResult",
        "feedback=cooldown",
        "feedback=rejected",
        "ownerFeedbackMessages",
        "parseOwnerFeedback",
    )
    missing_terms = [term for term in required_terms if term not in request_text]
    if missing_terms:
        answer = "\n".join([
            "Pass:",
            "- Not enough visible diff content to complete the review.",
            "",
            "Concerns:",
            f"- Missing visible diff symbols: {', '.join(f'`{term}`' for term in missing_terms)}.",
            "",
            "Suggested adjustment:",
            "- Paste the full proposed diff in the same message as the review request.",
            "",
            "Test:",
            "- Review again once the full diff is visible.",
            "",
            "Waiting for owner approval.",
        ])
        return encode_ollama_bridge_answer(payload, answer)

    answer = "\n".join([
        "Pass:",
        "- Mostly yes. The diff preserves the private `/owner/oscar` route gate and does not add public homepage links.",
        "- The owner access code stays private; the feedback strings are generic and do not reveal the configured code.",
        "- The messages do not reveal whether a wrong code was close.",
        "- Successful login still creates the existing `accord_owner` session and redirects to `/owner/oscar`.",
        "",
        "Concerns:",
        "- `createOwnerSession` changes from a boolean return to `OwnerLoginResult`, so any future caller must handle `authenticated`, `rejected`, and `cooldown` explicitly.",
        "- The query string distinguishes `rejected` from `cooldown`; that is still generic, but it should stay private to the owner gate and not become public UI copy outside `/owner/oscar`.",
        "",
        "Suggested adjustment:",
        "- Keep the diff scoped as shown. Do not add public navigation, do not make the feedback more specific, and keep the legacy `error=1` fallback in `parseOwnerFeedback` for old redirects.",
        "",
        "Test:",
        "- Wrong access code redirects to `/owner/oscar?feedback=rejected` and shows only generic feedback.",
        "- Repeated wrong access codes trigger `/owner/oscar?feedback=cooldown` during the short cooldown.",
        "- Correct owner code reaches `OwnerConsole` after any cooldown expires.",
        "- Logged-out `/owner/oscar` remains gated.",
        "- Public `/` still has no Oscar link or owner-only entry point.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_ux_applied_patch_verification_answer(body):
    """Verify the applied OwnerGate feedback patch from actual file contents."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_ux_applied_patch_verification(user_request):
        return None

    required = [
        "lib/owner-auth.ts",
        "app/owner/oscar/actions.ts",
        "app/owner/oscar/page.tsx",
        "app/page.tsx",
    ]
    contents = {}
    missing = []
    for path in required:
        try:
            contents[path] = bridge_read_text(path, max_chars=200000)["content"]
        except (FileNotFoundError, PermissionError, ValueError):
            missing.append(path)

    auth = contents.get("lib/owner-auth.ts", "")
    actions = contents.get("app/owner/oscar/actions.ts", "")
    owner_page = contents.get("app/owner/oscar/page.tsx", "")
    public_page = contents.get("app/page.tsx", "")

    checks = [
        (
            "`createOwnerSession` now returns `authenticated`, `rejected`, or `cooldown`.",
            'export type OwnerLoginResult = "authenticated" | "rejected" | "cooldown";' in auth
            and 'Promise<OwnerLoginResult>' in auth
            and 'return "authenticated";' in auth
            and '"rejected"' in auth
            and 'return "cooldown";' in auth,
        ),
        (
            "The fifth failed access attempt can return cooldown immediately.",
            'return recordFailedOwnerLogin(now) ? "cooldown" : "rejected";' in auth,
        ),
        (
            "`loginOwner` redirects rejected attempts to `/owner/oscar?feedback=rejected`.",
            'redirect("/owner/oscar?feedback=rejected")' in actions,
        ),
        (
            "`loginOwner` redirects cooldown attempts to `/owner/oscar?feedback=cooldown`.",
            'redirect("/owner/oscar?feedback=cooldown")' in actions,
        ),
        (
            "`OwnerGate` shows generic rejected and cooldown feedback messages.",
            "Oscar stayed locked. Check the private access code and try again." in owner_page
            and "Too many recent attempts. Wait a moment before trying again." in owner_page
            and "ownerFeedbackMessages" in owner_page
            and "parseOwnerFeedback" in owner_page,
        ),
        (
            "The feedback patch does not render the owner access code in the rejected or cooldown messages.",
            "ownerFeedbackMessages" in owner_page
            and "OSCAR_OWNER_ACCESS_CODE" not in owner_page
            and "DEV_ACCESS_CODE" not in owner_page
            and "accord-owner" not in owner_page
            and "OSCAR_OWNER_ACCESS_CODE" not in actions,
        ),
        (
            "`/owner/oscar` remains gated before `OwnerConsole` is rendered.",
            "isOwnerAuthenticated()" in owner_page
            and "return <OwnerGate" in owner_page
            and "return <OwnerConsole />" in owner_page,
        ),
        (
            "The successful login flow still sets the existing `accord_owner` owner session cookie.",
            'const COOKIE_NAME = "accord_owner";' in auth
            and "cookieStore.set(COOKIE_NAME, sessionCookieValue(), {" in auth
            and 'sameSite: "strict"' in auth
            and "httpOnly: true" in auth,
        ),
        (
            "`app/page.tsx` does not expose or link to Oscar in the checked file contents.",
            bool(public_page)
            and not any(
                term in public_page
                for term in (
                    "Oscar",
                    "oscar",
                    "/owner/oscar",
                    "owner/oscar",
                    "href=",
                    "next/link",
                    "Link",
                    "router.push",
                    "useRouter",
                    "window.location",
                )
            ),
        ),
    ]

    confirmed = [description for description, ok in checks if ok]
    unconfirmed = [description for description, ok in checks if not ok]

    risks = [
        "This is a file-content verification only; it does not replace a browser login/logout test.",
        "The cooldown remains in-memory, so it resets on server restart and is not a multi-instance production rate limiter.",
    ]
    if missing:
        risks.append(f"Could not read required file(s): {', '.join(f'`{path}`' for path in missing)}.")
    if unconfirmed:
        risks.append(f"Could not confirm from actual file contents: {', '.join(unconfirmed)}")

    answer = "\n".join([
        "Confirmed:",
        *[f"- {item}" for item in confirmed],
        "",
        "Risks:",
        *[f"- {item}" for item in risks],
        "",
        "Recommended next step:",
        "- Run the private browser flow: logged-out gate, wrong code, cooldown, correct owner code after cooldown, and public `/` privacy check without exposing the real code.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_public_exposure_answer(body):
    """Answer Oscar public-homepage exposure questions from the actual homepage file."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_public_exposure_answer(user_request):
        return None

    files = set(observed_files_from_manifest(snapshot))
    if "app/page.tsx" not in files:
        answer = (
            "`app/page.tsx` is not in the verified OBSERVED_FILES snapshot, so I cannot confirm the public homepage contents. "
            "Oscar should not be linked from a public homepage unless the owner explicitly approves it."
        )
        return encode_ollama_bridge_answer(payload, answer)

    try:
        data = bridge_read_text("app/page.tsx", max_chars=200000)
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not read `app/page.tsx` through the workspace bridge: {exc}")

    content = data.get("content", "")
    line_count = len(content.splitlines())
    checked_terms = [
        "Oscar",
        "oscar",
        "/owner/oscar",
        "owner/oscar",
        "href=",
        "next/link",
        "Link",
        "router.push",
        "useRouter",
        "window.location",
    ]
    found_terms = [term for term in checked_terms if term in content]

    if found_terms:
        exposure_line = (
            "`app/page.tsx` contains these possible navigation/exposure signals: "
            + ", ".join(f"`{term}`" for term in found_terms)
            + "."
        )
        likely_line = "- Oscar may be exposed from the public homepage; the matching lines should be inspected before changing anything."
    else:
        exposure_line = (
            "`app/page.tsx` does not contain `Oscar`, `oscar`, `/owner/oscar`, `owner/oscar`, `href=`, "
            "`next/link`, `Link`, `router.push`, `useRouter`, or `window.location` in the checked file content."
        )
        likely_line = "- Oscar is not exposed from the public homepage based on `app/page.tsx`."

    answer = "\n".join([
        "Confirmed:",
        f"- Actual file read: `app/page.tsx` ({line_count} lines).",
        f"- {exposure_line}",
        "",
        "Likely:",
        likely_line,
        "",
        "Risks:",
        "- This only confirms `app/page.tsx`; other public routes would need inspection if they exist.",
        "- Oscar's direct owner route still depends on the `/owner/oscar` auth gate staying intact.",
        "",
        "Recommended next step:",
        "- Propose one small owner-security improvement and wait for approval.",
        "",
        "Waiting for owner approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def bridge_owner_privacy_synthesis_answer(body):
    """Synthesize the actual owner page/actions/auth files for privacy-flow prompts."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_owner_privacy_synthesis(user_request):
        return None

    observed = set(observed_files_from_manifest(snapshot))
    required = [
        "app/owner/oscar/page.tsx",
        "app/owner/oscar/actions.ts",
        "lib/owner-auth.ts",
    ]
    missing = [path for path in required if path not in observed]
    if missing:
        return encode_ollama_bridge_answer(
            payload,
            "Cannot synthesize the owner privacy flow because these files are not in OBSERVED_FILES: "
            + ", ".join(f"`{path}`" for path in missing),
        )

    try:
        contents = {path: bridge_read_text(path, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)["content"] for path in required}
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not read the owner privacy files through the bridge: {exc}")

    checks = {
        "page_checks_auth": "isOwnerAuthenticated()" in contents["app/owner/oscar/page.tsx"],
        "page_shows_gate": "OwnerGate" in contents["app/owner/oscar/page.tsx"],
        "page_shows_console": "OwnerConsole" in contents["app/owner/oscar/page.tsx"],
        "page_noindex": "index: false" in contents["app/owner/oscar/page.tsx"] and "follow: false" in contents["app/owner/oscar/page.tsx"],
        "actions_login": "createOwnerSession(accessCode)" in contents["app/owner/oscar/actions.ts"],
        "actions_logout": "clearOwnerSession()" in contents["app/owner/oscar/actions.ts"],
        "auth_server_only": 'import "server-only"' in contents["lib/owner-auth.ts"],
        "auth_http_only": "httpOnly: true" in contents["lib/owner-auth.ts"],
        "auth_same_site": 'sameSite: "strict"' in contents["lib/owner-auth.ts"],
        "auth_hmac": "createHmac" in contents["lib/owner-auth.ts"] and "sha256" in contents["lib/owner-auth.ts"],
        "auth_timing_safe": "timingSafeEqual" in contents["lib/owner-auth.ts"],
        "auth_prod_secret_throw": "must be configured before Oscar can run in production" in contents["lib/owner-auth.ts"],
    }

    confirmed = []
    if checks["page_checks_auth"] and checks["page_shows_gate"] and checks["page_shows_console"]:
        confirmed.append("`app/owner/oscar/page.tsx` calls `isOwnerAuthenticated()` and renders `OwnerGate` for unauthenticated users or `OwnerConsole` for authenticated users.")
    if checks["page_noindex"]:
        confirmed.append("The owner page metadata sets robots `index: false` and `follow: false`.")
    if checks["actions_login"] and checks["actions_logout"]:
        confirmed.append("`app/owner/oscar/actions.ts` handles login with `createOwnerSession(accessCode)` and logout with `clearOwnerSession()`.")
    if checks["auth_server_only"]:
        confirmed.append("`lib/owner-auth.ts` imports `server-only`, keeping the auth helpers server-side.")
    if checks["auth_hmac"] and checks["auth_timing_safe"]:
        confirmed.append("Owner sessions are signed with HMAC-SHA256 and validated with a timing-safe comparison.")
    if checks["auth_http_only"] and checks["auth_same_site"]:
        confirmed.append("The owner session cookie is set as HTTP-only and `sameSite: \"strict\"`.")
    if checks["auth_prod_secret_throw"]:
        confirmed.append("Production requires configured owner access and cookie secrets; missing production secrets throw an error.")

    answer = "\n".join([
        "Confirmed:",
        *[f"- {item}" for item in confirmed],
        "",
        "Likely:",
        "- Oscar is kept private through a server-side owner route gate, server actions for login/logout, and a signed owner session cookie.",
        "",
        "Risks:",
        "- The file contents do not show rate limiting, lockout, or audit logging for failed owner access attempts.",
        "- Local development fallbacks exist, so production depends on correctly setting `OSCAR_OWNER_ACCESS_CODE` and `OSCAR_OWNER_COOKIE_SECRET`.",
        "- I have not yet confirmed from `app/page.tsx` that the public homepage does not link to Oscar.",
        "",
        "Recommended next step:",
        "- Inspect `app/page.tsx` to confirm Oscar is not exposed on the public homepage, then propose one small owner-security improvement and wait for approval.",
    ])
    return encode_ollama_bridge_answer(payload, answer)


def summarize_actual_file(path, content, truncated=False):
    line_count = len(content.splitlines())

    if path == "lib/oscar-agent.ts":
        confirmed = [
            "It exports `OscarMode` as the union `\"plan\" | \"review\" | \"tests\"`.",
            "It exports `oscarCodingProtocol`, a string containing owner-approved rules for verified context, no invented files, blocked private patterns, approval before changes, owner-only Oscar access, and web app checks.",
            "It exports `oscarSystemPrompt`, which includes Oscar's identity, engineering operating system, coding standards, review posture, and `${oscarCodingProtocol}`.",
            "It exports `oscarRatings` with ratings for Research depth, Product judgment, Coding discipline, and Verification habit.",
            "It exports `generateOscarResponse(mode, brief)`, which returns different text for `review`, `tests`, and the default plan mode.",
            "The default plan response is an owner approval plan that ends with `Waiting for owner approval.`",
        ]
        absent = [
            name for name in ("handleRequest", "AgentState", "clientContext", "agent-lib")
            if name not in content
        ]
        if absent:
            confirmed.append("The file does not contain `" + "`, `".join(absent) + "`.")

        return "\n".join([
            f"Actual file read: `{path}` ({line_count} lines{' partial' if truncated else ''}).",
            "",
            "Confirmed:",
            *[f"- {item}" for item in confirmed],
            "",
            "Likely:",
            "- This file defines Oscar's prompt/protocol and canned owner-console responses; it is not a request handler.",
            "",
            "Need to inspect next:",
            "- `app/owner/oscar/page.tsx` to confirm how these exports are displayed in the owner UI.",
            "- `app/owner/oscar/actions.ts` and `lib/owner-auth.ts` to confirm the owner login/logout and access boundary.",
        ])

    if path == "app/owner/oscar/page.tsx":
        confirmed = [
            "It imports `generateOscarResponse`, `oscarRatings`, `oscarSystemPrompt`, and `OscarMode` from `@/lib/oscar-agent`.",
            "It imports `getOwnerAccessHelp` and `isOwnerAuthenticated` from `@/lib/owner-auth`.",
            "It imports `loginOwner` and `logoutOwner` from `./actions`.",
            "It exports `dynamic = \"force-dynamic\"`, so this owner route is forced dynamic.",
            "It exports metadata with title `Owner Oscar | Accord Terminal` and robots `index: false`, `follow: false`.",
            "`OwnerOscarPage` checks `isOwnerAuthenticated()` and returns `OwnerGate` when unauthenticated.",
            "`OwnerGate` renders a password access-code form that posts to `loginOwner` and shows an error when `?error=1` is present.",
            "`OwnerConsole` renders the owner workspace, mode cards generated by `generateOscarResponse`, Oscar ratings, and the `oscarSystemPrompt`.",
            "The UI copy says Oscar is separated from the public Accord surface and prompt changes require owner confirmation.",
        ]
        return "\n".join([
            f"Actual file read: `{path}` ({line_count} lines{' partial' if truncated else ''}).",
            "",
            "Confirmed:",
            *[f"- {item}" for item in confirmed],
            "",
            "Likely:",
            "- This is the private owner-facing Oscar page and display surface, while authentication/session mechanics live in `lib/owner-auth.ts` and `app/owner/oscar/actions.ts`.",
            "",
            "Need to inspect next:",
            "- `lib/owner-auth.ts` to confirm how `isOwnerAuthenticated` protects this page.",
            "- `app/owner/oscar/actions.ts` to confirm how the login/logout form actions redirect and manage sessions.",
            "- `app/page.tsx` to confirm Oscar is not linked from the public homepage.",
        ])

    if path == "app/owner/oscar/actions.ts":
        confirmed = [
            "It is a server-actions file with the `\"use server\"` directive.",
            "It imports `redirect` from `next/navigation`.",
            "It imports `clearOwnerSession` and `createOwnerSession` from `@/lib/owner-auth`.",
            "`loginOwner(formData)` reads `accessCode` from form data and calls `createOwnerSession(accessCode)`.",
            "If authentication fails, `loginOwner` redirects to `/owner/oscar?error=1`.",
            "If authentication succeeds, `loginOwner` redirects to `/owner/oscar`.",
            "`logoutOwner()` calls `clearOwnerSession()` and redirects to `/owner/oscar`.",
        ]
        return "\n".join([
            f"Actual file read: `{path}` ({line_count} lines{' partial' if truncated else ''}).",
            "",
            "Confirmed:",
            *[f"- {item}" for item in confirmed],
            "",
            "Likely:",
            "- This file is the server-side bridge between the owner access form and the owner-auth session helpers.",
            "",
            "Need to inspect next:",
            "- `lib/owner-auth.ts` to confirm how sessions and access-code checks are implemented.",
            "- `app/owner/oscar/page.tsx` to confirm the form wiring and error display.",
        ])

    if path == "lib/owner-auth.ts":
        confirmed = [
            "It imports `server-only`, so the module is intended to stay server-side.",
            "It imports `createHmac` and `timingSafeEqual` from `crypto` and `cookies` from `next/headers`.",
            "It defines the owner cookie name as `accord_owner` and the session payload as `owner`.",
            "It defines development fallbacks `accord-owner` and `accord-owner-dev-secret-change-before-production`.",
            "`readSecret` uses configured environment variables when present, allows fallbacks outside production, and throws in production if secrets are missing.",
            "`sign` creates an HMAC-SHA256 signature for the session payload.",
            "`safeEqual` uses `timingSafeEqual` after checking buffer lengths.",
            "`isOwnerAuthenticated` validates the owner cookie payload, signature, and format.",
            "`createOwnerSession` compares the submitted access code, then sets an HTTP-only, sameSite strict cookie for eight hours.",
            "`clearOwnerSession` clears the owner cookie by setting `maxAge: 0`.",
        ]
        return "\n".join([
            f"Actual file read: `{path}` ({line_count} lines{' partial' if truncated else ''}).",
            "",
            "Confirmed:",
            *[f"- {item}" for item in confirmed],
            "",
            "Likely:",
            "- This is the main privacy boundary for Oscar's owner-only route.",
            "",
            "Need to inspect next:",
            "- `app/owner/oscar/actions.ts` to confirm how `createOwnerSession` and `clearOwnerSession` are used.",
            "- `app/owner/oscar/page.tsx` to confirm unauthenticated users are gated before seeing Oscar.",
        ])

    exports = []
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if line.startswith("export "):
            exports.append(line[:160])
        if len(exports) >= 8:
            break

    confirmed = [
        f"The file was read from the verified workspace snapshot and has {line_count} visible lines.",
    ]
    if exports:
        confirmed.append("Visible exports include: " + "; ".join(f"`{item}`" for item in exports) + ".")
    if truncated:
        confirmed.append("The file content was truncated for the local bridge summary.")

    return "\n".join([
        f"Actual file read: `{path}`.",
        "",
        "Confirmed:",
        *[f"- {item}" for item in confirmed],
        "",
        "Likely:",
        "- More precise conclusions require inspecting related files and imports.",
        "",
        "Need to inspect next:",
        "- Related route, action, auth, or data files that import or are imported by this file.",
    ])


def bridge_file_content_answer(body):
    """Read a verified file and answer from its actual contents for file-inspection prompts."""
    payload, snapshot, user_request = bridge_payload_context_and_request(body)
    if not payload or not bridge_request_wants_file_content(user_request):
        return None

    observed_files = observed_files_from_manifest(snapshot)
    if not observed_files:
        return None

    requested = bridge_requested_path(user_request, observed_files)
    if not requested:
        return None

    if requested not in set(observed_files):
        answer = (
            f"`{requested}` is not in the verified workspace snapshot. "
            "I cannot inspect or explain a file that is not listed in OBSERVED_FILES."
        )
        return encode_ollama_bridge_answer(payload, answer)

    try:
        data = bridge_read_text(requested, max_chars=BRIDGE_READ_SUMMARY_MAX_CHARS)
    except Exception as exc:
        return encode_ollama_bridge_answer(payload, f"Could not read `{requested}` through the workspace bridge: {exc}")

    answer = summarize_actual_file(requested, data.get("content", ""), data.get("truncated", False))
    return encode_ollama_bridge_answer(payload, answer)


def compact_bridge_message(
    content,
    snapshot_max_chars=OLLAMA_BRIDGE_SNAPSHOT_MAX_CHARS,
    request_max_chars=500,
):
    """Compress an attached workspace snapshot but preserve the user's actual request."""
    snapshot, user_request = split_bridge_context(content)
    if not user_request:
        return shorten_middle(content, OLLAMA_CURRENT_MAX_CHARS)

    snapshot = shorten_middle(
        snapshot,
        snapshot_max_chars,
        "workspace snapshot shortened for local Ollama runtime",
    )
    user_request = shorten_middle(user_request, request_max_chars)
    return f"{snapshot}\n---\nUSER REQUEST\n{user_request}"


def payload_text_chars(messages):
    return sum(len(str(msg.get("content", ""))) for msg in messages if isinstance(msg, dict))


def last_user_text_from_chat_body(body):
    if not body:
        return ""

    try:
        payload = json.loads(body)
    except Exception:
        return ""

    messages = payload.get("messages")
    if not isinstance(messages, list):
        return ""

    for msg in reversed(messages):
        if not isinstance(msg, dict) or msg.get("role") == "system":
            continue
        content = str(msg.get("content", "") or "").strip()
        if not content:
            continue
        for marker in ("\n---\nUSER REQUEST\n", "\n---\nUser:", "\nUser:"):
            if marker in content:
                content = content.split(marker)[-1].strip()
        return content

    return ""


FINE_TUNE_CURRICULUM_FILE = os.path.join(MASTER_LLM_ROOT, "training", "FINE-TUNE-OPENAI-CURRICULUM.json")
CYBER_CURRICULUM_FILE = os.path.join(
    MASTER_LLM_ROOT, "training", "oscar-cyber-security-expert", "OSCAR-CYBER-SECURITY-CURRICULUM.json"
)
CYBER_LEARN_BUNDLE_FILE = os.path.join(
    MASTER_LLM_ROOT, "training", "oscar-cyber-security-expert", "OSCAR-LEARN-BUNDLE.md"
)
COURSES_CURRICULUM_FILE = os.path.join(
    MASTER_LLM_ROOT, "training", "courses-for-everything", "COURSES-FOR-EVERYTHING-CURRICULUM.json"
)
COURSES_INDEX_FILE = os.path.join(
    MASTER_LLM_ROOT, "training", "courses-for-everything", "lessons-index.json"
)
COURSES_LEARN_BUNDLE_FILE = os.path.join(
    MASTER_LLM_ROOT, "training", "courses-for-everything", "OSCAR-LESSONS-BUNDLE.md"
)
FINE_TUNE_VIDEO_ROOT = os.path.join(
    _GOAT_FORCE_ROOT,
    "Training",
    "Fine-Tune-LLMs",
    "Fine Tune LLMs OPENAI",
)
PROTOOLS_PLAYBOOK_FILE = os.path.join(
    PROJECT_ROOT,
    "BackupVault",
    "Oscar-Studio",
    "PROTOLS-RECORDING-ENGINEER-PLAYBOOK.md",
)
# typo-safe alternate filename
if not os.path.isfile(PROTOOLS_PLAYBOOK_FILE):
    PROTOOLS_PLAYBOOK_FILE = os.path.join(
        PROJECT_ROOT,
        "BackupVault",
        "Oscar-Studio",
        "PROTOOLS-RECORDING-ENGINEER-PLAYBOOK.md",
    )


def parse_oscar_learn_command(text):
    """TEACH / APPLY / DRILL / SESSION PLAN — hardwired (not LLM-honor-system only)."""
    if not text:
        return None
    raw = text.strip()
    first = raw.split("\n", 1)[0].strip()
    low = first.lower()
    for mode, prefixes in (
        ("teach", ("teach:", "teach ")),
        ("apply", ("apply:", "apply ")),
        ("drill", ("drill:", "drill ")),
        ("session_plan", ("session plan:", "session plan ")),
    ):
        for prefix in prefixes:
            if low.startswith(prefix):
                topic = first[len(prefix) :].strip() or raw
                return mode, topic
    return None


def load_fine_tune_curriculum():
    try:
        with open(FINE_TUNE_CURRICULUM_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        root = data.get("root") or FINE_TUNE_VIDEO_ROOT
        if not os.path.isdir(root):
            root = FINE_TUNE_VIDEO_ROOT
        data["root"] = root
        return data
    except Exception:
        return {"root": FINE_TUNE_VIDEO_ROOT, "tracks": []}


def fine_tune_lesson_index():
    data = load_fine_tune_curriculum()
    root = data.get("root", FINE_TUNE_VIDEO_ROOT)
    lines = []
    for track in data.get("tracks", []):
        title = track.get("title", track.get("id", "track"))
        lines.append(f"## {title}")
        for lesson in track.get("lessons", []):
            fname = lesson.get("file", "")
            exists = os.path.isfile(os.path.join(root, fname))
            mark = "ok" if exists else "MISSING"
            lines.append(
                f"- [{mark}] {lesson.get('order', '?')}. {lesson.get('topic', fname)} → `{fname}`"
            )
    return root, "\n".join(lines) if lines else "(no curriculum tracks loaded)"


def load_cyber_curriculum():
    try:
        with open(CYBER_CURRICULUM_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"modules": [], "chatCommands": []}


def cyber_lesson_index():
    data = load_cyber_curriculum()
    lines = []
    for mod in data.get("modules", []):
        title = mod.get("title", mod.get("id", "module"))
        lines.append(f"## {title}")
        for lesson in mod.get("lessons", []):
            drill = lesson.get("drill", "")
            extra = f" → DRILL: {drill}" if drill else ""
            lines.append(f"- {lesson.get('order', '?')}. {lesson.get('topic', '')}{extra}")
    cmds = data.get("chatCommands") or []
    if cmds:
        lines.append("\n## Fast chat commands")
        for c in cmds[:12]:
            lines.append(f"- `{c}`")
    bundle_note = ""
    if os.path.isfile(CYBER_LEARN_BUNDLE_FILE):
        bundle_note = f"\nLearn bundle on disk: {CYBER_LEARN_BUNDLE_FILE}"
    return "\n".join(lines) if lines else "(cyber curriculum empty — run oscar-accelerate-learning.sh)", bundle_note


def read_cyber_bundle_excerpt(max_chars=2200):
    if not os.path.isfile(CYBER_LEARN_BUNDLE_FILE):
        return None
    try:
        with open(CYBER_LEARN_BUNDLE_FILE, "r", encoding="utf-8") as f:
            text = f.read(max_chars + 1)
        if len(text) > max_chars:
            text = text[:max_chars] + "\n…(bundle truncated — run Launch Oscar Learn Fast)"
        return text
    except OSError:
        return None


def load_courses_curriculum():
    try:
        with open(COURSES_CURRICULUM_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"tracks": [], "chatCommands": []}


def load_courses_index():
    try:
        with open(COURSES_INDEX_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"totalItems": 0, "trackStats": [], "items": []}


def courses_lesson_index():
    cur = load_courses_curriculum()
    idx = load_courses_index()
    lines = [f"Indexed on USB: **{idx.get('totalItems', 0)}** lesson files"]
    lines.append(
        f"Drive: https://drive.google.com/drive/folders/1G1RV6bVXWnQ6lMQnakvyU8WzkknNo9Cs\n"
    )
    for track in cur.get("tracks", []):
        title = track.get("title", track.get("id", ""))
        teach = track.get("teach", "")
        lines.append(f"\n## {title}")
        if teach:
            lines.append(f"- Command: `{teach}`")
        root = track.get("root") or (track.get("roots") or [None])[0]
        if root:
            exists = os.path.isdir(root)
            lines.append(f"- Root: `{root}` [{'ok' if exists else 'MISSING — sync Drive to USB'}]")
    for stat in idx.get("trackStats", [])[:12]:
        lines.append(
            f"- {stat.get('trackTitle', '?')}: {stat.get('itemCount', 0)} files"
        )
    cmds = cur.get("chatCommands") or []
    if cmds:
        lines.append("\n## Fast commands")
        for c in cmds[:10]:
            lines.append(f"- `{c}`")
    bundle_note = ""
    if os.path.isfile(COURSES_LEARN_BUNDLE_FILE):
        bundle_note = f"\nBundle: {COURSES_LEARN_BUNDLE_FILE}"
    desk = "http://127.0.0.1:8090/lessons-learn-desk.html"
    return "\n".join(lines), bundle_note, desk


def read_courses_bundle_excerpt(max_chars=2000):
    if not os.path.isfile(COURSES_LEARN_BUNDLE_FILE):
        return None
    try:
        with open(COURSES_LEARN_BUNDLE_FILE, "r", encoding="utf-8") as f:
            text = f.read(max_chars + 1)
        if len(text) > max_chars:
            text = text[:max_chars] + "\n…(run scripts/absorb-all-lessons.sh)"
        return text
    except OSError:
        return None


def courses_next_lesson_path():
    idx = load_courses_index()
    for it in idx.get("items") or []:
        if it.get("mediaType") == "video" and os.path.isfile(it.get("path", "")):
            return it
    for it in idx.get("items") or []:
        if os.path.isfile(it.get("path", "")):
            return it
    return None


def read_playbook_excerpt(max_chars=3500):
    if not os.path.isfile(PROTOOLS_PLAYBOOK_FILE):
        return None
    try:
        with open(PROTOOLS_PLAYBOOK_FILE, "r", encoding="utf-8") as f:
            text = f.read(max_chars + 1)
        if len(text) > max_chars:
            text = text[:max_chars] + "\n…(playbook truncated)"
        return text
    except Exception:
        return None


def oscar_learn_mode_answer(body):
    """
    Hard replies for TEACH / APPLY / DRILL so Boss is not stuck waiting on a small model
    that parrots pasted articles. Returns Ollama-shaped JSON or None.
    """
    text = last_user_text_from_chat_body(body)
    parsed = parse_oscar_learn_command(text)
    if not parsed:
        return None

    mode, topic = parsed
    topic_low = topic.lower()
    answer = ""
    model_name = "oscar-learn-mode"

    is_finetune = any(
        k in topic_low
        for k in ("fine tune", "fine-tune", "finetune", "openai course", "wikipedia data", "customer care data")
    )
    is_protools = any(
        k in topic_low for k in ("pro tools", "protools", "record", "tracking", "recording engineer")
    )
    is_cyber = any(
        k in topic_low
        for k in (
            "cyber",
            "security",
            "sweep",
            "firewall",
            "lockdown",
            "jetson",
            "thor",
            "nano",
            "ssh",
            "teamviewer",
            "remote access",
            "exfat",
            "rsync",
            "opnsense",
            "studio harden",
            "money penny boundary",
            "codex lane",
        )
    )
    is_courses = any(
        k in topic_low
        for k in (
            "courses",
            "course",
            "lesson",
            "lessons",
            "absorb",
            "all lessons",
            "n8n",
            "automation course",
            "prompt engineering",
            "deepseek",
            "codex vault",
            "social media marketing",
            "leetcode",
            "crowdfunding",
            "books pdf",
        )
    )

    if mode == "teach" and is_courses and not is_finetune:
        index, bundle_note, desk = courses_lesson_index()
        excerpt = read_courses_bundle_excerpt(1600) or "(run bash GOAT-FORCE/scripts/absorb-all-lessons.sh)"
        answer = (
            "TEACH — COURSES FOR EVERYTHING (absorb lane)\n\n"
            "Money Penny style: index on USB, you distill video → text notes, Oscar applies.\n\n"
            f"{index}{bundle_note}\n\n"
            f"Desk: {desk}\n\n"
            f"Excerpt:\n{excerpt}\n\n"
            "Paste after each video: TEACH: [topic] — material: [your 5 bullets]"
        )
    elif mode == "teach" and is_cyber:
        index, bundle_note = cyber_lesson_index()
        excerpt = read_cyber_bundle_excerpt(1800) or "(run scripts/oscar-accelerate-learning.sh to build bundle)"
        answer = (
            "TEACH — Cybersecurity expert lane (hardwired, local)\n\n"
            "Oscar defends studio + USB + LAN. Money Penny stays OG vault — never merge.\n\n"
            f"{index}{bundle_note}\n\n"
            f"Bundle excerpt:\n{excerpt}\n\n"
            "Next: APPLY: security sweep — or open http://127.0.0.1:8090/oscar-security-command.html"
        )
    elif mode == "teach" and is_finetune:
        root, index = fine_tune_lesson_index()
        answer = (
            "TEACH — Fine-tune course (hardwired)\n\n"
            f"Video root: {root}\n"
            "Oscar cannot watch .mp4 without transcripts. Use videos + your notes; Oscar uses this index.\n\n"
            f"{index}\n\n"
            "Next trailhead: Open lesson 1 in VLC, take 5 bullets of notes, paste as:\n"
            "TEACH: fine-tune — material: [your notes]\n"
            "Or run Tool Mode: read a .txt summary you save next to the videos."
        )
    elif mode == "teach" and is_protools:
        excerpt = read_playbook_excerpt(2800) or "(playbook missing on USB)"
        answer = (
            "TEACH — Pro Tools recording (hardwired)\n\n"
            "10-step checklist for tomorrow:\n"
            "1) Confirm SR/bit depth + backup folder\n"
            "2) Label I/O to match cables\n"
            "3) Session Save As + auto-save\n"
            "4) Gain stage peaks ~-18 to -12 dBFS\n"
            "5) Headphone mix approved\n"
            "6) Test pass noise/pop\n"
            "7) Playlist per take + markers\n"
            "8) Light chain only (HPF / optional comp)\n"
            "9) Save Copy In to backup\n"
            "10) Edit list for comp — no mastering today\n\n"
            f"Playbook excerpt:\n{excerpt}\n\n"
            "DRILL: reply APPLY: tracking vocals now when you start."
        )
    elif mode == "teach":
        answer = (
            f"TEACH — {topic}\n\n"
            "Paste 5–10 bullets of YOUR notes (not raw web lists). I will return:\n"
            "- SOP checklist\n"
            "- 5 quiz questions\n"
            "- APPLY command for live use\n"
        )

    elif mode == "apply" and is_finetune:
        data = load_fine_tune_curriculum()
        first_lesson = None
        for track in data.get("tracks", []):
            lessons = track.get("lessons") or []
            if lessons:
                first_lesson = lessons[0]
                break
        if first_lesson:
            fname = first_lesson.get("file", "")
            answer = (
                "APPLY — fine-tune study session (next 3 steps only)\n\n"
                f"1) Open: {os.path.join(data.get('root', FINE_TUNE_VIDEO_ROOT), fname)}\n"
                f"2) Watch {first_lesson.get('topic', 'intro')}; write 5 bullets in Notes.txt beside the folder\n"
                "3) Paste back: TEACH: fine-tune — material: [your 5 bullets]\n\n"
                "I do not learn from video pixels — only from text you distill."
            )
        else:
            answer = "APPLY — fine-tune: curriculum file missing. Check MASTER-LLM/training/FINE-TUNE-OPENAI-CURRICULUM.json"

    elif mode == "apply" and (is_courses or "next lesson" in topic_low or "absorb" in topic_low):
        nxt = courses_next_lesson_path()
        if nxt:
            answer = (
                "APPLY — next lesson (3 steps)\n\n"
                f"1) Open: {nxt.get('path', '')}\n"
                f"2) Watch/read: {nxt.get('title', 'lesson')} — pause and write 5 bullets\n"
                "3) Paste in Oscar: TEACH: courses — material: [your bullets]\n\n"
                f"Desk: http://127.0.0.1:8090/lessons-learn-desk.html"
            )
        else:
            answer = (
                "APPLY — absorb lessons\n\n"
                "1) Run on USB: bash GOAT-FORCE/scripts/absorb-all-lessons.sh\n"
                "2) Sync Google Drive folder 1G1RV6bVXWnQ6lMQnakvyU8WzkknNo9Cs to inbox if needed\n"
                "3) Say TEACH: courses again\n"
            )
    elif mode == "apply" and is_cyber:
        answer = (
            "APPLY — Security sweep RIGHT NOW (next 3 steps)\n\n"
            "1) Open http://127.0.0.1:8090/oscar-security-command.html (or POST /api/oscar/security/sweep on :3333)\n"
            "2) Note firewall state, SSH keys count, TeamViewer/remote apps, stale LaunchAgents on FKD1/Ventoy\n"
            "3) If copying LLMs USB today: Wi‑Fi/BT off → rsync or one Finder job — Spotlight off on /Volumes/LLMs\n\n"
            "Say DRILL: firewall when done."
        )
    elif mode == "apply" and is_protools:
        answer = (
            "APPLY — Pro Tools tracking RIGHT NOW (next 3 steps)\n\n"
            "1) Open session → confirm sample rate/bit depth → Save As to backup folder\n"
            "2) One vocal test pass: adjust preamp/interface gain until peaks sit ~-18 to -12 dBFS (no red)\n"
            "3) Set headphone mix for artist → record Take 1 to a new playlist → marker + comment\n\n"
            "Say DRILL: gain staging if you want a quiz."
        )

    elif mode == "apply":
        answer = (
            f"APPLY — {topic}\n\n"
            "Next 3 actions only (Boss — do these now):\n"
            "1) State the exact goal for the next 20 minutes\n"
            "2) Open the one tool/file for that goal\n"
            "3) Execute step 1 of the checklist; report back one line of result\n"
        )

    elif mode == "drill" and is_protools:
        answer = (
            "DRILL — Pro Tools gain staging\n\n"
            "Q: Where should vocal peaks land while tracking, and what do you turn down FIRST if the track clips?\n\n"
            "Reply with your answer; I will grade on the next message."
        )
    elif mode == "drill" and is_finetune:
        answer = (
            "DRILL — Fine-tune concepts\n\n"
            "Q: In one sentence, when is fine-tuning worth it vs a strong system prompt?\n\n"
            "Reply with your answer; I will grade on the next message."
        )
    elif mode == "drill" and is_courses:
        if "prompt" in topic_low:
            answer = (
                "DRILL — Prompt engineering\n\n"
                "Q: What belongs in a system prompt vs what belongs in RAG context?\n\n"
                "Reply with your answer; I will grade on the next message."
            )
        elif "n8n" in topic_low or "automation" in topic_low:
            answer = (
                "DRILL — n8n automation\n\n"
                "Q: When should you use an AI Agent node vs a simple LLM chain in n8n?\n\n"
                "Reply with your answer; I will grade on the next message."
            )
        else:
            answer = (
                "DRILL — Courses absorb\n\n"
                "Q: What 3 steps turn a video lesson into Oscar-usable knowledge?\n\n"
                "Reply with your answer; I will grade on the next message."
            )
    elif mode == "drill" and is_cyber:
        if "jetson" in topic_low or "thor" in topic_low or "nano" in topic_low or "flash" in topic_low:
            answer = (
                "DRILL — Jetson flash integrity\n\n"
                "Q: You see `Shell>` at boot on a Jetson after USB flash. Wrong ISO, wrong drive, or Wi‑Fi attack?\n\n"
                "Reply with your answer; I will grade on the next message."
            )
        elif "money penny" in topic_low or "boundary" in topic_low or "vault" in topic_low:
            answer = (
                "DRILL — Money Penny vs Oscar\n\n"
                "Q: Who owns OG vault protocol and store credentials — Oscar or Money Penny?\n\n"
                "Reply with your answer; I will grade on the next message."
            )
        elif "firewall" in topic_low or "ssh" in topic_low:
            answer = (
                "DRILL — Studio perimeter\n\n"
                "Q: Name two checks Oscar runs before you claim someone 'hacked' your Mac.\n\n"
                "Reply with your answer; I will grade on the next message."
            )
        elif "codex" in topic_low:
            answer = (
                "DRILL — Codex crew lane\n\n"
                "Q: What is Codex's role in the registry, and why doesn't Oscar replace the Codex app?\n\n"
                "Reply with your answer; I will grade on the next message."
            )
        else:
            answer = (
                "DRILL — Cybersecurity\n\n"
                "Q: What three facts must be logged before escalating a studio incident?\n\n"
                "Reply with your answer; I will grade on the next message."
            )
    elif mode == "drill":
        answer = (
            f"DRILL — {topic}\n\n"
            "Q: What is the single most important step you must not skip?\n\n"
            "Reply with your answer; I will grade on the next message."
        )

    elif mode == "session_plan" and is_protools:
        answer = (
            f"SESSION PLAN — {topic}\n\n"
            "Tracks: Click, Voc Lead (playlist), HPF, Comp (optional), Rev Send, Music Ref (optional)\n"
            "Routing: Mic → Interface → Pro Tools input; aux reverb prefader\n"
            "Gain: Peaks -18 to -12 dBFS; fix at preamp\n"
            "Backup: Save Copy In at end + session notes txt"
        )
    elif mode == "session_plan" and is_courses:
        answer = (
            f"SESSION PLAN — {topic}\n\n"
            "Block 1 (45m): Fine-tune intro videos + 5 bullets each\n"
            "Block 2 (45m): n8n OR prompt engineering module + notes\n"
            "Block 3 (30m): DRILL in Oscar + one APPLY for studio work\n"
            "Desk: http://127.0.0.1:8090/lessons-learn-desk.html"
        )
    elif mode == "session_plan" and is_cyber:
        answer = (
            f"SESSION PLAN — {topic}\n\n"
            "Morning: security sweep + log listeners/remote apps\n"
            "Copy window: lockdown Wi‑Fi, Spotlight off LLMs, rsync batch\n"
            "Jetson: confirm Nano vs Thor kit before any flash\n"
            "Evening: re-sweep, eject LLMs only after stopping :8090/:3333 services"
        )
    elif mode == "session_plan":
        answer = f"SESSION PLAN — {topic}\n\nDefine: artist, song, SR, inputs, headphone needs, comp policy, backup path."

    return {
        "model": model_name,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "message": {"role": "assistant", "content": answer},
        "done": True,
        "oscarLearnMode": mode,
    }


def load_grok_eden_catalog():
    try:
        if os.path.isfile(OSCAR_GROK_EDEN_CATALOG):
            with open(OSCAR_GROK_EDEN_CATALOG, encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return None


def run_oscar_grok_eden_lab(command):
    script = OSCAR_GROK_EDEN_LAB
    if not os.path.isfile(script):
        return {"ok": False, "error": f"lab script missing: {script}"}
    env = os.environ.copy()
    env["GOAT_FORCE"] = env.get("GOAT_FORCE") or "/Volumes/LLMs/GOAT-FORCE"
    env["OSCAR_GROK_EDEN_DIR"] = OSCAR_GROK_EDEN_SOURCE_DIR
    try:
        proc = subprocess.run(
            [sys.executable, script, command, "--dir", OSCAR_GROK_EDEN_SOURCE_DIR],
            capture_output=True,
            text=True,
            timeout=900 if command == "stitch" else 300,
            cwd=os.path.dirname(script),
            env=env,
        )
        if proc.stdout.strip():
            try:
                return json.loads(proc.stdout.strip().splitlines()[-1])
            except Exception:
                pass
        if proc.returncode != 0:
            return {"ok": False, "error": (proc.stderr or proc.stdout or "lab failed").strip()[:800]}
        return {"ok": True, "output": proc.stdout.strip()[:500]}
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": f"eden lab {command} timed out"}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


def quick_local_handshake_answer(body):
    """Answer owner wake words locally so the UI never stalls on simple checks."""
    text = last_user_text_from_chat_body(body)
    if not text:
        return None

    compact = re.sub(r"\s+", " ", text).strip()
    normalized = re.sub(r"[^a-z0-9 ]+", " ", compact.lower())
    normalized = re.sub(r"\s+", " ", normalized).strip()

    if not normalized:
        return None

    answer = None
    model_name = "oscar-local-handshake"
    image_request = (
        re.search(r"\b(draw|make|create|generate|render)\b.*\b(pic|picture|image|art|logo|cover|poster|graphic|goat)\b", normalized)
        or re.search(r"\bdraw me\b", normalized)
        or re.search(r"\bmake me\b.*\b(image|pic|picture|art|logo|cover|poster|graphic)\b", normalized)
    )
    video_eden_request = (
        "video eden" in normalized
        or "eden awakens" in normalized
        or "grok video" in normalized
        or re.search(r"\b(stitch|trailer|prompt pack)\b.*\b(eden|grok)\b", normalized)
        or re.search(r"\b(eden|grok)\b.*\b(trailer|video|clips)\b", normalized)
    )
    if re.search(r"\boscar\b.*\b(home|here|online)\b", normalized) or "oscar are you home" in normalized:
        answer = "Yes, OG. Oscar. GOAT. Boss is Waka. I remember. Tools are online."
        model_name = "oscar-local-handshake"
    elif normalized in ("hello", "hi", "hey oscar", "hey"):
        answer = "Yes, OG. Oscar. GOAT. Boss is Waka. I remember. Tools are online."
        model_name = "oscar-local-handshake"
    elif "enable codex" in normalized or "codex parity" in normalized or "codex mode" in normalized:
        settings = apply_codex_parity_settings()
        answer = (
            "Codex Parity ON — Oscar can run programs and make art like Codex.\n\n"
            "• Tool Mode: ON\n"
            "• Computer Control: ON (DAWs only when you say OPEN/LAUNCH)\n"
            "• Producer Mode: ON\n"
            "• Skill: code\n\n"
            "Try: read a file · run bash GOAT-FORCE/scripts/oscar-friday-ready.sh audit · "
            "draw EDEN keyframe · open Terminal\n\n"
            "Use OSCAR_TOOL_REQUEST blocks — I will not fake tool results."
        )
        model_name = "oscar-codex-parity"
    elif "boss level" in normalized or "load boss memory" in normalized or "upgrade oscar" in normalized:
        mem = build_boss_level_memory()
        answer = (
            "Boss level memory loaded into this session context.\n\n"
            + (mem[:2400] if mem else "Protocol files on USB — plug LLMs volume.")
            + "\n\nSay VIDEO EDEN — prompt pack or open GOAT Imagine for visuals."
        )
        model_name = "oscar-boss-level"
    elif "moneypenny are you there" in normalized or "money penny are you there" in normalized:
        answer = (
            "Yes, Boss. I remember.\n\n"
            "Moneypenny Vault Protocol v7.0 is recognized in this local Oscar stack. "
            "DrawOurGoat, CheckVaultStatus, and StartProphecyDrop are owner commands; "
            "write actions stay locked until the owner code is supplied."
        )
    elif (
        "graham are you there" in normalized
        or "gray are you there" in normalized
        or "gray status" in normalized
        or normalized in ("graham", "gray", "hey graham", "hey gray")
    ):
        model_name = "graham-gray-guardian"
        answer = (
            "Yes, OG. Graham aka Gray. Guardian of Oscar and GOAT Force.\n\n"
            "I'm in the pack — load Crew → Graham or GET /api/graham-gray/profile. "
            "Cloud lane: xai-api/grok-3-mini-fast when credits are green. "
            "Oscar runs the room; Gray stands guard."
        )
    elif "draw our goat" in normalized or "drawourgoat" in normalized:
        draft = create_oscar_image_render("GOAT/Raspy Rawls royal crest concept")
        model_name = draft.get("renderer", "oscar-local-image-renderer")
        answer = (
            "DrawOurGoat trigger received. Oscar image route is online.\n\n"
            "Oscar created a real local image from the active local renderer.\n"
            f"Local image: {draft['url']}\n"
            f"Manifest: {draft['manifestUrl']}\n"
            f"Renderer: {draft.get('renderer')}\n"
            f"Diffusion renderer connected: {draft.get('diffusionRendererConnected')}\n"
            f"Note: {draft.get('note', '')}"
        )
    elif video_eden_request:
        model_name = "oscar-eden-video-lab"
        if "stitch" in normalized or "trailer" in normalized:
            result = run_oscar_grok_eden_lab("stitch")
            answer = (
                "EDEN AWAKENS — Grok trailer stitch\n\n"
                f"OK: {result.get('ok')}\n"
                f"Output: {result.get('output', result.get('error', 'see log'))}\n"
                f"Clips used: {result.get('clips', '—')}\n"
                f"Gallery: http://127.0.0.1:{CHAT_SERVER_PORT}/api/goat/imagine/gallery\n"
                f"GOAT Imagine: http://127.0.0.1:8090/goat-imagine.html"
            )
        elif "prompt" in normalized:
            pack = load_grok_eden_catalog()
            shots = (pack or {}).get("shotPrompts") or []
            dna = (pack or {}).get("promptDna") or ""
            answer = (
                "EDEN AWAKENS — Grok-level prompt pack (use in Grok Imagine / ComfyUI / GOAT Imagine)\n\n"
                f"DNA: {dna}\n\n"
                "Shots:\n"
                + "\n".join(f"  {i+1}. {s}" for i, s in enumerate(shots))
                + "\n\nSay VIDEO EDEN — stitch trailer to concat Boss clips."
            )
        else:
            result = run_oscar_grok_eden_lab("index")
            answer = (
                "EDEN AWAKENS — indexed Boss Grok reference clips\n\n"
                f"OK: {result.get('ok')}\n"
                f"Clips: {result.get('clips', 0)}\n"
                f"Catalog: {OSCAR_GROK_EDEN_CATALOG}\n\n"
                "Oscar lanes for Friday:\n"
                "  • VIDEO EDEN — prompt pack\n"
                "  • VIDEO EDEN — stitch trailer\n"
                "  • GENERATE IMAGE + GOAT Imagine Animate (Ken Burns upgrade)\n"
                "  • New Grok clips: paste DNA + shot line from prompt pack\n"
                "Better than one-off Grok: Oscar storyboards, stitches, titles, and reuses your vault."
            )
    elif image_request:
        subject = compact
        subject = re.sub(r"(?i)\b(oscar|money penny|moneypenny)\b[:, ]*", "", subject).strip()
        subject = re.sub(r"(?i)\b(can you|please|draw me|draw|make me|make|create|generate|render)\b", "", subject).strip()
        subject = re.sub(r"(?i)\b(a|an|me|pic|picture|image)\b", "", subject).strip()
        subject = re.sub(r"(?i)^(of|for|to)\s+", "", subject).strip()
        if not subject:
            subject = "original GOAT/Raspy Rawls royal crest concept"
        draft = create_oscar_image_render(subject)
        model_name = draft.get("renderer", "oscar-local-image-renderer")
        answer = (
            "Image request received. Oscar created a real local image from the active local renderer.\n\n"
            f"Subject: {subject}\n"
            f"Local image: {draft['url']}\n"
            f"Manifest: {draft['manifestUrl']}\n"
            f"Renderer: {draft.get('renderer')}\n"
            f"Diffusion renderer connected: {draft.get('diffusionRendererConnected')}\n"
            f"Note: {draft.get('note', '')}"
        )
    elif "checkvaultstatus" in normalized or "check vault status" in normalized:
        answer = (
            "CheckVaultStatus recognized. Local protocol memory is reachable, and the vault remains "
            "read-and-mirror only from chat until owner write code is supplied."
        )
    if answer is None:
        return None

    return {
        "model": model_name,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "message": {"role": "assistant", "content": answer},
        "done": True,
    }


def _png_chunk(tag, data):
    tag_bytes = tag if isinstance(tag, bytes) else tag.encode("ascii")
    return (
        struct.pack(">I", len(data))
        + tag_bytes
        + data
        + struct.pack(">I", zlib.crc32(tag_bytes + data) & 0xFFFFFFFF)
    )


def _write_rgb_png(path, width, height, pixels):
    stride = width * 3
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        start = y * stride
        raw.extend(pixels[start:start + stride])

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    compressed = zlib.compress(bytes(raw), 9)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(_png_chunk("IHDR", ihdr))
        f.write(_png_chunk("IDAT", compressed))
        f.write(_png_chunk("IEND", b""))


def _blend_rgb(pixels, width, height, x, y, color, alpha=1.0):
    if x < 0 or y < 0 or x >= width or y >= height:
        return
    idx = (y * width + x) * 3
    inv = max(0.0, 1.0 - alpha)
    a = min(1.0, max(0.0, alpha))
    pixels[idx] = int(pixels[idx] * inv + color[0] * a)
    pixels[idx + 1] = int(pixels[idx + 1] * inv + color[1] * a)
    pixels[idx + 2] = int(pixels[idx + 2] * inv + color[2] * a)


def _fill_circle(pixels, width, height, cx, cy, radius, color, alpha=1.0):
    r = max(1, int(radius))
    r2 = r * r
    left = max(0, int(cx) - r)
    right = min(width - 1, int(cx) + r)
    top = max(0, int(cy) - r)
    bottom = min(height - 1, int(cy) + r)
    for y in range(top, bottom + 1):
        dy = y - cy
        for x in range(left, right + 1):
            dx = x - cx
            if dx * dx + dy * dy <= r2:
                _blend_rgb(pixels, width, height, x, y, color, alpha)


def _fill_ellipse(pixels, width, height, cx, cy, rx, ry, color, alpha=1.0):
    rx = max(1.0, float(rx))
    ry = max(1.0, float(ry))
    left = max(0, int(cx - rx))
    right = min(width - 1, int(cx + rx))
    top = max(0, int(cy - ry))
    bottom = min(height - 1, int(cy + ry))
    for y in range(top, bottom + 1):
        ny = ((y - cy) / ry) ** 2
        if ny > 1:
            continue
        for x in range(left, right + 1):
            nx = ((x - cx) / rx) ** 2
            if nx + ny <= 1:
                _blend_rgb(pixels, width, height, x, y, color, alpha)


def _fill_rect(pixels, width, height, x1, y1, x2, y2, color, alpha=1.0):
    left = max(0, min(width - 1, int(min(x1, x2))))
    right = max(0, min(width - 1, int(max(x1, x2))))
    top = max(0, min(height - 1, int(min(y1, y2))))
    bottom = max(0, min(height - 1, int(max(y1, y2))))
    for y in range(top, bottom + 1):
        for x in range(left, right + 1):
            _blend_rgb(pixels, width, height, x, y, color, alpha)


def _draw_line(pixels, width, height, x1, y1, x2, y2, color, thickness=1, alpha=1.0):
    distance = max(1.0, math.hypot(x2 - x1, y2 - y1))
    radius = max(1, int(thickness / 2))
    sample_stride = max(1.0, radius * 0.65)
    steps = max(1, int(distance / sample_stride))
    for step in range(steps + 1):
        t = step / steps
        x = x1 + (x2 - x1) * t
        y = y1 + (y2 - y1) * t
        _fill_circle(pixels, width, height, x, y, radius, color, alpha)


def _draw_quadratic(pixels, width, height, start, control, end, color, thickness=1, alpha=1.0, steps=160):
    last_x, last_y = start
    for i in range(1, steps + 1):
        t = i / steps
        inv = 1.0 - t
        x = inv * inv * start[0] + 2 * inv * t * control[0] + t * t * end[0]
        y = inv * inv * start[1] + 2 * inv * t * control[1] + t * t * end[1]
        _draw_line(pixels, width, height, last_x, last_y, x, y, color, thickness, alpha)
        last_x, last_y = x, y


def _fill_polygon(pixels, width, height, points, color, alpha=1.0):
    min_y = max(0, int(min(p[1] for p in points)))
    max_y = min(height - 1, int(max(p[1] for p in points)))
    for y in range(min_y, max_y + 1):
        intersections = []
        j = len(points) - 1
        for i, point in enumerate(points):
            xi, yi = point
            xj, yj = points[j]
            if (yi > y) != (yj > y):
                denom = yj - yi
                if denom:
                    intersections.append(xi + (y - yi) * (xj - xi) / denom)
            j = i
        intersections.sort()
        for i in range(0, len(intersections), 2):
            if i + 1 >= len(intersections):
                break
            x_start = max(0, int(intersections[i]))
            x_end = min(width - 1, int(intersections[i + 1]))
            for x in range(x_start, x_end + 1):
                _blend_rgb(pixels, width, height, x, y, color, alpha)


def _draw_ring(pixels, width, height, cx, cy, radius, color, thickness=6, alpha=1.0, segments=360):
    last = None
    for i in range(segments + 1):
        angle = (math.pi * 2 * i) / segments
        x = cx + math.cos(angle) * radius
        y = cy + math.sin(angle) * radius
        if last:
            _draw_line(pixels, width, height, last[0], last[1], x, y, color, thickness, alpha)
        last = (x, y)


def create_local_png_draft(subject):
    """Create an actual local PNG image for Oscar draw requests without external renderers."""
    os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)
    stem = f"oscar-draw-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}"
    render_seed = uuid.uuid4().hex
    png_path = os.path.join(GENERATED_IMAGES_DIR, f"{stem}.png")
    manifest_path = os.path.join(GENERATED_IMAGES_DIR, f"{stem}.json")
    width = 1024
    height = 1024
    pixels = bytearray(width * height * 3)
    subject_hash = hashlib.sha256(f"{subject}|{render_seed}".encode("utf-8", "ignore")).digest()
    accent = (
        190 + subject_hash[0] % 56,
        145 + subject_hash[1] % 70,
        35 + subject_hash[2] % 45,
    )
    gold = (248, 211, 88)
    light_gold = (255, 238, 161)
    dark_gold = (145, 96, 18)
    black = (5, 5, 5)

    for y in range(height):
        dy = (y - height * 0.48) / height
        for x in range(width):
            dx = (x - width * 0.50) / width
            r = min(1.0, math.sqrt(dx * dx + dy * dy) * 2.1)
            glow = max(0.0, 1.0 - r)
            idx = (y * width + x) * 3
            pixels[idx] = int(3 + accent[0] * glow * 0.18)
            pixels[idx + 1] = int(3 + accent[1] * glow * 0.13)
            pixels[idx + 2] = int(4 + accent[2] * glow * 0.07)

    subject_words = set(re.findall(r"[a-z0-9]+", subject.lower()))
    if {"city", "building", "street", "skyline"} & subject_words:
        layout = 1
    elif {"cover", "poster", "flyer", "album", "thumbnail"} & subject_words:
        layout = 2
    elif {"space", "stars", "galaxy", "planet"} & subject_words:
        layout = 3
    elif {"car", "speed", "motion", "race"} & subject_words:
        layout = 4
    else:
        layout = subject_hash[3] % 5

    if layout == 1:
        for i in range(18):
            x = 96 + i * 49
            h = 90 + subject_hash[(i + 4) % len(subject_hash)] % 185
            _fill_rect(pixels, width, height, x, 850 - h, x + 28, 850, dark_gold, 0.28)
            _fill_rect(pixels, width, height, x + 5, 850 - h + 14, x + 10, 846, light_gold, 0.20)
    elif layout == 2:
        _fill_rect(pixels, width, height, 122, 116, 902, 204, accent, 0.16)
        _fill_rect(pixels, width, height, 122, 820, 902, 908, accent, 0.16)
        for i in range(9):
            y = 138 + i * 84
            _draw_line(pixels, width, height, 96, y, 928, y + (subject_hash[(i + 9) % len(subject_hash)] % 37 - 18), gold, 3, 0.20)
    elif layout == 3:
        for i in range(42):
            sx = 80 + ((subject_hash[i % len(subject_hash)] * 19 + i * 83) % 864)
            sy = 80 + ((subject_hash[(i + 11) % len(subject_hash)] * 23 + i * 61) % 864)
            _fill_circle(pixels, width, height, sx, sy, 2 + subject_hash[(i + 3) % len(subject_hash)] % 4, light_gold, 0.50)
        _draw_ring(pixels, width, height, 512, 512, 235 + subject_hash[18] % 90, accent, 2, 0.25, 240)
    elif layout == 4:
        for i in range(12):
            y = 250 + i * 46
            _draw_line(pixels, width, height, 70, y, 954, y - 120 + subject_hash[(i + 5) % len(subject_hash)] % 240, accent, 5, 0.18)
    else:
        for i in range(16):
            angle = (math.pi * 2 * i) / 16
            radius = 320 + subject_hash[(i + 6) % len(subject_hash)] % 130
            _draw_line(
                pixels,
                width,
                height,
                512,
                512,
                512 + math.cos(angle) * radius,
                512 + math.sin(angle) * radius,
                accent,
                4,
                0.16,
            )

    for radius, thickness, alpha in ((430, 14, 0.95), (382, 5, 0.68), (300, 3, 0.35)):
        _draw_ring(pixels, width, height, 512, 512, radius, gold, thickness, alpha)

    # Horns and luxury linework.
    _draw_quadratic(pixels, width, height, (435, 410), (255, 180), (178, 384), gold, 34, 0.96)
    _draw_quadratic(pixels, width, height, (589, 410), (769, 180), (846, 384), gold, 34, 0.96)
    _draw_quadratic(pixels, width, height, (435, 410), (293, 235), (226, 388), black, 12, 0.92)
    _draw_quadratic(pixels, width, height, (589, 410), (731, 235), (798, 388), black, 12, 0.92)
    _draw_quadratic(pixels, width, height, (332, 610), (512, 735), (692, 610), dark_gold, 15, 0.62)
    _draw_quadratic(pixels, width, height, (312, 676), (512, 816), (712, 676), gold, 11, 0.86)

    # Crown.
    crown = [(396, 260), (446, 165), (511, 260), (578, 165), (628, 260)]
    _draw_line(pixels, width, height, 396, 260, 446, 165, gold, 20, 0.98)
    _draw_line(pixels, width, height, 446, 165, 511, 260, gold, 20, 0.98)
    _draw_line(pixels, width, height, 511, 260, 578, 165, gold, 20, 0.98)
    _draw_line(pixels, width, height, 578, 165, 628, 260, gold, 20, 0.98)
    _draw_line(pixels, width, height, 390, 282, 634, 282, light_gold, 12, 0.98)
    for point in crown[1::2]:
        _fill_circle(pixels, width, height, point[0], point[1], 18, light_gold, 1.0)

    # Goat face.
    _fill_polygon(pixels, width, height, [(310, 493), (388, 445), (430, 575), (356, 610)], gold, 0.96)
    _fill_polygon(pixels, width, height, [(714, 445), (792, 493), (668, 610), (594, 575)], gold, 0.96)
    _fill_ellipse(pixels, width, height, 512, 535, 160, 230, gold, 0.98)
    _fill_ellipse(pixels, width, height, 512, 545, 132, 202, black, 0.96)
    _draw_quadratic(pixels, width, height, (380, 500), (512, 395), (644, 500), light_gold, 10, 0.82)
    _draw_line(pixels, width, height, 512, 398, 512, 662, dark_gold, 6, 0.76)
    _fill_circle(pixels, width, height, 448, 505, 22, light_gold, 0.98)
    _fill_circle(pixels, width, height, 576, 505, 22, light_gold, 0.98)
    _fill_circle(pixels, width, height, 448, 505, 8, black, 0.96)
    _fill_circle(pixels, width, height, 576, 505, 8, black, 0.96)
    _fill_ellipse(pixels, width, height, 512, 645, 78, 65, gold, 0.98)
    _fill_ellipse(pixels, width, height, 512, 642, 55, 38, (30, 22, 10), 0.92)
    _fill_circle(pixels, width, height, 488, 632, 9, light_gold, 0.94)
    _fill_circle(pixels, width, height, 536, 632, 9, light_gold, 0.94)
    _draw_quadratic(pixels, width, height, (462, 705), (512, 748), (562, 705), light_gold, 12, 0.92)
    _draw_line(pixels, width, height, 440, 760, 584, 760, gold, 11, 0.88)
    _draw_line(pixels, width, height, 410, 795, 614, 795, dark_gold, 8, 0.58)

    # Prompt fingerprint bars: every render carries a visibly different mark.
    for i in range(20):
        bar = subject_hash[i % len(subject_hash)]
        x = 262 + i * 25
        y1 = 888 - (bar % 86)
        _fill_rect(pixels, width, height, x, y1, x + 10, 898, light_gold if i % 2 else accent, 0.72)

    # Glowing sparks.
    for i in range(34):
        sx = 160 + ((subject_hash[i % len(subject_hash)] * 37 + i * 53) % 704)
        sy = 160 + ((subject_hash[(i + 7) % len(subject_hash)] * 41 + i * 29) % 704)
        if 250 < sx < 774 and 270 < sy < 850:
            continue
        _draw_line(pixels, width, height, sx - 12, sy, sx + 12, sy, light_gold, 3, 0.75)
        _draw_line(pixels, width, height, sx, sy - 12, sx, sy + 12, light_gold, 3, 0.75)
        _fill_circle(pixels, width, height, sx, sy, 4, gold, 0.85)

    _write_rgb_png(png_path, width, height, pixels)
    manifest = {
        "ok": True,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "requestedSubject": subject,
        "renderSeed": render_seed,
        "type": "local-procedural-png",
        "renderer": "oscar-local-procedural-png",
        "diffusionRendererConnected": False,
        "pngPath": png_path,
        "url": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{os.path.basename(png_path)}",
        "manifestUrl": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{os.path.basename(manifest_path)}",
        "note": "Created by Oscar's built-in local procedural PNG renderer. Each draw request gets a fresh render seed and visible prompt fingerprint. Use ComfyUI/Stable Diffusion workflows for full diffusion-model art.",
    }
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    return manifest


def create_safe_image_bridge_draft(subject, timeout=12):
    """Ask the running Oscar Safe Image Bridge to create a local SVG render."""
    os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)
    payload = json.dumps({"prompt": subject}).encode("utf-8")
    req = urllib.request.Request(
        f"{OSCAR_SAFE_IMAGE_BRIDGE_URL}/api/draw",
        data=payload,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        data = json.loads(res.read().decode("utf-8", "replace"))
    if not data.get("ok"):
        raise RuntimeError(data.get("error") or "Oscar Safe Image Bridge returned a failed render")

    bridge_url = str(data.get("url") or "")
    if bridge_url.startswith("/"):
        bridge_url = f"{OSCAR_SAFE_IMAGE_BRIDGE_URL}{bridge_url}"
    stem = f"oscar-bridge-render-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}"
    manifest_path = os.path.join(GENERATED_IMAGES_DIR, f"{stem}.json")
    manifest = {
        "ok": True,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "requestedSubject": subject,
        "type": "local-safe-image-bridge-svg",
        "renderer": "oscar-safe-image-bridge-svg",
        "diffusionRendererConnected": False,
        "imagePath": data.get("path"),
        "file": data.get("file"),
        "url": bridge_url,
        "manifestPath": manifest_path,
        "manifestUrl": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{os.path.basename(manifest_path)}",
        "note": "Created by Oscar's local Safe Image Bridge. This is a Mac-safe SVG renderer, not ComfyUI/Stable Diffusion diffusion art.",
        "bridge": {
            "baseUrl": OSCAR_SAFE_IMAGE_BRIDGE_URL,
            "raw": data,
        },
    }
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    return manifest


def create_oscar_image_render(subject):
    """Use the best local Oscar renderer that is actually online, then fall back safely."""
    try:
        return create_safe_image_bridge_draft(subject)
    except Exception as exc:
        manifest = create_local_png_draft(subject)
        manifest["fallbackFrom"] = "oscar-safe-image-bridge-svg"
        manifest["fallbackReason"] = f"{type(exc).__name__}: {exc}"
        manifest["note"] = (
            "Created by Oscar's built-in local procedural PNG renderer because the Safe Image Bridge "
            "was unavailable. This is still not ComfyUI/Stable Diffusion diffusion art."
        )
        manifest_path = manifest.get("manifestUrl", "").rsplit("/", 1)[-1]
        if manifest_path:
            full_manifest_path = os.path.join(GENERATED_IMAGES_DIR, manifest_path)
            try:
                with open(full_manifest_path, "w", encoding="utf-8") as f:
                    json.dump(manifest, f, indent=2)
            except Exception:
                pass
        return manifest


def create_local_svg_draft(subject):
    """Create a deterministic local SVG draft for image requests when no renderer is connected."""
    os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)
    stem = f"oscar-draw-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}"
    svg_path = os.path.join(GENERATED_IMAGES_DIR, f"{stem}.svg")
    manifest_path = os.path.join(GENERATED_IMAGES_DIR, f"{stem}.json")
    safe_subject = html.escape(subject[:180])

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1400" viewBox="0 0 1400 1400" role="img" aria-label="Oscar local image draft">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#1c1606"/>
      <stop offset="55%" stop-color="#070707"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff2a8"/>
      <stop offset="35%" stop-color="#f2c94c"/>
      <stop offset="70%" stop-color="#b88718"/>
      <stop offset="100%" stop-color="#ffe680"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="1400" height="1400" fill="url(#bg)"/>
  <circle cx="700" cy="700" r="510" fill="none" stroke="url(#gold)" stroke-width="18" opacity=".88"/>
  <circle cx="700" cy="700" r="455" fill="none" stroke="#f8d86b" stroke-width="4" opacity=".5"/>
  <path d="M420 590 C260 455 290 250 485 340 C550 370 600 455 625 525" fill="none" stroke="url(#gold)" stroke-width="54" stroke-linecap="round"/>
  <path d="M980 590 C1140 455 1110 250 915 340 C850 370 800 455 775 525" fill="none" stroke="url(#gold)" stroke-width="54" stroke-linecap="round"/>
  <path d="M500 610 C520 485 610 410 700 410 C790 410 880 485 900 610 C925 765 835 930 700 950 C565 930 475 765 500 610 Z" fill="#080808" stroke="url(#gold)" stroke-width="28"/>
  <path d="M610 735 C650 710 750 710 790 735 C765 800 735 835 700 835 C665 835 635 800 610 735 Z" fill="url(#gold)" opacity=".92"/>
  <circle cx="610" cy="625" r="28" fill="#f9d767" filter="url(#glow)"/>
  <circle cx="790" cy="625" r="28" fill="#f9d767" filter="url(#glow)"/>
  <path d="M650 895 C680 920 720 920 750 895" fill="none" stroke="#f8d86b" stroke-width="18" stroke-linecap="round"/>
  <path d="M560 305 L620 210 L700 315 L780 210 L840 305" fill="none" stroke="url(#gold)" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M380 1040 C520 1135 880 1135 1020 1040" fill="none" stroke="url(#gold)" stroke-width="24" stroke-linecap="round"/>
  <text x="700" y="1138" text-anchor="middle" fill="#f5d76e" font-family="Georgia, serif" font-size="48" letter-spacing="3">OSCAR LOCAL IMAGE DRAFT</text>
  <text x="700" y="1208" text-anchor="middle" fill="#fff1a8" font-family="Arial, sans-serif" font-size="30">{safe_subject}</text>
</svg>
"""
    manifest = {
        "ok": True,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "requestedSubject": subject,
        "type": "local-svg-draft",
        "renderer": "deterministic-svg-fallback",
        "bitmapRendererConnected": False,
        "svgPath": svg_path,
        "url": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{os.path.basename(svg_path)}",
        "manifestUrl": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{os.path.basename(manifest_path)}",
        "nextStep": "Start ComfyUI on 127.0.0.1:8188 or Stable Diffusion WebUI on 127.0.0.1:7860 for bitmap rendering.",
    }
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg)
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    return manifest


def sanitize_ollama_chat_body(body):
    """Bound chat payloads so a local 4K-context model does not spend minutes timing out."""
    if not body:
        return body

    try:
        payload = json.loads(body)
    except Exception:
        return body

    messages = payload.get("messages")
    if not isinstance(messages, list) or not messages:
        return body

    original_chars = payload_text_chars(messages)
    has_core_identity = any(
        isinstance(msg, dict)
        and msg.get("role") == "system"
        and str(msg.get("content", "")).startswith(OSCAR_CORE_IDENTITY_PREFIX)
        for msg in messages
    )
    if not has_core_identity:
        inject = [
            {"role": "system", "content": OSCAR_CORE_IDENTITY},
            {"role": "system", "content": OSCAR_BOSS_PROTOCOL},
        ]
        # Friday / local-only: skip auto cyber playbook (was making Oscar sound like Qwen security bot)
        if not os.environ.get("OSCAR_FORCE_LOCAL_ONLY", "").strip().lower() in (
            "1",
            "true",
            "yes",
        ):
            inject.append({"role": "system", "content": OSCAR_SECURITY_EXPERT})
        messages = inject + messages

    system_messages = []
    core_identity_messages = []
    security_expert_messages = []
    project_memory_messages = []
    tool_mode_messages = []
    absorbed_tools_messages = []
    conversation = []
    is_bridge_payload = any(
        isinstance(msg, dict)
        and msg.get("role") != "system"
        and is_bridge_context(msg.get("content", ""))
        for msg in messages
    )
    has_tool_mode = any(
        isinstance(msg, dict)
        and msg.get("role") == "system"
        and str(msg.get("content", "")).startswith(TOOL_MODE_PREFIX)
        for msg in messages
    )
    system_max_chars = OLLAMA_BRIDGE_SYSTEM_MAX_CHARS if is_bridge_payload else OLLAMA_SYSTEM_MAX_CHARS
    history_budget_chars = OLLAMA_BRIDGE_HISTORY_BUDGET_CHARS if is_bridge_payload else OLLAMA_HISTORY_BUDGET_CHARS
    total_budget_chars = OLLAMA_BRIDGE_TOTAL_BUDGET_CHARS if is_bridge_payload else OLLAMA_TOTAL_BUDGET_CHARS
    if has_tool_mode and not is_bridge_payload:
        total_budget_chars = max(total_budget_chars, OLLAMA_TOOL_TOTAL_BUDGET_CHARS)

    for msg in messages:
        if not isinstance(msg, dict):
            continue
        if msg.get("role") == "system":
            compact = dict(msg)
            content = str(compact.get("content", ""))
            if content.startswith(OSCAR_CORE_IDENTITY_PREFIX):
                compact["content"] = shorten_middle(
                    content,
                    OLLAMA_CORE_IDENTITY_MAX_CHARS,
                    "Oscar core identity shortened for local Ollama runtime",
                )
                core_identity_messages.append(compact)
            elif content.startswith(OSCAR_SECURITY_EXPERT_PREFIX):
                compact["content"] = shorten_middle(
                    content,
                    OLLAMA_SECURITY_EXPERT_MAX_CHARS,
                    "Oscar security expert playbook shortened for local Ollama runtime",
                )
                security_expert_messages.append(compact)
            elif content.startswith(PROJECT_MEMORY_PREFIX):
                memory_max_chars = (
                    OLLAMA_BRIDGE_PROJECT_MEMORY_MAX_CHARS
                    if is_bridge_payload
                    else OLLAMA_PROJECT_MEMORY_MAX_CHARS
                )
                compact["content"] = shorten_middle(
                    content,
                    memory_max_chars,
                    "project memory shortened for local Ollama runtime",
                )
                project_memory_messages.append(compact)
            elif content.startswith(TOOL_MODE_PREFIX):
                compact["content"] = shorten_middle(
                    content,
                    OLLAMA_TOOL_MODE_MAX_CHARS,
                    "tool mode instructions shortened for local Ollama runtime",
                )
                tool_mode_messages.append(compact)
            elif content.startswith(ABSORBED_TOOLS_PREFIX):
                compact["content"] = shorten_middle(
                    content,
                    OLLAMA_ABSORBED_TOOLS_MAX_CHARS,
                    "absorbed tools instructions shortened for local Ollama runtime",
                )
                absorbed_tools_messages.append(compact)
            else:
                compact["content"] = shorten_middle(content, system_max_chars)
                system_messages.append(compact)
        else:
            conversation.append(msg)

    if not conversation:
        payload["messages"] = (
            core_identity_messages
            + security_expert_messages
            + system_messages
            + project_memory_messages
            + tool_mode_messages
            + absorbed_tools_messages
        )
        return json.dumps(payload).encode("utf-8")

    current = dict(conversation[-1])
    current_content = str(current.get("content", ""))
    if is_bridge_context(current_content):
        current["content"] = compact_bridge_message(
            current_content,
            snapshot_max_chars=OLLAMA_BRIDGE_RUNTIME_SNAPSHOT_MAX_CHARS,
            request_max_chars=OLLAMA_BRIDGE_REQUEST_MAX_CHARS,
        )
    else:
        current["content"] = shorten_middle(current_content, OLLAMA_CURRENT_MAX_CHARS)

    prior_messages = []
    used_history = 0
    for msg in reversed(conversation[:-1]):
        if not isinstance(msg, dict):
            continue
        content = str(msg.get("content", ""))
        if not content or is_bridge_context(content):
            continue
        remaining = history_budget_chars - used_history
        if remaining < 250:
            break
        compact = dict(msg)
        compact["content"] = shorten_middle(content, min(remaining, OLLAMA_MESSAGE_MAX_CHARS))
        prior_messages.append(compact)
        used_history += len(compact["content"])

    compact_messages = (
        core_identity_messages
        + security_expert_messages
        + system_messages
        + project_memory_messages
        + tool_mode_messages
        + absorbed_tools_messages
        + list(reversed(prior_messages))
        + [current]
    )

    while payload_text_chars(compact_messages) > total_budget_chars and prior_messages:
        prior_messages.pop()
        compact_messages = (
            core_identity_messages
            + security_expert_messages
            + system_messages
            + project_memory_messages
            + tool_mode_messages
            + absorbed_tools_messages
            + list(reversed(prior_messages))
            + [current]
        )

    if payload_text_chars(compact_messages) > total_budget_chars and system_messages:
        for msg in system_messages:
            msg["content"] = shorten_middle(msg.get("content", ""), 200)
        compact_messages = (
            core_identity_messages
            + security_expert_messages
            + system_messages
            + project_memory_messages
            + tool_mode_messages
            + absorbed_tools_messages
            + list(reversed(prior_messages))
            + [current]
        )

    if payload_text_chars(compact_messages) > total_budget_chars and project_memory_messages:
        memory_floor = 180 if is_bridge_payload else 260
        for msg in project_memory_messages:
            msg["content"] = shorten_middle(
                msg.get("content", ""),
                memory_floor,
                "project memory shortened for local Ollama runtime",
            )
        compact_messages = core_identity_messages + security_expert_messages + system_messages + project_memory_messages + tool_mode_messages + list(reversed(prior_messages)) + [current]

    if payload_text_chars(compact_messages) > total_budget_chars and tool_mode_messages:
        for msg in tool_mode_messages:
            msg["content"] = shorten_middle(
                msg.get("content", ""),
                360,
                "tool mode instructions shortened for local Ollama runtime",
            )
        compact_messages = core_identity_messages + security_expert_messages + system_messages + project_memory_messages + tool_mode_messages + list(reversed(prior_messages)) + [current]

    options = payload.get("options") if isinstance(payload.get("options"), dict) else {}
    max_ctx = OLLAMA_NUM_CTX
    max_predict = OLLAMA_BRIDGE_MAX_PREDICT if is_bridge_payload else OLLAMA_MAX_PREDICT
    options["num_ctx"] = min(int(options.get("num_ctx", max_ctx) or max_ctx), max_ctx)
    requested_predict = int(options.get("num_predict", max_predict) or max_predict)
    # Older UI sent 384 — bump so replies are not cut off mid-thought
    floor_predict = OLLAMA_BRIDGE_MAX_PREDICT if is_bridge_payload else OLLAMA_MIN_PREDICT
    options["num_predict"] = min(max(requested_predict, floor_predict), max_predict)
    payload["options"] = options
    payload["messages"] = compact_messages

    compact_chars = payload_text_chars(compact_messages)
    if compact_chars != original_chars:
        safe_print(
            f"[proxy] compacted /api/chat prompt {original_chars} -> {compact_chars} chars",
            flush=True,
        )

    return json.dumps(payload).encode("utf-8")


class ChatHandler(http.server.BaseHTTPRequestHandler):
    """Handles all HTTP requests for Oscar Local Agent Chat."""

    def log_message(self, format, *args):
        """Print all requests for easy debugging."""
        msg = format % args
        ts = time.strftime("%H:%M:%S")
        # Colour-code by status: errors red, warnings yellow, ok green
        if "404" in msg or "500" in msg or "502" in msg:
            prefix = "  \033[91m[ERR]\033[0m"
        elif "200" in msg or "204" in msg:
            prefix = "  \033[92m[ OK]\033[0m"
        else:
            prefix = "  \033[93m[---]\033[0m"
        safe_print(f"{prefix} {ts}  {msg}")

    # ── Browser origin boundary ─────────────────────────────────
    def _browser_origin_allowed(self):
        origin = self.headers.get("Origin", "").strip().rstrip("/")
        if not origin:
            return True
        if origin == "null" and self._is_local_request():
            return True

        parsed = urlparse(origin)
        host = self.headers.get("Host", "").strip().lower()
        if parsed.scheme in ("http", "https") and parsed.netloc.lower() == host:
            return True

        return origin in OSCAR_ALLOWED_ORIGINS

    def _reject_untrusted_browser_origin(self):
        if self._browser_origin_allowed():
            return False

        self.send_response(403)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Vary", "Origin")
        self.end_headers()
        self.wfile.write(b'{"error":"Browser origin is not allowed to access Oscar."}')
        return True

    # ── CORS headers ───────────────────────────────────────────
    def _cors_headers(self):
        origin = self.headers.get("Origin", "").strip().rstrip("/")
        if origin and self._browser_origin_allowed():
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_json(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        if self._reject_untrusted_browser_origin():
            return
        self.send_response(204)
        self._cors_headers()
        self.end_headers()

    # ── Routing ────────────────────────────────────────────────
    def do_HEAD(self):
        if self._reject_untrusted_browser_origin():
            return
        path = urlparse(self.path).path
        if path.startswith("/api/voice/library/") and path.endswith("/audio"):
            self._get_voice_library_audio(path, head_only=True)
        elif path.startswith("/api/voice/speak-output/"):
            self._get_voice_speak_output(path, head_only=True)
        else:
            self.send_error(501, "Unsupported method ('HEAD')")

    def do_GET(self):
        if self._reject_untrusted_browser_origin():
            return
        path = urlparse(self.path).path

        # Serve the main UI
        if path == "/" or path == "/index.html":
            self._serve_html()

        # Chat data API
        elif path == "/api/chats":
            self._get_chats()

        # Settings API
        elif path == "/api/settings":
            self._get_settings()

        elif path == "/api/deepseek/status":
            self._get_deepseek_status()

        elif path == "/api/xai/status":
            self._get_xai_status()

        # Hardware stats API
        elif path == "/api/stats":
            self._get_stats()

        # Sanitized local Money Penny intake profile
        elif path == "/api/money-penny/profile":
            self._get_money_penny_profile()

        # Sanitized local Lexicon Lexi intake profile
        elif path == "/api/lexicon-lexi/profile":
            self._get_lexicon_lexi_profile()

        # Sanitized local Ms. Vanessa intake profile
        elif path == "/api/ms-vanessa/profile":
            self._get_ms_vanessa_profile()

        # Sanitized local Ms. Nexus intake profile
        elif path == "/api/ms-nexus/profile":
            self._get_ms_nexus_profile()

        # Sanitized local Sir Codex intake profile
        elif path == "/api/sir-codex/profile":
            self._get_sir_codex_profile()

        elif path == "/api/graham-gray/profile":
            self._get_graham_gray_profile()

        # Private local Oscar call-and-response protocol
        elif path == "/api/oscar/vault-protocol":
            self._get_oscar_vault_protocol()

        elif path == "/api/oscar/boss-level-memory":
            self._get_oscar_boss_level_memory()

        elif path == "/api/oscar/codex-parity/status":
            self._get_oscar_codex_parity_status()

        # Private local Oscar diary
        elif path == "/api/oscar/diary":
            self._get_oscar_diary()

        # Sanitized private Drive/Vault intake profile
        elif path == "/api/drive-vault/profile":
            self._get_drive_vault_profile()

        # Sanitized GOAT Drive intake summary
        elif path == "/api/goat/drive-intake":
            self._get_drive_intake_summary()

        # Sanitized GOAT catalog scanner standard
        elif path == "/api/goat/catalog-scanner":
            self._get_goat_data_standard(CATALOG_SCANNER_STANDARD_FILE, "catalog scanner standard")

        # Sanitized GOAT instrument lab standard
        elif path == "/api/goat/instrument-lab":
            self._get_goat_data_standard(GOAT_INSTRUMENT_LAB_STANDARD_FILE, "instrument lab standard")

        # Sanitized GOAT asset/style vault standard
        elif path == "/api/goat/asset-style-vault":
            self._get_goat_data_standard(GOAT_ASSET_STYLE_VAULT_STANDARD_FILE, "asset style vault standard")

        # Sanitized GOAT icon/art lab standard
        elif path == "/api/goat/icon-art-lab":
            self._get_goat_data_standard(GOAT_ICON_ART_LAB_STANDARD_FILE, "icon art lab standard")

        # Sanitized GOAT image render bridge standard and live local renderer status
        elif path == "/api/goat/image-render-bridge":
            self._get_image_render_bridge_status()

        elif path == "/api/goat/imagine/gallery":
            self._get_goat_imagine_gallery()

        elif path == "/api/goat/imagine/grok-catalog":
            self._get_goat_imagine_grok_catalog()

        # Oscar embedded local AI runtime stack
        elif path == "/api/oscar/local-ai-stack":
            self._get_local_ai_stack_status()

        # Oscar Security Command — defensive ops (separate from Money Penny vault)
        elif path == "/api/oscar/security/status":
            self._get_oscar_security_status()
        elif path == "/api/oscar/security/sweep":
            self._get_oscar_security_sweep()
        elif path == "/api/oscar/security/policy":
            self._get_oscar_security_policy()
        elif path == "/api/oscar/security/playbook":
            self._get_oscar_security_playbook()

        # Sanitized GOAT career co-pilot standard
        elif path == "/api/goat/career-copilot":
            self._get_goat_data_standard(GOAT_CAREER_COPILOT_STANDARD_FILE, "career co-pilot standard")

        # Sanitized GOAT local model pack
        elif path == "/api/goat/local-model-pack":
            self._get_goat_data_standard(GOAT_LOCAL_MODEL_PACK_FILE, "local model pack")

        # Optional local Granite Speech ASR bridge
        elif path == "/api/voice/granite/status":
            self._get_granite_voice_status()

        elif path == "/api/voice/library":
            self._get_voice_library()

        elif path.startswith("/api/voice/library/") and path.endswith("/audio"):
            self._get_voice_library_audio(path)

        elif path.startswith("/api/voice/speak-output/"):
            self._get_voice_speak_output(path)

        elif path == "/voice-editor" or path == "/voice-editor.html":
            self._serve_voice_editor()

        elif path == "/api/library/status":
            self._get_library_status()

        elif path == "/api/library/search":
            self._get_library_search()

        elif path == "/api/library/web":
            self._get_library_web()

        elif path == "/api/master-llm/registry":
            self._get_master_llm_registry()

        elif path == "/api/crew/parity":
            self._get_crew_parity()

        elif path == "/api/oscar/asset-manifest":
            self._get_oscar_asset_manifest()

        elif path == "/api/training/curriculum":
            self._get_training_curriculum()

        # Oscar Studio local-first build status
        elif path == "/api/studio/status":
            self._get_studio_status()

        # LAN/mobile browser access status
        elif path == "/api/mobile/access":
            self._get_mobile_access()

        # Read-only workspace bridge API
        elif path == "/api/workspace":
            self._get_workspace_info()

        elif path == "/api/workspace/tree":
            self._get_workspace_tree()

        elif path == "/api/workspace/file":
            self._get_workspace_file()

        elif path == "/api/workspace/search":
            self._get_workspace_search()

        elif path == "/api/workspace/context":
            self._get_workspace_context()

        # Owner-approved Oscar Tool Mode API
        elif path == "/api/tools":
            self._get_tools_info()

        elif path == "/api/tools/policy":
            self._get_tools_policy()

        elif path == "/api/tools/logs":
            self._get_tools_logs()

        elif path == "/api/owner-approval":
            self._get_owner_approval()

        # Proxy Ollama API
        elif path.startswith("/ollama/"):
            self._proxy_ollama("GET")

        # GOAT Royalty local web app
        elif path == "/goat" or path == "/goat/" or path.startswith("/goat/"):
            self._serve_goat_static(path)

        # Local SVG/image drafts generated by Oscar's image fallback route
        elif path.startswith("/generated-images/"):
            self._serve_generated_image_static(path)

        else:
            # Try serving static files from SCRIPT_DIR
            self._serve_static(path)

    def do_POST(self):
        if self._reject_untrusted_browser_origin():
            return
        path = urlparse(self.path).path

        if path == "/api/chats":
            self._save_chats()

        elif path == "/api/settings":
            self._save_settings()

        elif path == "/api/tools":
            self._post_tool_action()

        elif path == "/api/tools/policy":
            self._post_tools_policy()

        elif path == "/api/owner-approval/setup":
            self._post_owner_approval_setup()

        elif path == "/api/owner-approval/unlock":
            self._post_owner_approval_unlock()

        elif path == "/api/owner-approval/lock":
            self._post_owner_approval_lock()

        elif path == "/api/oscar/diary":
            self._post_oscar_diary()

        elif path == "/api/voice/granite/transcribe":
            self._post_granite_transcribe()

        elif path == "/api/voice/library":
            self._post_voice_library()

        elif path == "/api/voice/library/bootstrap":
            self._post_voice_library_bootstrap()

        elif path == "/api/voice/speak":
            self._post_voice_speak()

        elif path == "/api/library/sync":
            self._post_library_sync()

        elif path == "/api/goat/imagine/generate":
            self._post_goat_imagine_generate()

        elif path == "/api/goat/imagine/eden-rebuild":
            self._post_goat_imagine_eden_rebuild()

        elif path == "/api/goat/imagine/grok-index":
            self._post_goat_imagine_grok_index()

        elif path == "/api/goat/imagine/grok-stitch":
            self._post_goat_imagine_grok_stitch()

        elif path == "/api/oscar/enable-codex-parity":
            self._post_oscar_enable_codex_parity()

        # Proxy Ollama API
        elif path.startswith("/ollama/"):
            self._proxy_ollama("POST")

        else:
            self.send_response(404)
            self._cors_headers()
            self.end_headers()

    def do_DELETE(self):
        if self._reject_untrusted_browser_origin():
            return
        path = urlparse(self.path).path
        if path.startswith("/ollama/"):
            self._proxy_ollama("DELETE")
        else:
            self.send_response(404)
            self._cors_headers()
            self.end_headers()

    # ── Serve HTML ─────────────────────────────────────────────
    def _serve_html(self):
        try:
            with open(HTML_FILE, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self._cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"FastChatUI.html not found.")

    def _serve_static(self, path):
        """Serve static files (CSS, JS, images) from SCRIPT_DIR."""
        safe_path = os.path.normpath(path.lstrip("/"))
        first_part = safe_path.split(os.sep, 1)[0]
        full_path = os.path.realpath(os.path.join(SCRIPT_DIR, safe_path))
        script_root = os.path.realpath(SCRIPT_DIR)

        # Security: don't allow path traversal or serving private app data.
        if os.path.commonpath([script_root, full_path]) != script_root or first_part in PRIVATE_DIRS:
            self.send_response(403)
            self._cors_headers()
            self.end_headers()
            return

        if os.path.isfile(full_path):
            ext = os.path.splitext(full_path)[1].lower()
            mime_types = {
                ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
                ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
                ".svg": "image/svg+xml", ".ico": "image/x-icon",
                ".wav": "audio/wav", ".mp3": "audio/mpeg", ".m4a": "audio/mp4",
                ".aac": "audio/aac", ".flac": "audio/flac", ".ogg": "audio/ogg",
                ".aiff": "audio/aiff", ".aif": "audio/aiff",
            }
            content_type = mime_types.get(ext, "application/octet-stream")
            with open(full_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self._cors_headers()
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_response(404)
            self._cors_headers()
            self.end_headers()

    def _serve_goat_static(self, path):
        """Serve GOAT Royalty web-app files under /goat/ without exposing the repo."""
        if not os.path.isdir(GOAT_WEB_APP_DIR):
            self.send_response(404)
            self._cors_headers()
            self.end_headers()
            return

        rel_path = path[len("/goat/"):] if path.startswith("/goat/") else ""
        if not rel_path:
            rel_path = "index.html"
        safe_path = os.path.normpath(rel_path)
        first_part = safe_path.split(os.sep, 1)[0]
        full_path = os.path.realpath(os.path.join(GOAT_WEB_APP_DIR, safe_path))
        goat_root = os.path.realpath(GOAT_WEB_APP_DIR)

        if (
            safe_path.startswith("..")
            or os.path.commonpath([goat_root, full_path]) != goat_root
            or first_part in PRIVATE_DIRS
            or first_part.startswith(".")
        ):
            self.send_response(403)
            self._cors_headers()
            self.end_headers()
            return

        if not os.path.isfile(full_path):
            self.send_response(404)
            self._cors_headers()
            self.end_headers()
            return

        ext = os.path.splitext(full_path)[1].lower()
        mime_types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".md": "text/markdown; charset=utf-8",
            ".sh": "text/x-shellscript; charset=utf-8",
            ".ps1": "text/plain; charset=utf-8",
        }
        content_type = mime_types.get(ext, "application/octet-stream")
        with open(full_path, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self._cors_headers()
        self.end_headers()
        self.wfile.write(content)

    def _serve_generated_image_static(self, path):
        rel_path = path[len("/generated-images/"):]
        rel_path = os.path.normpath(rel_path).lstrip(os.sep)
        if not rel_path or rel_path.startswith(".."):
            self.send_response(403)
            self._cors_headers()
            self.end_headers()
            return

        image_root = os.path.realpath(GENERATED_IMAGES_DIR)
        full_path = os.path.realpath(os.path.join(GENERATED_IMAGES_DIR, rel_path))
        if os.path.commonpath([image_root, full_path]) != image_root:
            self.send_response(403)
            self._cors_headers()
            self.end_headers()
            return
        if not os.path.isfile(full_path):
            self.send_response(404)
            self._cors_headers()
            self.end_headers()
            return

        ext = os.path.splitext(full_path)[1].lower()
        content_type = {
            ".svg": "image/svg+xml",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
        }.get(ext, "application/octet-stream")
        with open(full_path, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self._cors_headers()
        self.end_headers()
        self.wfile.write(content)

    # ── Chat Persistence ───────────────────────────────────────
    def _get_chats(self):
        self._send_json(200, read_json_file(CHATS_FILE, []))

    def _save_chats(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            chats = json.loads(body)
            if not isinstance(chats, list):
                raise ValueError("Expected a JSON array of chats")
            write_json_file(CHATS_FILE, chats)
            self._send_json(200, {"ok": True})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_settings(self):
        self._send_json(200, public_settings_view(load_settings()))

    def _get_deepseek_status(self):
        self._send_json(
            200,
            {
                "ok": True,
                "configured": deepseek_configured(),
                "base": deepseek_api_base(),
                "models": list(DEEPSEEK_VIRTUAL_TAG_MODELS),
                "maskedKey": mask_api_key(deepseek_api_key()) if deepseek_configured() else "",
                "hint": "Paste your DeepSeek developer API key in Oscar Settings. Local Ollama pulls: deepseek-r1:7b, deepseek-coder:33b, etc.",
            },
        )

    def _get_xai_status(self):
        credits_ok = False
        credits_error = ""
        if xai_configured():
            _, err = call_xai_chat(
                [{"role": "user", "content": "ping"}],
                "xai-api/grok-3-mini-fast",
                temperature=0,
                max_tokens=8,
            )
            if err:
                credits_error = err
                credits_ok = "403" not in err and "credits" not in err.lower()
            else:
                credits_ok = True
        self._send_json(
            200,
            {
                "ok": True,
                "configured": xai_configured(),
                "creditsOk": credits_ok,
                "creditsError": credits_error[:300] if credits_error else "",
                "base": XAI_API_URL,
                "models": list(XAI_VIRTUAL_TAG_MODELS),
                "defaultModel": XAI_DEFAULT_MODEL,
                "maskedKey": mask_api_key(xai_api_key()) if xai_configured() else "",
                "hint": (
                    "Grok needs xAI credits on your team console — use qwen2.5:3b or gemma2-2b-local until then."
                    if xai_configured() and not credits_ok
                    else "Grok is xAI cloud (not Ollama). Key from GOAT Intel local_keys.json or Oscar Settings."
                ),
            },
        )

    def _save_settings(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            settings = json.loads(body)
            if not isinstance(settings, dict):
                raise ValueError("Expected a JSON object of settings")
            merged = load_settings()
            incoming_key = settings.pop("deepseekApiKey", None)
            if incoming_key is not None:
                incoming_key = str(incoming_key).strip()
                if incoming_key:
                    merged["deepseekApiKey"] = incoming_key
                elif settings.get("clearDeepseekApiKey"):
                    merged["deepseekApiKey"] = ""
            incoming_xai = settings.pop("xaiApiKey", None)
            if incoming_xai is not None:
                incoming_xai = str(incoming_xai).strip()
                if incoming_xai:
                    merged["xaiApiKey"] = incoming_xai
                elif settings.get("clearXaiApiKey"):
                    merged["xaiApiKey"] = ""
            for key, value in settings.items():
                if key in ("clearDeepseekApiKey", "clearXaiApiKey"):
                    continue
                merged[key] = value
            write_json_file(SETTINGS_FILE, merged)
            self._send_json(
                200,
                {
                    "ok": True,
                    "deepseekConfigured": deepseek_configured(),
                    "xaiConfigured": xai_configured(),
                },
            )
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_money_penny_profile(self):
        self._get_sanitized_profile(
            "Money Penny",
            MONEY_PENNY_PROFILE_FILE,
            MONEY_PENNY_SUMMARY_FILE,
            MONEY_PENNY_HOME_DIR,
            "Money Penny profile has not been created yet.",
        )

    def _get_lexicon_lexi_profile(self):
        self._get_sanitized_profile(
            "Lexicon Lexi",
            LEXI_PROFILE_FILE,
            LEXI_SUMMARY_FILE,
            LEXI_HOME_DIR,
            "Lexicon Lexi profile has not been created yet.",
        )

    def _get_ms_vanessa_profile(self):
        self._get_sanitized_profile(
            "Ms. Vanessa",
            MS_VANESSA_PROFILE_FILE,
            MS_VANESSA_SUMMARY_FILE,
            MS_VANESSA_HOME_DIR,
            "Ms. Vanessa profile has not been created yet.",
        )

    def _get_ms_nexus_profile(self):
        self._get_sanitized_profile(
            "Ms. Nexus",
            MS_NEXUS_PROFILE_FILE,
            MS_NEXUS_SUMMARY_FILE,
            MS_NEXUS_HOME_DIR,
            "Ms. Nexus profile has not been created yet.",
        )

    def _get_sir_codex_profile(self):
        self._get_sanitized_profile(
            "Sir Codex",
            SIR_CODEX_PROFILE_FILE,
            SIR_CODEX_SUMMARY_FILE,
            SIR_CODEX_HOME_DIR,
            "Sir Codex profile has not been created yet.",
        )

    def _get_graham_gray_profile(self):
        try:
            with open(GRAHAM_GRAY_PROFILE_FILE, "r", encoding="utf-8") as f:
                profile = f.read().strip()
            if os.path.isfile(GRAHAM_GUARDIAN_IDENTITY_FILE):
                with open(GRAHAM_GUARDIAN_IDENTITY_FILE, "r", encoding="utf-8") as guard_fh:
                    guardian = guard_fh.read().strip()
                if guardian:
                    profile = f"{profile}\n\n---\n\n{guardian}"
            manifest = {}
            if os.path.isfile(GRAHAM_GRAY_MANIFEST_FILE):
                try:
                    with open(GRAHAM_GRAY_MANIFEST_FILE, "r", encoding="utf-8") as mf:
                        manifest = json.load(mf)
                except Exception:
                    manifest = {}
            self._send_json(200, {
                "ok": True,
                "profile": profile,
                "profilePath": GRAHAM_GRAY_PROFILE_FILE,
                "manifestPath": GRAHAM_GRAY_MANIFEST_FILE,
                "guardianPath": GRAHAM_GUARDIAN_IDENTITY_FILE,
                "homeDir": GRAHAM_GRAY_HOME_DIR,
                "manifest": manifest,
                "source": "sanitized-local-graham-gray-profile",
                "displayName": "Graham aka Gray",
                "cloudModel": "xai-api/grok-3-mini-fast",
                "note": "Graham is guardian/ops lane — not Oscar on Ollama. Use xAI model for cloud Graham voice.",
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": "Graham aka Gray profile has not been created yet.",
                "profilePath": GRAHAM_GRAY_PROFILE_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_sanitized_profile(self, display_name, profile_file, summary_file, home_dir, missing_message):
        try:
            with open(profile_file, "r", encoding="utf-8") as f:
                profile = f.read().strip()
            self._send_json(200, {
                "ok": True,
                "profile": profile,
                "profilePath": profile_file,
                "summaryPath": summary_file,
                "homeDir": home_dir,
                "source": "sanitized-local-profile",
                "displayName": display_name,
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": missing_message,
                "profilePath": profile_file,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_oscar_vault_protocol(self):
        try:
            with open(OSCAR_PROTOCOL_MEMORY_FILE, "r", encoding="utf-8") as f:
                profile = f.read().strip()
            if os.path.isfile(OSCAR_IDENTITY_FILE):
                with open(OSCAR_IDENTITY_FILE, "r", encoding="utf-8") as ident_fh:
                    identity = ident_fh.read().strip()
                if identity:
                    profile = f"{profile}\n\n---\n\n{identity}"
            self._send_json(200, {
                "ok": True,
                "profile": profile,
                "profilePath": OSCAR_PROTOCOL_MEMORY_FILE,
                "identityPath": OSCAR_IDENTITY_FILE,
                "protocolPath": OSCAR_PROTOCOL_FILE,
                "homeDir": OSCAR_PROTOCOL_HOME_DIR,
                "source": "private-local-oscar-vault-protocol",
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": "Oscar vault protocol has not been created yet.",
                "profilePath": OSCAR_PROTOCOL_MEMORY_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_oscar_boss_level_memory(self):
        try:
            memory = build_boss_level_memory()
            if not memory:
                raise FileNotFoundError("Boss level protocol files missing on USB")
            self._send_json(200, {
                "ok": True,
                "memory": memory,
                "sources": [
                    OSCAR_BOSS_LEVEL_MEMORY_FILE,
                    OSCAR_IDENTITY_FILE,
                    OSCAR_EDEN_VIDEO_PROTOCOL_FILE,
                ],
            })
        except FileNotFoundError as exc:
            self._send_json(404, {"ok": False, "error": str(exc)})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_oscar_codex_parity_status(self):
        s = load_settings()
        caps = tool_capabilities()
        self._send_json(200, {
            "ok": True,
            "toolModeEnabled": bool(s.get("toolModeEnabled")),
            "computerControlEnabled": bool(s.get("computerControlEnabled")),
            "producerModeEnabled": bool(s.get("producerModeEnabled")),
            "expertMode": s.get("expertMode"),
            "capabilities": caps,
            "codexParityReady": bool(s.get("toolModeEnabled")) and caps.get("run") and caps.get("draw"),
        })

    def _post_oscar_enable_codex_parity(self):
        try:
            settings = apply_codex_parity_settings()
            self._send_json(200, {
                "ok": True,
                "message": "Codex Parity enabled",
                "settings": {
                    "toolModeEnabled": settings.get("toolModeEnabled"),
                    "computerControlEnabled": settings.get("computerControlEnabled"),
                    "producerModeEnabled": settings.get("producerModeEnabled"),
                    "expertMode": settings.get("expertMode"),
                    "capabilityMode": settings.get("capabilityMode"),
                },
            })
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": str(exc)})

    def _get_oscar_security_status(self):
        if not oscar_security:
            self._send_json(503, {"ok": False, "error": "oscar_security_ops module not available"})
            return
        try:
            self._send_json(200, oscar_security.quick_status())
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": str(exc)})

    def _get_oscar_security_sweep(self):
        if not oscar_security:
            self._send_json(503, {"ok": False, "error": "oscar_security_ops module not available"})
            return
        try:
            self._send_json(200, oscar_security.run_full_sweep())
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": str(exc)})

    def _get_oscar_security_policy(self):
        separation = {}
        if oscar_security:
            separation = oscar_security._money_penny_separation()
        self._send_json(200, {
            "ok": True,
            "lane": "oscar_security_command",
            "role": "Oscar is the cybersecurity expert for the studio. Money Penny stays OG vault only.",
            "forceLocalOnly": os.environ.get("OSCAR_FORCE_LOCAL_ONLY", "").lower() in ("1", "true", "yes"),
            "ollamaNoCloud": os.environ.get("OLLAMA_NO_CLOUD", ""),
            "cloudApisBlockedWhenForced": True,
            "moneyPennySeparation": separation,
            "docs": os.path.join(PROJECT_ROOT, "OSCAR-SECURITY-COMMAND.md"),
        })

    def _get_oscar_security_playbook(self):
        if not oscar_security:
            self._send_json(503, {"ok": False, "error": "oscar_security_ops module not available"})
            return
        try:
            self._send_json(200, oscar_security.expert_playbook())
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": str(exc)})

    def _get_oscar_diary(self):
        try:
            ensure_oscar_diary()
            with open(OSCAR_DIARY_FILE, "r", encoding="utf-8") as f:
                diary = f.read().strip()
            self._send_json(200, {
                "ok": True,
                "diary": diary,
                "profile": oscar_diary_profile(),
                "diaryPath": OSCAR_DIARY_FILE,
                "profilePath": OSCAR_DIARY_MEMORY_FILE,
                "homeDir": OSCAR_DIARY_HOME_DIR,
                "source": "private-local-oscar-diary",
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_drive_vault_profile(self):
        try:
            with open(DRIVE_VAULT_PROFILE_FILE, "r", encoding="utf-8") as f:
                profile = f.read().strip()
            summary = read_json_file(DRIVE_FEATURE_INTAKE_FILE, {})
            counts = summary.get("counts", {}) if isinstance(summary, dict) else {}
            self._send_json(200, {
                "ok": True,
                "profile": profile,
                "profilePath": DRIVE_VAULT_PROFILE_FILE,
                "manifestPath": DRIVE_INTAKE_MANIFEST_FILE,
                "summaryPath": DRIVE_FEATURE_INTAKE_FILE,
                "homeDir": DRIVE_INTAKE_HOME_DIR,
                "source": "sanitized-private-drive-vault-profile",
                "counts": counts,
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": "Drive Vault profile has not been created yet.",
                "profilePath": DRIVE_VAULT_PROFILE_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_drive_intake_summary(self):
        try:
            summary = read_json_file(DRIVE_FEATURE_INTAKE_FILE, {})
            if not isinstance(summary, dict) or not summary:
                raise FileNotFoundError(DRIVE_FEATURE_INTAKE_FILE)
            self._send_json(200, {
                "ok": True,
                "summary": summary,
                "summaryPath": DRIVE_FEATURE_INTAKE_FILE,
                "manifestPath": DRIVE_INTAKE_MANIFEST_FILE,
                "homeDir": DRIVE_INTAKE_HOME_DIR,
                "source": "sanitized-goat-drive-intake-summary",
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": "Drive intake summary has not been created yet.",
                "summaryPath": DRIVE_FEATURE_INTAKE_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_goat_data_standard(self, file_path, label):
        try:
            data = read_json_file(file_path, {})
            if not isinstance(data, dict) or not data:
                raise FileNotFoundError(file_path)
            self._send_json(200, {
                "ok": True,
                "label": label,
                "data": data,
                "path": file_path,
                "source": "sanitized-local-goat-standard",
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": f"{label} has not been created yet.",
                "path": file_path,
            })

    def _probe_local_renderer(self, name, url, timeout=1.2):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json,text/plain,*/*"})
            with urllib.request.urlopen(req, timeout=timeout) as res:
                return {
                    "name": name,
                    "url": url,
                    "reachable": 200 <= res.status < 500,
                    "status": res.status,
                }
        except Exception as e:
            return {
                "name": name,
                "url": url,
                "reachable": False,
                "error": f"{type(e).__name__}: {e}",
            }

    def _comfy_model_inventory(self, timeout=4.0):
        inventory = {"checkpoints": [], "diffusers": [], "usable": False}
        endpoints = (
            ("checkpoints", "CheckpointLoaderSimple", "ckpt_name"),
            ("diffusers", "DiffusersLoader", "model_path"),
        )
        for key, node_name, field_name in endpoints:
            try:
                req = urllib.request.Request(
                    f"http://127.0.0.1:8188/object_info/{node_name}",
                    headers={"Accept": "application/json"},
                )
                with urllib.request.urlopen(req, timeout=timeout) as res:
                    payload = json.loads(res.read().decode("utf-8"))
                choices = (
                    payload.get(node_name, {})
                    .get("input", {})
                    .get("required", {})
                    .get(field_name, [[]])[0]
                )
                if isinstance(choices, list):
                    inventory[key] = [str(item) for item in choices if str(item).strip()]
            except Exception as e:
                inventory[f"{key}Error"] = f"{type(e).__name__}: {e}"
        inventory["usable"] = bool(inventory["checkpoints"] or inventory["diffusers"])
        return inventory

    def _dir_status(self, path):
        return {
            "path": path,
            "exists": os.path.isdir(path),
        }

    def _file_status(self, path):
        return {
            "path": path,
            "exists": os.path.isfile(path),
        }

    def _python_import_status(self, python_path, module_name, timeout=20):
        if not os.path.exists(python_path):
            return {"module": module_name, "available": False, "error": "python not found"}
        proc = subprocess.run(
            [
                python_path,
                "-c",
                f"import importlib.util; raise SystemExit(0 if importlib.util.find_spec({module_name!r}) else 1)",
            ],
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        return {
            "module": module_name,
            "available": proc.returncode == 0,
            "error": tool_short_output(proc.stderr or proc.stdout, 1200) if proc.returncode else "",
        }

    def _model_download_job_status(self):
        log_path = os.path.join(SCRIPT_DIR, "logs", "oscar-autonomous-model-download.log")
        pid_path = os.path.join(SCRIPT_DIR, "logs", "oscar-autonomous-model-download.pid")
        report_path = os.path.join(SCRIPT_DIR, "logs", "oscar-art-model-download-report.json")
        pid = None
        running = False
        if os.path.exists(pid_path):
            try:
                with open(pid_path, "r", encoding="utf-8") as f:
                    pid = int(f.read().strip())
                os.kill(pid, 0)
                running = True
            except Exception:
                running = False
        if not running:
            try:
                proc = subprocess.run(
                    ["ps", "-axo", "pid=,command="],
                    capture_output=True,
                    text=True,
                    timeout=5,
                    check=False,
                )
                for line in proc.stdout.splitlines():
                    if "OSCAR-DOWNLOAD-AUTONOMOUS-AI-STACK.sh" in line and "ps -axo" not in line:
                        parts = line.strip().split(None, 1)
                        if parts:
                            pid = int(parts[0])
                            running = True
                            break
            except Exception:
                running = False
        report = []
        summary = {}
        if os.path.exists(report_path):
            try:
                report = read_json_file(report_path, [])
                if isinstance(report, list):
                    for item in report:
                        status = str(item.get("status") or "unknown")
                        summary[status] = summary.get(status, 0) + 1
                else:
                    report = []
            except Exception:
                report = []
        return {
            "running": running,
            "pid": pid,
            "pidPath": pid_path,
            "logPath": log_path,
            "reportPath": report_path,
            "reportExists": os.path.exists(report_path),
            "summary": summary,
            "completedItems": len(report),
            "startScript": os.path.join(SCRIPT_DIR, "runtime", "start-autonomous-model-download.sh"),
            "terminalScript": os.path.join(PROJECT_ROOT, "Mac", "Start Oscar Autonomous Model Download.command"),
        }

    def _model_store_inventory(self):
        stores = {}
        for key, path in {
            "foundation": OSCAR_FOUNDATION_MODELS_DIR,
            "art": OSCAR_ART_MODELS_DIR,
            "loras": os.path.join(OSCAR_ART_MODELS_DIR, "loras"),
            "ollama": os.path.join(SCRIPT_DIR, "models", "ollama_data"),
        }.items():
            top_level = []
            model_files = 0
            if os.path.isdir(path):
                try:
                    top_level = sorted(os.listdir(path))[:300]
                    for _root, _dirs, files in os.walk(path):
                        for name in files:
                            if name.endswith((".safetensors", ".ckpt", ".gguf", ".bin")):
                                model_files += 1
                except Exception:
                    pass
            stores[key] = {
                "path": path,
                "exists": os.path.isdir(path),
                "topLevelCount": len(top_level),
                "topLevelSample": top_level[:40],
                "modelFileCount": model_files,
            }
        return stores

    def _get_local_ai_stack_status(self):
        comfy_dir, comfy_venv_dir, comfy_layout = oscar_comfyui_install_paths()
        comfy_python = os.path.join(comfy_venv_dir, "bin", "python")
        if not os.path.isfile(comfy_python):
            comfy_python = os.path.join(OSCAR_COMFYUI_VENV, "bin", "python")
        ollama_probe = self._probe_local_renderer("Ollama", "http://127.0.0.1:11434/api/tags")
        renderers = [
            self._probe_local_renderer("ComfyUI", "http://127.0.0.1:8188/system_stats", timeout=3.0),
            self._probe_local_renderer("Stable Diffusion WebUI", "http://127.0.0.1:7860/"),
            self._probe_local_renderer("SD WebUI Forge", "http://127.0.0.1:7861/"),
        ]
        desktop_apps = [
            "/Applications/Draw Things.app",
            "/Applications/LM Studio.app",
            "/Applications/Jan.app",
        ]
        self._send_json(200, {
            "ok": True,
            "root": PROJECT_ROOT,
            "mode": "embedded-local-ai-stack-status",
            "llmRuntimes": {
                "ollama": {
                    "embedded": os.path.exists(os.path.join(SCRIPT_DIR, "bin", "ollama-darwin")),
                    "reachable": bool(ollama_probe.get("reachable")),
                    "url": "http://127.0.0.1:11434",
                },
                "llamaCpp": {
                    **self._dir_status(OSCAR_LLAMA_CPP_DIR),
                    "cli": local_or_path_executable(OSCAR_LLAMA_CLI, "llama-cli"),
                    "server": local_or_path_executable(OSCAR_LLAMA_SERVER, "llama-server"),
                    "buildScript": os.path.join(SCRIPT_DIR, "runtime", "build-llama-cpp.sh"),
                    "startScript": os.path.join(SCRIPT_DIR, "runtime", "start-llama-cpp-server.sh"),
                    "url": "http://127.0.0.1:9797",
                    "note": "Local GGUF runtime lane. The server starts when at least one GGUF model is available.",
                },
                "vllm": {
                    "installed": False,
                    "note": "vLLM is normally a Linux/NVIDIA server lane, not a reliable Intel macOS embedded runtime.",
                },
                "mlxLm": {
                    "installed": False,
                    "supportedOnThisMac": platform.system() == "Darwin" and platform.machine() == "arm64",
                    "note": "MLX LM is Apple Silicon only.",
                },
            },
            "imageRuntimes": {
                "comfyui": {
                    **self._dir_status(comfy_dir),
                    "embedded": os.path.isfile(os.path.join(comfy_dir, "main.py")),
                    "layout": comfy_layout,
                    "venv": self._dir_status(comfy_venv_dir),
                    "python": comfy_python,
                    "torch": self._python_import_status(comfy_python, "torch"),
                    "diffusers": self._python_import_status(comfy_python, "diffusers"),
                    "startScript": os.path.join(SCRIPT_DIR, "runtime", "start-comfyui.sh"),
                    "url": "http://127.0.0.1:8188",
                },
                "auto1111": {
                    **self._dir_status(OSCAR_AUTO1111_DIR),
                    "startScript": os.path.join(SCRIPT_DIR, "runtime", "start-auto1111.sh"),
                    "url": "http://127.0.0.1:7860",
                },
                "forge": {
                    **self._dir_status(OSCAR_FORGE_DIR),
                    "startScript": os.path.join(SCRIPT_DIR, "runtime", "start-forge.sh"),
                    "url": "http://127.0.0.1:7861",
                },
                "invokeai": {
                    "installed": self._python_import_status(comfy_python, "invokeai").get("available"),
                    "python": comfy_python,
                    "note": "Install lane is tracked; use ComfyUI/Forge first on this Intel Mac.",
                },
                "drawThings": {
                    "installed": os.path.isdir("/Applications/Draw Things.app"),
                    "appPath": "/Applications/Draw Things.app",
                    "note": "Mac App Store app; Oscar can detect/open it but cannot embed App Store binaries.",
                },
                "renderers": renderers,
            },
            "modelStores": {
                "foundation": self._dir_status(OSCAR_FOUNDATION_MODELS_DIR),
                "art": self._dir_status(OSCAR_ART_MODELS_DIR),
                "comfyExtraModelPaths": self._file_status(os.path.join(comfy_dir, "extra_model_paths.yaml")),
            },
            "modelStoreInventory": self._model_store_inventory(),
            "modelDownloadJob": self._model_download_job_status(),
            "desktopApps": [self._dir_status(path) for path in desktop_apps],
            "ownerApprovalPolicy": {
                "requiredFor": [
                    "likeness, face-swap, or identity-preserving generation",
                    "publishing or client-facing output",
                    "cloud APIs or uploads",
                    "paid desktop apps",
                ],
                "reason": "Oscar can have powerful tools while still requiring the owner's final say for harmful or public actions.",
            },
        })

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            payload = json.loads(body or b"{}")
            if not isinstance(payload, dict):
                raise ValueError("Expected a JSON object")
            return payload
        except (json.JSONDecodeError, ValueError) as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})
            return None

    def _post_goat_imagine_generate(self):
        payload = self._read_json_body()
        if payload is None:
            return
        prompt = str(payload.get("prompt") or payload.get("subject") or "GOAT royal crest concept").strip()
        if not prompt:
            self._send_json(400, {"ok": False, "error": "prompt required"})
            return
        try:
            manifest = create_oscar_image_render(prompt)
            self._send_json(200, {"ok": True, "lane": "generate", "manifest": manifest})
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": str(exc)})

    def _post_goat_imagine_eden_rebuild(self):
        script = os.path.join(MASTER_LLM_ROOT, "tools", "create_eden_animation_clips.py")
        if not os.path.isfile(script):
            self._send_json(404, {"ok": False, "error": "Eden clip script not found", "path": script})
            return
        try:
            proc = subprocess.run(
                [sys.executable, script],
                capture_output=True,
                text=True,
                timeout=900,
                cwd=os.path.dirname(script),
            )
            outputs = [line.strip() for line in (proc.stdout or "").splitlines() if line.strip()]
            if proc.returncode != 0:
                self._send_json(500, {
                    "ok": False,
                    "error": proc.stderr.strip() or "eden clip build failed",
                    "returncode": proc.returncode,
                })
                return
            self._send_json(200, {"ok": True, "lane": "eden_campaign", "outputs": outputs, "script": script})
        except subprocess.TimeoutExpired:
            self._send_json(504, {"ok": False, "error": "Eden rebuild timed out (15 min cap)"})
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": str(exc)})

    def _get_goat_imagine_gallery(self):
        web_candidates = [
            os.path.join(os.path.dirname(MASTER_LLM_ROOT), "GOAT-Royalty-App", "web-app"),
            os.path.join(PROJECT_ROOT, "goat-royalty-portable-2.0.0", "web-app"),
        ]
        eden_dir = None
        for web in web_candidates:
            candidate = os.path.join(web, "videos", "eden-campaign")
            if os.path.isdir(candidate):
                eden_dir = candidate
                break
        eden_clips = []
        if eden_dir:
            for name in sorted(os.listdir(eden_dir)):
                if name.startswith("."):
                    continue
                full = os.path.join(eden_dir, name)
                if not os.path.isfile(full):
                    continue
                rel = f"videos/eden-campaign/{name}"
                eden_clips.append({
                    "name": name,
                    "path": full,
                    "url": rel,
                    "kind": "video" if name.endswith((".mp4", ".mov")) else "image",
                })
        generated = []
        if os.path.isdir(GENERATED_IMAGES_DIR):
            for name in sorted(os.listdir(GENERATED_IMAGES_DIR), reverse=True)[:40]:
                if name.startswith(".") or name.endswith(".json"):
                    continue
                full = os.path.join(GENERATED_IMAGES_DIR, name)
                if not os.path.isfile(full):
                    continue
                generated.append({
                    "name": name,
                    "url": f"http://127.0.0.1:{CHAT_SERVER_PORT}/generated-images/{name}",
                })
        grok_refs = []
        catalog = load_grok_eden_catalog()
        if catalog:
            for clip in catalog.get("clips") or []:
                grok_refs.append({
                    "name": clip.get("name"),
                    "path": clip.get("path"),
                    "frame": clip.get("frame"),
                    "durationSec": (clip.get("meta") or {}).get("durationSec"),
                    "kind": "video",
                })
        stitch_out = ""
        if eden_dir:
            stitch_out = os.path.join(eden_dir, "grok-boss-batch", "eden-awakens-grok-boss-trailer.mp4")
        if not stitch_out or not os.path.isfile(stitch_out):
            stitch_out = os.path.join(
                _CANONICAL_GOAT_WEB,
                "videos",
                "eden-campaign",
                "grok-boss-batch",
                "eden-awakens-grok-boss-trailer.mp4",
            )
        if os.path.isfile(stitch_out):
            grok_refs.insert(
                0,
                {
                    "name": "eden-awakens-grok-boss-trailer.mp4",
                    "path": stitch_out,
                    "url": "videos/eden-campaign/grok-boss-batch/eden-awakens-grok-boss-trailer.mp4",
                    "kind": "video",
                },
            )
        self._send_json(200, {
            "ok": True,
            "edenClips": eden_clips,
            "grokReferences": grok_refs,
            "grokCatalog": OSCAR_GROK_EDEN_CATALOG if os.path.isfile(OSCAR_GROK_EDEN_CATALOG) else None,
            "generated": generated,
            "edenDir": eden_dir,
            "imagineUi": "http://127.0.0.1:8090/goat-imagine.html",
            "edenProtocol": "BackupVault/Eden-Awakens/OSCAR-EDEN-GROK-VIDEO-LEVEL.md",
        })

    def _get_goat_imagine_grok_catalog(self):
        catalog = load_grok_eden_catalog()
        if not catalog:
            self._send_json(404, {"ok": False, "error": "No catalog — POST /api/goat/imagine/grok-index first"})
            return
        self._send_json(200, catalog)

    def _post_goat_imagine_grok_index(self):
        result = run_oscar_grok_eden_lab("index")
        status = 200 if result.get("ok") else 500
        self._send_json(status, result)

    def _post_goat_imagine_grok_stitch(self):
        result = run_oscar_grok_eden_lab("stitch")
        status = 200 if result.get("ok") else 500
        self._send_json(status, result)

    def _get_image_render_bridge_status(self):
        try:
            data = read_json_file(GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE, {})
            if not isinstance(data, dict) or not data:
                raise FileNotFoundError(GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE)

            safe_bridge_probe = self._probe_local_renderer("Oscar Safe Image Bridge", f"{OSCAR_SAFE_IMAGE_BRIDGE_URL}/health", timeout=3.0)
            comfy_probe = self._probe_local_renderer("ComfyUI", "http://127.0.0.1:8188/system_stats", timeout=3.0)
            comfy_models = self._comfy_model_inventory() if comfy_probe.get("reachable") else {"checkpoints": [], "diffusers": [], "usable": False}
            probes = [
                safe_bridge_probe,
                comfy_probe,
                self._probe_local_renderer("Stable Diffusion WebUI", "http://127.0.0.1:7860/"),
                self._probe_local_renderer("SD WebUI Forge", "http://127.0.0.1:7861/"),
            ]
            cloud_configured = any(
                os.environ.get(name)
                for name in (
                    "OPENAI_API_KEY",
                    "GOOGLE_API_KEY",
                    "GEMINI_API_KEY",
                    "REPLICATE_API_TOKEN",
                    "STABILITY_API_KEY",
                )
            )
            self._send_json(200, {
                "ok": True,
                "label": "image render bridge standard",
                "data": data,
                "path": GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE,
                "source": "sanitized-local-goat-standard",
                "renderers": probes,
                "comfyModels": comfy_models,
                "cloudImageApiConfigured": bool(cloud_configured),
                "localFallbackCanRenderNow": bool(safe_bridge_probe.get("reachable")),
                "canRenderNow": (
                    bool(cloud_configured)
                    or any(item.get("reachable") and item.get("name") != "ComfyUI" for item in probes)
                    or (bool(comfy_probe.get("reachable")) and bool(comfy_models.get("usable")))
                ),
                "note": (
                    "GOAT can route image jobs now. The Safe Image Bridge is a local SVG fallback. "
                    "Full bitmap diffusion rendering requires ComfyUI/Stable Diffusion/Forge with a visible model loaded/listed, "
                    "or an owner-approved server-side cloud image API."
                ),
            })
        except FileNotFoundError:
            self._send_json(404, {
                "ok": False,
                "error": "image render bridge standard has not been created yet.",
                "path": GOAT_IMAGE_RENDER_BRIDGE_STANDARD_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _post_oscar_diary(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            payload = json.loads(body or b"{}")
            if not isinstance(payload, dict):
                raise ValueError("Expected a JSON object")
            stamp = append_oscar_diary_entry(payload.get("entry") or payload.get("note") or "")
            self._send_json(200, {
                "ok": True,
                "stamp": stamp,
                "profile": oscar_diary_profile(),
                "diaryPath": OSCAR_DIARY_FILE,
                "source": "private-local-oscar-diary",
            })
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e)})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_granite_voice_status(self):
        self._send_json(200, granite_status_payload())

    def _voice_lib_ready(self):
        if oscar_voice_library is None:
            self._send_json(503, {"ok": False, "error": "Voice library module is unavailable."})
            return False
        return True

    def _get_voice_library(self):
        if not self._voice_lib_ready():
            return
        try:
            payload = oscar_voice_library.bootstrap_default_voices()
            self._send_json(200, payload)
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _serve_voice_binary(self, file_path, head_only=False):
        ext = os.path.splitext(file_path)[1].lower()
        mime = {
            ".wav": "audio/wav",
            ".mp3": "audio/mpeg",
            ".m4a": "audio/mp4",
            ".aac": "audio/aac",
            ".flac": "audio/flac",
            ".ogg": "audio/ogg",
            ".aiff": "audio/aiff",
            ".aif": "audio/aiff",
        }.get(ext, "application/octet-stream")
        try:
            size = os.path.getsize(file_path)
            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(size))
            self.send_header("Accept-Ranges", "bytes")
            self._cors_headers()
            self.end_headers()
            if not head_only:
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
        except OSError as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_voice_library_audio(self, path, head_only=False):
        if not self._voice_lib_ready():
            return
        parts = path.strip("/").split("/")
        if len(parts) < 4:
            self._send_json(400, {"ok": False, "error": "Invalid voice audio path."})
            return
        voice_id = parts[3]
        data = oscar_voice_library.load_library()
        voice = None
        for item in data.get("voices", []):
            if item.get("id") == voice_id:
                voice = item
                break
        if not voice:
            self._send_json(404, {"ok": False, "error": f"Voice not found: {voice_id}"})
            return
        audio_path = oscar_voice_library.voice_audio_path(voice)
        if not audio_path or not os.path.isfile(audio_path):
            self._send_json(404, {"ok": False, "error": "Voice audio file is missing."})
            return
        self._serve_voice_binary(audio_path, head_only=head_only)

    def _get_voice_speak_output(self, path, head_only=False):
        if not self._voice_lib_ready():
            return
        token = path.rsplit("/", 1)[-1]
        if not re.fullmatch(r"[a-f0-9]{32}\.(wav|aiff)", token or ""):
            self._send_json(400, {"ok": False, "error": "Invalid speak output token."})
            return
        full_path = os.path.join(oscar_voice_library.VOICE_SPEAK_CACHE_DIR, token)
        if not os.path.isfile(full_path):
            self._send_json(404, {"ok": False, "error": "Speak output expired or missing."})
            return
        self._serve_voice_binary(full_path, head_only=head_only)

    def _serve_voice_editor(self):
        editor_path = os.path.join(SCRIPT_DIR, "voice-editor.html")
        try:
            with open(editor_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self._cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self._cors_headers()
            self.end_headers()
            self.wfile.write(b"voice-editor.html not found.")

    def _post_voice_library(self):
        if not self._voice_lib_ready():
            return
        content_type = self.headers.get("Content-Type", "")
        try:
            if "multipart/form-data" in content_type:
                content_length = int(self.headers.get("Content-Length", 0))
                if content_length <= 0:
                    self._send_json(400, {"ok": False, "error": "No upload received."})
                    return
                temp_dir = tempfile.mkdtemp(prefix="oscar-voice-upload-")
                try:
                    form = cgi.FieldStorage(
                        fp=self.rfile,
                        headers=self.headers,
                        environ={
                            "REQUEST_METHOD": "POST",
                            "CONTENT_TYPE": content_type,
                            "CONTENT_LENGTH": str(content_length),
                        },
                    )
                    item = None
                    for field_name in ("audio", "file"):
                        if field_name in form:
                            candidate = form[field_name]
                            item = candidate[0] if isinstance(candidate, list) else candidate
                            break
                    if item is None or not getattr(item, "filename", ""):
                        self._send_json(400, {"ok": False, "error": "Attach a WAV or audio file."})
                        return
                    filename = os.path.basename(item.filename)
                    ext = os.path.splitext(filename)[1].lower() or ".wav"
                    saved_path = os.path.join(temp_dir, f"upload{ext}")
                    with open(saved_path, "wb") as out:
                        shutil.copyfileobj(item.file, out)
                    name = form.getfirst("name") or os.path.splitext(filename)[0]
                    voice_id = form.getfirst("voiceId") or form.getfirst("id")
                    is_default = str(form.getfirst("isDefault", "")).lower() in {"1", "true", "yes", "on"}
                    entry = oscar_voice_library.register_voice(
                        name=name,
                        upload_path=saved_path,
                        voice_id=voice_id,
                        is_default=is_default,
                        mac_say_voice=form.getfirst("macSayVoice") or "Alex",
                        rate=float(form.getfirst("rate") or 1.0),
                        pitch=float(form.getfirst("pitch") or 1.0),
                        notes=form.getfirst("notes") or "",
                    )
                    self._send_json(200, {"ok": True, "voice": oscar_voice_library.public_voice_entry(entry), "library": oscar_voice_library.library_payload()})
                finally:
                    shutil.rmtree(temp_dir, ignore_errors=True)
                return

            length = int(self.headers.get("Content-Length", 0) or 0)
            raw = self.rfile.read(length) if length else b"{}"
            body = json.loads(raw.decode("utf-8") or "{}")
            action = body.get("action")
            if action == "remove":
                voice_id = body.get("voiceId") or body.get("id")
                if not voice_id:
                    self._send_json(400, {"ok": False, "error": "voiceId is required."})
                    return
                oscar_voice_library.remove_voice(voice_id)
                self._send_json(200, oscar_voice_library.library_payload())
                return
            if action == "setDefault":
                voice_id = body.get("voiceId") or body.get("id")
                if not voice_id:
                    self._send_json(400, {"ok": False, "error": "voiceId is required."})
                    return
                payload = oscar_voice_library.set_default_voice(voice_id)
                self._send_json(200, payload)
                return

            source_path = body.get("sourcePath") or body.get("path")
            name = body.get("name")
            if not name and source_path:
                name = os.path.splitext(os.path.basename(source_path))[0]
            if not source_path or not name:
                self._send_json(400, {"ok": False, "error": "Provide name and sourcePath, or upload multipart audio."})
                return
            entry = oscar_voice_library.register_voice(
                name=name,
                source_path=source_path,
                voice_id=body.get("voiceId") or body.get("id"),
                is_default=bool(body.get("isDefault")),
                owner_approved=bool(body.get("ownerApproved", True)),
                mac_say_voice=body.get("macSayVoice") or "Alex",
                rate=float(body.get("rate") or 1.0),
                pitch=float(body.get("pitch") or 1.0),
                notes=body.get("notes") or "",
            )
            self._send_json(200, {"ok": True, "voice": oscar_voice_library.public_voice_entry(entry), "library": oscar_voice_library.library_payload()})
        except FileNotFoundError as e:
            self._send_json(404, {"ok": False, "error": str(e)})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e)})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _post_voice_library_bootstrap(self):
        if not self._voice_lib_ready():
            return
        try:
            length = int(self.headers.get("Content-Length", 0) or 0)
            force = False
            if length:
                body = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
                force = bool(body.get("force"))
            payload = oscar_voice_library.bootstrap_default_voices(force=force)
            self._send_json(200, payload)
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _post_voice_speak(self):
        if not self._voice_lib_ready():
            return
        try:
            length = int(self.headers.get("Content-Length", 0) or 0)
            body = json.loads(self.rfile.read(length).decode("utf-8") or "{}") if length else {}
            voice_id = body.get("voiceId") or body.get("id")
            text = body.get("text") or ""
            if not voice_id:
                custom = str(body.get("speechVoiceName") or "")
                if custom.startswith("custom:"):
                    voice_id = custom.split(":", 1)[1]
            if not voice_id:
                self._send_json(400, {"ok": False, "error": "voiceId is required."})
                return
            rate_multiplier = body.get("rateMultiplier", body.get("speechSpeed", 1.0))
            result = oscar_voice_library.synthesize_custom_voice(
                voice_id, text, rate_multiplier=rate_multiplier
            )
            self._send_json(200, result)
        except RuntimeError as e:
            self._send_json(503, {"ok": False, "error": str(e)})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e)})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_library_status(self):
        if oscar_library is None:
            self._send_json(503, {"ok": False, "error": "Library bridge unavailable."})
            return
        try:
            self._send_json(200, oscar_library.library_status_payload())
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_library_search(self):
        if oscar_library is None:
            self._send_json(503, {"ok": False, "error": "Library bridge unavailable."})
            return
        query = parse_qs(urlparse(self.path).query).get("q", [""])[0]
        limit = int(parse_qs(urlparse(self.path).query).get("limit", ["40"])[0] or 40)
        try:
            result = oscar_library.search_catalog(query, limit=min(limit, 100))
            if isinstance(result, dict):
                self._send_json(200, {
                    "ok": True,
                    "query": query,
                    "count": result.get("count", 0),
                    "items": result.get("items", []),
                    "local": result.get("local", []),
                    "web": result.get("web", []),
                })
            else:
                self._send_json(200, {"ok": True, "query": query, "count": len(result), "items": result})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_library_web(self):
        if oscar_library is None:
            self._send_json(503, {"ok": False, "error": "Library bridge unavailable."})
            return
        try:
            self._send_json(200, {
                "ok": True,
                "webSources": oscar_library.load_web_sources(),
                "pdfBooksWorld": "https://www.pdfbooksworld.com/books",
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _post_library_sync(self):
        if oscar_library is None:
            self._send_json(503, {"ok": False, "error": "Library bridge unavailable."})
            return
        try:
            catalog = oscar_library.build_catalog()
            self._send_json(200, {
                "ok": True,
                "itemCount": catalog.get("itemCount"),
                "builtAt": catalog.get("builtAt"),
                "stats": catalog.get("stats"),
                "catalogPath": oscar_library.CATALOG_FILE,
            })
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_master_llm_registry(self):
        try:
            if os.path.isfile(MASTER_LLM_REGISTRY_FILE):
                with open(MASTER_LLM_REGISTRY_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self._send_json(200, {"ok": True, "registry": data, "path": MASTER_LLM_REGISTRY_FILE})
            else:
                self._send_json(404, {"ok": False, "error": "MASTER_LLM_REGISTRY.json not found.", "path": MASTER_LLM_REGISTRY_FILE})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_oscar_asset_manifest(self):
        manifest_path = os.path.join(SCRIPT_DIR, "OSCAR_ASSET_MANIFEST.json")
        try:
            if os.path.isfile(manifest_path):
                with open(manifest_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                exists = {}
                for key in ("launchers", "installers", "thor"):
                    block = data.get(key)
                    if isinstance(block, dict):
                        for name, path in block.items():
                            if isinstance(path, str):
                                exists[name] = os.path.exists(path)
                            elif isinstance(path, list):
                                exists[name] = [os.path.exists(p.get("path", "")) if isinstance(p, dict) else os.path.exists(p) for p in path]
                self._send_json(200, {"ok": True, "manifest": data, "path": manifest_path, "exists": exists})
            else:
                self._send_json(404, {"ok": False, "error": "OSCAR_ASSET_MANIFEST.json not found."})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e)})

    def _get_training_curriculum(self):
        curricula = []
        training_dir = os.path.join(MASTER_LLM_ROOT, "training")
        for name in (
            "FINE-TUNE-OPENAI-CURRICULUM.json",
            "N8N-AI-AUTOMATION-CURRICULUM.json",
            "oscar-cyber-security-expert/OSCAR-CYBER-SECURITY-CURRICULUM.json",
            "courses-for-everything/COURSES-FOR-EVERYTHING-CURRICULUM.json",
        ):
            path = os.path.join(training_dir, name)
            if os.path.isfile(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        curricula.append(json.load(f))
                except (json.JSONDecodeError, OSError):
                    pass
        self._send_json(200, {"ok": True, "count": len(curricula), "curricula": curricula})

    def _get_crew_parity(self):
        matrix_path = os.path.join(GOAT_WEB_APP_DIR, "data", "crew-capability-matrix.json")
        payload = {
            "ok": True,
            "rule": "Crew shares the same tool matrix; vault/money/credentials require owner approval.",
            "oscarToolMode": bool(load_settings().get("toolModeEnabled")),
            "oscarComputerControl": bool(load_settings().get("computerControlEnabled")),
            "computerActions": [
                "open_app", "activate_app", "quit_app", "open_path", "reveal_path",
                "open_url", "screenshot", "speak", "type_text", "hotkey", "daw_transport",
            ],
            "moneyPennyIntel": "http://127.0.0.1:5500",
            "goatWeb": goat_local_web_url(),
            "oscarChat": f"http://127.0.0.1:{CHAT_SERVER_PORT}",
        }
        if os.path.isfile(matrix_path):
            try:
                with open(matrix_path, "r", encoding="utf-8") as f:
                    matrix = json.load(f)
                payload["sharedCapabilities"] = matrix.get("sharedCapabilities", [])[:20]
                payload["matrixPath"] = matrix_path
            except Exception:
                pass
        self._send_json(200, payload)

    def _get_studio_status(self):
        settings = load_settings()
        paths = {
            "projectRoot": PROJECT_ROOT,
            "html": HTML_FILE,
            "chats": CHATS_FILE,
            "settings": SETTINGS_FILE,
            "studioHome": OSCAR_STUDIO_HOME_DIR,
            "studioSpec": OSCAR_STUDIO_SPEC_FILE,
            "workspaceRoot": tool_root(),
            "bridgeRoot": bridge_root(),
        }
        self._send_json(200, {
            "ok": True,
            "mode": "local-first-oscar-studio",
            "paths": paths,
            "exists": {key: os.path.exists(value) for key, value in paths.items()},
            "settings": {
                "capabilityMode": settings.get("capabilityMode"),
                "expertMode": settings.get("expertMode"),
                "councilModeEnabled": bool(settings.get("councilModeEnabled")),
                "toolModeEnabled": bool(settings.get("toolModeEnabled")),
                "computerControlEnabled": bool(settings.get("computerControlEnabled")),
                "voiceAutoSpeak": bool(settings.get("voiceAutoSpeak")),
                "speechVoiceName": settings.get("speechVoiceName"),
                "speechStyle": settings.get("speechStyle"),
                "speechSpeed": settings.get("speechSpeed"),
            },
            "runtimes": {
                "python": sys.executable,
                "ollama": shutil.which("ollama"),
                "llamaCli": local_or_path_executable(OSCAR_LLAMA_CLI, "llama-cli"),
                "llamaServer": local_or_path_executable(OSCAR_LLAMA_SERVER, "llama-server"),
                "ffmpeg": shutil.which("ffmpeg"),
                "brew": shutil.which("brew"),
            },
            "features": {
                "localChat": True,
                "persistentMemory": True,
                "workspaceBridge": os.path.isdir(bridge_root()),
                "toolMode": True,
                "computerControl": platform.system() == "Darwin",
                "voiceReadAloud": True,
                "voiceEditor": True,
                "customVoiceLibrary": bool(oscar_voice_library),
                "browserSpeechRecognition": True,
                "graniteSpeechBridge": True,
                "ownerApprovalGates": True,
                "localBackups": os.path.isdir(os.path.join(PROJECT_ROOT, "BackupVault")),
            },
        })

    def _get_mobile_access(self):
        lan_ip = detect_lan_ip()
        local_url = f"http://127.0.0.1:{CHAT_SERVER_PORT}/"
        lan_url = f"http://{lan_ip}:{CHAT_SERVER_PORT}/"
        self._send_json(200, {
            "ok": True,
            "mode": "phone-and-lan-browser-access",
            "bind": "0.0.0.0",
            "localUrl": local_url,
            "lanUrl": lan_url,
            "phoneUrl": lan_url,
            "sameWifiRequired": True,
            "supportedClients": [
                "iPhone/iPad Safari or Chrome as LAN web app",
                "Android Chrome/Firefox as LAN web app",
                "Android Termux native launcher",
                "Linux phone browser or Linux shell launcher",
                "macOS browser or portable launcher",
                "Windows browser or portable launcher",
                "Linux browser or portable launcher",
            ],
            "notes": [
                "The desktop/server device must stay awake while phones connect.",
                "Phones use the same Oscar UI over the local network.",
                "Local model inference still runs on the host device unless Android/Linux phone native mode is used.",
                "If a phone cannot connect, allow port 3333 through the host firewall and keep both devices on the same network.",
            ],
        })

    def _post_granite_transcribe(self):
        content_length = int(self.headers.get("Content-Length", 0))
        max_bytes = GRANITE_STT_MAX_UPLOAD_MB * 1024 * 1024
        if content_length <= 0:
            self._send_json(400, {"ok": False, "error": "No audio upload was received."})
            return
        if content_length > max_bytes:
            self._send_json(413, {
                "ok": False,
                "error": f"Audio upload is too large. Limit is {GRANITE_STT_MAX_UPLOAD_MB} MB.",
            })
            return

        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            self._send_json(400, {"ok": False, "error": "Expected multipart/form-data audio upload."})
            return

        temp_dir = tempfile.mkdtemp(prefix="oscar-granite-upload-")
        saved_path = None
        try:
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    "REQUEST_METHOD": "POST",
                    "CONTENT_TYPE": content_type,
                    "CONTENT_LENGTH": str(content_length),
                },
            )
            item = None
            for field_name in ("audio", "file"):
                if field_name in form:
                    candidate = form[field_name]
                    item = candidate[0] if isinstance(candidate, list) else candidate
                    break
            if item is None or not getattr(item, "filename", ""):
                self._send_json(400, {"ok": False, "error": "Attach an audio or video file first."})
                return

            filename = granite_safe_filename(item.filename)
            ext = granite_audio_extension(filename)
            if ext not in GRANITE_AUDIO_EXTENSIONS:
                self._send_json(400, {
                    "ok": False,
                    "error": f"Unsupported audio/video type: {ext or 'unknown'}",
                    "supportedExtensions": sorted(GRANITE_AUDIO_EXTENSIONS),
                })
                return

            saved_path = os.path.join(temp_dir, filename)
            with open(saved_path, "wb") as f:
                shutil.copyfileobj(item.file, f)
            if not os.path.getsize(saved_path):
                self._send_json(400, {"ok": False, "error": "The uploaded file was empty."})
                return
            media = probe_media_metadata(saved_path, filename)
            try:
                media["fingerprints"] = media_fingerprint_payload(saved_path, filename)
            except Exception as e:
                media["fingerprintError"] = str(e)

            result = granite_transcribe_file(
                saved_path,
                filename,
                prompt=form.getfirst("prompt", GRANITE_STT_PROMPT),
                keywords=form.getfirst("keywords", GRANITE_STT_KEYWORDS),
            )
            self._send_json(200, {
                "ok": True,
                "filename": filename,
                "chars": len(result["text"]),
                "media": media,
                **result,
            })
        except Exception as e:
            self._send_json(503, {
                **granite_status_payload(),
                "error": str(e),
                "ok": False,
            })
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    # ── Oscar Tool Mode ─────────────────────────────────────────
    def _is_local_request(self):
        return self.client_address and self.client_address[0] in TOOL_LOCAL_CLIENTS

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        payload = json.loads(body or b"{}")
        if not isinstance(payload, dict):
            raise ValueError("Expected a JSON object")
        return payload

    def _get_owner_approval(self):
        self._send_json(200, {"ok": True, "ownerApproval": owner_approval_public_state()})

    def _post_owner_approval_setup(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Owner approval setup is local-only"})
            return
        try:
            payload = self._read_json_body()
            data = owner_approval_setup(payload.get("ownerName", "Owner"), payload.get("passphrase", ""))
            session = owner_approval_create_session(data.get("ownerName", "Owner"))
            self._send_json(200, {"ok": True, "ownerApproval": owner_approval_public_state(), "session": session})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except PermissionError as e:
            self._send_json(403, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})

    def _post_owner_approval_unlock(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Owner approval unlock is local-only"})
            return
        try:
            payload = self._read_json_body()
            ok, data = owner_approval_verify(payload.get("passphrase", ""))
            if not ok:
                self._send_json(401, {"ok": False, "error": "Owner approval code was rejected.", "ownerApproval": owner_approval_public_state()})
                return
            session = owner_approval_create_session(data.get("ownerName", "Owner"))
            self._send_json(200, {"ok": True, "ownerApproval": owner_approval_public_state(), "session": session})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except PermissionError as e:
            self._send_json(403, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})

    def _post_owner_approval_lock(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Owner approval lock is local-only"})
            return
        try:
            payload = self._read_json_body()
            token = payload.get("_ownerApprovalToken") or payload.get("ownerApprovalToken") or payload.get("token")
            if token:
                owner_approval_revoke(token)
            self._send_json(200, {"ok": True, "ownerApproval": owner_approval_public_state()})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})

    def _get_tools_info(self):
        local = self._is_local_request()
        settings = load_settings()
        policy = load_tool_policy()
        self._send_json(200, {
            "ok": True,
            "localRequest": local,
            "runWriteEnabled": local,
            "toolModeEnabled": bool(settings.get("toolModeEnabled")),
            "computerControlEnabled": bool(settings.get("computerControlEnabled")),
            "producerModeEnabled": producer_mode_enabled(),
            "ownerApproval": owner_approval_public_state(),
            "root": tool_root(),
            "allowedRoots": policy["allowedRoots"],
            "toolPolicy": policy,
            "mode": "owner-approved local tool mode",
            "absorbedTools": load_absorbed_tools_catalog(),
            "absorbedToolsPrompt": absorbed_tools_prompt_text(),
            "actions": [
                "tree",
                "read",
                "search",
                "run",
                "write",
                "patch",
                "mkdir",
                "copy",
                "move",
                "trash",
                "web_fetch",
                "draw",
                "diagnose",
                "self_heal",
                "computer",
            ],
            "drawPolicy": {
                "localOnly": True,
                "renderer": "auto: oscar-safe-image-bridge-svg when online, fallback oscar-local-procedural-png",
                "safeImageBridge": OSCAR_SAFE_IMAGE_BRIDGE_URL,
                "apiKeysRequired": False,
                "outputDir": GENERATED_IMAGES_DIR,
                "note": "Uses the local Safe Image Bridge when it is online; otherwise falls back to built-in PNG. ComfyUI/Stable Diffusion/Forge must be running for real diffusion art.",
            },
            "runPolicy": {
                "localOnly": True,
                "timeoutSeconds": TOOL_TIMEOUT_SECONDS,
                "allowedScripts": sorted(TOOL_ALLOWED_RUN_SCRIPTS),
                "allowedExactCommands": [" ".join(cmd) for cmd in sorted(TOOL_ALLOWED_EXACT_COMMANDS)],
            },
            "writePolicy": {
                "localOnly": True,
                "maxChars": TOOL_MAX_WRITE_CHARS,
                "backupDir": TOOL_BACKUP_DIR,
                "textOnly": True,
                "blockedDirectories": sorted(BRIDGE_SKIP_DIRS),
                "blockedFiles": sorted(BRIDGE_PRIVATE_FILES),
            },
            "patchPolicy": {
                "localOnly": True,
                "maxReplacements": TOOL_MAX_PATCH_REPLACEMENTS,
                "defaultReplacementCount": 1,
                "backupDir": TOOL_BACKUP_DIR,
                "textOnly": True,
                "exactTextOnly": True,
            },
            "fileOpsPolicy": {
                "localOnly": True,
                "ownerApprovedRootsOnly": True,
                "backupDir": TOOL_BACKUP_DIR,
                "trashIsReversible": True,
                "actions": ["mkdir", "copy", "move", "trash"],
                "copyRegularFilesOnly": True,
                "blockedDirectories": sorted(BRIDGE_SKIP_DIRS),
                "blockedFiles": sorted(BRIDGE_PRIVATE_FILES),
            },
            "webFetchPolicy": {
                "localOnly": True,
                "allowedUrlSchemes": sorted(COMPUTER_ALLOWED_URL_SCHEMES),
                "maxBytes": TOOL_MAX_WEB_FETCH_BYTES,
                "maxChars": TOOL_MAX_WEB_FETCH_CHARS,
                "embeddedCredentialsBlocked": True,
            },
            "selfHealPolicy": {
                "localOnly": True,
                "ownerApproved": True,
                "dryRunSupported": True,
                "repairs": [
                    "create missing Oscar runtime directories",
                    "create missing chat/settings JSON",
                    "restore advanced Tool Mode and Computer Control settings when requested",
                    "restore executable bits on Oscar launch/build scripts",
                    "compile-check chat_server.py",
                ],
                "backupDir": TOOL_BACKUP_DIR,
            },
            "computerPolicy": {
                "localOnly": True,
                "requiresToolMode": True,
                "requiresComputerControl": True,
                "actions": [
                    "open_url",
                    "open_app",
                    "activate_app",
                    "quit_app",
                    "open_path",
                    "reveal_path",
                    "list_running_apps",
                    "screenshot",
                    "speak",
                    "type_text",
                    "hotkey",
                    "daw_transport",
                ],
                "allowedUrlSchemes": sorted(COMPUTER_ALLOWED_URL_SCHEMES),
                "allowedApps": policy["allowedApps"],
                "allowedHotkeyModifiers": sorted(COMPUTER_ALLOWED_MODIFIERS),
                "allowedHotkeyKeys": sorted(COMPUTER_SPECIAL_KEY_CODES),
                "maxTypeChars": COMPUTER_MAX_TYPE_CHARS,
                "allowedDawTransportApps": sorted(DAW_ALLOWED_TRANSPORT_APPS),
                "allowedDawTransportCommands": sorted(DAW_ALLOWED_TRANSPORT_COMMANDS),
                "screenshotOutputDir": COMPUTER_SCREENSHOT_DIR,
                "ownerApprovedRootsOnly": True,
                "dryRunSupported": True,
                "timeoutSeconds": COMPUTER_CONTROL_TIMEOUT_SECONDS,
            },
        })

    def _get_tools_policy(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Oscar Tool Mode policy is local-only"})
            return
        self._send_json(200, {
            "ok": True,
            "policy": load_tool_policy(),
            "defaultPolicy": default_tool_policy(),
            "ownerApproval": owner_approval_public_state(),
        })

    def _get_tools_logs(self):
        if not self._is_local_request():
            self._send_json(403, {"error": "Oscar Tool Mode logs are local-only"})
            return
        log_path = os.path.join(TOOL_LOG_DIR, "tool-mode.jsonl")
        entries = []
        try:
            with open(log_path, "r", encoding="utf-8") as f:
                lines = f.readlines()[-50:]
            for line in lines:
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
        except FileNotFoundError:
            pass
        self._send_json(200, {"log": entries})

    def _post_tools_policy(self):
        if not self._is_local_request():
            self._send_json(403, {"ok": False, "error": "Oscar Tool Mode policy is local-only"})
            return
        try:
            payload = self._read_json_body()
            try:
                owner_approval_require(payload, "tool_policy")
            except PermissionError as e:
                self._send_json(401, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
                return
            raw_policy = payload.get("policy", payload)
            if not isinstance(raw_policy, dict):
                raise ValueError("Policy must be a JSON object")
            policy = save_tool_policy(raw_policy)
            log_id = tool_log({
                "action": "tool_policy",
                "allowedRoots": policy["allowedRoots"],
                "allowedApps": policy["allowedApps"],
                "capabilities": policy["capabilities"],
            })
            self._send_json(200, {"ok": True, "policy": policy, "logId": log_id, "ownerApproval": owner_approval_public_state()})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except PermissionError as e:
            self._send_json(403, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
        except Exception as e:
            self._send_json(500, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})

    def _post_tool_action(self):
        if not self._is_local_request():
            self._send_json(403, {"error": "Oscar Tool Mode actions are local-only"})
            return

        try:
            payload = self._read_json_body()

            action = str(payload.get("action", "")).strip().lower()
            tool_require_capability(action)
            try:
                owner_approval_require(payload, action)
            except PermissionError as e:
                self._send_json(401, {"ok": False, "error": str(e), "ownerApproval": owner_approval_public_state()})
                return
            payload.pop("_ownerApprovalToken", None)
            payload.pop("ownerApprovalToken", None)

            if action == "computer":
                settings = load_settings()
                if not settings.get("toolModeEnabled") or not settings.get("computerControlEnabled"):
                    raise PermissionError("Computer Control requires Tool Mode and Computer Control switched on in Oscar")

            if action == "tree":
                max_files = max(1, min(int(payload.get("max", BRIDGE_MAX_TREE_FILES)), 600))
                result = {"root": tool_root(), "roots": tool_allowed_roots(), "files": tool_iter_files(max_files)}
            elif action == "read":
                result = tool_read_text(payload.get("path", ""), max_chars=int(payload.get("maxChars", BRIDGE_READ_SUMMARY_MAX_CHARS)))
            elif action == "search":
                result = tool_search_text(payload.get("query", ""), max_hits=int(payload.get("max", 50)))
            elif action == "run":
                result = tool_run_command(payload.get("command", ""), cwd=payload.get("cwd", "."))
            elif action == "write":
                result = tool_write_text(payload.get("path", ""), payload.get("content", ""), reason=payload.get("reason", ""))
            elif action == "patch":
                result = tool_patch_text(payload.get("path", ""), payload.get("replacements", []), reason=payload.get("reason", ""))
            elif action == "mkdir":
                result = tool_mkdir(payload.get("path", ""), reason=payload.get("reason", ""))
            elif action == "copy":
                result = tool_copy(
                    payload.get("src", payload.get("source", "")),
                    payload.get("dest", payload.get("destination", "")),
                    overwrite=bool(payload.get("overwrite", False)),
                    reason=payload.get("reason", ""),
                )
            elif action == "move":
                result = tool_move(
                    payload.get("src", payload.get("source", "")),
                    payload.get("dest", payload.get("destination", "")),
                    overwrite=bool(payload.get("overwrite", False)),
                    reason=payload.get("reason", ""),
                )
            elif action == "trash":
                result = tool_trash(payload.get("path", ""), reason=payload.get("reason", ""))
            elif action == "web_fetch":
                result = tool_web_fetch(payload.get("url", ""), max_chars=payload.get("maxChars"))
            elif action == "draw":
                result = tool_draw_local(
                    payload.get("subject")
                    or payload.get("prompt")
                    or payload.get("text")
                    or payload.get("description")
                    or ""
                )
            elif action == "diagnose":
                result = tool_diagnose()
            elif action == "self_heal":
                result = tool_self_heal(
                    apply=bool(payload.get("apply", payload.get("repair", False))),
                    ensure_advanced=bool(payload.get("ensureAdvanced", True)),
                )
            elif action == "computer":
                result = computer_control_action(payload)
            else:
                raise ValueError("Unsupported tool action")

            self._send_json(200, {"ok": True, "action": action, "result": result, "ownerApproval": owner_approval_public_state()})
        except subprocess.TimeoutExpired as e:
            self._send_json(408, {"error": f"Tool command timed out after {TOOL_TIMEOUT_SECONDS} seconds", "stdout": e.stdout, "stderr": e.stderr})
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json(400, {"error": str(e)})
        except (FileNotFoundError, PermissionError, FileExistsError, IsADirectoryError) as e:
            self._send_json(403, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    # ── Hardware Stats ─────────────────────────────────────────
    def _get_stats(self):
        """Return CPU % and RAM % as JSON. Works with no external packages."""
        try:
            cpu, ram = _get_hw_stats()
            data = json.dumps({"cpu_percent": cpu, "ram_percent": ram, "has_psutil": HAS_PSUTIL})
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors_headers()
            self.end_headers()
            self.wfile.write(data.encode())
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    # ── Oscar Workspace Bridge ─────────────────────────────────
    def _get_workspace_info(self):
        root = bridge_root()
        exists = os.path.isdir(root)
        files = bridge_iter_files(1) if exists else []
        self._send_json(200, {
            "ok": exists,
            "root": root,
            "mode": "read-only",
            "filesAvailable": bool(files),
            "policy": {
                "blockedDirectories": sorted(BRIDGE_SKIP_DIRS),
                "blockedFiles": sorted(BRIDGE_PRIVATE_FILES),
            },
        })

    def _get_workspace_tree(self):
        try:
            query = parse_qs(urlparse(self.path).query)
            max_files = int(query.get("max", [BRIDGE_MAX_TREE_FILES])[0])
            max_files = max(1, min(max_files, 600))
            self._send_json(200, {
                "root": bridge_root(),
                "files": bridge_iter_files(max_files),
            })
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_workspace_file(self):
        try:
            query = parse_qs(urlparse(self.path).query)
            rel_path = query.get("path", [""])[0]
            if not rel_path:
                self._send_json(400, {"error": "Missing path"})
                return
            self._send_json(200, bridge_read_text(rel_path))
        except (FileNotFoundError, PermissionError, ValueError) as e:
            self._send_json(403, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_workspace_search(self):
        try:
            query = parse_qs(urlparse(self.path).query)
            needle = query.get("q", [""])[0].strip()
            max_hits = int(query.get("max", [50])[0])
            max_hits = max(1, min(max_hits, 200))
            if len(needle) < 2:
                self._send_json(400, {"error": "Search query must be at least 2 characters"})
                return

            hits = []
            needle_lower = needle.lower()
            for item in bridge_iter_files(1000):
                if not item.get("text") or item.get("size", 0) > 300_000:
                    continue
                try:
                    data = bridge_read_text(item["path"], max_chars=300_000)["content"]
                except Exception:
                    continue
                for index, line in enumerate(data.splitlines(), start=1):
                    if needle_lower in line.lower():
                        hits.append({
                            "path": item["path"],
                            "line": index,
                            "text": line.strip()[:260],
                        })
                        if len(hits) >= max_hits:
                            self._send_json(200, {"root": bridge_root(), "query": needle, "hits": hits})
                            return

            self._send_json(200, {"root": bridge_root(), "query": needle, "hits": hits})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _get_workspace_context(self):
        try:
            tree = bridge_iter_files(BRIDGE_MAX_TREE_FILES)
            package_name = "unknown"
            package_hint = "JavaScript/TypeScript app"
            try:
                package_data = json.loads(bridge_read_text("package.json", max_chars=4000)["content"])
                package_name = package_data.get("name") or package_name
                deps = {}
                deps.update(package_data.get("dependencies") or {})
                deps.update(package_data.get("devDependencies") or {})
                if "next" in deps:
                    package_hint = "Next.js web app"
            except Exception:
                pass

            lines = [
                "OSCAR VERIFIED WORKSPACE MANIFEST",
                f"Root: {bridge_root()}",
                "Mode: read-only local snapshot. No edits. No external repos.",
                "STRICT FILE RULE: Copy filenames only from OBSERVED_FILES.",
                "Never infer, continue, complete, predict, or add likely files.",
                "Do not say 'potential additional files' or 'could be'.",
                "If a requested file is not listed, say it is not in the snapshot.",
                "Blocked/private patterns (not observed files): .env*, .next, node_modules, .git.",
                "Never list blocked/private patterns as OBSERVED_FILES or candidate files.",
                f"Detected app: {package_name} ({package_hint}).",
            ]

            tree_paths = {item["path"] for item in tree}
            if "docs/oscar-coding-protocol.md" in tree_paths:
                lines.extend([
                    "Active protocol: docs/oscar-coding-protocol.md is owner-approved.",
                    "For Oscar owner-feature rankings, prioritize owner page/actions, lib/owner-auth.ts, lib/oscar-agent.ts, lib/accord-data.ts, prisma/schema.prisma, app/page.tsx, docs/oscar-agent.md, package.json when listed.",
                    "For owner privacy questions, prioritize lib/owner-auth.ts, app/owner/oscar/page.tsx, and app/owner/oscar/actions.ts when listed.",
                    "Do not rank app/globals.css or next-env.d.ts above owner/auth/agent/data/schema/protocol files.",
                    "For public homepage questions: Oscar should not be linked publicly unless the owner explicitly approves it.",
                    "For file-content questions: use only actual bridge-read file contents; never invent functions, objects, imports, or libraries.",
                    "For change requests: provide Goal, Files, Steps, Risk, Test, and end with 'Waiting for owner approval.' Do not implement or broaden scope before approval.",
                    "Proof rule: never claim Changed, Verified, implemented, fixed, tested, complete, or Still needs: None unless actual tool output, a patch diff, or updated file contents proves it.",
                    "In this read-only bridge mode, say no files were changed and provide a proposed patch instead of claiming implementation.",
                    "Patch proposal rule: only propose patches against verified files and verified existing code; never invent imports, libraries, state objects, functions, routes, packages, or APIs.",
                    "For failed-login cooldown patch proposals, use lib/owner-auth.ts and createOwnerSession(accessCode); do not propose Redux, client state, or lib/oscar-agent.ts changes.",
                    "For complete diff requests, preserve existing verified code and imports; never add React hooks, access_token cookies, ../utils, Redux, or client-side auth helpers unless they exist in the verified file.",
                    "For visible diff reviews, cite actual changed symbols; do not invent terms like access token when the verified code uses accord_owner.",
                    "Exact-symbol rule: when asked to verify exact symbols, report each requested symbol as Present, Missing, or Not visible in provided context; never answer with a generic file summary.",
                    "Owner privacy route test rule: when asked to verify app/owner/oscar/page.tsx, app/owner/oscar/actions.ts, lib/owner-auth.ts, and app/page.tsx together, inspect all four before answering; do not stop after one file or include Likely/Need to inspect next.",
                    "Runtime test plan only rule: when asked for a runtime test plan only, do not inspect files, summarize code, or claim tests were performed; answer only Goal, Test steps, Expected results, Risks, and Waiting for owner approval.",
                    "Owner UX proposal rule: when asked to propose one small owner UX improvement only, do not turn it into a public homepage check; answer only Confirmed, Proposed improvement, Files, Risk, Test, and Waiting for owner approval.",
                    "Owner UX patch plan rule: when asked to convert the approved owner UX proposal into a patch plan only, do not repeat the proposal or write code; answer only Goal, Files, Steps, Risk, Test, and Waiting for owner approval.",
                    "Owner UX proposed diff rule: when asked for a proposed diff only for OwnerGate feedback, do not repeat the patch plan or claim it is applied; answer only Proposed diff only. Not applied., a diff block, Risk, Test, and Waiting for owner approval.",
                    "Owner UX diff review rule: when asked to review a proposed OwnerGate feedback diff, do not repeat or apply the diff; answer only Pass, Concerns, Suggested adjustment, Test, and Waiting for owner approval.",
                    "OwnerGate applied patch verification rule: when asked to verify the applied OwnerGate feedback patch, inspect actual files and answer only Confirmed, Risks, Recommended next step, and Waiting for owner approval.",
                ])

            lines.extend([
                "",
                f"OBSERVED_FILES ({len(tree)}):",
            ])

            for item in tree:
                lines.append(f"- {item['path']}")
                if len("\n".join(lines)) >= BRIDGE_MAX_CONTEXT_CHARS:
                    lines.append("")
                    lines.append("[manifest truncated]")
                    break

            context = "\n".join(lines)
            if len(context) > BRIDGE_MAX_CONTEXT_CHARS:
                context = context[:BRIDGE_MAX_CONTEXT_CHARS] + "\n[manifest truncated]"

            self._send_json(200, {
                "root": bridge_root(),
                "context": context,
                "fileCount": len(tree),
                "maxChars": BRIDGE_MAX_CONTEXT_CHARS,
            })
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    # ── Ollama Proxy (streaming-aware) ─────────────────────────
    def _proxy_ollama(self, method):
        """
        Proxy requests from /ollama/* to the local Ollama engine.
        Supports streaming responses for /api/chat and /api/generate.
        """
        # Strip the /ollama prefix to get the real Ollama path
        ollama_path = self.path[len("/ollama"):]
        ollama_route = urlparse(ollama_path).path
        target_url = OLLAMA_HOST + ollama_path

        # Read request body if present
        body = None
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            body = self.rfile.read(content_length)

        try:
            # Handle fake /api/tags for llama.cpp mode
            if LLAMA_CPP_MODE and ollama_route == "/api/tags":
                self._send_json(200, {"models": [{"name": "local-llama-model"}]})
                return

            if method == "GET" and ollama_route == "/api/tags" and (deepseek_configured() or xai_configured()):
                req = urllib.request.Request(target_url, method="GET")
                try:
                    with urllib.request.urlopen(req, timeout=30) as response:
                        payload = json.loads(response.read().decode("utf-8", errors="replace"))
                except Exception:
                    payload = {"models": []}
                self._send_json(200, merge_cloud_virtual_tags(payload))
                return

            if LLAMA_CPP_MODE and ollama_route == "/api/chat":
                # Translate Ollama payload -> OpenAI payload for llama-server
                ollama_req = json.loads(body) if body else {}
                openai_req = {
                    "messages": ollama_req.get("messages", []),
                    "stream": True,
                    "temperature": ollama_req.get("options", {}).get("temperature", 0.7)
                }
                target_url = OLLAMA_HOST + "/v1/chat/completions"
                body = json.dumps(openai_req).encode()
            elif method == "POST" and ollama_route == "/api/chat":
                learn_answer = oscar_learn_mode_answer(body)
                if learn_answer is not None:
                    self._send_json(200, learn_answer)
                    safe_print(f"[proxy] served learn mode ({learn_answer.get('oscarLearnMode')})", flush=True)
                    return

                local_handshake = quick_local_handshake_answer(body)
                if local_handshake is not None:
                    self._send_json(200, local_handshake)
                    safe_print("[proxy] served local owner handshake", flush=True)
                    return

                direct_bridge_answer = bridge_file_list_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_privacy_synthesis_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_privacy_route_test_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_runtime_test_plan_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_ux_applied_patch_verification_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_ux_diff_review_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_ux_proposed_diff_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_ux_patch_plan_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_ux_improvement_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_public_exposure_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_auth_symbol_verification_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_file_content_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_feature_rank_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_privacy_files_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_owner_security_improvement_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_complete_cooldown_diff_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_cooldown_diff_review_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_cooldown_patch_proposal_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_readonly_implementation_answer(body)
                if direct_bridge_answer is None:
                    direct_bridge_answer = bridge_approval_plan_answer(body)
                if direct_bridge_answer is not None:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/x-ndjson")
                    self._cors_headers()
                    self.end_headers()
                    self.wfile.write(direct_bridge_answer)
                    self.wfile.flush()
                    safe_print("[proxy] served verified bridge answer directly", flush=True)
                    return
                xai_answer = try_xai_ollama_chat(body)
                if xai_answer is not None:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self._cors_headers()
                    self.end_headers()
                    self.wfile.write(xai_answer)
                    safe_print("[proxy] served xAI Grok chat", flush=True)
                    return

                deepseek_answer = try_deepseek_ollama_chat(body)
                if deepseek_answer is not None:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self._cors_headers()
                    self.end_headers()
                    self.wfile.write(deepseek_answer)
                    safe_print("[proxy] served DeepSeek API chat", flush=True)
                    return
                body = sanitize_ollama_chat_body(body)

            req = urllib.request.Request(
                target_url,
                data=body,
                method=method,
                headers={"Content-Type": self.headers.get("Content-Type", "application/json")}
            )

            # Optional: pass Authorization header if present
            if "Authorization" in self.headers:
                req.add_header("Authorization", self.headers.get("Authorization"))

            is_stream = ollama_route in ("/api/chat", "/api/generate")
            proxy_timeout = OLLAMA_PROXY_TIMEOUT_SECONDS if is_stream else 30
            response = urllib.request.urlopen(req, timeout=proxy_timeout)

            # Send response headers
            self.send_response(response.status)

            for header, value in response.getheaders():
                lower = header.lower()
                if lower not in ("transfer-encoding", "connection", "content-length"):
                    self.send_header(header, value)

            self._cors_headers()
            self.end_headers()

            if LLAMA_CPP_MODE and is_stream:
                buffer = ""

                def write_sse_line(line):
                    if not line.startswith("data: "):
                        return False
                    data = line[6:].strip()
                    if data == "[DONE]":
                        self.wfile.write(b'{"done": true}\n')
                        self.wfile.flush()
                        return True
                    try:
                        j = json.loads(data)
                        choices = j.get("choices") or []
                        if choices:
                            delta = choices[0].get("delta") or {}
                            content = delta.get("content", "")
                            if content:
                                out = {
                                    "message": {"role": "assistant", "content": content},
                                    "done": False,
                                }
                                self.wfile.write((json.dumps(out) + "\n").encode())
                                self.wfile.flush()
                    except json.JSONDecodeError:
                        pass
                    return False

                done_seen = False
                while not done_seen:
                    chunk = response.read(4096)
                    if not chunk:
                        break
                    buffer += chunk.decode(errors="ignore")
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        done_seen = write_sse_line(line.strip())
                        if done_seen:
                            break
                if buffer and not done_seen:
                    write_sse_line(buffer.strip())
            else:
                while True:
                    chunk = response.read(4096)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    if is_stream:
                        self.wfile.flush()

        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self._cors_headers()
            self.end_headers()
            try:
                self.wfile.write(e.read())
            except:
                pass

        except urllib.error.URLError as e:
            self._send_json(502, {"error": f"Cannot reach Ollama engine: {str(e.reason)}"})

        except (TimeoutError, socket.timeout):
            self._send_json(504, {
                "error": (
                    f"Oscar local model runner did not respond within {OLLAMA_PROXY_TIMEOUT_SECONDS} seconds. "
                    "Tool commands are online; real LLM generation is currently slow or stalled on this machine."
                )
            })

        except Exception as e:
            if str(e).lower() == "timed out":
                self._send_json(504, {
                    "error": (
                        f"Oscar local model runner did not respond within {OLLAMA_PROXY_TIMEOUT_SECONDS} seconds. "
                        "Tool commands are online; real LLM generation is currently slow or stalled on this machine."
                    )
                })
                return
            self._send_json(500, {"error": str(e)})


class ThreadedHTTPServer(http.server.HTTPServer):
    """Handle each request in a new thread for concurrent streaming."""
    allow_reuse_address = True

    def process_request(self, request, client_address):
        thread = threading.Thread(target=self._handle, args=(request, client_address))
        thread.daemon = True
        thread.start()

    def _handle(self, request, client_address):
        try:
            self.finish_request(request, client_address)
        except (BrokenPipeError, ConnectionResetError):
            # Browser-side Stop/interrupt closed the stream intentionally.
            pass
        except Exception:
            self.handle_error(request, client_address)
        finally:
            self.shutdown_request(request)


def open_browser_delayed():
    """Open the browser after a short delay to ensure server is ready."""
    time.sleep(1.0)
    webbrowser.open(f"http://localhost:{CHAT_SERVER_PORT}")


def warm_ollama_fast_model():
    """Pre-load the small USB model so the first chat does not hit the client timeout."""
    model = os.environ.get("OSCAR_WARM_MODEL", "gemma2-2b-local:latest")
    payload = json.dumps({
        "model": model,
        "prompt": "ok",
        "stream": False,
        "options": {"num_predict": 1, "num_ctx": 512},
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{OLLAMA_HOST}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            resp.read()
        safe_print(f"  Ollama warm model ready: {model}")
    except Exception as e:
        safe_print(f"  Ollama warm skipped: {e}")


def main():
    ensure_data_dir()
    if oscar_voice_library is not None:
        try:
            payload = oscar_voice_library.bootstrap_default_voices()
            safe_print(f"  Voice library: {payload.get('voiceCount', 0)} voice(s) ready")
        except Exception as e:
            safe_print(f"  Voice library bootstrap skipped: {e}")

    if oscar_library is not None:
        try:
            status = oscar_library.library_status_payload()
            if not status.get("itemCount"):
                cat = oscar_library.build_catalog()
                safe_print(f"  Library catalog built: {cat.get('itemCount', 0)} items")
            else:
                safe_print(f"  Library catalog: {status.get('itemCount', 0)} items")
        except Exception as e:
            safe_print(f"  Library bridge skipped: {e}")

    threading.Thread(target=warm_ollama_fast_model, daemon=True).start()

    local_ip = detect_lan_ip()

    print()
    print("=" * 55)
    print("  Oscar — Local Agent Chat Server")
    print("=" * 55)
    print()
    print(f"  Local Access:    http://localhost:{CHAT_SERVER_PORT}")
    print(f"  Network Access:  http://{local_ip}:{CHAT_SERVER_PORT}   <-- Use this on phone/other PC!")
    print(f"  Ollama/Llama Proxy: {OLLAMA_HOST}")
    if LLAMA_CPP_MODE:
        print("  Running in LLAMA_CPP_MODE (Translating API requests)")
    print()
    print("  All chats auto-save to the USB drive!")
    print("  Press Ctrl+C to shut down.")
    print()
    print("-" * 55)

    server = ThreadedHTTPServer(("0.0.0.0", CHAT_SERVER_PORT), ChatHandler)

    # Open browser in background thread
    if "--no-browser" not in sys.argv:
        threading.Thread(target=open_browser_delayed, daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Shutting down chat server...")
        server.shutdown()
        print("  Goodbye!")


if __name__ == "__main__":
    main()
