"""
Oscar Library Bridge — index books/docs from Google Drive sync, USB, and owner paths.
Delivers results via catalog search + reveal/open (no cloud upload).
"""

from __future__ import annotations

import glob
import json
import os
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MASTER_LLM_ROOT = os.environ.get(
    "OSCAR_MASTER_LLM_ROOT",
    os.path.join(os.path.dirname(os.path.dirname(SCRIPT_DIR)), "MASTER-LLM"),
)
LIBRARY_SOURCES_FILE = os.path.join(MASTER_LLM_ROOT, "library", "library-sources.json")
CATALOG_DIR = os.path.join(MASTER_LLM_ROOT, "library", "catalog")
CATALOG_FILE = os.path.join(CATALOG_DIR, "library-catalog.json")
MAX_ITEMS = int(os.environ.get("OSCAR_LIBRARY_MAX_ITEMS", "8000"))
MAX_DEPTH = int(os.environ.get("OSCAR_LIBRARY_MAX_DEPTH", "6"))
SKIP_DIR_NAMES = {
    ".git",
    "node_modules",
    ".ollama-runtime",
    "models",
    "python-envs",
    "build-tools",
    "ComfyUI-master",
    "stable-diffusion-webui-master",
    "stable-diffusion-webui-forge-main",
    "llama.cpp-master",
    "vllm-main",
    "InvokeAI-main",
}


def _expand_paths(raw_paths):
    out = []
    for raw in raw_paths or []:
        if not raw:
            continue
        expanded = os.path.expanduser(str(raw).strip())
        if "*" in expanded:
            for match in glob.glob(expanded):
                if os.path.isdir(match):
                    out.append(os.path.realpath(match))
        elif os.path.isdir(expanded):
            out.append(os.path.realpath(expanded))
        elif expanded.endswith(".app") and os.path.isdir(expanded):
            out.append(os.path.realpath(expanded))
    return out


