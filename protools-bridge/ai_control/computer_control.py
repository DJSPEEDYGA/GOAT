#!/usr/bin/env python3
"""
GOAT Force Computer Control Engine
Dr. Devin (Agent 007) — AI Computer Control

Mouse + keyboard control via cliclick and AppleScript.
Requires macOS Accessibility permissions for Terminal/Python.
"""

import subprocess
import time
import os
import json

CLICLICK = "/opt/homebrew/bin/cliclick"


# ─────────────────────────────────────────────
# MOUSE CONTROL
# ─────────────────────────────────────────────

def move_mouse(x, y, smooth=True):
    """Move mouse to (x, y)."""
    if smooth:
        subprocess.run([CLICLICK, f"m:{x},{y}"], capture_output=True)
    else:
        subprocess.run([CLICLICK, f"m:{x},{y}"], capture_output=True)
    time.sleep(0.05)


def click(x, y, button="left", double=False):
    """Click at (x, y). button: left|right|middle"""
    move_mouse(x, y)
    time.sleep(0.08)
    if double:
        cmd = "dc"
    elif button == "right":
        cmd = "rc"
    elif button == "middle":
        cmd = "mc"
    else:
        cmd = "c"
    subprocess.run([CLICLICK, f"{cmd}:{x},{y}"], capture_output=True)
    time.sleep(0.1)


def double_click(x, y):
    click(x, y, double=True)


def right_click(x, y):
    click(x, y, button="right")


def click_and_drag(x1, y1, x2, y2, duration=0.3):
    """Click and drag from (x1,y1) to (x2,y2)."""
    subprocess.run([CLICLICK, f"dd:{x1},{y1}"], capture_output=True)
    time.sleep(duration)
    subprocess.run([CLICLICK, f"du:{x2},{y2}"], capture_output=True)
    time.sleep(0.1)


def scroll(x, y, direction="down", amount=3):
    """Scroll at position. direction: up|down"""
    move_mouse(x, y)
    time.sleep(0.1)
    # Use AppleScript scroll
    delta = -amount if direction == "up" else amount
    script = f'''
tell application "System Events"
    scroll (get current application) by delta_y:{delta} at {{x:{x}, y:{y}}}
end tell
'''
    # Fallback: use cliclick scroll
    cmd = "ku" if direction == "up" else "kd"
    for _ in range(amount):
        subprocess.run([CLICLICK, f"w:100"], capture_output=True)


def get_mouse_position():
    """Return current mouse (x, y)."""
    result = subprocess.run([CLICLICK, "p:."], capture_output=True, text=True)
    # Output: "x,y"
    try:
        coords = result.stdout.strip().split(",")
        return int(coords[0]), int(coords[1])
    except Exception:
        return 0, 0


# ─────────────────────────────────────────────
# KEYBOARD CONTROL
# ─────────────────────────────────────────────

def type_text(text, delay=0.05):
    """Type text string at current focus."""
    # Use cliclick for typing
    # Escape single quotes in text
    safe_text = text.replace("'", "\\'")
    subprocess.run([CLICLICK, f"t:{safe_text}"], capture_output=True)
    time.sleep(delay)


def press_key(key, modifiers=None):
    """
    Press a key with optional modifiers.
    key: return, space, tab, escape, delete, up, down, left, right, f1-f12, etc.
    modifiers: list like ["cmd", "shift", "opt", "ctrl"]
    """
    if modifiers:
        mod_str = "+".join(modifiers)
        script = f'tell application "System Events" to keystroke "{key}" using {{{_mods_to_as(modifiers)}}}'
    else:
        script = f'tell application "System Events" to key code {_key_to_code(key)}'

    subprocess.run(["osascript", "-e", script], capture_output=True)
    time.sleep(0.05)


def hotkey(*keys):
    """
    Press a hotkey combo. E.g. hotkey("cmd", "s") for Cmd+S
    Last arg is the key, rest are modifiers.
    """
    if len(keys) == 1:
        press_key(keys[0])
        return
    mods = list(keys[:-1])
    key = keys[-1]
    mod_str = _mods_to_as(mods)
    script = f'tell application "System Events" to keystroke "{key}" using {{{mod_str}}}'
    subprocess.run(["osascript", "-e", script], capture_output=True)
    time.sleep(0.08)


def press_keycode(code, modifiers=None):
    """Press by key code (more reliable for special keys)."""
    if modifiers:
        mod_str = _mods_to_as(modifiers)
        script = f'tell application "System Events" to key code {code} using {{{mod_str}}}'
    else:
        script = f'tell application "System Events" to key code {code}'
    subprocess.run(["osascript", "-e", script], capture_output=True)
    time.sleep(0.05)


