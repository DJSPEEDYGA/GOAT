"""
Oscar Security Ops — defensive studio sweep (local only, no cloud).
Separated from Money Penny vault lane by design.
"""
from __future__ import annotations

import os
import plistlib
import re
import subprocess
import time
from datetime import datetime, timezone

_SHARED = os.path.dirname(os.path.abspath(__file__))
GOAT_FORCE = os.path.normpath(
    os.environ.get("OSCAR_GOAT_FORCE_ROOT", os.path.dirname(os.path.dirname(_SHARED)))
)
HOME = os.path.expanduser("~")
LAUNCH_AGENTS = os.path.join(HOME, "Library", "LaunchAgents")

REMOTE_APP_PATTERNS = re.compile(
    r"teamviewer|anydesk|rustdesk|parsec|vnc|logmein|splashtop",
    re.I,
)
STALE_GOAT_PATTERNS = re.compile(r"Ventoy/USB-Uncensored|/Volumes/FKD1/", re.I)


def _run(cmd, timeout=12):
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=isinstance(cmd, str),
        )
        return proc.returncode, (proc.stdout or "").strip(), (proc.stderr or "").strip()
    except Exception as exc:
        return -1, "", str(exc)


def _firewall_state():
    code, out, _ = _run(["/usr/libexec/ApplicationFirewall/socketfilterfw", "--getglobalstate"])
    on = "enabled" in out.lower() or "blocking" in out.lower()
    return {"ok": code == 0, "state": out or "unknown", "enabled": on}


def _ssh_backdoor_check():
    path = os.path.join(HOME, ".ssh", "authorized_keys")
    if not os.path.isfile(path):
        return {"ok": True, "authorizedKeys": False, "lines": 0}
    try:
        lines = [ln for ln in open(path, encoding="utf-8") if ln.strip() and not ln.strip().startswith("#")]
    except OSError as exc:
        return {"ok": False, "error": str(exc)}
    return {"ok": len(lines) == 0, "authorizedKeys": True, "lines": len(lines)}


def _listeners_external():
    code, out, _ = _run("lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null")
    rows = []
    if code != 0:
        return {"ok": False, "listeners": [], "error": out}
    for line in out.splitlines()[1:]:
        if "127.0.0.1" in line or "[::1]" in line or "*:" in line:
            continue
        parts = line.split()
        if len(parts) >= 9:
            rows.append({"command": parts[0], "pid": parts[1], "endpoint": parts[-1]})
    return {"ok": True, "listeners": rows, "count": len(rows)}


def _remote_access_apps():
    apps = []
    app_dir = "/Applications"
    if os.path.isdir(app_dir):
        for name in os.listdir(app_dir):
            if REMOTE_APP_PATTERNS.search(name):
                apps.append(os.path.join(app_dir, name))
    return {"installed": apps, "count": len(apps)}


def _launch_agent_audit():
    findings = []
    if not os.path.isdir(LAUNCH_AGENTS):
        return {"agents": [], "staleGoat": findings}
    for name in sorted(os.listdir(LAUNCH_AGENTS)):
        if not name.endswith(".plist"):
            continue
        path = os.path.join(LAUNCH_AGENTS, name)
        stale = False
        try:
            with open(path, "rb") as fh:
                raw = fh.read()
            text = raw.decode("utf-8", errors="ignore")
            stale = bool(STALE_GOAT_PATTERNS.search(text))
            if stale:
                findings.append({"label": name, "issue": "points at old Ventoy/FKD1 path", "path": path})
        except OSError as exc:
            findings.append({"label": name, "issue": str(exc), "path": path})
    return {"staleGoat": findings, "staleCount": len(findings)}


def _local_only_env():
    flags = {
        "OLLAMA_NO_CLOUD": os.environ.get("OLLAMA_NO_CLOUD", ""),
        "OSCAR_FORCE_LOCAL_ONLY": os.environ.get("OSCAR_FORCE_LOCAL_ONLY", ""),
        "OLLAMA_HOST": os.environ.get("OLLAMA_HOST", "127.0.0.1:11434"),
    }
    forced = flags["OSCAR_FORCE_LOCAL_ONLY"].lower() in ("1", "true", "yes")
    return {"ok": True, "forcedLocalOnly": forced, "env": flags}


