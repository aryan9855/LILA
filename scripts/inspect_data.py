import os
import glob
import json
import pyarrow.parquet as pq
import pandas as pd
import numpy as np

DATA_DIR = r"d:\LILA\player_data\player_data"

def inspect():
    folders = ["February_10", "February_11", "February_12", "February_13", "February_14"]
    minimap_dir = os.path.join(DATA_DIR, "minimaps")
    
    print("=== 1. MINIMAP FILES ===")
    if os.path.exists(minimap_dir):
        for f in os.listdir(minimap_dir):
            fp = os.path.join(minimap_dir, f)
            print(f"  {f} - {os.path.getsize(fp)} bytes")
    else:
        print("  Minimaps dir NOT found!")

    print("\n=== 2. FILE COUNTS ===")
    total_files = 0
    all_files = []
    for fld in folders:
        fld_path = os.path.join(DATA_DIR, fld)
        if os.path.exists(fld_path):
            files = [f for f in os.listdir(fld_path) if not f.startswith(".")]
            total_files += len(files)
            print(f"  {fld}: {len(files)} files")
            for f in files:
                all_files.append((fld, os.path.join(fld_path, f)))
        else:
            print(f"  {fld}: NOT FOUND")
    print(f"Total data files: {total_files}")

    print("\n=== 3. SCHEMA INSPECTION ===")
    sample_file = all_files[0][1]
    parquet_file = pq.ParquetFile(sample_file)
    schema = parquet_file.schema_arrow
    print(f"Sample file: {os.path.basename(sample_file)}")
    print("Schema:")
    for field in schema:
        print(f"  {field.name}: {field.type}")
        
    df_sample = pq.read_table(sample_file).to_pandas()
    print("\nSample Rows:")
    print(df_sample.head(3).to_string())

    print("\n=== 4. COMPREHENSIVE SCAN (ALL DAYS) ===")
    # Let's inspect across all files:
    # - event types
    # - unique maps
    # - coordinate bounds per map
    # - timestamp format / ranges
    # - human vs bot counts
    # - match counts
    
    event_counts = {}
    map_stats = {}
    unique_matches = set()
    unique_humans = set()
    unique_bots = set()
    total_rows = 0
    null_counts = {col: 0 for col in df_sample.columns}
    
    # Coordinate bounds per map: min_x, max_x, min_y, max_y, min_z, max_z
    for day, fpath in all_files:
        try:
            tbl = pq.read_table(fpath)
            df = tbl.to_pandas()
            total_rows += len(df)
            
            # Check nulls
            for col in df.columns:
                null_counts[col] += df[col].isnull().sum()
                
            # Decode event
            events = df['event'].apply(lambda x: x.decode('utf-8') if isinstance(x, bytes) else str(x))
            for ev, cnt in events.value_counts().items():
                event_counts[ev] = event_counts.get(ev, 0) + cnt
                
            # User & match
            for uid in df['user_id'].unique():
                # Check UUID vs numeric
                if len(str(uid)) > 10 and '-' in str(uid):
                    unique_humans.add(str(uid))
                else:
                    unique_bots.add(str(uid))
                    
            for mid in df['match_id'].unique():
                unique_matches.add(str(mid))
                
            # Map stats
            for m_id, grp in df.groupby('map_id'):
                if m_id not in map_stats:
                    map_stats[m_id] = {
                        'rows': 0,
                        'min_x': float('inf'), 'max_x': float('-inf'),
                        'min_y': float('inf'), 'max_y': float('-inf'),
                        'min_z': float('inf'), 'max_z': float('-inf'),
                        'min_ts': None, 'max_ts': None,
                        'files': 0,
                        'events': {}
                    }
                s = map_stats[m_id]
                s['rows'] += len(grp)
                s['files'] += 1
                s['min_x'] = min(s['min_x'], grp['x'].min())
                s['max_x'] = max(s['max_x'], grp['x'].max())
                s['min_y'] = min(s['min_y'], grp['y'].min())
                s['max_y'] = max(s['max_y'], grp['y'].max())
                s['min_z'] = min(s['min_z'], grp['z'].min())
                s['max_z'] = max(s['max_z'], grp['z'].max())
                
                # ts
                ts_min = grp['ts'].min()
                ts_max = grp['ts'].max()
                if s['min_ts'] is None or ts_min < s['min_ts']:
                    s['min_ts'] = ts_min
                if s['max_ts'] is None or ts_max > s['max_ts']:
                    s['max_ts'] = ts_max
                    
        except Exception as e:
            print(f"Error reading {fpath}: {e}")

    print(f"\nTotal rows across all files: {total_rows}")
    print(f"Unique Matches: {len(unique_matches)}")
    print(f"Unique Human Players: {len(unique_humans)}")
    print(f"Unique Bots: {len(unique_bots)}")
    
    print("\nNull Counts per column:")
    for col, n in null_counts.items():
        print(f"  {col}: {n}")
        
    print("\nEvent Frequencies:")
    for ev, count in sorted(event_counts.items(), key=lambda x: -x[1]):
        print(f"  {ev:16s}: {count:8d} ({count/total_rows*100:5.2f}%)")

    print("\nMap Statistics & Coordinate Bounds:")
    for m_id, s in map_stats.items():
        print(f"\n--- Map: {m_id} ---")
        print(f"  Files: {s['files']}, Total Rows: {s['rows']}")
        print(f"  X bounds: [{s['min_x']:.2f}, {s['max_x']:.2f}] (span: {s['max_x'] - s['min_x']:.2f})")
        print(f"  Y (elevation) bounds: [{s['min_y']:.2f}, {s['max_y']:.2f}] (span: {s['max_y'] - s['min_y']:.2f})")
        print(f"  Z bounds: [{s['min_z']:.2f}, {s['max_z']:.2f}] (span: {s['max_z'] - s['min_z']:.2f})")
        print(f"  TS min: {s['min_ts']}, TS max: {s['max_ts']}")

if __name__ == "__main__":
    inspect()