def _mods_to_as(mods):
    """Convert modifier list to AppleScript using clause."""
    mapping = {
        "cmd": "command down",
        "command": "command down",
        "shift": "shift down",
        "opt": "option down",
        "option": "option down",
        "alt": "option down",
        "ctrl": "control down",
        "control": "control down",
    }
    return ", ".join(mapping.get(m.lower(), m) for m in mods)


def _key_to_code(key):
    """Map key names to macOS key codes."""
    codes = {
        "return": 36, "enter": 36, "tab": 48, "space": 49,
        "delete": 51, "backspace": 51, "escape": 53, "esc": 53,
        "home": 115, "end": 119, "pageup": 116, "pagedown": 121,
        "up": 126, "down": 125, "left": 123, "right": 124,
        "f1": 122, "f2": 120, "f3": 99, "f4": 118, "f5": 96,
        "f6": 97, "f7": 98, "f8": 100, "f9": 101, "f10": 109,
        "f11": 103, "f12": 111,
    }
    return codes.get(key.lower(), 36)


# ─────────────────────────────────────────────
# APP CONTROL
# ─────────────────────────────────────────────

def activate_app(app_name):
    """Bring app to foreground."""
    script = f'tell application "{app_name}" to activate'
    subprocess.run(["osascript", "-e", script], capture_output=True)
    time.sleep(0.4)


def get_frontmost_app():
    """Return name of currently active app."""
    script = 'tell application "System Events" to get name of first application process whose frontmost is true'
    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    return result.stdout.strip()


def click_menu(app_name, menu, item, submenu=None):
    """Click a menu item in an app."""
    if submenu:
        script = f'''
tell application "System Events"
    tell process "{app_name}"
        click menu item "{item}" of menu 1 of menu item "{submenu}" of menu "{menu}" of menu bar 1
    end tell
end tell'''
    else:
        script = f'''
tell application "System Events"
    tell process "{app_name}"
        click menu item "{item}" of menu "{menu}" of menu bar 1
    end tell
end tell'''
    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    time.sleep(0.3)
    return result.returncode == 0


def wait_for_app(app_name, timeout=10):
    """Wait until app is running."""
    start = time.time()
    while time.time() - start < timeout:
        script = f'tell application "System Events" to (count processes whose name is "{app_name}") > 0'
        result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
        if "true" in result.stdout.lower():
            return True
        time.sleep(0.5)
    return False


# ─────────────────────────────────────────────
# FADER / KNOB CONTROL (DAW specific)
# ─────────────────────────────────────────────

def drag_fader(x, y, delta_y, steps=20):
    """
    Drag a fader up or down.
    x, y: fader position
    delta_y: negative = up (louder), positive = down (quieter)
    """
    subprocess.run([CLICLICK, f"dd:{x},{y}"], capture_output=True)
    time.sleep(0.05)
    step_size = delta_y / steps
    for i in range(steps):
        new_y = int(y + step_size * (i + 1))
        subprocess.run([CLICLICK, f"m:{x},{new_y}"], capture_output=True)
        time.sleep(0.02)
    subprocess.run([CLICLICK, f"du:{x},{int(y + delta_y)}"], capture_output=True)
    time.sleep(0.1)


def rotate_knob(x, y, delta, steps=15):
    """
    Rotate a knob by dragging up/down from center.
    delta: positive = clockwise (up), negative = counterclockwise (down)
    """
    drag_fader(x, y, -delta, steps)


def set_fader_to_zero(x, y):
    """Double-click a fader to reset to 0dB (works in most DAWs)."""
    double_click(x, y)
    time.sleep(0.1)


# ─────────────────────────────────────────────
# UTILITY
# ─────────────────────────────────────────────

def sleep(seconds):
    time.sleep(seconds)


def check_permissions():
    """Check if accessibility permissions are granted."""
    script = '''
tell application "System Events"
    set x to (count processes)
    return x
end tell'''
    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    if result.returncode == 0:
        return {"ok": True, "message": "Accessibility permissions granted"}
    else:
        return {
            "ok": False,
            "message": "Accessibility permissions NOT granted",
            "fix": "Open System Settings > Privacy & Security > Accessibility → add Terminal (or Python)"
        }


if __name__ == "__main__":
    print("Checking permissions...")
    result = check_permissions()
    print(json.dumps(result, indent=2))
    if result["ok"]:
        pos = get_mouse_position()
        print(f"Mouse position: {pos}")
        print("Computer control engine ready")
