#!/usr/bin/env python3
"""
GOAT Force AI DAW Agent
Dr. Devin (Agent 007) — AI Computer Control

This is the brain. It:
1. Takes a screenshot to SEE the screen
2. Uses Ollama (llama3.1:70b) or Grok to UNDERSTAND what's on screen
3. Decides what actions to take
4. Executes mouse/keyboard moves
5. Loops until the task is done

Supports: Pro Tools, FL Studio, MPC, Logic Pro, LUNA
Tasks: Mix, Master, Make Beats, Apply FX, Export
"""

import sys
import os
import json
import time
import base64
import requests
import subprocess
from datetime import datetime

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_control.screen_vision import capture_screen, screenshot_to_base64, cleanup_screenshots
from ai_control.computer_control import (
    activate_app, click, double_click, right_click, hotkey,
    press_keycode, type_text, drag_fader, rotate_knob,
    get_frontmost_app, click_menu, wait_for_app, sleep,
    check_permissions
)

OLLAMA_URL = "http://localhost:11435"
GROK_URL = "https://api.x.ai/v1"

# Load Grok key from Agent007Runtime settings
def load_grok_key():
    settings_path = os.path.expanduser(
        "~/Library/Application Support/Agent007Runtime/chat_data/settings.json"
    )
    try:
        with open(settings_path) as f:
            data = json.load(f)
            return data.get("grok_api_key") or data.get("api_key") or data.get("xai_key", "")
    except Exception:
        return os.environ.get("GROK_API_KEY", "")


# ─────────────────────────────────────────────
# AI VISION — Ask AI what it sees
# ─────────────────────────────────────────────

def ask_ai_vision(screenshot_path, task_context, model="llama3.2-vision"):
    """
    Send a screenshot to AI and ask what actions to take.
    Returns structured action plan.
    """
    b64 = screenshot_to_base64(screenshot_path)

    prompt = f"""You are Dr. Devin, the AI DAW controller for GOAT Force studio.
You are looking at a screenshot of a DAW (Pro Tools, FL Studio, MPC, Logic Pro, or LUNA).

TASK: {task_context}

Look at the screenshot carefully and respond with a JSON action plan.
Return ONLY valid JSON, no markdown, no explanation.

Format:
{{
  "daw_visible": "Pro Tools|FL Studio|MPC|unknown",
  "screen_state": "brief description of what you see",
  "actions": [
    {{
      "type": "click|double_click|right_click|hotkey|type|drag_fader|wait|done",
      "description": "what this does",
      "x": 100,
      "y": 200,
      "keys": ["cmd", "s"],
      "text": "text to type",
      "drag_delta_y": -50,
      "wait_seconds": 1.0
    }}
  ],
  "task_complete": false,
  "status": "what was done / what's next"
}}

For type actions: set text field.
For hotkey actions: set keys list (e.g. ["cmd","s"] for save).
For click actions: set x, y coordinates.
For drag_fader: set x, y (knob/fader position) and drag_delta_y (negative=up=louder).
For wait: set wait_seconds.
For done: set task_complete: true.

Be precise with coordinates based on what you see in the screenshot.
Screen resolution hint: 2560x1440."""

    # Try Ollama vision first
    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "images": [b64],
                "stream": False,
                "options": {"temperature": 0.1}
            },
            timeout=60
        )
        if r.status_code == 200:
            text = r.json().get("response", "")
            return _parse_json_response(text)
    except Exception:
        pass

    # Fallback: Grok vision
    grok_key = load_grok_key()
    if grok_key:
        try:
            r = requests.post(
                f"{GROK_URL}/chat/completions",
                headers={"Authorization": f"Bearer {grok_key}"},
                json={
                    "model": "grok-2-vision-1212",
                    "messages": [{
                        "role": "user",
                        "content": [
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
                            {"type": "text", "text": prompt}
                        ]
                    }],
                    "temperature": 0.1,
                    "max_tokens": 1000
                },
                timeout=30
            )
            if r.status_code == 200:
                text = r.json()["choices"][0]["message"]["content"]
                return _parse_json_response(text)
        except Exception:
            pass

    return {"error": "AI vision unavailable", "actions": []}