def _money_penny_separation():
    """Oscar sec ops must not mutate Money Penny vault."""
    mp_prompt = os.path.join(GOAT_FORCE, "MASTER-LLM", "training", "moneypenny-live", "MONEYPENNY_LIVE_SYSTEM_PROMPT.txt")
    store = os.path.join(GOAT_FORCE, "OSCAR", "goat-royalty-portable-2.0.0", "web-app", "moneypenny.html")
    return {
        "policy": "Oscar Security Command is separate from Money Penny OG vault tools.",
        "oscarLane": "http://127.0.0.1:3333 — local agent + security ops",
        "moneyPennyLane": "http://127.0.0.1:8090/moneypenny.html — store UI only; do not merge destructive tools",
        "moneyPennyPromptPresent": os.path.isfile(mp_prompt),
        "moneyPennyStorePresent": os.path.isfile(store),
        "rule": "Security sweeps and lockdown never delete vault or GOAT store trees.",
    }


def run_full_sweep():
    started = datetime.now(timezone.utc).isoformat()
    issues = []
    fw = _firewall_state()
    if not fw.get("enabled"):
        issues.append({"severity": "high", "code": "firewall_off", "message": "Mac firewall not fully on"})
    ssh = _ssh_backdoor_check()
    if not ssh.get("ok"):
        issues.append({"severity": "critical", "code": "ssh_authorized_keys", "message": f"SSH authorized_keys has {ssh.get('lines', '?')} entries"})
    remote = _remote_access_apps()
    for app in remote.get("installed", []):
        issues.append({"severity": "medium", "code": "remote_access_app", "message": f"Remote access installed: {app}"})
    agents = _launch_agent_audit()
    for item in agents.get("staleGoat", []):
        issues.append({"severity": "medium", "code": "stale_launch_agent", "message": item.get("label", "?")})
    listen = _listeners_external()
    for row in listen.get("listeners", [])[:5]:
        issues.append({"severity": "low", "code": "network_listener", "message": f"{row.get('command')} listening {row.get('endpoint')}"})

    return {
        "ok": True,
        "lane": "oscar_security_command",
        "timestamp": started,
        "host": platform_node(),
        "summary": {
            "issueCount": len(issues),
            "critical": sum(1 for i in issues if i["severity"] == "critical"),
            "high": sum(1 for i in issues if i["severity"] == "high"),
        },
        "checks": {
            "firewall": fw,
            "ssh": ssh,
            "listeners": listen,
            "remoteAccess": remote,
            "launchAgents": agents,
            "localOnly": _local_only_env(),
            "moneyPennySeparation": _money_penny_separation(),
        },
        "issues": issues,
        "actions": [
            "Run: bash GOAT-FORCE/scripts/migrate-studio-to-goat-force.sh",
            "Run: bash GOAT-FORCE/scripts/studio-lockdown.sh (Wi‑Fi/BT off)",
            "Uninstall TeamViewer if you did not install it",
            "Use Launch Oscar LOCAL ONLY.command",
        ],
    }


def platform_node():
    code, out, _ = _run(["scutil", "--get", "ComputerName"])
    return out if code == 0 else "unknown"


def expert_playbook():
    return {
        "ok": True,
        "role": "Oscar — Cybersecurity Expert (local defensive lane)",
        "separateFrom": "Money Penny OG vault — do not merge destructive tools",
        "principles": [
            "Evidence before panic — sweep first, then conclude",
            "Local-first Oscar — no cloud API unless Boss enables keys",
            "Air-gap sensitive work: Wi-Fi off, one USB job, Spotlight off on LLMs ExFAT",
            "Physical + network: TeamViewer, SSH keys, firewall, building LAN",
            "Jetson problems are usually wrong USB flash — not wireless magic attacks",
        ],
        "bossLockdownOrder": [
            "studio-lockdown.sh (Wi-Fi/BT off)",
            "security sweep",
            "migrate-studio-to-goat-force.sh (fix stale LaunchAgents)",
            "Remove TeamViewer if not yours",
            "OPNsense firewall for server room",
        ],
        "apis": {
            "status": "/api/oscar/security/status",
            "sweep": "/api/oscar/security/sweep",
            "policy": "/api/oscar/security/policy",
            "playbook": "/api/oscar/security/playbook",
        },
        "ui": "http://127.0.0.1:8090/oscar-security-command.html",
    }


def quick_status():
    sweep = run_full_sweep()
    return {
        "ok": True,
        "role": "Oscar cybersecurity expert",
        "posture": "alert" if sweep["summary"]["issueCount"] else "clean",
        "issueCount": sweep["summary"]["issueCount"],
        "timestamp": sweep["timestamp"],
    }