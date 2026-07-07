# GOAT Catalog Scanner Standard

Private owner-side standard for DJ Speedy, Speedy Productions, GOAT Royalty,
Money Penny, Waka/team, sync, licensing, beat, sound, film scoring, session,
stem, master, and metadata archives.

## Purpose

AGENT-007 and the crew should scan the 1950-2026 catalog as a rights and production
vault, not as a loose pile of files. The scanner lane is read-only: it creates
manifests, hashes, technical metadata, and crew routing notes without modifying
source files.

## Source Lanes

- Original music, beats, sounds, and film scoring material.
- Movie sync and licensing music for placement pitching.
- Pro Tools, Logic Pro, Ableton, and other owner-approved DAW sessions.
- WAV/AIFF/FLAC/MP3 masters, stems, instrumentals, acapellas, clean, dirty,
  radio, TV mixes, cue files, and reference exports.
- ASCAP, MLC, DSP, split, cue sheet, client, invoice, and release metadata.
- Owner-provided Drive folder: DJ Speedy Speedy Productions, Inc Catalog For
  Sync Placements.

## Scanner

Script:

```bash
python3 Shared/catalog_scanner.py "/path/to/owner-approved/catalog/folder"
```

Test with a limit:

```bash
python3 Shared/catalog_scanner.py "/path/to/owner-approved/catalog/folder" --limit 25
```

Outputs are written to:

```text
BackupVault/AGENT-007-Studio/Catalog/
```

Each scan creates a JSON manifest and CSV control map. When `ffprobe` and
`ffmpeg` are available, the scanner also records technical media metadata and a
normalized audio SHA-256 fingerprint.

## Crew Routing

- AGENT-007: coordinate scan, summarize findings, and ask for the next approved
  action.
- Money Penny: rights, splits, publishing, DSP, sync, cue sheets, and royalty
  reporting.
- Lexi: automation, dedupe, metadata cleanup, export scripts, and Thor/Jetson
  migration helpers.
- Ms. Vanessa: fingerprints, provenance, chain-of-custody, duplicate review,
  sample risk, and evidence packet prep.
- Ms. Nexus: sync/licensing opportunities, collaborator maps, supervisor pitch
  lanes, and platform routing.
- Sir Codex: SOPs, QA checklists, control maps, delivery logs, and documents.

## Sync Placement Fields

- Work title and alternate titles.
- Writers, publishers, PRO, IPI, ISRC, ISWC, UPC.
- Master owner, publishing owner, one-stop status, clearance contact.
- Tempo, key, mood, genre, era, vocal/instrumental status.
- Stems, alt mixes, clean/explicit/radio/TV/instrumental/acapella availability.
- Sample/interpolation status and known placement history.
- Cue sheet notes, usage terms, territory, and client delivery status.

## Privacy

Do not expose private Drive links, unreleased music, raw file names, API keys,
banking/payment data, vault phrases, client material, or dispute evidence in
public pages. Use fingerprints and manifests for owner-approved catalog
management, not unauthorized surveillance.