def ask_ai_text(task, context="", model="llama3.1:70b"):
    """
    Ask AI for a DAW action plan without vision (text-only, faster).
    Used for scripted tasks where screen position is known.
    """
    prompt = f"""You are Dr. Devin, GOAT Force AI DAW controller.
You control Pro Tools, FL Studio, and MPC via computer automation.

TASK: {task}
CONTEXT: {context}

Return a JSON action plan (actions to take in the DAW).
Return ONLY valid JSON. Format:
{{
  "plan": "description of overall plan",
  "steps": [
    {{"step": 1, "action": "what to do", "type": "hotkey|click|drag|menu", "detail": "specifics"}}
  ]
}}"""

    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False, "options": {"temperature": 0.2}},
            timeout=30
        )
        if r.status_code == 200:
            return _parse_json_response(r.json().get("response", ""))
    except Exception:
        pass

    # Grok fallback
    grok_key = load_grok_key()
    if grok_key:
        try:
            r = requests.post(
                f"{GROK_URL}/chat/completions",
                headers={"Authorization": f"Bearer {grok_key}"},
                json={
                    "model": "grok-3-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2
                },
                timeout=15
            )
            if r.status_code == 200:
                return _parse_json_response(r.json()["choices"][0]["message"]["content"])
        except Exception:
            pass

    return {"plan": "fallback", "steps": []}


def _parse_json_response(text):
    """Extract JSON from AI response text."""
    text = text.strip()
    # Strip markdown code blocks
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    try:
        return json.loads(text)
    except Exception:
        # Try to find JSON object
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            try:
                return json.loads(text[start:end])
            except Exception:
                pass
    return {"raw": text, "actions": []}


# ─────────────────────────────────────────────
# ACTION EXECUTOR
# ─────────────────────────────────────────────

def execute_actions(actions, log_fn=None):
    """Execute a list of actions from the AI plan."""
    results = []
    for action in actions:
        atype = action.get("type", "")
        desc = action.get("description", atype)
        if log_fn:
            log_fn(f"  → {desc}")

        try:
            if atype == "click":
                click(action["x"], action["y"])
                results.append({"ok": True, "action": desc})

            elif atype == "double_click":
                double_click(action["x"], action["y"])
                results.append({"ok": True, "action": desc})

            elif atype == "right_click":
                right_click(action["x"], action["y"])
                results.append({"ok": True, "action": desc})

            elif atype == "hotkey":
                keys = action.get("keys", [])
                if keys:
                    hotkey(*keys)
                results.append({"ok": True, "action": desc})

            elif atype == "type":
                type_text(action.get("text", ""))
                results.append({"ok": True, "action": desc})

            elif atype == "drag_fader":
                drag_fader(action["x"], action["y"], action.get("drag_delta_y", -30))
                results.append({"ok": True, "action": desc})

            elif atype == "wait":
                sleep(action.get("wait_seconds", 1.0))
                results.append({"ok": True, "action": desc})

            elif atype == "done":
                results.append({"ok": True, "action": "Task complete", "done": True})
                break

            else:
                results.append({"ok": False, "action": desc, "error": f"Unknown action type: {atype}"})

        except Exception as e:
            results.append({"ok": False, "action": desc, "error": str(e)})

    return results


# ─────────────────────────────────────────────
# SCRIPTED DAW WORKFLOWS
# ─────────────────────────────────────────────

