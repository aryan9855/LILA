<h1 align="center">
  🎮 LILA BLACK — Player Journey Visualization Tool
</h1>

<p align="center">
  A production-grade telemetry visualization and level design analytics dashboard for <strong>LILA BLACK</strong>, an extraction shooter.
  <br/>
  Built for Level Designers to analyze player navigation, combat hot-spots, and spatial patterns across 5 days of live gameplay.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
</p>

<p align="center">
  <a href="ARCHITECTURE.md"><strong>📐 Architecture</strong></a> ·
  <a href="INSIGHTS.md"><strong>📊 Game Insights</strong></a> ·
  <a href="#-getting-started"><strong>🚀 Setup Guide</strong></a>
</p>

---

## 🌐 Live Demo

> **🚀 Deployed URL:** [lila-pi.vercel.app](https://lila-pi.vercel.app/)

---

## ✨ Features at a Glance

### 🗺️ Multi-Map Interactive Visualization
- High-DPI **HTML5 Canvas** renderer for all 3 maps — **Ambrose Valley**, **Grand Rift**, **Lockdown**
- Smooth **Pan** (click & drag) and **Zoom** (scroll wheel + buttons) with Reset View
- Correct **world-to-UV coordinate projection** validated across 89,104 data points

### 👥 Player Journey Tracking
- **Solid colored paths** for human players · **Dashed diamond paths** for AI bots
- Click any player in the roster to **focus their journey** and dim all others
- Synchronized multi-player timelines — up to 16 participants per match

### 🎯 Event Markers
| Marker | Event Type | Color |
|:---|:---|:---|
| ⊕ Crosshair ring | Kill / Bot Kill | 🔴 Red |
| ● Dot | Player Death | 🌸 Rose |
| ◆ Diamond | Loot Pickup | 🩵 Cyan |
| ○ Vortex ring | Storm Elimination | 🟣 Purple |

Hover over any marker for a **tooltip** showing: event type, player ID, world coordinates, and timestamp.

### 🔥 Heatmap Overlays (5 Types)
| Heatmap | Color | Shows |
|:---|:---|:---|
| Kill Zones | 🔴 Red | Lethal firefight clustering |
| Death Zones | 🌸 Rose | Casualty hot-spots |
| Player Traffic | 🔵 Blue | Movement corridors & choke-points |
| Storm Deaths | 🟣 Purple | Environmental kill zones |
| Loot Distribution | 🩵 Cyan | Item concentration areas |

Adjustable **Opacity Slider** (10%–100%) for layer blending.

### ⏱️ Timeline Playback Engine
- **60 FPS** `requestAnimationFrame` loop
- Play / Pause / Reset controls
- Scrub bar with **color-coded event ticks** (click a tick to jump to that moment)
- Speed multipliers: `0.5×` `1×` `2×` `5×` `10×`

### 🔍 Filters & Match Browser
- Filter by **Map** / **Date** (Feb 10–14, 2026) / **Match ID**
- Search matches by ID string
- Toggle **Human Players** and **AI Bots** independently
- Toggle event types individually (Kills, Deaths, Storm, Loot)

### 📊 Level Design Insights Modal
- 3 real, data-backed insights derived from 89,104 gameplay events
- Each includes: statistics, actionable recommendations, and affected KPIs
- **"View on Map"** button instantly applies the corresponding heatmap

### 🖥️ Live HUD
- Real-time **World (X, Z)** and **UV (u, v)** coordinates under cursor
- Current **zoom level** display
- Active match quick-stats: humans, bots, kills, deaths, storm deaths, duration

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|:---|:---|:---|
| **Data Pipeline** | Python 3.11, Pandas, PyArrow, Pillow | Columnar Parquet parsing, coordinate math, WebP compression |
| **Frontend** | React 18, Vite 6, TypeScript 5 | Sub-second HMR, strict type safety, modular components |
| **Rendering** | High-DPI HTML5 2D Canvas | 60 FPS trajectories, radial gradient heatmaps, zero DOM overhead |
| **Styling** | Tailwind CSS 3, Lucide Icons | Tactical dark-HUD aesthetic for game designers |
| **Deployment** | Vercel Edge CDN | Static SPA, zero cold-starts, instant global CDN delivery |

---

## 📁 Project Structure

```
LILA/
├── ARCHITECTURE.md              # System design, coordinate math & tradeoffs
├── INSIGHTS.md                  # 3 data-backed level design insights
├── README.md                    # This file
│
├── scripts/
│   ├── preprocess_data.py       # Full ETL: Parquet → JSON + WebP assets
│   ├── inspect_data.py          # Schema & distribution inspection
│   ├── verify_coordinates.py    # UV projection bounds validation
│   └── verify_timestamps.py     # Epoch timestamp verification
│
├── public/
│   ├── minimaps/                # 3x optimized 1024x1024 WebP map textures
│   └── data/
│       ├── manifest.json        # Index of 796 matches + map configs (~280 KB)
│       ├── matches/             # 796 on-demand match telemetry JSONs (~7.7 MB)
│       └── heatmaps/            # Pre-aggregated density grids per map
│
└── src/
    ├── App.tsx                  # Root state coordinator & data fetching
    ├── components/
    │   ├── Header.tsx           # Map switcher, match stats, insights button
    │   ├── Sidebar.tsx          # Filters, match browser, heatmap controls
    │   ├── MapCanvas.tsx        # High-DPI canvas renderer (core component)
    │   ├── TimelineControls.tsx # Scrubber, play/pause, speed controls
    │   └── InsightsModal.tsx    # Level design analytics modal
    ├── types/
    │   └── telemetry.ts         # TypeScript interfaces for all data shapes
    └── utils/
        └── coordinates.ts       # World → UV → Canvas math + player color palette
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** 3.10+ (only needed to re-run preprocessing)

```bash
pip install pyarrow pandas Pillow
```

### 1. Clone the Repository

```bash
git clone https://github.com/aryan9855/LILA.git
cd LILA
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app loads instantly since processed data is pre-committed.

### 4. Production Build

```bash
npm run build
npm run preview
```

---

## ⚙️ Data Preprocessing _(Optional)_

Processed data is already committed under `public/data/`. To regenerate from raw Parquet files (requires the `player_data/` directory with 1,243 Parquet files):

```bash
# 1. Inspect schema and event distribution
python scripts/inspect_data.py

# 2. Validate coordinate projection math
python scripts/verify_coordinates.py

# 3. Run full ETL pipeline (Parquet -> JSON + WebP)
python scripts/preprocess_data.py
```

The pipeline processes **89,104 events** across **1,243 files** and outputs:
- `public/data/manifest.json` — complete match index
- `public/data/matches/*.json` — per-match telemetry
- `public/data/heatmaps/*.json` — spatial density grids
- `public/minimaps/*.webp` — optimized 1024x1024 map textures

---

## 🌐 Deploy to Vercel

1. Push to GitHub _(already done at [aryan9855/LILA](https://github.com/aryan9855/LILA))_
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import `aryan9855/LILA`
3. Configure:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy** — live in ~60 seconds ✅

---

## 🗺️ Coordinate System

World coordinates `(x, z)` from game-space are projected to UV `[0, 1]` using per-map calibration:

```
u = (x − origin_x) / scale
v = (z − origin_z) / scale

canvas_x = u × mapSize
canvas_y = (1 − v) × mapSize    ← y-axis inverted (canvas top-left origin)
```

| Map | Scale | Origin (X, Z) | Verified UV Range |
|:---|:---:|:---:|:---|
| Ambrose Valley | 900 | (−370, −473) | u: [0.05, 0.75], v: [0.10, 0.93] |
| Grand Rift | 581 | (−290, −290) | u: [0.11, 0.94], v: [0.17, 0.79] |
| Lockdown | 1000 | (−500, −500) | u: [0.09, 0.85], v: [0.22, 0.83] |

**Result**: 0 out-of-bounds across all 89,104 recorded events ✅

---

## 🎮 How to Use

1. **Select a Map** — click any tab in the header (Ambrose Valley / Grand Rift / Lockdown)
2. **Pick a Match** — filter by date, search by Match ID, click a match card to load
3. **Play the Match** — hit ▶ Play to watch trajectories unfold, or scrub the timeline manually
4. **Focus a Player** — click any player in the roster list to dim all others
5. **Toggle Events** — enable/disable kills, deaths, storm deaths, loot from the sidebar
6. **Enable a Heatmap** — select a layer type and use the opacity slider to blend it
7. **Read Insights** — click **Game Insights** in the header for 3 level design findings with data

---

## 🔍 Key Technical Findings

| Finding | Detail |
|:---|:---|
| **Timestamp anomaly** | Schema labels `ts` as `timestamp[ms]` — raw values are actually Unix epoch **seconds** |
| **Asset compression** | 9000×9000 PNG (11.8 MB) → 1024×1024 WebP (~75 KB) — **98% size reduction** |
| **Zero projection errors** | 100% of 89,104 points map within UV bounds `[0, 1]` |
| **PvP scarcity** | Only 3 PvP kills over 5 days — dataset is almost entirely PvE |

---

## ⚠️ Known Limitations

1. **Static dataset** — fixed 5-day snapshot (Feb 10–14, 2026); no live data streaming
2. **2D projection only** — elevation (`y`) shown in tooltips but not rendered as isometric view
3. **No PvP kill-chain graphs** — only 3 PvP kills in dataset, too sparse for kill-chain analysis
4. **Timestamp assumption** — `ts` epoch-second interpretation should be re-validated for future data batches

---

## 📝 Submission Checklist

- [x] Source code — React + Vite + TypeScript + Python ETL
- [x] `README.md` — comprehensive setup, usage & documentation
- [x] `ARCHITECTURE.md` — 1-page system design & technical tradeoffs
- [x] `INSIGHTS.md` — 3 evidence-based level design insights with real statistics
- [x] Player paths on correct minimaps with coordinate validation
- [x] Human vs Bot visual distinction
- [x] Kill / Death / Loot / Storm Death event markers with tooltips
- [x] Map, Date, Match, Player-type, Event-type filters
- [x] 60 FPS timeline playback with scrub and speed control
- [x] 5 heatmap layers with opacity control
- [x] Working deployment _(URL to be added post-Vercel deploy)_

---

<p align="center">
  Built for the <strong>LILA Games — Product Engineer Written Test</strong>
  <br/>
  Dataset: February 10–14, 2026 · 89,104 events · 796 matches · 3 maps
</p>