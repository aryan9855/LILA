# Architecture & System Design

**Project**: LILA BLACK — Player Journey & Combat Telemetry Visualization Tool  
**Role**: Product Engineer & Level Designer Analytics  
**Target Audience**: Level Designers & Game Systems Engineers  

---

## 1. System Architecture & Tech Stack

```
[Raw Parquet Data] (1,243 files, 89,104 rows)
       │
       ▼
[Python Preprocessing Pipeline] (preprocess_data.py)
  ├── Decode byte events (b'Position', b'Loot', etc.)
  ├── Interpret `ts` as Unix epoch seconds & compute Δt
  ├── Transform (x, z) ──> UV space [0, 1]
  ├── Subsample traffic points & aggregate heatmaps
  └── Optimize minimap assets (4320x4320 ──> 1024x1024 WebP)
       │
       ▼
[Client-Ready Static Assets] (/public/data & /public/minimaps)
  ├── manifest.json (index, metadata, filter catalogs)
  ├── matches/{match_id}.json (on-demand match journeys)
  ├── heatmaps/{map_id}.json (pre-calculated density grids)
  └── minimaps/*.webp (lightweight map textures)
       │
       ▼
[Browser Application] (React 18 + Vite + TypeScript + Tailwind CSS)
  ├── Rendering Engine: High-DPI HTML5 Canvas (Pan, Zoom, Trajectories, Glow)
  ├── Playback Engine: requestAnimationFrame 60 FPS scrubber & multiplier
  └── UI / Control Panel: Filters, Map switcher, Insights modal
```

### Why This Stack?
- **Python + PyArrow / Pandas (Offline Preprocessing)**: Parquet is an analytical columnar format designed for fast batch aggregation. Parsing 1,243 Parquet files directly inside the client browser on page load would freeze the UI thread and consume hundreds of megabytes of memory. Preprocessing partitions the data cleanly into lightweight, on-demand JSON files.
- **React 18 + Vite + TypeScript (Frontend)**: Delivers sub-second hot reloading, strict type safety for game telemetry schemas, and modular component architecture.
- **HTML5 2D Canvas (Rendering Engine)**: SVG DOM elements choke when rendering tens of thousands of polyline points, animated player nodes, and radial gradient heatmaps simultaneously. Canvas handles high-density trajectories and 60 FPS timeline playback effortlessly.
- **Tailwind CSS**: Allows rapid creation of a custom, dark-themed "tactical HUD" aesthetic tailored for game designers.
- **Static Hosting (Vercel)**: Zero cloud server costs, zero cold starts, global CDN edge caching for match JSONs and minimap WebP assets.

---

## 2. World-to-Minimap Coordinate Mapping

Mapping 3D in-game coordinates onto 2D top-down minimaps is the core mathematical foundation of the application:

### Step 1: Normalization to UV Space $[0, 1]$
World coordinates $(x, z)$ are normalized using map-specific scale and origin coordinates:
$$u = \frac{x - \text{origin}_x}{\text{scale}}, \quad v = \frac{z - \text{origin}_z}{\text{scale}}$$

| Map ID | Config Scale | Config Origin $(X, Z)$ | Actual World $X$ Range | Actual World $Z$ Range | UV Projection Bounds |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **AmbroseValley** | 900.0 | $(-370.0, -473.0)$ | $[-324.97, 301.79]$ | $[-380.01, 360.76]$ | $u \in [0.050, 0.746], v \in [0.103, 0.926]$ |
| **GrandRift** | 581.0 | $(-290.0, -290.0)$ | $[-225.90, 256.62]$ | $[-194.00, 170.11]$ | $u \in [0.110, 0.941], v \in [0.165, 0.792]$ |
| **Lockdown** | 1000.0 | $(-500.0, -500.0)$ | $[-406.63, 348.36]$ | $[-285.10, 329.24]$ | $u \in [0.093, 0.848], v \in [0.215, 0.829]$ |

*Verification Result: Across all 89,104 recorded points, exactly 0 out-of-bounds errors occurred ($0 \le u \le 1$ and $0 \le v \le 1$).*

### Step 2: Screen / Canvas Projection
The Canvas vertical axis starts at top-left $(0, 0)$ and increases downwards, whereas in-game world $Z$ points northwards (upwards). Hence, the vertical axis is inverted:
$$\text{canvas}_x = u \times \text{mapSize} + \text{offsetX}$$
$$\text{canvas}_y = (1 - v) \times \text{mapSize} + \text{offsetY}$$

### Step 3: Elevation ($y$)
In the provided data, $y$ represents elevation/height above ground (e.g., $100\text{m} - 162\text{m}$ on Ambrose Valley). While disregarded for flat 2D minimap projection, $y$ is preserved in tooltips and used for topographical choke-point analysis.

---

## 3. Assumptions & Edge Case Handling

1. **Timestamp Unit Anomaly**:
   - *Ambiguity*: Parquet metadata lists `ts` as `timestamp[ms]`. However, treating `1770754537` as milliseconds resulted in dates in `1970-01-21` and fractional match durations ($< 0.4$ seconds).
   - *Resolution*: Interpreting `1770754537` as Unix epoch seconds gives `2026-02-10 20:15:37 UTC`, matching folder names and realistic match durations of 3–12 minutes. The pipeline converts `ts` to epoch seconds and normalizes playback relative to match start ($t_{\text{rel}} = ts - ts_0$).
2. **Bot vs. Human Identification**:
   - Filenames and schemas use UUID strings for human players (e.g., `f4e072fa-...`) and numeric string IDs for AI bots (e.g., `1440`). Detection is validated via string length $> 10$ and UUID hyphen presence.
3. **Asset Optimization**:
   - The original minimaps in `minimaps/` range up to $9000 \times 9000$ pixels (11.8 MB). Serving these directly caused high client memory usage. The pipeline generated $1024 \times 1024$ WebP assets (~75 KB each), ensuring 60 FPS pan/zoom and instantaneous page loads.

---

## 4. Technical Tradeoffs Matrix

| Option Considered | Decision Taken | Rationale & Tradeoffs |
| :--- | :--- | :--- |
| **In-Browser Parquet Parsing** (DuckDB-Wasm / Parquet-Wasm) | **Preprocessed JSON + Static Index** | In-browser Parquet loading requires downloading 1,243 files (~8.5 MB) and running heavy WebAssembly on client devices. Preprocessing provides instant initial load (<300ms) with lightweight on-demand match fetching. |
| **Dynamic Server Backend** (Node.js / FastAPI + PostgreSQL) | **Client-Side Static SPA on Edge CDN** | The 5-day dataset is static production data. A dynamic backend adds deployment complexity, latency, and hosting costs. Static JSON delivery on Vercel is free, globally cached, and failsafe. |
| **DOM / SVG Map Rendering** | **High-DPI HTML5 2D Canvas** | DOM/SVG elements produce high memory overhead when animating hundreds of path segments and pulsing markers. Canvas offers hardware-accelerated 60 FPS rendering and smooth pan/zoom matrix math. |
| **Client-Side Heatmap Gridding** | **Pre-Aggregated Density Points** | Pre-calculating density points during preprocessing avoids recalculating 89k points on every filter toggle, keeping map interactions lag-free. |