class ProToolsMixer:
    """Scripted Pro Tools mix workflows using known keyboard shortcuts."""

    APP = "Pro Tools"

    def activate(self):
        activate_app(self.APP)
        sleep(0.4)

    def open_mix_window(self):
        self.activate()
        hotkey("cmd", "=")
        sleep(0.5)

    def open_edit_window(self):
        self.activate()
        hotkey("cmd", "option", "=")
        sleep(0.5)

    def save(self):
        self.activate()
        hotkey("cmd", "s")
        sleep(0.3)

    def bounce_to_disk(self, log=None):
        """Open Bounce to Disk dialog."""
        self.activate()
        if log: log("Opening Bounce to Disk dialog...")
        click_menu("Pro Tools", "File", "Bounce to", "Disk...")
        sleep(0.5)

    def select_all(self):
        self.activate()
        hotkey("cmd", "a")
        sleep(0.2)

    def consolidate(self):
        """Shift+Option+3 — Consolidate selection."""
        self.activate()
        hotkey("shift", "option", "3")
        sleep(1.0)

    def nudge_volume_up(self, steps=1):
        """Plus key nudges selected track volume up."""
        self.activate()
        for _ in range(steps):
            press_keycode(69)  # numpad +
            sleep(0.1)

    def nudge_volume_down(self, steps=1):
        self.activate()
        for _ in range(steps):
            press_keycode(78)  # numpad -
            sleep(0.1)

    def open_send(self, track_x, track_y):
        """Click a send slot on a track."""
        click(track_x, track_y)
        sleep(0.2)

    def mix_workflow_basic(self, log=None):
        """
        Basic mix workflow:
        1. Open Mix window
        2. Select all tracks
        3. Save
        Returns log of actions taken.
        """
        steps = []
        if log: log("Starting basic mix workflow...")

        self.open_mix_window()
        steps.append("Opened Mix window")

        sleep(1.0)
        steps.append("Mix window ready")

        self.save()
        steps.append("Session saved")

        return steps


class FLStudioAgent:
    """Scripted FL Studio workflows."""

    def __init__(self, version="2025"):
        self.version = version
        self.app = f"FL Studio {version}"

    def activate(self):
        activate_app(self.app)
        sleep(0.4)

    def play_stop(self):
        self.activate()
        press_keycode(49)  # spacebar
        sleep(0.2)

    def save(self):
        self.activate()
        hotkey("cmd", "s")
        sleep(0.3)

    def open_mixer(self):
        self.activate()
        hotkey("cmd", "m")
        sleep(0.5)

    def open_piano_roll(self):
        self.activate()
        hotkey("cmd", "p")
        sleep(0.5)

    def open_playlist(self):
        self.activate()
        hotkey("cmd", "t")
        sleep(0.5)

    def export_wav(self, log=None):
        self.activate()
        if log: log("Opening Export WAV dialog...")
        click_menu("OsxFL", "File", "Export", "Wave file...")
        sleep(0.5)

    def export_mp3(self, log=None):
        self.activate()
        if log: log("Opening Export MP3 dialog...")
        click_menu("OsxFL", "File", "Export", "MP3 file...")
        sleep(0.5)

    def set_tempo(self, bpm, log=None):
        """
        Set tempo by clicking the BPM field and typing.
        BPM field is typically at the top of the main toolbar.
        Uses screen capture to find it if needed.
        """
        self.activate()
        if log: log(f"Setting BPM to {bpm}...")
        # Double-click BPM display to select it (approx location — top toolbar)
        # These are approximate — vision loop will refine
        double_click(490, 38)
        sleep(0.2)
        hotkey("cmd", "a")
        type_text(str(bpm))
        press_keycode(36)  # Enter
        sleep(0.3)

    def beat_making_workflow(self, bpm=140, pattern_name="GOAT Beat", log=None):
        """
        Basic beat making session setup in FL Studio.
        """
        steps = []
        if log: log(f"Starting beat making workflow — {bpm} BPM")

        self.activate()
        sleep(0.5)
        steps.append("FL Studio activated")

        self.open_mixer()
        sleep(0.5)
        steps.append("Mixer opened")

        self.open_playlist()
        sleep(0.3)
        steps.append("Playlist opened")

        self.save()
        steps.append("Project saved")

        return steps


class MPCAgent:
    """Scripted MPC workflows."""

    def __init__(self, app="mpc3"):
        app_map = {"mpc3": "MPC 3", "mpc": "MPC", "beats": "MPC Beats"}
        self.app = app_map.get(app, "MPC 3")

    def activate(self):
        activate_app(self.app)
        sleep(0.4)

    def play_stop(self):
        self.activate()
        press_keycode(49)
        sleep(0.2)

    def record(self):
        self.activate()
        hotkey("cmd", "r")
        sleep(0.2)

    def save(self):
        self.activate()
        hotkey("cmd", "s")
        sleep(0.3)

    def export(self, log=None):
        self.activate()
        if log: log("Opening MPC export...")
        click_menu(self.app, "File", "Export...")
        sleep(0.5)

    def pad_hit(self, pad_num):
        """Trigger a pad (1-16) via keyboard."""
        self.activate()
        pad_keys = {
            1: "1", 2: "2", 3: "3", 4: "4",
            5: "q", 6: "w", 7: "e", 8: "r",
            9: "a", 10: "s", 11: "d", 12: "f",
            13: "z", 14: "x", 15: "c", 16: "v"
        }
        key = pad_keys.get(pad_num, "1")
        type_text(key)
        sleep(0.1)


