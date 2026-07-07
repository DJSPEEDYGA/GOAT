#!/usr/bin/env python3
"""
Dr. Devin (Patch) — Safe Web Terminal Server

Gives the GOAT launchers a live in-browser terminal.
Only listens on localhost (127.0.0.1) by default.
Blocks or warns on destructive commands.

Usage:
    python3 patch-terminal-server.py --port 9999

Then open the Patch console or widget and use the Terminal tab.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse


# Paths that are never allowed to be touched by auto-executed commands.
FORBIDDEN_COMMANDS = [
    r"\brm\b.*\s+-[a-zA-Z]*[rf]",      # rm -rf or any recursive/force combo
    r"\bmkfs\b",
    r"\bdd\s+if=",
    r"\bformat\b",
    r"\bdiskpart\b",
    r"\bfdisk\b",
    r"\bparted\b",
    r"\bshutdown\b",
    r"\breboot\b",
    r"\bpkill\s+-9",
    r"\bkillall\b",
    r"\bsudo\b",
    r"\bsu\b",
    r"\bpasswd\b",
    r"\bchown\b",
    r"\bchmod\b.*\s+0[0-7]{3}",
    r"\bcurl\s+.*\s*\|\s*(ba)?sh",
    r"\bwget\s+.*\s*\|\s*(ba)?sh",
    r"\beval\s*\(",
    r"\b>:\s*\{",
]

# Commands that are allowed without confirmation.
READONLY_COMMANDS = [
    r"^ls\b",
    r"^pwd\b",
    r"^cd\b",
    r"^cat\b",
    r"^head\b",
    r"^tail\b",
    r"^find\b",
    r"^grep\b",
    r"^ps\b",
    r"^top\b",
    r"^htop\b",
    r"^df\b",
    r"^du\b",
    r"^echo\b",
    r"^whoami\b",
    r"^uname\b",
    r"^python3\b",
    r"^node\b",
    r"^git\s+status\b",
    r"^git\s+log\b",
    r"^git\s+diff\b",
    r"^git\s+branch\b",
    r"^ollama\s+list\b",
    r"^ollama\s+ps\b",
]

# Commands that can modify things but are generally safe.
NORMAL_COMMANDS = [
    r"^cp\b",
    r"^mv\b",
    r"^mkdir\b",
    r"^touch\b",
    r"^git\s+add\b",
    r"^git\s+commit\b",
    r"^git\s+pull\b",
    r"^git\s+push\b",
    r"^python3\b",
    r"^bash\s+",
    r"^sh\s+",
]

# Commands that require explicit confirmation.
DANGEROUS_COMMANDS = [
    r"\brm\b",
    r"\bcp\b.*\s+-[a-zA-Z]*[rf]",
    r"\bmv\b.*\s+-[a-zA-Z]*f",
]


def classify_command(cmd):
    cmd = cmd.strip()
    if not cmd:
        return {"ok": False, "class": "empty", "reason": "Empty command"}

    for pattern in FORBIDDEN_COMMANDS:
        if re.search(pattern, cmd, re.IGNORECASE):
            return {"ok": False, "class": "forbidden", "reason": f"Blocked by safety rule: {pattern}"}

    for pattern in DANGEROUS_COMMANDS:
        if re.search(pattern, cmd, re.IGNORECASE):
            return {"ok": True, "class": "dangerous", "reason": "Destructive command — requires confirmation"}

    for pattern in READONLY_COMMANDS:
        if re.search(pattern, cmd, re.IGNORECASE):
            return {"ok": True, "class": "readonly", "reason": "Read-only command"}

    for pattern in NORMAL_COMMANDS:
        if re.search(pattern, cmd, re.IGNORECASE):
            return {"ok": True, "class": "normal", "reason": "Normal command"}

    return {"ok": True, "class": "unknown", "reason": "Unknown command — use with caution"}


def run_command(cmd, cwd=None, confirm=False):
    classification = classify_command(cmd)
    if not classification["ok"]:
        return {"ok": False, **classification, "stdout": "", "stderr": classification["reason"], "returncode": None}

    if classification["class"] == "dangerous" and not confirm:
        return {"ok": True, "needs_confirm": True, **classification, "stdout": "", "stderr": "", "returncode": None}

    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=60,
            env={**os.environ, "PATH": os.environ.get("PATH", "/usr/bin:/bin:/usr/local/bin")},
        )
        return {
            "ok": True,
            "class": classification["class"],
            "reason": classification["reason"],
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
        }
    except subprocess.TimeoutExpired:
        return {"ok": False, "class": "timeout", "reason": "Command timed out after 60s", "stdout": "", "stderr": "Command timed out", "returncode": -1}
    except Exception as e:
        return {"ok": False, "class": "error", "reason": str(e), "stdout": "", "stderr": str(e), "returncode": -1}


class TerminalHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Quieter logging.
        pass

    def _send_json(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json(200, {})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/terminal":
            self._send_json(404, {"error": "not found"})
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {"error": "invalid JSON"})
            return

        cmd = data.get("cmd", "").strip()
        cwd = data.get("cwd") or os.getcwd()
        confirm = bool(data.get("confirm"))

        if not cmd:
            self._send_json(400, {"error": "empty command"})
            return

        result = run_command(cmd, cwd=cwd, confirm=confirm)
        self._send_json(200, result)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._send_json(200, {"status": "ok", "service": "patch-terminal"})
        else:
            self._send_json(404, {"error": "not found"})


def main():
    parser = argparse.ArgumentParser(description="Patch Web Terminal Server")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host (default 127.0.0.1)")
    parser.add_argument("--port", type=int, default=9999, help="Port (default 9999)")
    args = parser.parse_args()

    if args.host != "127.0.0.1" and args.host != "localhost":
        print("WARNING: binding to non-localhost address is risky for a shell endpoint.", file=sys.stderr)

    server = HTTPServer((args.host, args.port), TerminalHandler)
    print(f"Patch Terminal Server listening on http://{args.host}:{args.port}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
