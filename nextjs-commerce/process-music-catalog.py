#!/usr/bin/env python3
"""
Process Music Catalog Files for GOAT Royalty App
Unifies all Excel/CSV catalog files into a single database
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime

# Configuration
OUTPUT_DIR = Path("data/processed")
INPUT_DIR = Path("/workspace")
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

# File mappings
CATALOG_FILES = {
    "ascap_1": {
        "file": "ASCAP 1.xlsx",
        "type": "excel",
        "description": "ASCAP catalog entries"
    },
    "catalog_metadata": {
        "file": "Catalog Metadata_BSM Publishing.xlsx",
        "type": "excel",
        "description": "BSM Publishing catalog metadata"
    },
    "isrc_qzem1": {
        "file": "ISRC - QZEM1.xlsx",
        "type": "excel",
        "description": "ISRC codes QZEM1"
    },
    "mlc_royalty": {
        "file": "MLC_Royalty_Catalog.xlsx",
        "type": "excel",
        "description": "MLC Royalty catalog"
    },
    "music_reports_waka": {
        "file": "Music Reports publishing_catalog_WAKA 2.xlsx",
        "type": "excel",
        "description": "Music Reports WAKA catalog"
    },
    "waka_merged": {
        "file": "WAKA - MERGED SONG CATALOG - ASCAP_SX .xlsx",
        "type": "excel",
        "description": "Merged WAKA song catalog"
    },
    "waka_ascap": {
        "file": "Waka ASCAP 6023.xlsx",
        "type": "excel",
        "description": "Waka ASCAP catalog (6023 entries)"
    },
    "waka_isrc": {
        "file": "Waka Flocka ISRC's.xlsx",
        "type": "excel",
        "description": "Waka Flocka ISRC codes"
    },
    "works_catalog": {
        "file": "WorksCatalogFASTASSMAN PUBLISHING INC ASCAP.csv",
        "type": "csv",
        "description": "Works catalog - FASTASSMAN PUBLISHING INC"
    },
    "associated_artist": {
        "file": "associated_1000071571_Artist_Catalog_2022-01-17_20-18-17 2.xlsx",
        "type": "excel",
        "description": "Associated artist catalog"
    },
    "isrc_qz9em": {
        "file": "iSRC Codes - QZ-9EM-17 (1).xlsx",
        "type": "excel",
        "description": "ISRC codes QZ-9EM-17"
    }
}

def load_file(filepath, file_type):
    """Load Excel or CSV file"""
    try:
        if file_type == "excel":
            # Try different engines
            try:
                df = pd.read_excel(filepath, engine='openpyxl')
            except:
                df = pd.read_excel(filepath, engine='xlrd')
        else:
            df = pd.read_csv(filepath)
        return df
    except Exception as e:
        print(f"❌ Error loading {filepath}: {e}")
        return None

def process_dataframe(df, source_name):
    """Process dataframe and normalize columns"""
    if df is None or df.empty:
        return []
    
    # Convert to lowercase
    df.columns = df.columns.str.lower().str.replace(' ', '_')
    
    # Add source column
    df['source'] = source_name
    df['processed_date'] = datetime.now().isoformat()
    
    # Convert to records
    records = df.to_dict('records')
    print(f"✅ Processed {len(records)} records from {source_name}")
    return records

def main():
    print("🐐 Processing Music Catalog Files for GOAT Royalty")
    print("=" * 60)
    
    all_records = []
    
    # Process each file
    for key, catalog in CATALOG_FILES.items():
        filepath = INPUT_DIR / catalog["file"]
        
        if not filepath.exists():
            print(f"⚠️  File not found: {filepath}")
            continue
        
        print(f"\n📄 Processing: {catalog['description']}")
        print(f"   File: {catalog['file']}")
        
        df = load_file(filepath, catalog["type"])
        if df is not None:
            records = process_dataframe(df, key)
            all_records.extend(records)
    
    # Save summary
    summary = {
        "total_records": len(all_records),
        "total_files_processed": len([k for k, v in CATALOG_FILES.items() if (INPUT_DIR / v['file']).exists()]),
        "files_found": [],
        "processed_date": datetime.now().isoformat(),
        "catalog_summary": {}
    }
    
    for key, catalog in CATALOG_FILES.items():
        filepath = INPUT_DIR / catalog["file"]
        if filepath.exists():
            summary["files_found"].append(key)
            summary["catalog_summary"][key] = {
                "file": catalog["file"],
                "description": catalog["description"]
            }
    
    # Save unified catalog
    with open(OUTPUT_DIR / "unified_catalog.json", 'w') as f:
        json.dump(all_records, f, indent=2, default=str)
    
    # Save summary
    with open(OUTPUT_DIR / "catalog_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    print("\n" + "=" * 60)
    print(f"✅ Processing Complete!")
    print(f"   Total Records: {len(all_records):,}")
    print(f"   Files Processed: {summary['total_files_processed']}")
    print(f"   Output: {OUTPUT_DIR}")
    print("\nFiles created:")
    print(f"  - {OUTPUT_DIR / 'unified_catalog.json'}")
    print(f"  - {OUTPUT_DIR / 'catalog_summary.json'}")
    
    # Create individual files for each source
    print("\nCreating individual catalogs...")
    for key in summary["files_found"]:
        records = [r for r in all_records if r.get('source') == key]
        if records:
            output_file = OUTPUT_DIR / f"{key}_catalog.json"
            with open(output_file, 'w') as f:
                json.dump(records, f, indent=2, default=str)
            print(f"  ✅ {output_file} ({len(records)} records)")
    
    print("\n🐐 GOAT Royalty Catalog Processing Complete!")

if __name__ == "__main__":
    main()