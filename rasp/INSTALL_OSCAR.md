# Turning RASP on in the live Oscar (`chat_server.py`)

Three edits. Line numbers are from the backed-up 9,514-line `chat_server.py`
(`live-server/srv1148455/code/oscar/chat_server.py`), which is byte-identical to
the copy on your drives. If your line numbers drift, search for the **anchor**
text shown with each edit.

Every hook is wrapped so a RASP error can **never** take down the proxy — if the
`rasp/` folder is missing or anything throws, Oscar serves exactly as before.

---

## 0. Copy the folder — OSCAR drive only
Oscar lives on the **OSCAR drive** (not FKD1). Put the whole `rasp/` folder
**inside the Oscar directory on the OSCAR drive**, next to `chat_server.py`:

```
/Volumes/OSCAR/.../oscar/        (OSCAR drive — keep all Oscar files here)
    chat_server.py
    rasp/            <-- copy this folder here
        rasp.py
        prompts.py
        integrate_oscar.py
        ...
```

Sanity check it runs on the drive (no pip, stdlib only):
```bash
cd .../oscar/rasp
python3 -m unittest test_rasp     # expect: OK (22 tests)
python3 run_evals.py              # expect: 21/21 passed
python3 integrate_oscar.py        # demo: catches a fake "I checked" claim
```

---

## EDIT 1 — import the hooks (near the top imports)

**Anchor:** find the existing line `import oscar_library_bridge as oscar_library`
(around **line 56**). Add this block right after the import section there:

```python
# --- RASP Protocol hooks (safe no-op if the rasp/ folder is absent) ---
try:
    import os as _os, sys as _sys
    _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "rasp"))
    from integrate_oscar import (
        rasp_prepare_body,
        rasp_gate_ollama_answer,
        rasp_stats,
    )
    RASP_ON = True
except Exception as _rasp_err:  # never break Oscar if RASP can't load
    RASP_ON = False
    print(f"[rasp] disabled: {_rasp_err}")
```

---

## EDIT 2 — STEP 1: validate + route + inject the constitution (covers Grok, DeepSeek, and local)

**Anchor:** the line
`elif method == "POST" and ollama_route == "/api/chat":` (around **line 9219**),
inside `def _proxy_ollama`. Add these 5 lines as the **first** statements inside
that branch, *before* the `learn_answer = ...` line:

```python
            elif method == "POST" and ollama_route == "/api/chat":
                if RASP_ON and body:                                  # <-- ADD
                    try:                                              # <-- ADD
                        body, _rasp_user, _rasp_lane = rasp_prepare_body(body)  # <-- ADD
                    except Exception as _e:                           # <-- ADD
                        safe_print(f"[rasp] prepare skipped: {_e}", flush=True)  # <-- ADD
                learn_answer = oscar_learn_mode_answer(body)   # (existing line)
```

This prepends the RASP constitution + the routed lane nudge to the system prompt
for **every** backend, because it runs before the bridge/xAI/DeepSeek/local
dispatch all read `body`.

---

## EDIT 3 — STEP 3: gate the (non-streaming) Grok + DeepSeek answers

**Anchor:** `xai_answer = try_xai_ollama_chat(body)` (around **line 9280**) and
`deepseek_answer = try_deepseek_ollama_chat(body)` (around **line 9290**).
Add the small `if RASP_ON:` wrap right after each answer is produced and before
it is written:

```python
                xai_answer = try_xai_ollama_chat(body)
                if xai_answer is not None:
                    if RASP_ON:                                       # <-- ADD
                        try:                                          # <-- ADD
                            xai_answer = rasp_gate_ollama_answer(body, xai_answer)  # <-- ADD
                        except Exception as _e:                       # <-- ADD
                            safe_print(f"[rasp] gate skipped: {_e}", flush=True)    # <-- ADD
                    self.send_response(200)
                    ...

                deepseek_answer = try_deepseek_ollama_chat(body)
                if deepseek_answer is not None:
                    if RASP_ON:                                       # <-- ADD
                        try:                                          # <-- ADD
                            deepseek_answer = rasp_gate_ollama_answer(body, deepseek_answer)  # <-- ADD
                        except Exception as _e:                       # <-- ADD
                            safe_print(f"[rasp] gate skipped: {_e}", flush=True)              # <-- ADD
                    self.send_response(200)
                    ...
```

---

## Local-model (streamed Ollama) gating — optional, do later
The local Ollama path (`sanitize_ollama_chat_body` → streamed proxy, ~line 9299+)
returns the answer in **streamed chunks**, so the output gate can't see the full
draft until the stream ends. EDIT 1 + EDIT 2 still apply to it (it gets the RASP
constitution + routing), but to gate its *output* you must buffer the stream and
gate at the end. That's a bigger, riskier change — do EDITS 1-3 first, confirm
Grok answers are gated, then ping me and I'll provide the buffered-stream variant.

## Verify after editing
```bash
python3 -c "import ast; ast.parse(open('chat_server.py').read()); print('syntax OK')"
```
Restart Oscar, send Oscar a message like *"is the server healthy on port 3333?"*
in Grok mode with a fabricated "I checked it" style reply, and confirm a
`[RASP]` note is appended. Gate metrics are available via `rasp_stats()` (wire it
into `/api/stats` if you want them in the UI).
