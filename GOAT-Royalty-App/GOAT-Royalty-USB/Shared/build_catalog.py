#!/usr/bin/env python3
"""
GOAT Royalty App - Catalog Data Builder
Cleans, normalizes and unifies all catalog JSON files into one searchable index
"""
import json
import os
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent / 'data'
OUTPUT_FILE = DATA_DIR / 'unified-catalog.json'

def clean_str(val):
    if val is None or val != val:  # NaN check
        return None
    return str(val).strip() if str(val).strip() not in ['NaN', 'nan', 'None', ''] else None

def build_catalog():
    catalog = []
    seen_isrc = set()
    seen_titles = set()

    # ── 1. Waka ISRC (best quality: status, ISRC, artist, title, version) ──
    print("Loading waka-isrc.json...")
    with open(DATA_DIR / 'waka-isrc.json') as f:
        data = json.load(f)
    for item in data:
        title = clean_str(item.get('Title'))
        isrc  = clean_str(item.get('ISRC'))
        if not title:
            continue
        entry = {
            'source': 'waka-isrc',
            'title': title,
            'artist': clean_str(item.get('Artist')) or 'Waka Flocka Flame',
            'isrc': isrc,
            'version': clean_str(item.get('Version Title')),
            'type': clean_str(item.get('Type')),
            'status': clean_str(item.get('Status')),
            'year': None,
            'duration': None,
            'writer': None,
            'publisher': None,
            'ascap_id': None,
            'iswc': None,
            'split_writer': None,
            'split_publisher': None,
        }
        catalog.append(entry)
        if isrc:
            seen_isrc.add(isrc)
        seen_titles.add(title.lower())
    print(f"  → {len(catalog)} entries from waka-isrc")

    # ── 2. Waka Catalog (title, year, duration, ISRC) ──
    print("Loading waka-catalog.json...")
    with open(DATA_DIR / 'waka-catalog.json') as f:
        data = json.load(f)
    added = 0
    for item in data:
        title = clean_str(item.get('Title'))
        isrc  = clean_str(item.get('ISRC'))
        if not title or title.isdigit():
            continue
        # Only add if ISRC not already seen
        if isrc and isrc in seen_isrc:
            continue
        if title.lower() in seen_titles:
            continue
        year = item.get('Year')
        try:
            year = int(year) if year and str(year) not in ['0', 'nan', 'NaN'] else None
        except:
            year = None
        entry = {
            'source': 'waka-catalog',
            'title': title,
            'artist': 'Waka Flocka Flame',
            'isrc': isrc,
            'version': clean_str(item.get('Feature')),
            'type': 'Audio',
            'status': 'COMPLIANT',
            'year': year,
            'duration': clean_str(item.get('Duration')),
            'writer': None,
            'publisher': None,
            'ascap_id': None,
            'iswc': None,
            'split_writer': None,
            'split_publisher': None,
        }
        catalog.append(entry)
        added += 1
        seen_titles.add(title.lower())
        if isrc:
            seen_isrc.add(isrc)
    print(f"  → {added} new entries from waka-catalog")

    # ── 3. Fastassman Publishing Works (ASCAP registered works) ──
    print("Loading fastassman-publishing-works.json...")
    with open(DATA_DIR / 'fastassman-publishing-works.json') as f:
        data = json.load(f)
    added = 0
    for item in data:
        title = clean_str(item.get('work_title'))
        if not title:
            continue
        own_pct = clean_str(item.get('own_percent'))
        collect_pct = clean_str(item.get('collect_percent'))
        reg_date = clean_str(item.get('registration_date'))
        year = None
        if reg_date:
            try:
                year = int(reg_date[:4])
            except:
                pass
        entry = {
            'source': 'fastassman-publishing',
            'title': title,
            'artist': clean_str(item.get('interested_parties')) or 'Fastassman Publishing',
            'isrc': None,
            'version': None,
            'type': 'Publishing',
            'status': clean_str(item.get('registration_status')) or 'Accepted',
            'year': year,
            'duration': None,
            'writer': clean_str(item.get('interested_parties')),
            'publisher': 'Fastassman Publishing Inc.',
            'ascap_id': clean_str(item.get('ascap_work_id')),
            'iswc': clean_str(item.get('iswc_number')),
            'split_writer': own_pct,
            'split_publisher': collect_pct,
        }
        catalog.append(entry)
        added += 1
    print(f"  → {added} entries from fastassman-publishing")

    # ── 4. Harvey Miller Works ──
    print("Loading harvey-miller-works.json...")
    with open(DATA_DIR / 'harvey-miller-works.json') as f:
        data = json.load(f)
    added = 0
    for item in data:
        title = clean_str(item.get('work_title'))
        if not title:
            continue
        entry = {
            'source': 'harvey-miller',
            'title': title,
            'artist': 'Harvey Miller',
            'isrc': None,
            'version': None,
            'type': 'Publishing',
            'status': 'ASCAP Registered',
            'year': None,
            'duration': None,
            'writer': 'Harvey L. Miller',
            'publisher': 'Fastassman Publishing Inc.',
            'ascap_id': clean_str(item.get('ascap_work_id')),
            'iswc': clean_str(item.get('iswc_number')),
            'split_writer': clean_str(item.get('own_percent')),
            'split_publisher': clean_str(item.get('collect_percent')),
        }
        catalog.append(entry)
        added += 1
    print(f"  → {added} entries from harvey-miller")

    # ── 5. Fastassman MLC (sync licensing catalog) ──
    print("Loading fastassman-mlc.json...")
    with open(DATA_DIR / 'fastassman-mlc.json') as f:
        data = json.load(f)
    added = 0
    if isinstance(data, list):
        for item in data:
            # MLC data: recording_artists is the song/artist, writers is who wrote it
            recording_artist = clean_str(item.get('recording_artists'))
            writers = clean_str(item.get('writers'))
            mlc_code = clean_str(item.get('mlc_song_code'))
            iswc = clean_str(item.get('iswc'))
            shares = clean_str(item.get('total_known_shares'))
            if not recording_artist and not writers:
                continue
            # Use recording artist as title/artist field, writers as writer
            title = recording_artist or writers or mlc_code
            entry = {
                'source': 'fastassman-mlc',
                'title': title,
                'artist': recording_artist or 'Various',
                'isrc': None,
                'version': None,
                'type': 'Sync/MLC',
                'status': 'MLC Registered',
                'year': None,
                'duration': None,
                'writer': writers,
                'publisher': 'Fastassman Publishing Inc.',
                'ascap_id': mlc_code,
                'iswc': iswc if iswc else None,
                'split_writer': shares,
                'split_publisher': shares,
            }
            catalog.append(entry)
            added += 1
    print(f"  → {added} entries from fastassman-mlc")

    # ── 6. Speedy Splits (motion picture library tracks) ──
    print("Loading speedy-splits.json...")
    with open(DATA_DIR / 'speedy-splits.json') as f:
        data = json.load(f)
    added = 0
    SKIP_PHRASES = [
        'the title of the track', 'the date track was submitted',
        'hip hop, r&b', 'fast, mid, slow', 'song, hook, inst'
    ]
    for item in data:
        # In speedy-splits: publisher_name is the filename/track title, writer_name is date or Harvey Miller
        track_file = clean_str(item.get('publisher_name'))
        writer = clean_str(item.get('writer_name'))
        writer_split = clean_str(item.get('writer_split'))
        publisher_split = clean_str(item.get('publisher_split'))
        genre = clean_str(item.get('pro'))
        
        # Skip header rows and descriptive rows
        if not track_file:
            continue
        skip = False
        for phrase in SKIP_PHRASES:
            if phrase in track_file.lower() or (writer and phrase in writer.lower()):
                skip = True
                break
        if skip:
            continue
        
        # Only include real Harvey Miller writer entries
        is_harvey = writer and 'harvey miller' in writer.lower()
        is_real_writer = writer and len(writer) < 50 and not writer.startswith('20')
        
        entry = {
            'source': 'speedy-splits',
            'title': track_file,
            'artist': 'Harvey Miller' if is_harvey else (writer or 'Fastassman'),
            'isrc': None,
            'version': None,
            'type': 'Library/Sync',
            'status': 'Licensed',
            'year': None,
            'duration': None,
            'writer': 'Harvey L. Miller' if is_harvey else writer,
            'publisher': 'Fastassman Publishing Inc.',
            'ascap_id': None,
            'iswc': None,
            'split_writer': writer_split,
            'split_publisher': publisher_split,
        }
        if genre and len(genre) < 50:
            entry['genre'] = genre
        catalog.append(entry)
        added += 1
    print(f"  → {added} entries from speedy-splits")

    # ── Build stats ──
    total = len(catalog)
    by_source = {}
    for entry in catalog:
        src = entry['source']
        by_source[src] = by_source.get(src, 0) + 1

    with_isrc = sum(1 for e in catalog if e['isrc'])
    with_splits = sum(1 for e in catalog if e['split_writer'])
    waka_entries = sum(1 for e in catalog if 'waka' in e['source'])
    fastassman_entries = sum(1 for e in catalog if 'fastassman' in e['source'])
    harvey_entries = sum(1 for e in catalog if 'harvey' in e['source'])

    stats = {
        'total': total,
        'with_isrc': with_isrc,
        'with_splits': with_splits,
        'by_source': by_source,
        'artists': {
            'Waka Flocka Flame': waka_entries,
            'Fastassman Publishing': fastassman_entries,
            'Harvey Miller': harvey_entries,
        }
    }

    # ── Write output ──
    output = {
        'stats': stats,
        'catalog': catalog
    }
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2, default=str)

    print()
    print(f"✅ Unified catalog built: {total} total entries")
    print(f"   ISRCs: {with_isrc} | With splits: {with_splits}")
    print(f"   Waka: {waka_entries} | Fastassman: {fastassman_entries} | Harvey: {harvey_entries}")
    print(f"   Saved to: {OUTPUT_FILE}")
    return stats

if __name__ == '__main__':
    build_catalog()