# AGENT-007 Cody Sidekick Test Report - 2026-06-28

## Installed Components

- Added Cody Sidekick local profile:
  - `BackupVault/Cody-Sidekick-Home/CODY-SIDEKICK-PROFILE-FOR-AGENT-007.md`
  - `BackupVault/Cody-Sidekick-Home/CODY-SIDEKICK-SOURCE-SUMMARY.md`
- Added Cody Sidekick training protocol:
  - `Training-Corpus/AGENT-007-CODY-SIDEKICK-TRAINING.md`
- Added AGENT-007 server profile endpoint:
  - `/api/cody-sidekick/profile`
- Added AGENT-007 UI controls:
  - Expert mode: `Cody Sidekick`
  - Crew loader button: `Load Cody`
  - Council review now knows Cody Sidekick as an optional perspective.

## Purpose

Cody Sidekick gives AGENT-007 a local-first helper lane for debugging, verification, studio training, recording-school teaching, and Thor migration prep. It is not a claim that the OpenAI Codex cloud service is embedded inside AGENT-007. It is an owner-approved local profile and prompt lane that teaches AGENT-007 to work with a Codex-style inspection, patch, verify, document, and teach loop.

## Studio Context

The Mac is the recording studio and production seat. The building has five recording rooms, and the owner is building a recording school. Cody Sidekick should help AGENT-007 convert sessions into reusable lessons, templates, SOPs, and student-friendly drills.

## Verification

Passed on the local AGENT-007 runtime after restart.

- Python server compile check passed:
  `PYTHONPYCACHEPREFIX=/private/tmp/agent007-pycache python3 -m py_compile Shared/chat_server.py`
- AGENT-007 inline browser script syntax check passed:
  `inline scripts ok: 1`
- Thor verifier syntax check passed after adding Cody checks:
  `thor verify syntax ok`
- AGENT-007 restarted through the official launcher chain:
  `START AGENT-007.command` -> `Launch AGENT-007.command` -> `Mac/start-agent-007-detached.sh`
- Live listener verified:
  `Python` PID listening on `127.0.0.1:3333`
- LaunchAgent verified:
  `local.agent007.chatserver`
- Health route passed:
  `/api/health` returned `ok: true`, `tool_mode: true`, `voice_auto_speak: true`, `speechVoiceName: Daniel`, and `ollama_host: http://127.0.0.1:11435`.
- Cody profile endpoint passed:
  `/api/cody-sidekick/profile` returned `ok: true`, `displayName: Cody Sidekick`, and the profile path under `BackupVault/Cody-Sidekick-Home`.
- Home UI smoke test passed:
  `/` returned HTTP 200 and contains `Cody Sidekick` and `Load Cody`.
- GOAT app smoke test passed:
  `/goat/index.html` returned HTTP 200.
- Settings route passed:
  `/api/settings` returned tool mode enabled, computer control enabled, training capability mode, Daniel voice, and default model `gemma2-2b-local:latest`.
- Model lane passed:
  `/ollama/api/tags` through AGENT-007 and direct `127.0.0.1:11435/api/tags` both reported 56 visible models.
- Tiny chat proxy test passed:
  `/ollama/api/chat` with `gemma2-2b-local:latest` returned in about one second.

Note: Cody Sidekick behavior becomes fully active when the UI loads the Cody profile into AGENT-007 memory or when Expert mode is switched to `Cody Sidekick`. The tiny chat proxy test only proved the model/proxy lane was alive.
