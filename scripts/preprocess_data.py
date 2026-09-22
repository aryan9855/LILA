import os
import json
import pyarrow.parquet as pq
import pyarrow as pa
import pandas as pd
from PIL import Image

DATA_DIR = r"d:\LILA\player_data\player_data"
OUT_DIR = r"d:\LILA\public"
DATA_OUT_DIR = os.path.join(OUT_DIR, "data")
MATCHES_OUT_DIR = os.path.join(DATA_OUT_DIR, "matches")
HEATMAPS_OUT_DIR = os.path.join(DATA_OUT_DIR, "heatmaps")
MINIMAPS_OUT_DIR = os.path.join(OUT_DIR, "minimaps")

MAP_CONFIGS = {
    "AmbroseValley": {
        "id": "AmbroseValley",
        "name": "Ambrose Valley",
        "scale": 900.0,
        "origin_x": -370.0,
        "origin_z": -473.0,
        "minimap_src": "AmbroseValley_Minimap.png",
        "minimap_web": "/minimaps/AmbroseValley_Minimap.webp",
        "description": "Primary battle arena featuring sprawling open terrain, river valleys, and tactical compounds."
    },
    "GrandRift": {
        "id": "GrandRift",
        "name": "Grand Rift",
        "scale": 581.0,
        "origin_x": -290.0,
        "origin_z": -290.0,
        "minimap_src": "GrandRift_Minimap.png",
        "minimap_web": "/minimaps/GrandRift_Minimap.webp",
        "description": "Challenging canyon terrain with steep elevation changes and high-risk extraction corridors."
    },
    "Lockdown": {
        "id": "Lockdown",
        "name": "Lockdown",
        "scale": 1000.0,
        "origin_x": -500.0,
        "origin_z": -500.0,
        "minimap_src": "Lockdown_Minimap.jpg",
        "minimap_web": "/minimaps/Lockdown_Minimap.webp",
        "description": "Dense, claustrophobic industrial complex designed for fast-paced close-quarters combat."
    }
}

FOLDERS = ["February_10", "February_11", "February_12", "February_13", "February_14"]

def ensure_dirs():
    os.makedirs(MATCHES_OUT_DIR, exist_ok=True)
    os.makedirs(HEATMAPS_OUT_DIR, exist_ok=True)
    os.makedirs(MINIMAPS_OUT_DIR, exist_ok=True)

def optimize_minimaps():
    print("--- 1. Optimizing Minimap Images to 1024x1024 WebP ---")
    src_dir = os.path.join(DATA_DIR, "minimaps")
    for map_id, cfg in MAP_CONFIGS.items():
        src_path = os.path.join(src_dir, cfg["minimap_src"])
        dst_path = os.path.join(MINIMAPS_OUT_DIR, f"{map_id}_Minimap.webp")
        if not os.path.exists(src_path):
            print(f"Warning: {src_path} not found!")
            continue
        
        im = Image.open(src_path)
        if im.mode != "RGB":
            im = im.convert("RGB")
        im_resized = im.resize((1024, 1024), Image.Resampling.LANCZOS)
        im_resized.save(dst_path, "WEBP", quality=85)
        print(f"Saved: {dst_path} ({os.path.getsize(dst_path)} bytes, from {os.path.getsize(src_path)} bytes)")