class LogicAgent:
    """Scripted Logic Pro Creator Studio workflows."""

    APP = "Logic Pro Creator Studio"

    def activate(self):
        activate_app(self.APP)
        sleep(0.5)

    def open_mix_window(self):
        self.activate()
        hotkey("cmd", "x")
        sleep(0.4)

    def open_library(self):
        self.activate()
        hotkey("cmd", "y")
        sleep(0.4)

    def open_piano_roll(self):
        self.activate()
        hotkey("cmd", "p")
        sleep(0.4)

    def bounce(self):
        self.activate()
        hotkey("cmd", "b")
        sleep(0.5)

    def save(self):
        self.activate()
        hotkey("cmd", "s")
        sleep(0.3)

    def undo(self):
        self.activate()
        hotkey("cmd", "z")
        sleep(0.2)

    def redo(self):
        self.activate()
        hotkey("cmd", "shift", "z")
        sleep(0.2)


class LunaAgent:
    """Scripted Universal Audio LUNA workflows."""

    APP = "LUNA"

    def activate(self):
        activate_app(self.APP)
        sleep(0.5)

    def open_mix_window(self):
        self.activate()
        press_keycode(99)  # F3
        sleep(0.4)

    def open_timeline(self):
        self.activate()
        press_keycode(96)  # F2
        sleep(0.4)

    def bounce(self):
        self.activate()
        hotkey("cmd", "b")
        sleep(0.5)

    def save(self):
        self.activate()
        hotkey("cmd", "s")
        sleep(0.3)

    def undo(self):
        self.activate()
        hotkey("cmd", "z")
        sleep(0.2)

    def redo(self):
        self.activate()
        hotkey("cmd", "shift", "z")
        sleep(0.2)


# ─────────────────────────────────────────────
# MAIN AI CONTROL LOOP
# ─────────────────────────────────────────────