def load_sources():
    if not os.path.isfile(LIBRARY_SOURCES_FILE):
        return {"version": 1, "sources": []}
    with open(LIBRARY_SOURCES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _should_skip_dir(name):
    lower = name.lower()
    if name.startswith(".") and name not in {".", ".."}:
        return True
    return lower in SKIP_DIR_NAMES or "node_modules" in lower


def scan_root(root, source_id, extensions, items, stats, media_type=None, max_depth=None):
    extensions = {e.lower() for e in extensions}
    root = os.path.realpath(root)
    depth_limit = max_depth if max_depth is not None else MAX_DEPTH
    for dirpath, dirnames, filenames in os.walk(root):
        depth = dirpath[len(root) :].count(os.sep)
        if depth > depth_limit:
            dirnames[:] = []
            continue
        dirnames[:] = [d for d in dirnames if not _should_skip_dir(d)]
        for filename in filenames:
            if len(items) >= MAX_ITEMS:
                stats["truncated"] = True
                return
            ext = os.path.splitext(filename)[1].lower()
            if ext not in extensions:
                continue
            full = os.path.join(dirpath, filename)
            try:
                st = os.stat(full)
            except OSError:
                continue
            entry = {
                "id": f"{source_id}:{len(items)}",
                "sourceId": source_id,
                "title": filename,
                "path": full,
                "extension": ext,
                "sizeBytes": st.st_size,
                "modifiedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(st.st_mtime)),
            }
            if media_type:
                entry["mediaType"] = media_type
            items.append(entry)
            stats["indexed"] += 1


def build_catalog():
    config = load_sources()
    items = []
    stats = {"indexed": 0, "truncated": False, "sourcesScanned": 0, "roots": []}
    for source in config.get("sources", []):
        sid = source.get("id") or "source"
        extensions = source.get("extensions") or [".pdf", ".epub", ".txt", ".md"]
        roots = _expand_paths(source.get("paths"))
        for root in roots:
            stats["sourcesScanned"] += 1
            stats["roots"].append(root)
            scan_root(
                root,
                sid,
                extensions,
                items,
                stats,
                media_type=source.get("mediaType"),
                max_depth=source.get("maxDepth"),
            )
            if stats.get("truncated"):
                break
        if stats.get("truncated"):
            break

    catalog = {
        "version": 1,
        "builtAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "itemCount": len(items),
        "stats": stats,
        "items": items,
    }
    os.makedirs(CATALOG_DIR, exist_ok=True)
    with open(CATALOG_FILE, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return catalog


def load_catalog():
    if not os.path.isfile(CATALOG_FILE):
        return build_catalog()
    try:
        with open(CATALOG_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict) and isinstance(data.get("items"), list):
            return data
    except (json.JSONDecodeError, OSError):
        pass
    return build_catalog()


def search_catalog(query, limit=40):
    catalog = load_catalog()
    q = str(query or "").strip().lower()
    items = catalog.get("items") or []
    local_hits = []
    if not q:
        local_hits = items[:limit]
    else:
        for item in items:
            title = str(item.get("title") or "").lower()
            path = str(item.get("path") or "").lower()
            if q in title or q in path:
                local_hits.append(item)
                if len(local_hits) >= limit:
                    break
    web_hits = search_web_catalog(q, limit=max(10, limit // 2)) if q else []
    return {
        "local": local_hits,
        "web": web_hits,
        "items": local_hits,
        "count": len(local_hits) + len(web_hits),
    }


def load_web_sources():
    config = load_sources()
    entries = []
    for source in config.get("webSources") or []:
        manifest_path = source.get("manifest")
        gift = {}
        if manifest_path and os.path.isfile(manifest_path):
            try:
                with open(manifest_path, "r", encoding="utf-8") as f:
                    gift = json.load(f)
            except (json.JSONDecodeError, OSError):
                gift = {}
        entries.append({**source, "gift": gift})
    return entries


def search_web_catalog(query, limit=20):
    hits = []
    q = str(query or "").strip().lower()
    for source in load_web_sources():
        gift = source.get("gift") or {}
        for item in gift.get("featured") or []:
            title = str(item.get("title") or "").lower()
            author = str(item.get("author") or "").lower()
            if not q or q in title or q in author:
                hits.append({
                    "sourceId": source.get("id"),
                    "title": item.get("title"),
                    "author": item.get("author"),
                    "url": item.get("url"),
                    "mediaType": "web_book",
                })
                if len(hits) >= limit:
                    return hits
        for cat in gift.get("categories") or []:
            name = str(cat.get("name") or "").lower()
            if q and q in name:
                hits.append({
                    "sourceId": source.get("id"),
                    "title": cat.get("name"),
                    "url": cat.get("url"),
                    "mediaType": "web_category",
                })
                if len(hits) >= limit:
                    return hits
    return hits[:limit]


def library_status_payload():
    catalog = load_catalog()
    sources = load_sources()
    web = load_web_sources()
    inbox = os.path.join(MASTER_LLM_ROOT, "library", "inbox")
    return {
        "ok": True,
        "catalogPath": CATALOG_FILE,
        "sourcesFile": LIBRARY_SOURCES_FILE,
        "itemCount": catalog.get("itemCount", len(catalog.get("items") or [])),
        "builtAt": catalog.get("builtAt"),
        "sourceCount": len(sources.get("sources") or []),
        "webSourceCount": len(web),
        "libraryInbox": inbox,
        "inboxExists": os.path.isdir(inbox),
        "pdfBooksWorld": "https://www.pdfbooksworld.com/books",
        "stats": catalog.get("stats"),
        "webSources": [
            {
                "id": w.get("id"),
                "label": w.get("label"),
                "catalogUrl": w.get("catalogUrl"),
                "giftNote": (w.get("gift") or {}).get("giftNote"),
            }
            for w in web
        ],
    }