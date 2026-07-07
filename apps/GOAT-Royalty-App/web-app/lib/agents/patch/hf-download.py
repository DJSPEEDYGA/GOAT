#!/usr/bin/env python3
"""
Hugging Face model downloader for GOAT agents.

Downloads a model (or list of models) from the Hugging Face Hub using
huggingface_hub. If the hub client is not installed, it falls back to a simple
git-lfs clone or wget of the model files.

Usage:
    python3 hf-download.py <model_id> [local_dir]
    python3 hf-download.py --list            # list queued models from browser

Examples:
    python3 hf-download.py meta-llama/Llama-3.2-3B-Instruct
    python3 hf-download.py facebook/musicgen-small ./models/musicgen
    python3 hf-download.py --file models.txt
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

GOAT_DIR = Path(__file__).resolve().parents[4]
QUEUE_FILE = GOAT_DIR / ".goat_hf_queue.json"
DEFAULT_CACHE = os.environ.get("HF_HOME", GOAT_DIR / "models" / "huggingface")


def ensure_hf_hub():
    try:
        import huggingface_hub
        return huggingface_hub
    except ImportError:
        print("huggingface_hub not installed. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "huggingface_hub[cli]"])
        import huggingface_hub
        return huggingface_hub


def download(model_id, local_dir=None, use_hf_hub=True):
    print(f"Downloading {model_id} ...")
    if local_dir is None:
        local_dir = Path(DEFAULT_CACHE) / model_id.replace("/", "--")
    else:
        local_dir = Path(local_dir)
    local_dir.mkdir(parents=True, exist_ok=True)

    if use_hf_hub:
        hf = ensure_hf_hub()
        hf.snapshot_download(repo_id=model_id, local_dir=str(local_dir), local_dir_use_symlinks=False)
    else:
        # Fallback: use git-lfs if available
        if (Path(local_dir) / ".git").exists():
            subprocess.check_call(["git", "-C", str(local_dir), "pull"])
        else:
            subprocess.check_call(["git", "clone", f"https://huggingface.co/{model_id}", str(local_dir)])
    print(f"Done: {local_dir}")
    return local_dir


def load_queue():
    if QUEUE_FILE.exists():
        return json.loads(QUEUE_FILE.read_text())
    return []


def save_queue(queue):
    QUEUE_FILE.write_text(json.dumps(queue, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Download Hugging Face models for GOAT")
    parser.add_argument("model_id", nargs="?", help="Hugging Face model ID, e.g. meta-llama/Llama-3.2-3B-Instruct")
    parser.add_argument("local_dir", nargs="?", help="Optional local directory to download into")
    parser.add_argument("--list", action="store_true", help="Show queued models from the browser UI")
    parser.add_argument("--file", help="File with one model ID per line")
    parser.add_argument("--no-hf-hub", action="store_true", help="Use git-lfs fallback instead of huggingface_hub")
    args = parser.parse_args()

    if args.list:
        queue = load_queue()
        print("Queued models:")
        for m in queue:
            print(f"  - {m}")
        return

    models = []
    if args.file:
        models = [line.strip() for line in Path(args.file).read_text().splitlines() if line.strip()]
    elif args.model_id:
        models = [args.model_id]
    else:
        queue = load_queue()
        if queue:
            models = queue
            print(f"Using {len(queue)} queued model(s) from browser UI.")
        else:
            parser.print_help()
            return

    for m in models:
        download(m, args.local_dir, use_hf_hub=not args.no_hf_hub)

    # Clear queue after successful download
    if QUEUE_FILE.exists():
        save_queue([])
        print("Cleared browser download queue.")


if __name__ == "__main__":
    main()