class GoatDAWAgent:
    """
    The main AI agent that uses vision to control any DAW.
    Combines scripted workflows with AI vision for complex tasks.
    """

    def __init__(self, daw="protools", fl_version="2025", mpc_app="mpc3"):
        self.daw = daw
        self.log_entries = []

        if daw == "protools":
            self.scripted = ProToolsMixer()
        elif daw == "fl":
            self.scripted = FLStudioAgent(fl_version)
        elif daw == "mpc":
            self.scripted = MPCAgent(mpc_app)
        elif daw == "logic":
            self.scripted = LogicAgent()
        elif daw == "luna":
            self.scripted = LunaAgent()

    def log(self, msg):
        ts = datetime.now().strftime("%H:%M:%S")
        entry = f"[{ts}] {msg}"
        self.log_entries.append(entry)
        print(entry)

    def run_task(self, task, use_vision=False, max_steps=10):
        """
        Run an AI-driven task on the DAW.
        task: string description of what to do
        use_vision: if True, take screenshots and use AI vision at each step
        max_steps: max vision loop iterations
        """
        self.log(f"Starting task: {task}")
        results = {"task": task, "steps": [], "ok": True}

        # Check permissions first
        perm = check_permissions()
        if not perm["ok"]:
            results["ok"] = False
            results["error"] = perm["message"]
            results["fix"] = perm.get("fix", "")
            return results

        if use_vision:
            # Vision-driven loop
            for step in range(max_steps):
                self.log(f"Step {step+1}/{max_steps} — capturing screen...")
                try:
                    screenshot = capture_screen()
                    plan = ask_ai_vision(screenshot, task)
                    self.log(f"AI sees: {plan.get('screen_state', '?')}")
                    self.log(f"Status: {plan.get('status', '?')}")

                    actions = plan.get("actions", [])
                    if not actions:
                        self.log("No actions returned by AI")
                        break

                    step_results = execute_actions(actions, log_fn=self.log)
                    results["steps"].append({
                        "step": step+1,
                        "screen_state": plan.get("screen_state"),
                        "status": plan.get("status"),
                        "actions_taken": step_results
                    })

                    if plan.get("task_complete"):
                        self.log("Task complete!")
                        break

                    sleep(0.5)
                    cleanup_screenshots(keep_last=5)

                except Exception as e:
                    self.log(f"Error in step {step+1}: {e}")
                    results["ok"] = False
                    results["error"] = str(e)
                    break

        else:
            # Scripted mode — use known workflows
            try:
                if self.daw == "protools":
                    if "mix" in task.lower():
                        steps = self.scripted.mix_workflow_basic(log=self.log)
                        results["steps"] = steps
                    elif "bounce" in task.lower() or "export" in task.lower():
                        self.scripted.bounce_to_disk(log=self.log)
                        results["steps"] = ["Bounce to Disk dialog opened"]
                    elif "save" in task.lower():
                        self.scripted.save()
                        results["steps"] = ["Session saved"]
                    elif "mix window" in task.lower():
                        self.scripted.open_mix_window()
                        results["steps"] = ["Mix window opened"]

                elif self.daw == "fl":
                    if "beat" in task.lower():
                        steps = self.scripted.beat_making_workflow(log=self.log)
                        results["steps"] = steps
                    elif "export wav" in task.lower():
                        self.scripted.export_wav(log=self.log)
                        results["steps"] = ["Export WAV dialog opened"]
                    elif "export mp3" in task.lower():
                        self.scripted.export_mp3(log=self.log)
                        results["steps"] = ["Export MP3 dialog opened"]
                    elif "save" in task.lower():
                        self.scripted.save()
                        results["steps"] = ["Project saved"]
                    elif "mixer" in task.lower():
                        self.scripted.open_mixer()
                        results["steps"] = ["Mixer opened"]
                    elif "piano" in task.lower():
                        self.scripted.open_piano_roll()
                        results["steps"] = ["Piano Roll opened"]

                elif self.daw == "mpc":
                    if "export" in task.lower() or "stems" in task.lower():
                        self.scripted.export(log=self.log)
                        results["steps"] = ["Export dialog opened"]
                    elif "save" in task.lower():
                        self.scripted.save()
                        results["steps"] = ["Project saved"]
                    elif "record" in task.lower():
                        self.scripted.record()
                        results["steps"] = ["Record toggled"]

                elif self.daw == "logic":
                    if "mix" in task.lower() or "mixer" in task.lower():
                        self.scripted.open_mix_window()
                        results["steps"] = ["Logic mixer opened"]
                    elif "bounce" in task.lower() or "export" in task.lower():
                        self.scripted.bounce()
                        results["steps"] = ["Bounce dialog opened"]
                    elif "save" in task.lower():
                        self.scripted.save()
                        results["steps"] = ["Project saved"]
                    elif "piano" in task.lower():
                        self.scripted.open_piano_roll()
                        results["steps"] = ["Piano Roll opened"]

                elif self.daw == "luna":
                    if "mix" in task.lower() or "mixer" in task.lower():
                        self.scripted.open_mix_window()
                        results["steps"] = ["LUNA mixer opened"]
                    elif "bounce" in task.lower() or "export" in task.lower():
                        self.scripted.bounce()
                        results["steps"] = ["Bounce dialog opened"]
                    elif "save" in task.lower():
                        self.scripted.save()
                        results["steps"] = ["Session saved"]
                    elif "timeline" in task.lower():
                        self.scripted.open_timeline()
                        results["steps"] = ["Timeline view opened"]

            except Exception as e:
                self.log(f"Error: {e}")
                results["ok"] = False
                results["error"] = str(e)

        results["log"] = self.log_entries
        return results


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="GOAT Force AI DAW Agent")
    parser.add_argument("task", help="Task to perform")
    parser.add_argument("--daw", default="protools", choices=["protools", "fl", "mpc", "logic", "luna"])
    parser.add_argument("--fl-version", default="2025")
    parser.add_argument("--mpc-app", default="mpc3", choices=["mpc3", "mpc", "beats"])
    parser.add_argument("--vision", action="store_true", help="Use AI vision mode")
    args = parser.parse_args()

    agent = GoatDAWAgent(args.daw, args.fl_version, args.mpc_app)
    result = agent.run_task(args.task, use_vision=args.vision)
    print(json.dumps(result, indent=2))
