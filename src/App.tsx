import { useState, useEffect, useRef } from 'react';
import {
  ManifestData,
  MatchDetail,
  HeatmapData,
  FilterState,
  PlaybackState,
  HeatmapType
} from './types/telemetry';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapCanvas } from './components/MapCanvas';
import { TimelineControls } from './components/TimelineControls';
import { InsightsModal } from './components/InsightsModal';
import { Loader2 } from 'lucide-react';

export function App() {
  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [currentMatchDetail, setCurrentMatchDetail] = useState<MatchDetail | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  // Loading states
  const [isLoadingManifest, setIsLoadingManifest] = useState(true);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  // Main Filter State
  const [filters, setFilters] = useState<FilterState>({
    mapId: 'AmbroseValley',
    date: 'all',
    matchId: '',
    showHumans: true,
    showBots: true,
    events: {
      kills: true,
      deaths: true,
      stormDeaths: true,
      loot: true
    },
    selectedPlayerId: null,
    heatmapType: 'none',
    heatmapOpacity: 0.65
  });

  // Playback State
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    speed: 1
  });

  const lastFrameTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // 1. Fetch Manifest on Mount
  useEffect(() => {
    async function loadManifest() {
      try {
        const res = await fetch('/data/manifest.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ManifestData = await res.json();
        setManifest(data);

        // Pick default match for AmbroseValley
        const defaultMatch = data.matches.find((m) => m.map_id === 'AmbroseValley');
        if (defaultMatch) {
          setFilters((prev) => ({
            ...prev,
            matchId: defaultMatch.match_id
          }));
        }
      } catch (err) {
        console.error('Failed to load manifest.json:', err);
      } finally {
        setIsLoadingManifest(false);
      }
    }
    loadManifest();
  }, []);

  // 2. Fetch Match Detail when matchId changes
  useEffect(() => {
    if (!filters.matchId) return;

    let isCancelled = false;
    async function loadMatch(mId: string) {
      setIsLoadingMatch(true);
      try {
        const res = await fetch(`/data/matches/${mId}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MatchDetail = await res.json();
        if (!isCancelled) {
          setCurrentMatchDetail(data);
          // Reset playback to start on new match
          setPlayback((prev) => ({
            ...prev,
            currentTime: 0,
            isPlaying: false
          }));
        }
      } catch (err) {
        console.error(`Failed to load match ${mId}:`, err);
      } finally {
        if (!isCancelled) setIsLoadingMatch(false);
      }
    }

    loadMatch(filters.matchId);
    return () => {
      isCancelled = true;
    };
  }, [filters.matchId]);

  // 3. Fetch Heatmap data when mapId changes
  useEffect(() => {
    if (!filters.mapId) return;

    async function loadHeatmap(mapId: string) {
      try {
        const res = await fetch(`/data/heatmaps/${mapId}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: HeatmapData = await res.json();
        setHeatmapData(data);
      } catch (err) {
        console.error(`Failed to load heatmap for ${mapId}:`, err);
      }
    }

    loadHeatmap(filters.mapId);
  }, [filters.mapId]);

  // 4. Playback Animation Engine
  useEffect(() => {
    if (!playback.isPlaying || !currentMatchDetail) {
      lastFrameTimeRef.current = null;
      return;
    }

    const duration = currentMatchDetail.duration_sec;

    const animate = (now: number) => {
      if (lastFrameTimeRef.current !== null) {
        const deltaSeconds = (now - lastFrameTimeRef.current) / 1000;
        const advancedTime = deltaSeconds * playback.speed;

        setPlayback((prev) => {
          const nextTime = prev.currentTime + advancedTime;
          if (nextTime >= duration) {
            return { ...prev, isPlaying: false, currentTime: duration };
          }
          return { ...prev, currentTime: nextTime };
        });
      }
      lastFrameTimeRef.current = now;
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [playback.isPlaying, playback.speed, currentMatchDetail]);

  // Handle map switch from Header
  const handleSelectMap = (mapId: string) => {
    if (!manifest) return;
    // Find first match on this map
    const matchOnMap = manifest.matches.find((m) => m.map_id === mapId);
    setFilters((prev) => ({
      ...prev,
      mapId,
      matchId: matchOnMap ? matchOnMap.match_id : '',
      selectedPlayerId: null
    }));
  };

  const handleApplyInsightFilter = (mapId: string, heatmapType: 'kills' | 'storm_deaths' | 'loot') => {
    handleSelectMap(mapId);
    setFilters((prev) => ({
      ...prev,
      heatmapType: heatmapType as HeatmapType,
      heatmapOpacity: 0.75
    }));
  };

  if (isLoadingManifest || !manifest) {
    return (
      <div className="h-screen w-screen bg-[#070a10] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-slate-200 font-bold text-sm tracking-wide">
            INITIALIZING LILA BLACK TELEMETRY
          </p>
          <p className="text-slate-500 text-xs font-mono">
            Loading maps, matches catalog, and coordinate systems...
          </p>
        </div>
      </div>
    );
  }

  const activeMapConfig = manifest.maps[filters.mapId];
  const activeMatchSummary =
    manifest.matches.find((m) => m.match_id === filters.matchId) || null;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#080b11] overflow-hidden text-slate-100 font-sans">
      {/* Header */}
      <Header
        maps={manifest.maps}
        activeMapId={filters.mapId}
        onSelectMap={handleSelectMap}
        activeMatch={activeMatchSummary}
        onOpenInsights={() => setIsInsightsOpen(true)}
        totalMatches={manifest.total_matches}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <Sidebar
          filters={filters}
          onFilterChange={setFilters}
          matches={manifest.matches}
          availableDates={manifest.days}
          currentMatchDetail={currentMatchDetail}
          isLoadingMatch={isLoadingMatch}
        />

        {/* Interactive 2D Map Canvas */}
        <MapCanvas
          mapConfig={activeMapConfig}
          matchDetail={currentMatchDetail}
          filters={filters}
          playback={playback}
          heatmapData={heatmapData}
          onSelectPlayer={(pId) =>
            setFilters((prev) => ({ ...prev, selectedPlayerId: pId }))
          }
        />
      </div>

      {/* Interactive Timeline Playback Bar */}
      <TimelineControls
        playback={playback}
        onPlaybackChange={setPlayback}
        matchDetail={currentMatchDetail}
      />

      {/* Level Design Insights Modal */}
      <InsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        onApplyInsightFilter={handleApplyInsightFilter}
      />
    </div>
  );
}

export default App;
