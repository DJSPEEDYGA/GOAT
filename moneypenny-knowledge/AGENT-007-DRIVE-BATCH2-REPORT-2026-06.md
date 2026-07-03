# Drive Batch 2 — Intake Report (June 2026)

**Owner links received:** 200  
**Merged into master manifest:** yes (`drive-owner-finalize-manifest-2026-06.json` → **479 total**)

## Breakdown (batch 2 only)

| Type | Count |
|------|------:|
| Drive files (binary/media/docs) | 186 |
| Google Docs | 12 |
| Google Sheets | 2 |

## Export status (automated)

| Result | Count |
|--------|------:|
| Google Docs/Sheets **exported to FKD1** (all batches, synced) | **50** |
| Text files on disk in `Drive-Intake/raw/` | **89** |
| Still **pending** (mostly Drive *files* — need browser download) | **429** |

**Exported Docs/Sheets land at:**  
`/Volumes/FKD1/Raspy-AGENT-007/BackupVault/AGENT-007-Studio/Drive-Intake/raw/{ID}.txt` or `.csv`

**Sanitized index for AGENT-007 memory:**  
`BackupVault/AGENT-007-Studio/Marketing/drive-intake-summary-for-agent-007.txt`

## What AGENT-007 can use now

- All **exported .txt** docs are readable locally (Tool Mode `read` on `BackupVault/AGENT-007-Studio/Drive-Intake/raw/...`).
- Skill → **Marketing** or **Drive Vault** → ask: *“Summarize drive-intake-summary-for-agent-007.txt and draft GOAT positioning.”*
- Do **not** paste raw vault/legal drama into public marketing — Vanessa redaction gate applies.

## What still needs you (186+ files)

Drive **files** (PDF, images, video, zip, Office binaries) are **not** auto-downloaded without Google Drive API or manual “Download” in browser.

**Owner workflow:**
1. Open Google Drive while logged in.
2. Multi-select priority folders/files → Download.
3. Drop into `BackupVault/AGENT-007-Studio/Drive-Intake/incoming/batch2/`
4. Tell AGENT-007: *“Index incoming/batch2 and update marketing memory.”*

## Commands

```bash
# Merge more URL lists
python3 Shared/runtime/import-drive-finalize-manifest.py --merge-url-file path/to/urls.txt --batch-label batch3

# Export pending Docs/Sheets (runs in background; may take 10–20 min)
python3 Shared/runtime/import-drive-finalize-manifest.py --export-all-docs

# After exports, sync manifest + rebuild summary
python3 Shared/runtime/import-drive-finalize-manifest.py --sync-raw
python3 Shared/runtime/import-drive-finalize-manifest.py --build-summary
```

## Overlap with May 2025 intake

Docs `1NDGxRAuDgAxym0SKDr-LJePi5nRqwWAHZyoDvyBTSvY` and `1MKFIx7zGVNqRfpFkN8wAkh0rawbCmUQh6ujRutrJgfc` were already in the earlier vault intake — re-exported for freshness on FKD1.