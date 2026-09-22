export interface MapConfig {
  id: string;
  name: string;
  scale: number;
  origin_x: number;
  origin_z: number;
  minimap_src: string;
  minimap_web: string;
  description: string;
}

export interface MatchSummary {
  match_id: string;
  day: string;
  map_id: string;
  start_ts: number;
  duration_sec: number;
  humans_count: number;
  bots_count: number;
  total_events: number;
  kills: number;
  deaths: number;
  loot: number;
  storm_deaths: number;
}

export interface ManifestData {
  maps: Record<string, MapConfig>;
  days: string[];
  total_matches: number;
  total_humans: number;
  total_bots: number;
  total_events: number;
  event_totals: Record<string, number>;
  matches: MatchSummary[];
}

// Player trajectory point: [t_rel, u, v, x, y, z]
export type PathPoint = [number, number, number, number, number, number];

export interface TelemetryEvent {
  t: number;
  event: 'Kill' | 'Killed' | 'BotKill' | 'BotKilled' | 'KilledByStorm' | 'Loot' | string;
  user_id: string;
  is_bot: boolean;
  u: number;
  v: number;
  x: number;
  y: number;
  z: number;
}

export interface PlayerData {
  user_id: string;
  is_bot: boolean;
  path: PathPoint[];
  events: TelemetryEvent[];
  total_points: number;
}

export interface MatchDetail {
  match_id: string;
  day: string;
  map_id: string;
  start_ts: number;
  duration_sec: number;
  players_count: number;
  humans_count: number;
  bots_count: number;
  total_events: number;
  stats: {
    kills: number;
    deaths: number;
    loot: number;
    storm_deaths: number;
  };
  players: PlayerData[];
  events: TelemetryEvent[];
}

export interface HeatmapData {
  map_id: string;
  traffic: [number, number][];
  kills: [number, number][];
  deaths: [number, number][];
  storm_deaths: [number, number][];
  loot: [number, number][];
  stats: {
    total_traffic_pts: number;
    total_kills: number;
    total_deaths: number;
    total_storm_deaths: number;
    total_loot: number;
  };
}

export type HeatmapType = 'none' | 'traffic' | 'kills' | 'deaths' | 'storm_deaths' | 'loot';

export interface FilterState {
  mapId: string;
  date: string; // 'all' or 'February_10', etc.
  matchId: string;
  showHumans: boolean;
  showBots: boolean;
  events: {
    kills: boolean;
    deaths: boolean;
    stormDeaths: boolean;
    loot: boolean;
  };
  selectedPlayerId: string | null;
  heatmapType: HeatmapType;
  heatmapOpacity: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number; // relative seconds
  speed: number; // 0.5, 1, 2, 5, 10
}
