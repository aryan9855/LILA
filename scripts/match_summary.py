import os
import pyarrow.parquet as pq
import pandas as pd

DATA_DIR = r"d:\LILA\player_data\player_data"
folders = ["February_10", "February_11", "February_12", "February_13", "February_14"]

matches_summary = {}

for fld in folders:
    fld_path = os.path.join(DATA_DIR, fld)
    for f in os.listdir(fld_path):
        if f.startswith("."): continue
        # filename: {user_id}_{match_id}.nakama-0
        parts = f.replace(".nakama-0", "").split("_")
        uid = parts[0]
        mid = parts[1]
        
        tbl = pq.read_table(os.path.join(fld_path, f))
        df = tbl.to_pandas()
        
        map_id = df['map_id'].iloc[0]
        min_ts = df['ts'].min()
        max_ts = df['ts'].max()
        ev_count = len(df)
        is_bot = not ('-' in uid and len(uid) > 10)
        
        if mid not in matches_summary:
            matches_summary[mid] = {
                'match_id': mid,
                'day': fld,
                'map_id': map_id,
                'players': set(),
                'bots': set(),
                'min_ts': min_ts,
                'max_ts': max_ts,
                'event_count': 0
            }
        m = matches_summary[mid]
        if is_bot:
            m['bots'].add(uid)
        else:
            m['players'].add(uid)
        m['event_count'] += ev_count
        if min_ts < m['min_ts']: m['min_ts'] = min_ts
        if max_ts > m['max_ts']: m['max_ts'] = max_ts

matches_list = list(matches_summary.values())
df_matches = pd.DataFrame([{
    'match_id': m['match_id'],
    'day': m['day'],
    'map_id': m['map_id'],
    'num_humans': len(m['players']),
    'num_bots': len(m['bots']),
    'total_players': len(m['players']) + len(m['bots']),
    'duration_sec': (m['max_ts'] - m['min_ts']).total_seconds(),
    'event_count': m['event_count']
} for m in matches_list])

print("=== MATCH STATISTICS SUMMARY ===")
print(f"Total Matches: {len(df_matches)}")
print("\nMatches per Map:")
print(df_matches['map_id'].value_counts())
print("\nMatches per Day:")
print(df_matches['day'].value_counts())
print("\nPlayers per Match Distribution:")
print(df_matches[['num_humans', 'num_bots', 'total_players', 'duration_sec']].describe())
print("\nTop 5 matches with most humans:")
print(df_matches.sort_values(by='num_humans', ascending=False)[['match_id', 'map_id', 'day', 'num_humans', 'num_bots', 'duration_sec', 'event_count']].head(5))
