import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  MapConfig,
  MatchDetail,
  FilterState,
  PlaybackState,
  HeatmapData,
  TelemetryEvent
} from '../types/telemetry';
import { uvToCanvas, canvasToWorld, getPlayerColor, formatTime } from '../utils/coordinates';
import { ZoomIn, ZoomOut, Maximize2, Crosshair, Flame, Package } from 'lucide-react';

interface MapCanvasProps {
  mapConfig: MapConfig;
  matchDetail: MatchDetail | null;
  filters: FilterState;
  playback: PlaybackState;
  heatmapData: HeatmapData | null;
  onSelectPlayer: (playerId: string | null) => void;
}

interface HoveredTarget {
  type: 'event' | 'player';
  x: number;
  y: number;
  event?: TelemetryEvent;
  playerId?: string;
  isBot?: boolean;
  time?: number;
  worldX?: number;
  worldZ?: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  mapConfig,
  matchDetail,
  filters,
  playback,
  heatmapData,
  onSelectPlayer
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Minimap image caching
  const minimapImageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Transform state: zoom & pan offset
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Hover states & HUD
  const [mouseCoord, setMouseCoord] = useState<{ wx: number; wz: number; u: number; v: number } | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<HoveredTarget | null>(null);

  // Load minimap image when map changes
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.src = mapConfig.minimap_web;
    img.onload = () => {
      minimapImageRef.current = img;
      setImageLoaded(true);
    };
  }, [mapConfig.minimap_web]);

  // Reset zoom & pan when map changes
  const handleResetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    handleResetView();
  }, [mapConfig.id, handleResetView]);

  // Zoom helpers
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(5, Math.max(0.6, prev + delta)));
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#070a10';
    ctx.fillRect(0, 0, width, height);

    // Apply pan & zoom transform
    ctx.save();
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -height / 2);

    // Maintain 1:1 square aspect ratio for the minimap centered in container
    const mapSize = Math.min(width, height) * 0.95;
    const mapX = (width - mapSize) / 2;
    const mapY = (height - mapSize) / 2;

    // 1. Render Minimap Image
    if (minimapImageRef.current && imageLoaded) {
      ctx.drawImage(minimapImageRef.current, mapX, mapY, mapSize, mapSize);
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(mapX, mapY, mapSize, mapSize);
      ctx.strokeStyle = '#374151';
      ctx.strokeRect(mapX, mapY, mapSize, mapSize);
    }

    // Grid Overlay & Border
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);

    // 2. Render Heatmap Overlay if active
    if (filters.heatmapType !== 'none' && heatmapData) {
      ctx.save();
      ctx.globalAlpha = filters.heatmapOpacity;

      const points =
        filters.heatmapType === 'traffic'
          ? heatmapData.traffic
          : filters.heatmapType === 'kills'
          ? heatmapData.kills
          : filters.heatmapType === 'deaths'
          ? heatmapData.deaths
          : filters.heatmapType === 'storm_deaths'
          ? heatmapData.storm_deaths
          : heatmapData.loot;

      const radius = filters.heatmapType === 'traffic' ? 18 : 26;
      let gradColor = 'rgba(239, 68, 68, '; // default red for kills
      if (filters.heatmapType === 'traffic') gradColor = 'rgba(59, 130, 246, '; // blue
      else if (filters.heatmapType === 'deaths') gradColor = 'rgba(244, 63, 94, '; // rose
      else if (filters.heatmapType === 'storm_deaths') gradColor = 'rgba(168, 85, 247, '; // purple
      else if (filters.heatmapType === 'loot') gradColor = 'rgba(6, 182, 212, '; // cyan

      points.forEach(([u, v]) => {
        const pt = uvToCanvas(u, v, mapSize, mapSize);
        const px = mapX + pt.x;
        const py = mapY + pt.y;

        const radial = ctx.createRadialGradient(px, py, 2, px, py, radius);
        radial.addColorStop(0, gradColor + '0.45)');
        radial.addColorStop(0.5, gradColor + '0.15)');
        radial.addColorStop(1, gradColor + '0)');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // 3. Render Player Trajectories
    if (matchDetail) {
      const currentTime = playback.currentTime;

      matchDetail.players.forEach((player, pIdx) => {
        // Filter out if humans or bots are disabled
        if (player.is_bot && !filters.showBots) return;
        if (!player.is_bot && !filters.showHumans) return;

        const isFocused = filters.selectedPlayerId === player.user_id;
        const isAnyFocused = filters.selectedPlayerId !== null;

        // Path styling
        const playerColor = getPlayerColor(player.user_id, player.is_bot, pIdx);
        let alpha = isFocused ? 1.0 : isAnyFocused ? 0.2 : 0.8;
        let lineWidth = isFocused ? 3.5 : player.is_bot ? 1.8 : 2.5;

        // Progressive path points up to currentTime
        const activePoints = player.path.filter((p) => p[0] <= currentTime);
        if (activePoints.length === 0) return;

        ctx.save();
        ctx.strokeStyle = playerColor;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        if (player.is_bot) {
          ctx.setLineDash([5, 4]); // Dashed line for bots
        } else {
          ctx.setLineDash([]);
        }

        // Draw trajectory path
        ctx.beginPath();
        activePoints.forEach((p, idx) => {
          const pt = uvToCanvas(p[1], p[2], mapSize, mapSize);
          const px = mapX + pt.x;
          const py = mapY + pt.y;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Current Head Marker (player position at current time)
        const lastPt = activePoints[activePoints.length - 1];
        const headPt = uvToCanvas(lastPt[1], lastPt[2], mapSize, mapSize);
        const headX = mapX + headPt.x;
        const headY = mapY + headPt.y;

        // Draw Player Head Node
        ctx.setLineDash([]);
        if (player.is_bot) {
          // Bot: Diamond shape
          ctx.fillStyle = playerColor;
          ctx.beginPath();
          const dSize = isFocused ? 6 : 4.5;
          ctx.moveTo(headX, headY - dSize);
          ctx.lineTo(headX + dSize, headY);
          ctx.lineTo(headX, headY + dSize);
          ctx.lineTo(headX - dSize, headY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Human: Glowing Circle with border
          ctx.fillStyle = playerColor;
          ctx.beginPath();
          const rSize = isFocused ? 7 : 5;
          ctx.arc(headX, headY, rSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Outer pulse if playing
          if (playback.isPlaying) {
            ctx.beginPath();
            ctx.arc(headX, headY, rSize + 4, 0, Math.PI * 2);
            ctx.strokeStyle = playerColor;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.4;
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      // 4. Render Event Markers (Kills, Deaths, Loot, Storm)
      const visibleEvents = matchDetail.events.filter((ev) => ev.t <= currentTime);

      visibleEvents.forEach((ev) => {
        const isKill = ev.event === 'Kill' || ev.event === 'BotKill';
        const isDeath = ev.event === 'Killed' || ev.event === 'BotKilled';
        const isStorm = ev.event === 'KilledByStorm';
        const isLoot = ev.event === 'Loot';

        if (isKill && !filters.events.kills) return;
        if (isDeath && !filters.events.deaths) return;
        if (isStorm && !filters.events.stormDeaths) return;
        if (isLoot && !filters.events.loot) return;

        const pt = uvToCanvas(ev.u, ev.v, mapSize, mapSize);
        const px = mapX + pt.x;
        const py = mapY + pt.y;

        // Check if event just occurred (in the last 5 seconds) for pulse effect
        const isRecent = currentTime - ev.t >= 0 && currentTime - ev.t < 5;

        ctx.save();
        if (isKill) {
          // Crosshairs Marker
          ctx.strokeStyle = '#ef4444';
          ctx.fillStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px - 9, py); ctx.lineTo(px + 9, py);
          ctx.moveTo(px, py - 9); ctx.lineTo(px, py + 9);
          ctx.stroke();

          if (isRecent) {
            ctx.beginPath();
            ctx.arc(px, py, 14, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        } else if (isDeath) {
          // Skull / Death Marker
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (isStorm) {
          // Storm Death Marker (Purple vortex)
          ctx.strokeStyle = '#a855f7';
          ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (isLoot) {
          // Loot Diamond Marker
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.moveTo(px, py - 3.5);
          ctx.lineTo(px + 3.5, py);
          ctx.lineTo(px, py + 3.5);
          ctx.lineTo(px - 3.5, py);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });
    }

    ctx.restore(); // Restore pan & zoom
    ctx.restore(); // Restore dpr
  }, [
    mapConfig,
    imageLoaded,
    matchDetail,
    filters,
    playback.currentTime,
    playback.isPlaying,
    heatmapData,
    scale,
    pan
  ]);

  // Mouse Interaction: Pan, Zoom, Coordinates HUD, and Target Hovering
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    handleZoom(zoomFactor);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
      return;
    }

    // Compute coordinate HUD
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const mapSize = Math.min(width, height) * 0.95;
    const mapX = (width - mapSize) / 2;
    const mapY = (height - mapSize) / 2;

    // Invert pan & zoom to find canvas local coord
    const localX = (clientX - (width / 2 + pan.x)) / scale + width / 2;
    const localY = (clientY - (height / 2 + pan.y)) / scale + height / 2;

    const u = (localX - mapX) / mapSize;
    const v = 1 - (localY - mapY) / mapSize;

    if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
      const world = canvasToWorld(localX - mapX, localY - mapY, mapSize, mapSize, mapConfig);
      setMouseCoord({ wx: world.x, wz: world.z, u, v });
    } else {
      setMouseCoord(null);
    }

    // Hit-testing for tooltips (events & player head nodes)
    if (!matchDetail) {
      setHoveredTarget(null);
      return;
    }

    const HIT_RADIUS = 12 / scale;
    let foundTarget: HoveredTarget | null = null;

    // Check events first
    for (const ev of matchDetail.events) {
      if (ev.t > playback.currentTime) continue;
      const pt = uvToCanvas(ev.u, ev.v, mapSize, mapSize);
      const evX = mapX + pt.x;
      const evY = mapY + pt.y;
      const dist = Math.hypot(localX - evX, localY - evY);
      if (dist < HIT_RADIUS) {
        foundTarget = {
          type: 'event',
          x: clientX,
          y: clientY,
          event: ev,
          time: ev.t,
          worldX: ev.x,
          worldZ: ev.z
        };
        break;
      }
    }

    setHoveredTarget(foundTarget);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = () => {
    if (hoveredTarget && hoveredTarget.event) {
      onSelectPlayer(hoveredTarget.event.user_id);
    } else {
      onSelectPlayer(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-[calc(100vh-8rem)] bg-[#070a10] overflow-hidden flex items-center justify-center cursor-crosshair"
    >
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        className="w-full h-full block"
      />

      {/* Floating Canvas Controls (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 bg-[#0e1422]/90 backdrop-blur-md p-1.5 rounded-lg border border-[#1e2a44] shadow-xl z-20">
        <button
          onClick={() => handleZoom(0.25)}
          className="p-2 rounded hover:bg-[#1a253e] text-slate-300 hover:text-white transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.25)}
          className="p-2 rounded hover:bg-[#1a253e] text-slate-300 hover:text-white transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded hover:bg-[#1a253e] text-slate-300 hover:text-white transition-all"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Real-time World Coordinates HUD (Bottom Left) */}
      <div className="absolute bottom-4 left-4 bg-[#0a0e17]/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#1b253b] text-xs font-mono text-slate-300 flex items-center space-x-4 shadow-lg pointer-events-none z-20">
        <div>
          <span className="text-slate-500">World: </span>
          {mouseCoord ? (
            <span className="text-blue-400 font-semibold">
              X: {mouseCoord.wx.toFixed(1)}, Z: {mouseCoord.wz.toFixed(1)}
            </span>
          ) : (
            <span className="text-slate-500">-- , --</span>
          )}
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div>
          <span className="text-slate-500">UV: </span>
          {mouseCoord ? (
            <span className="text-emerald-400 font-semibold">
              ({mouseCoord.u.toFixed(3)}, {mouseCoord.v.toFixed(3)})
            </span>
          ) : (
            <span className="text-slate-500">--</span>
          )}
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div>
          <span className="text-slate-500">Zoom: </span>
          <span className="text-amber-400 font-semibold">{scale.toFixed(1)}x</span>
        </div>
      </div>

      {/* Interactive Event Hover Card */}
      {hoveredTarget && hoveredTarget.event && (
        <div
          className="absolute z-30 pointer-events-none bg-[#0f172a]/95 backdrop-blur-md p-3 rounded-lg border border-slate-700 shadow-2xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredTarget.x, top: hoveredTarget.y }}
        >
          <div className="flex items-center space-x-1.5 font-bold">
            {hoveredTarget.event.event.includes('Kill') ? (
              <Crosshair className="w-3.5 h-3.5 text-red-400" />
            ) : hoveredTarget.event.event === 'KilledByStorm' ? (
              <Flame className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <Package className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span
              className={
                hoveredTarget.event.event.includes('Kill')
                  ? 'text-red-400'
                  : hoveredTarget.event.event === 'KilledByStorm'
                  ? 'text-purple-400'
                  : 'text-cyan-400'
              }
            >
              {hoveredTarget.event.event}
            </span>
            <span className="text-slate-400 text-[10px]">
              at {formatTime(hoveredTarget.event.t)}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 font-mono">
            ID:{' '}
            <span className="text-white">
              {hoveredTarget.event.is_bot
                ? `Bot-${hoveredTarget.event.user_id}`
                : `Player-${hoveredTarget.event.user_id.substring(0, 8)}...`}
            </span>
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            World: ({hoveredTarget.event.x.toFixed(1)}, {hoveredTarget.event.z.toFixed(1)})
          </div>
        </div>
      )}
    </div>
  );
};
