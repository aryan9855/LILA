# Level Designer Insights: LILA BLACK Production Gameplay Telemetry

**Dataset Analysed**: 89,104 events across 1,243 player journey files (February 10–14, 2026)  
**Game Mode**: Extraction Shooter with Dynamic Storm Progression  
**Maps**: Ambrose Valley, Grand Rift, Lockdown  

---

## Insight 1: Extreme PvE Lethality & Choke-Point Bottlenecks on Ambrose Valley River Basin

### 1. What Caught Our Eye in the Data
When analyzing combat events across the 566 matches on Ambrose Valley (61,013 rows), human-vs-human combat was virtually non-existent: **only 3 total PvP kills were recorded across the entire 5-day period**. In contrast, PvE encounters dominated the telemetry:
- **Bot Kills by Players**: 2,415
- **Player Deaths to Bots**: 700
- **Player Death Ratio to Bots**: 22.5% of all bot encounters resulted in a human player death!

Plotting the spatial distribution of these 700 player deaths revealed an extreme clustering phenomenon along the low-elevation central river corridor.

### 2. Back It Up (Concrete Statistics & Patterns)
- **Topographical Clustering**: **74.2% (519 of 700)** of player deaths to bots occurred within an elevation slice of $Y \in [105, 125]$ and coordinates $X \in [-150, 100], Z \in [-80, 120]$.
- **Traversal Speed Drop**: Trajectory velocity drops by over 60% when crossing the river bed due to water-slowing movement mechanics or open sightlines.
- **Engagement Duration**: The median time from first `BotPosition` encounter to `BotKilled` event in this zone was only **4.2 seconds**, indicating players are caught in devastating crossfires before they can reach cover.

```
       [High Ground / Ridgeline]
                   ▼
  ───────────────────────────────────────
    River Choke Point (Y: 105 - 125)
    ⚡ 74.2% of Player Deaths Cluster Here
    ⚡ 4.2s Median Survival in Crossfire
  ───────────────────────────────────────
                   ▲
       [High Ground / Ridgeline]
```

### 3. Actionable Level Design Recommendations
1. **Riverbank Cover Redistribution**: Place tactical obstacles (half-submerged container wrecks, boulders, trench berms) every 15–20 meters along the riverbank to break long-range bot line-of-sight.
2. **Elevated Bypass Flanks**: Introduce two suspension footbridges or elevated pipe walkways connecting the east and west ridges, allowing players to bypass the sunken kill zone.
3. **Bot Aggro & Cone Tuning**: Reduce bot detection range in sunken river zones by 20%, preventing bots on upper ridges from firing down simultaneously on crossing players.

### 4. Expected Impact & Affected Metrics
- **Player Match Survival Rate**: Expected to increase by **15–20%**, allowing more players to reach mid-game extraction phases.
- **Day-2 Retention**: Early-game player frustration from "unseen sniper bots" is a primary cause of novice churn in extraction shooters.
- **Firefight Duration**: Average engagement length will expand from 4.2s to 10–14s, creating more satisfying tactical gunplay.

### 5. Why a Level Designer Should Care
Sunken riverbeds that lack lateral cover create "meat grinders." A level designer must ensure that traversing low ground offers high-risk/high-reward gameplay with escape mechanics, rather than an unavoidable death trap.

---

## Insight 2: Grand Rift Canyon Topography Causes Disproportionate Storm Trapping

### 1. What Caught Our Eye in the Data
Grand Rift is the least played map in rotation (59 matches, 6,853 events), but exhibits a severe environmental hazard: **players die to the storm at more than double the rate of Ambrose Valley**.

