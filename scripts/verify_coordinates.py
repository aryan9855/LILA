import os
import pyarrow.parquet as pq
import pandas as pd

DATA_DIR = r"d:\LILA\player_data\player_data"
CONFIG = {
    "AmbroseValley": {"scale": 900.0, "origin_x": -370.0, "origin_z": -473.0},
    "GrandRift": {"scale": 581.0, "origin_x": -290.0, "origin_z": -290.0},
    "Lockdown": {"scale": 1000.0, "origin_x": -500.0, "origin_z": -500.0}
}

folders = ["February_10", "February_11", "February_12", "February_13", "February_14"]

uv_stats = {m: {"min_u": 999, "max_u": -999, "min_v": 999, "max_v": -999, "oob_count": 0} for m in CONFIG}

for fld in folders:
    fld_path = os.path.join(DATA_DIR, fld)
    for f in os.listdir(fld_path):
        if f.startswith("."): continue
        tbl = pq.read_table(os.path.join(fld_path, f))
        df = tbl.to_pandas()
        for m_id, grp in df.groupby('map_id'):
            cfg = CONFIG[m_id]
            u = (grp['x'] - cfg['origin_x']) / cfg['scale']
            v = (grp['z'] - cfg['origin_z']) / cfg['scale']
            
            s = uv_stats[m_id]
            s['min_u'] = min(s['min_u'], u.min())
            s['max_u'] = max(s['max_u'], u.max())
            s['min_v'] = min(s['min_v'], v.min())
            s['max_v'] = max(s['max_v'], v.max())
            
            oob = ((u < 0) | (u > 1) | (v < 0) | (v > 1)).sum()
            s['oob_count'] += oob

print("=== UV COORDINATE BOUNDS & OUT-OF-BOUNDS CHECK ===")
for m_id, s in uv_stats.items():
    print(f"Map: {m_id}")
    print(f"  u range: [{s['min_u']:.4f}, {s['max_u']:.4f}] -> Pixel X: [{s['min_u']*1024:.1f}, {s['max_u']*1024:.1f}]")
    print(f"  v range: [{s['min_v']:.4f}, {s['max_v']:.4f}] -> Pixel Y: [{(1-s['max_v'])*1024:.1f}, {(1-s['min_v'])*1024:.1f}]")
    print(f"  Out of bounds points: {s['oob_count']}")
