#!/usr/bin/env python3
"""
GOAT Force Session Scanner
Dr. Devin (Agent 007) — Pro Tools Automation Bridge
Scans The C Room for all .ptx sessions and outputs a catalog JSON.
"""

import os
import json
import subprocess
from datetime import datetime

C_ROOM = "/Volumes/The C Room"

# Named session groups (from global rules)
SESSION_GROUPS = {
    "HEAD2SOLID SESSIONS": "HEAD2SOLID SESSIONS",
    "Icky Sessions":        "Icky Sessions",
    "Jimmy Rocket":         "Jimmy Rocket",
    "EMPHAMUS VERSE":       "EMPHAMUS VERSE",
    "JimmyMGHU":            "JimmyMGHU",
    "JNOTE SESSIONS":       "JNOTE SESSIONS",
    "Waka Hard Liquor":     "Waka Hard Liquor",
    "WOOH":                 "WOOH",
    "PRIORITY SESSIONS":    "PRIORITY SESSIONS",
    "LOUDIENE SESSIONS":    "LOUDIENE SESSIONS",
}

def scan():
    catalog = {
        "scanned_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "root": C_ROOM,
        "groups": {}
    }

    # Walk the drive
    for root, dirs, files in os.walk(C_ROOM):
        # Skip backup folders
        dirs[:] = [d for d in dirs if d != "Session File Backups"]

        for f in files:
            if f.endswith(".ptx"):
                full_path = os.path.join(root, f)
                rel = os.path.relpath(full_path, C_ROOM)
                parts = rel.split(os.sep)

                # Determine group
                group = "Other"
                for grp_name, grp_folder in SESSION_GROUPS.items():
                    if parts[0] == grp_folder or (len(parts) > 1 and parts[0] == "Desktop" and len(parts) > 2 and grp_folder in parts):
                        group = grp_name
                        break
                    elif grp_folder in rel:
                        group = grp_name
                        break

                stat = os.stat(full_path)
                session = {
                    "name": os.path.splitext(f)[0],
                    "file": f,
                    "path": full_path,
                    "relative": rel,
                    "group": group,
                    "size_mb": round(stat.st_size / 1024 / 1024, 3),
                    "modified": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M"),
                }

                if group not in catalog["groups"]:
                    catalog["groups"][group] = []
                catalog["groups"][group].append(session)

    # Sort each group by modified date desc
    for grp in catalog["groups"]:
        catalog["groups"][grp].sort(key=lambda x: x["modified"], reverse=True)

    total = sum(len(v) for v in catalog["groups"].values())
    catalog["total_sessions"] = total
    return catalog

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="/Users/be100radio/GOAT-Royalty-App/protools-bridge/sessions_catalog.json")
    args = parser.parse_args()

    data = scan()
    with open(args.out, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Scanned {data['total_sessions']} sessions → {args.out}")
    for grp, sessions in data["groups"].items():
        print(f"  {grp}: {len(sessions)} sessions")