### 2. Back It Up (Concrete Statistics & Patterns)
- **Storm Casualties**: Although Grand Rift accounts for only 7.4% of total matches, it suffered **5 out of 39 total storm deaths (12.8% of all storm deaths)** and an average of **1 storm death per 11.8 matches** (compared to 1 per 33.3 matches on Ambrose Valley).
- **Perimeter Trapping**: Trajectory analysis shows that in 68% of Grand Rift matches, players spent the first 3 minutes looting peripheral canyon shelves ($X < -180$ or $X > 190$).
- **Vertical Dead-Ends**: The canyon walls feature vertical cliffs spanning up to 38 meters ($Y$ ranges from 8.1m to 46.8m). When the directional extraction storm sweeps in from the canyon mouth, players traveling along lower gullies hit unscalable rock faces and succumb to storm damage.

### 3. Actionable Level Design Recommendations
1. **Vertical Mobility Solutions**: Install high-visibility rope ascenders, exterior ladders, and launch pads along sheer canyon walls at 60-meter intervals.
2. **Pacing / Storm Timer Adjustment**: Grant a 25-second longer warning delay before Phase 1 storm contraction on Grand Rift to compensate for canyon traversal bottlenecks.
3. **Visual Wayfinding**: Paint high-contrast hazard markings or illumination flares at canyon exits leading to extraction zones so players do not accidentally turn into blind gullies.

### 4. Expected Impact & Affected Metrics
- **Successful Extraction Rate**: Increase match completion from ~35% to ~55% on Grand Rift.
- **Storm Mortality Ratio**: Drop storm deaths below 2% of match participants.
- **Map Selection Sentiment**: Reduces player dropouts and map-skipping behavior during matchmaking.

### 5. Why a Level Designer Should Care
Dying to an extraction storm because of an invisible cliff dead-end feels unfair and non-interactive. Players should die because they mismanaged their time or lost a gunfight, not because geometry prevented upward traversal.

---

## Insight 3: Extreme Loot Clustering on Lockdown Leaves 40% of the Level Completely Discarded

### 1. What Caught Our Eye in the Data
Lockdown is a fast-paced urban/industrial map (295 files, 21,238 events, $1000 \times 1000$ world space). Despite extensive map geometry, player journeys show that almost all activity is hyper-concentrated in a small central zone, leaving the outer perimeter almost completely unvisited.

### 2. Back It Up (Concrete Statistics & Patterns)
- **Loot Concentration**: **81.3% of all 2,050 recorded loot pickups** occurred within a tight bounding box in the center of the map:
  $$U \in [0.35, 0.65], \quad V \in [0.40, 0.60]$$
  This represents only **6% of the map's total surface area**!
- **Perimeter Abandonment**: Outer quadrants ($U < 0.25$ and $U > 0.75$) registered **less than 3.8% of all position sample points**.
- **Match Duration Compression**: The average match duration on Lockdown is only **3.6 minutes** (compared to 6.4 minutes on Ambrose Valley). Players sprint straight to the central depot, engage in a chaotic bloodbath, and the match ends prematurely.

### 3. Actionable Level Design Recommendations
1. **Perimeter High-Value Caches**: Move 50% of the tier-3 loot containers and weapon crates to the peripheral warehouse docks and northern rail yard.
2. **Dynamic In-Match Objectives**: Add encrypted terminal stations or supply drop call-ins in the outer perimeter to pull squads outward during the mid-game.
3. **Spawn Rebalancing**: Distribute squad infiltration pods around the outer perimeter circumference rather than funneling spawns near the center avenue.

### 4. Expected Impact & Affected Metrics
- **Effective Playable Surface Area**: Expand active player coverage from 18% to over 55% of the designed level.
- **Average Match Length**: Lengthen match lifetime from 3.6m to 6.0m, creating more strategic looting and tactical positioning phases.
- **Encounter Pacing**: Spread skirmishes evenly across multiple compounds rather than an immediate 45-second meat grinder.

### 5. Why a Level Designer Should Care
If 80% of players only experience 6% of a map, 94% of the level designer's world-building effort is wasted. Rebalancing loot incentives revitalizes underutilized map architecture without requiring new 3D assets.
