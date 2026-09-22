import os
import pyarrow.parquet as pq
import pyarrow as pa
import pandas as pd
from collections import defaultdict

DATA_DIR = r"d:\LILA\player_data\player_data"
folders = ["February_10", "February_11", "February_12", "February_13", "February_14"]

matches = defaultdict(list)
for fld in folders:
    fpath = os.path.join(DATA_DIR, fld)
    for f in os.listdir(fpath):
        if f.startswith("."): continue
        parts = f.replace(".nakama-0", "").split("_")
        matches[parts[1]].append((fld, parts[0], os.path.join(fpath, f)))

print(f"Total unique match IDs: {len(matches)}")
multi_player_matches = {m: files for m, files in matches.items() if len(files) > 1}
print(f"Matches with >1 player/bot file: {len(multi_player_matches)}")

# Inspect the match with the most participants
sorted_matches = sorted(multi_player_matches.items(), key=lambda x: -len(x[1]))
top_match_id, top_files = sorted_matches[0]
print(f"\nTop match: {top_match_id} with {len(top_files)} files:")
for day, uid, path in top_files:
    is_bot = not ('-' in uid and len(uid) > 10)
    tbl = pq.read_table(path)
    df = tbl.to_pandas()
    print(f"  User: {uid:36s} | Bot: {str(is_bot):5s} | Rows: {len(df):4d} | Events: {df['event'].apply(lambda x: x.decode() if isinstance(x, bytes) else x).unique()}")

