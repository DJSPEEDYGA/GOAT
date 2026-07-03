# AGENT-007 Studio Build Spec

## Mission

AGENT-007 Studio is the local-first Codex-style build environment for DJ Speedy and Raspy. It keeps AGENT-007 usable without API keys, while leaving a clean optional path for cloud/API boosts later.

## Non-Negotiables

- Local mode must work without OpenAI API keys.
- Cloud/API mode must be optional and clearly labeled.
- Private owner routes, vault material, chat memory, and secrets stay local unless explicitly exported by the owner.
- Tool and computer actions require owner-controlled switches and explicit approval.
- AGENT-007 must report only tools, tests, files, or commands that actually ran.
- Backups must be easy to run and easy to verify.

## First-Class Features

- Local chat through Ollama, llama.cpp, vLLM, or another local OpenAI-compatible endpoint.
- Persistent project memory stored on the USB drive.
- Private call protocols for AGENT-007, Money Penny, and approved crew profiles.
- File intake for PDFs, images, and Granite Speech audio/video transcripts.
- Voice controls: read aloud, voice conversation, wake listening, and selectable speaking voice.
- Workspace bridge: attach a safe project snapshot into the next message.
- Tool Mode: local file tree, read, search, run, write, diagnose.
- Computer Control: owner-approved open URL, open app, reveal file, and speak actions.
- Crew/Council mode for investigator, engineer, strategist, writer, and privacy perspectives.
- Codex Guardian perspective for disciplined local engineering, identity protection, backup awareness, and owner approval boundaries.
- Health/status endpoints so launchers can tell what is ready.

## UI Contract

- `Skill: Studio` means AGENT-007 behaves like a local builder, not a generic chatbot.
- `Tool Mode` must remain opt-in.
- `Computer Control` must remain opt-in and dependent on Tool Mode.
- Audio/video uploads become transcript context before AGENT-007 answers.
- Failed runtimes should fail clearly, never silently.

## Runtime Contract

- AGENT-007 server: `http://localhost:3333`
- Studio status: `/api/studio/status`
- Granite status: `/api/voice/granite/status`
- Granite transcription: `/api/voice/granite/transcribe`
- Local model backend: `/ollama/*` proxy to Ollama or llama.cpp mode.

## Launch Contract

Launchers should:

- Resolve paths relative to the USB folder.
- Avoid starting a second AGENT-007 server on port `3333`.
- Open the existing server if AGENT-007 is already running.
- Scope tool access to the approved workspace.
- Keep terminal output clear for a non-engineer owner.

## Build Stages

1. Studio mode in AGENT-007 UI.
2. Studio status endpoint and runtime readiness.
3. One-click Studio launcher.
4. Codex Guardian crew role.
5. Granite speech runtime installer/launcher.
6. Turnkey backup and restore scripts.
7. Windows 11 high-memory workstation runtime path.
8. Jetson AGX/Thor transfer profile.
9. Optional Cloud Boost using official API keys or supported auth only.

## Current Truth

AGENT-007 already has local chat, persistent memory, launcher flow, voice controls, workspace bridge, Tool Mode, Computer Control, crew panel, GOAT workspace launcher, backup vault, AGENT-007 protocol, and Granite Speech wiring.

The Granite engine itself still requires a local runtime such as `llama.cpp`, plus `ffmpeg` for best audio/video conversion.
