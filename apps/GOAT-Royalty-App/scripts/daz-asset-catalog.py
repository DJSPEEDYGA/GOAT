#!/usr/bin/env python3
"""
DAZ Studio Asset Catalog Generator for GOAT Royalty App

AGENT007 + MONEY PENNY personal originals.
THEIR AI TOOL KIT = THE GOAT ROYALTY APP. Licence to Build or Destroy.
NO MORE OSCAR HERE.

Absorbs DAZ 3D assets from mounted volumes (DAZ 3D + User Library) into the GOAT art/3D sections.

- Scans for .duf files (scenes, characters, outfits, poses)
- Groups by common DAZ categories (People/Genesis, Clothing, Props, Scenes, etc.)
- Builds a JSON catalog with name, path, type, category for use in:
  - goat-3d-studio.html (asset browser)
  - Lexi creative tools (generate_3d, metahuman, animation)
  - catalog-manager and fashion/3D tools
  - Crew workflows for best-in-class MetaHuman-style characters + 3D animation

Run:
  python3 scripts/daz-asset-catalog.py

Outputs:
  data/daz-assets.json
  data/daz-assets-summary.txt

This adds the real high-quality DAZ data (Genesis characters, clothing, morphs, poses) to the GOAT creative pipeline
so the crew (Waka, DJ Speedy, Lexi, etc.) can reference actual assets for MetaHuman-level 3D characters and animation.

No cloud, fully local/offline. Paths point to the mounted /Volumes/DAZ3D STUDIO for direct use or export instructions.
"""

import os
import json
from pathlib import Path
from collections import defaultdict
import datetime

# Paths from user (adjust if needed)
DAZ_BASES = [
    "/Volumes/DAZ3D STUDIO/DAZ 3D",
    "/Volumes/DAZ3D STUDIO/User Library",
    "/Volumes/DAZ3D STUDIO/DAZ 3D/MY DAZ 3D LIBRARY",
    "/Volumes/DAZ3D STUDIO/DAZ 3D/DOWNLOADS",
]

OUTPUT_DIR = Path("data")
OUTPUT_DIR.mkdir(exist_ok=True)

CATALOG_FILE = OUTPUT_DIR / "daz-assets.json"
SUMMARY_FILE = OUTPUT_DIR / "daz-assets-summary.txt"

# Category mapping based on typical DAZ folder structure
CATEGORY_MAP = {
    "people": "character",
    "genesis": "character",
    "characters": "character",
    "clothing": "clothing",
    "outfit": "clothing",
    "props": "prop",
    "scenes": "scene",
    "pose": "pose",
    "animation": "animation",
    "morph": "morph",
    "environment": "environment",
    "hair": "hair",
    "accessories": "accessory",
}

def categorize_path(path_str: str) -> str:
    lower = path_str.lower()
    for key, cat in CATEGORY_MAP.items():
        if key in lower:
            return cat
    if "genesis" in lower or "people" in lower:
        return "character"
    return "other"

def extract_name(duf_path: Path) -> str:
    name = duf_path.stem
    # Clean common DAZ suffixes
    for suffix in ["_Genesis8", "_G8F", "_G8M", "_G9", "_Pose", "_Outfit", "_Scene"]:
        if name.endswith(suffix):
            name = name[: -len(suffix)]
    return name.replace("_", " ").title()

def scan_daz_assets():
    catalog = {
        "generated": datetime.datetime.now().isoformat(),
        "source_volumes": DAZ_BASES,
        "total_assets": 0,
        "by_type": defaultdict(list),
        "assets": []
    }

    seen = set()

    for base in DAZ_BASES:
        base_path = Path(base)
        if not base_path.exists():
            print(f"Skipping missing: {base}")
            continue

        print(f"Scanning {base}...")

        for duf in base_path.rglob("*.duf"):
            if duf in seen:
                continue
            seen.add(duf)

            rel_path = str(duf.relative_to(base_path.parent) if base_path.parent in duf.parents else duf)
            asset_type = categorize_path(str(duf))
            name = extract_name(duf)

            entry = {
                "name": name,
                "path": str(duf),
                "relative": rel_path,
                "type": asset_type,
                "category": Path(duf.parent).name,
                "size_mb": round(duf.stat().st_size / (1024*1024), 2) if duf.exists() else 0,
            }

            catalog["assets"].append(entry)
            catalog["by_type"][asset_type].append(entry["name"])

    catalog["total_assets"] = len(catalog["assets"])
    catalog["by_type"] = {k: v for k, v in catalog["by_type"].items()}

    # Write JSON catalog
    with open(CATALOG_FILE, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    # Write human summary
    with open(SUMMARY_FILE, "w", encoding="utf-8") as f:
        f.write(f"DAZ STUDIO ASSET CATALOG FOR GOAT ROYALTY\n")
        f.write(f"Generated: {catalog['generated']}\n")
        f.write(f"Total .duf assets absorbed: {catalog['total_assets']}\n\n")
        f.write("By Type:\n")
        for t, items in sorted(catalog["by_type"].items()):
            f.write(f"  {t}: {len(items)}\n")
        f.write("\nSample Characters (for MetaHuman / 3D):\n")
        chars = [a for a in catalog["assets"] if a["type"] == "character"][:10]
        for c in chars:
            f.write(f"  - {c['name']} ({c['category']}) : {c['path']}\n")

        f.write("\n\nHOW TO USE IN GOAT TOOLS:\n")
        f.write("- In goat-3d-studio.html: Load DAZ assets via the catalog for reference/import.\n")
        f.write("- In Lexi (generate_3d / new daz methods): Reference specific assets for prompts and workflows.\n")
        f.write("- Export tips: Use DAZ Studio -> Blender bridge (free) or FBX export -> Unreal for MetaHuman pipeline.\n")
        f.write("- For animation: Use DAZ poses/animations with local tools or export to the GOAT 3D animation pipeline.\n")
        f.write("- Best MetaHuman results: Genesis 8/9 figures + morphs + high quality textures from this library.\n")

    print(f"\nCatalog written to {CATALOG_FILE}")
    print(f"Summary written to {SUMMARY_FILE}")
    print(f"Total assets absorbed: {catalog['total_assets']}")

    return catalog

if __name__ == "__main__":
    scan_daz_assets()