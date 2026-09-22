import os
import pyarrow.parquet as pq
import pyarrow as pa
import datetime

DATA_DIR = r"d:\LILA\player_data\player_data"
folders = ["February_10", "February_11", "February_12", "February_13", "February_14"]

for fld in folders:
    fld_path = os.path.join(DATA_DIR, fld)
    files = [f for f in os.listdir(fld_path) if not f.startswith(".")]
    sample = files[0]
    tbl = pq.read_table(os.path.join(fld_path, sample))
    ts_ints = tbl.column('ts').cast(pa.int64()).to_pylist()
    first_ts = ts_ints[0]
    last_ts = ts_ints[-1]
    dt_first = datetime.datetime.fromtimestamp(first_ts, tz=datetime.timezone.utc)
    dt_last = datetime.datetime.fromtimestamp(last_ts, tz=datetime.timezone.utc)
    duration_sec = last_ts - first_ts
    print(f"{fld}: {sample[:25]}... -> Start: {dt_first}, End: {dt_last}, Duration: {duration_sec}s ({duration_sec/60:.1f} min)")
