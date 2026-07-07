#!/usr/bin/env python3
"""
GOAT Royalty - GDrive Evidence Ingestor for Lexi / Agent007 upgrades

Usage (after you download the items from the links you provided):

  python3 scripts/ingest_gdrive_evidence.py \
    --dump-dir /Volumes/GOAT_ROYALTY_APP/evidence/gdrive_dump_2026-06-07 \
    --links-file /Volumes/GOAT_ROYALTY_APP/evidence/gdrive_dump_2026-06-07/links.txt \
    --category "legal_openclav_evidence" \
    --output-log /mnt/ai-storage/evidence-logs/gdrive-dump-$(date +%Y%m%d).log

This produces:
- Hashed manifest of everything you downloaded.
- Calls the existing evidence-log generator for full chain-of-custody (JSON + HTML + TXT).
- Includes the original Drive links you pasted as source metadata.
- Ties into the FBI contact and "drives are up now" system.
- Designed so Lexi (on Jetson) can run this locally for air-gapped evidence preservation.

The script is the "add the updates to Lexi" piece for handling the massive data dump you just gave.

It matches the style in your MASTER DOC (EVID-xxx, SHA-256, collection method, storage on external, verification, chain of custody).

After running, copy the output logs + the dump dir to your evidence package on the external drives.
"""

import os
import sys
import json
import hashlib
import subprocess
import argparse
from datetime import datetime
from pathlib import Path

def compute_sha256(file_path: Path) -> str:
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha.update(chunk)
    return sha.hexdigest()

def scan_directory(dump_dir: Path) -> dict:
    manifest = {
        "scan_time": datetime.now().isoformat(),
        "root": str(dump_dir),
        "total_files": 0,
        "total_size_bytes": 0,
        "items": []
    }

    for root, dirs, files in os.walk(dump_dir):
        for file in files:
            if file.startswith("."):
                continue
            full_path = Path(root) / file
            try:
                size = full_path.stat().st_size
                sha = compute_sha256(full_path)
                rel_path = str(full_path.relative_to(dump_dir))
                manifest["items"].append({
                    "path": rel_path,
                    "size_bytes": size,
                    "sha256": sha,
                    "modified": datetime.fromtimestamp(full_path.stat().st_mtime).isoformat()
                })
                manifest["total_files"] += 1
                manifest["total_size_bytes"] += size
            except Exception as e:
                print(f"Warning: could not process {full_path}: {e}")

    return manifest

def main():
    parser = argparse.ArgumentParser(description="Ingest Google Drive dump for GOAT evidence log (Lexi upgrade)")
    parser.add_argument("--dump-dir", required=True, help="Local directory where you downloaded the Drive items")
    parser.add_argument("--links-file", help="Text file containing the original list of Drive links you pasted (one per line or the full list)")
    parser.add_argument("--category", default="gdrive_dump", help="Category for this batch (e.g. legal, openclav, evidence, gmail_openai)")
    parser.add_argument("--output-log", help="Optional path to write a summary log")
    parser.add_argument("--call-evidence-generator", action="store_true", default=True,
                        help="Also run the existing evidence-log generator on the dump dir")
    args = parser.parse_args()

    dump_dir = Path(args.dump_dir).expanduser().resolve()
    if not dump_dir.exists():
        print(f"ERROR: {dump_dir} does not exist. Download the items from the links first.")
        sys.exit(1)

    print(f"Scanning {dump_dir} ...")
    manifest = scan_directory(dump_dir)

    # Load original links if provided
    original_links = []
    if args.links_file:
        links_path = Path(args.links_file)
        if links_path.exists():
            with open(links_path) as f:
                original_links = [line.strip() for line in f if line.strip() and "drive.google.com" in line]
            print(f"Loaded {len(original_links)} original Drive links")

    # Build the evidence entry in the style of your MASTER DOC
    entry = {
        "id": f"EVID-GDRIVE-{datetime.now().strftime('%Y%m%d-%H%M')}",
        "description": f"Google Drive data dump - {args.category} ({len(manifest['items'])} files, {manifest['total_size_bytes'] / 1e9:.2f} GB)",
        "source": "User-provided Google Drive links (private) + local download to external drive",
        "collection_date": datetime.now().isoformat(),
        "collection_method": "Downloaded from Google Drive (user account) to external storage; SHA-256 computed locally",
        "storage_location": str(dump_dir),
        "transferred_to": "External drive (e.g. GOAT ROYALTY APP / AI TOOLS / AGENT*); retained by owner for chain of custody",
        "verification": "Full file manifest with SHA-256 below. Re-compute hashes to verify integrity.",
        "original_drive_links_count": len(original_links),
        "manifest": manifest,
        "original_links_sample": original_links[:5] if original_links else [],
        "notes": "Part of hard drive protection / post-FBI contact evidence package. Do not surrender original media."
    }

    # Write a JSON sidecar next to the dump
    sidecar = dump_dir / f"{entry['id']}_manifest.json"
    with open(sidecar, "w") as f:
        json.dump(entry, f, indent=2)
    print(f"Wrote manifest sidecar: {sidecar}")

    # Optionally call the existing full evidence log generator (the one we built for you)
    if args.call_evidence_generator:
        print("Calling the main evidence log generator on the dump directory (this adds the full chain-of-custody HTML/JSON/TXT)...")
        try:
            script = Path(__file__).parent / "generate-evidence-log.js"
            cmd = ["node", str(script), str(dump_dir)]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            print(result.stdout)
            if result.returncode != 0:
                print("Generator stderr:", result.stderr)
        except Exception as e:
            print(f"Could not call generator (you can run it manually): {e}")
            print("Manual: node scripts/generate-evidence-log.js /path/to/your/dump")

    # Summary for Lexi / the crew
    summary = f"""
EVIDENCE INGEST COMPLETE FOR LEXI

ID: {entry['id']}
Category: {args.category}
Files: {manifest['total_files']}
Size: {manifest['total_size_bytes'] / 1e9:.2f} GB
Manifest: {sidecar}
Original Drive links provided: {len(original_links)}

This dump (legal docs, openclav/nemoclav code & plans, AI platform materials, Gmail/OpenAI activity exports, evidence from the case, etc.) is now part of the chain of custody on your external drives.

Lexi can now reference this ID when generating reports or when you ask her about "the Google Drive data" or "openclav evidence".

Next: Copy the sidecar + any generated logs to your master evidence package. Re-run on the Jetson for air-gapped copy if desired.
"""
    print(summary)

    if args.output_log:
        with open(args.output_log, "w") as f:
            f.write(summary)
        print(f"Summary written to {args.output_log}")

if __name__ == "__main__":
    main()