def process_all_data():
    ensure_dirs()
    optimize_minimaps()

    print("\n--- 2. Scanning all 1,243 Parquet files ---")
    raw_files = []
    for fld in FOLDERS:
        fld_path = os.path.join(DATA_DIR, fld)
        if not os.path.exists(fld_path): continue
        for fname in os.listdir(fld_path):
            if fname.startswith("."): continue
            raw_files.append((fld, fname, os.path.join(fld_path, fname)))

    print(f"Found {len(raw_files)} files. Grouping by match_id...")

    # Group files by match_id
    matches_dict = {}
    for day, fname, fpath in raw_files:
        # filename convention: {user_id}_{match_id}.nakama-0
        clean_name = fname.replace(".nakama-0", "")
        parts = clean_name.split("_")
        user_id = parts[0]
        match_id = parts[1]
        
        if match_id not in matches_dict:
            matches_dict[match_id] = {
                "match_id": match_id,
                "day": day,
                "files": []
            }
        matches_dict[match_id]["files"].append((user_id, fpath))

    print(f"Total Unique Matches to Process: {len(matches_dict)}")

    # Data structures for aggregation
    manifest_matches = []
    map_heatmaps = {
        m: {
            "traffic": [],
            "kills": [],
            "deaths": [],
            "storm_deaths": [],
            "loot": []
        } for m in MAP_CONFIGS
    }
    
    global_stats = {
        "total_matches": len(matches_dict),
        "total_files": len(raw_files),
        "total_events": 0,
        "unique_humans": set(),
        "unique_bots": set(),
        "event_totals": {}
    }

    match_count = 0
    for match_id, m_info in matches_dict.items():
        match_count += 1
        if match_count % 100 == 0 or match_count == len(matches_dict):
            print(f"  Processed {match_count}/{len(matches_dict)} matches...")

        match_records = []
        map_id = None
        min_ts = None
        max_ts = None

        for user_id, fpath in m_info["files"]:
            tbl = pq.read_table(fpath)
            # Cast ts to int64 (Unix epoch seconds)
            df = tbl.to_pandas()
            df['raw_ts'] = tbl.column('ts').cast(pa.int64()).to_pylist()
            df['event_str'] = df['event'].apply(lambda x: x.decode('utf-8') if isinstance(x, bytes) else str(x))
            
            is_bot = not ('-' in user_id and len(user_id) > 10)
            if is_bot:
                global_stats["unique_bots"].add(user_id)
            else:
                global_stats["unique_humans"].add(user_id)

            if map_id is None:
                map_id = df['map_id'].iloc[0]

            f_min_ts = df['raw_ts'].min()
            f_max_ts = df['raw_ts'].max()
            if min_ts is None or f_min_ts < min_ts: min_ts = f_min_ts
            if max_ts is None or f_max_ts > max_ts: max_ts = f_max_ts

            match_records.append({
                "user_id": user_id,
                "is_bot": is_bot,
                "df": df
            })

        if map_id not in MAP_CONFIGS:
            continue

        cfg = MAP_CONFIGS[map_id]
        scale = cfg["scale"]
        origin_x = cfg["origin_x"]
        origin_z = cfg["origin_z"]
        duration_sec = int(max_ts - min_ts) if (max_ts and min_ts) else 0

        # Construct player paths and match event stream
        players_data = []
        all_match_events = []
        match_kill_count = 0
        match_death_count = 0
        match_loot_count = 0
        match_storm_count = 0

        for prec in match_records:
            user_id = prec["user_id"]
            is_bot = prec["is_bot"]
            df = prec["df"]

            player_path = []
            player_events = []

            for _, row in df.iterrows():
                ev = row['event_str']
                t_rel = round(float(row['raw_ts'] - min_ts), 2)
                x = round(float(row['x']), 2)
                y = round(float(row['y']), 2) # elevation
                z = round(float(row['z']), 2)
                u = round(float((x - origin_x) / scale), 4)
                v = round(float((z - origin_z) / scale), 4)

                global_stats["total_events"] += 1
                global_stats["event_totals"][ev] = global_stats["event_totals"].get(ev, 0) + 1

                # Feed heatmaps (sampled traffic to avoid millions of points)
                if ev in ['Position', 'BotPosition']:
                    player_path.append([t_rel, u, v, x, y, z])
                    map_heatmaps[map_id]["traffic"].append([u, v])
                else:
                    event_entry = {
                        "t": t_rel,
                        "event": ev,
                        "user_id": user_id,
                        "is_bot": is_bot,
                        "u": u,
                        "v": v,
                        "x": x,
                        "y": y,
                        "z": z
                    }
                    player_events.append(event_entry)
                    all_match_events.append(event_entry)

                    if ev in ['Kill', 'BotKill']:
                        match_kill_count += 1
                        map_heatmaps[map_id]["kills"].append([u, v])
                    elif ev in ['Killed', 'BotKilled']:
                        match_death_count += 1
                        map_heatmaps[map_id]["deaths"].append([u, v])
                    elif ev == 'KilledByStorm':
                        match_storm_count += 1
                        map_heatmaps[map_id]["storm_deaths"].append([u, v])
                    elif ev == 'Loot':
                        match_loot_count += 1
                        map_heatmaps[map_id]["loot"].append([u, v])

            # Path compression: sort by t_rel
            player_path.sort(key=lambda p: p[0])

            players_data.append({
                "user_id": user_id,
                "is_bot": is_bot,
                "path": player_path, # [t_rel, u, v, x, y, z]
                "events": player_events,
                "total_points": len(player_path)
            })

        # Sort all events chronologically
        all_match_events.sort(key=lambda e: e["t"])

        # Write match JSON
        match_json = {
            "match_id": match_id,
            "day": m_info["day"],
            "map_id": map_id,
            "start_ts": int(min_ts) if min_ts else 0,
            "duration_sec": duration_sec,
            "players_count": len(players_data),
            "humans_count": sum(1 for p in players_data if not p["is_bot"]),
            "bots_count": sum(1 for p in players_data if p["is_bot"]),
            "total_events": sum(len(p["path"]) + len(p["events"]) for p in players_data),
            "stats": {
                "kills": match_kill_count,
                "deaths": match_death_count,
                "loot": match_loot_count,
                "storm_deaths": match_storm_count
            },
            "players": players_data,
            "events": all_match_events
        }

        match_file_path = os.path.join(MATCHES_OUT_DIR, f"{match_id}.json")
        with open(match_file_path, "w", encoding="utf-8") as mf:
            json.dump(match_json, mf, separators=(',', ':'))

        # Add to manifest
        manifest_matches.append({
            "match_id": match_id,
            "day": m_info["day"],
            "map_id": map_id,
            "start_ts": int(min_ts) if min_ts else 0,
            "duration_sec": duration_sec,
            "humans_count": match_json["humans_count"],
            "bots_count": match_json["bots_count"],
            "total_events": match_json["total_events"],
            "kills": match_kill_count,
            "deaths": match_death_count,
            "loot": match_loot_count,
            "storm_deaths": match_storm_count
        })

    # Sort manifest matches: prioritize matches with most humans and longest durations
    manifest_matches.sort(key=lambda m: (-m["humans_count"], -m["duration_sec"]))

    # Save Heatmaps
    print("\n--- 3. Writing Pre-aggregated Heatmaps ---")
    for m_id, hdata in map_heatmaps.items():
        # Subsample traffic points if too large (keep up to 15,000 representative points per map for quick client rendering)
        traffic_pts = hdata["traffic"]
        if len(traffic_pts) > 15000:
            step = len(traffic_pts) // 15000
            traffic_pts = traffic_pts[::step]
            
        heatmap_payload = {
            "map_id": m_id,
            "traffic": traffic_pts,
            "kills": hdata["kills"],
            "deaths": hdata["deaths"],
            "storm_deaths": hdata["storm_deaths"],
            "loot": hdata["loot"],
            "stats": {
                "total_traffic_pts": len(hdata["traffic"]),
                "total_kills": len(hdata["kills"]),
                "total_deaths": len(hdata["deaths"]),
                "total_storm_deaths": len(hdata["storm_deaths"]),
                "total_loot": len(hdata["loot"])
            }
        }
        h_file = os.path.join(HEATMAPS_OUT_DIR, f"{m_id}.json")
        with open(h_file, "w", encoding="utf-8") as hf:
            json.dump(heatmap_payload, hf, separators=(',', ':'))
        print(f"  {m_id} Heatmap saved: {len(hdata['kills'])} kills, {len(hdata['deaths'])} deaths, {len(hdata['storm_deaths'])} storm deaths, {len(hdata['loot'])} loot")

    # Save Manifest
    print("\n--- 4. Writing Manifest Index ---")
    manifest_payload = {
        "maps": MAP_CONFIGS,
        "days": FOLDERS,
        "total_matches": len(manifest_matches),
        "total_humans": len(global_stats["unique_humans"]),
        "total_bots": len(global_stats["unique_bots"]),
        "total_events": global_stats["total_events"],
        "event_totals": global_stats["event_totals"],
        "matches": manifest_matches
    }
    manifest_file = os.path.join(DATA_OUT_DIR, "manifest.json")
    with open(manifest_file, "w", encoding="utf-8") as mf:
        json.dump(manifest_payload, mf, indent=2)
    print(f"Manifest written to: {manifest_file} ({os.path.getsize(manifest_file)} bytes)")
    print("Preprocessing completed successfully!")

if __name__ == "__main__":
    process_all_data()
