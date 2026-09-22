import React from 'react';
import { MapConfig, MatchSummary } from '../types/telemetry';
import { MapPin, Users, Bot, Crosshair, Skull, ShieldAlert, Sparkles, Compass } from 'lucide-react';
import { formatTime } from '../utils/coordinates';

interface HeaderProps {
  maps: Record<string, MapConfig>;
  activeMapId: string;
  onSelectMap: (mapId: string) => void;
  activeMatch: MatchSummary | null;
  onOpenInsights: () => void;
  totalMatches: number;
}

export const Header: React.FC<HeaderProps> = ({
  maps,
  activeMapId,
  onSelectMap,
  activeMatch,
  onOpenInsights,
  totalMatches,
}) => {
  return (
    <header className="h-16 bg-[#0c101a] border-b border-[#1b253b] px-5 flex items-center justify-between z-30 select-none">
      {/* Brand & Map Selector */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-wider text-sm text-white uppercase">LILA BLACK</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Level Designer Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Player Journey & Combat Telemetry</p>
          </div>
        </div>

        {/* Map Switcher Tabs */}
        <div className="hidden md:flex items-center bg-[#131b2e] p-1 rounded-lg border border-[#22304d]">
          {Object.values(maps).map((m) => {
            const isActive = m.id === activeMapId;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMap(m.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a253e]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Match Telemetry Quick Stats */}
      {activeMatch && (
        <div className="hidden lg:flex items-center space-x-4 bg-[#111828] px-4 py-1.5 rounded-lg border border-[#1e2a44] text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <Users className="w-3.5 h-3.5" />
            <span className="font-semibold">{activeMatch.humans_count}</span>
            <span className="text-slate-400 text-[11px]">Humans</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center space-x-1.5 text-amber-400">
            <Bot className="w-3.5 h-3.5" />
            <span className="font-semibold">{activeMatch.bots_count}</span>
            <span className="text-slate-400 text-[11px]">Bots</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center space-x-1.5 text-red-400">
            <Crosshair className="w-3.5 h-3.5" />
            <span className="font-semibold">{activeMatch.kills}</span>
            <span className="text-slate-400 text-[11px]">Kills</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center space-x-1.5 text-rose-400">
            <Skull className="w-3.5 h-3.5" />
            <span className="font-semibold">{activeMatch.deaths}</span>
            <span className="text-slate-400 text-[11px]">Deaths</span>
          </div>
          {activeMatch.storm_deaths > 0 && (
            <>
              <div className="h-3 w-px bg-slate-700" />
              <div className="flex items-center space-x-1.5 text-purple-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="font-semibold">{activeMatch.storm_deaths}</span>
                <span className="text-slate-400 text-[11px]">Storm</span>
              </div>
            </>
          )}
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-slate-300 font-mono text-[11px]">
            Duration: <span className="text-blue-400 font-semibold">{formatTime(activeMatch.duration_sec)}</span>
          </div>
        </div>
      )}

      {/* Right Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenInsights}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-lg shadow-purple-600/20 border border-purple-400/30 transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Game Insights</span>
          <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-bold">3</span>
        </button>

        <div className="text-slate-400 text-[11px] font-mono border-l border-slate-800 pl-3 hidden sm:block">
          <span>{totalMatches} Matches Loaded</span>
        </div>
      </div>
    </header>
  );
};
