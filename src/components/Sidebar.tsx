import React from 'react';
import { FilterState, MatchSummary, HeatmapType, MatchDetail } from '../types/telemetry';
import {
  Calendar,
  Layers,
  Flame,
  User,
  Bot,
  Crosshair,
  Skull,
  Package,
  Zap,
  Activity,
  Sliders,
  Search,
  Eye,
  CheckSquare,
  Square
} from 'lucide-react';
import { formatTime, getPlayerColor } from '../utils/coordinates';

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  matches: MatchSummary[];
  availableDates: string[];
  currentMatchDetail: MatchDetail | null;
  isLoadingMatch: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  onFilterChange,
  matches,
  availableDates,
  currentMatchDetail,
  isLoadingMatch
}) => {
  const [matchSearch, setMatchSearch] = React.useState('');

  // Filter matches for the dropdown/list
  const filteredMatches = React.useMemo(() => {
    return matches.filter((m) => {
      if (m.map_id !== filters.mapId) return false;
      if (filters.date !== 'all' && m.day !== filters.date) return false;
      if (matchSearch) {
        return (
          m.match_id.toLowerCase().includes(matchSearch.toLowerCase()) ||
          m.day.toLowerCase().includes(matchSearch.toLowerCase())
        );
      }
      return true;
    });
  }, [matches, filters.mapId, filters.date, matchSearch]);

  const handleSelectMatch = (matchId: string) => {
    onFilterChange((prev) => ({
      ...prev,
      matchId,
      selectedPlayerId: null // reset highlighted player
    }));
  };

  return (
    <aside className="w-84 md:w-96 bg-[#0e1320] border-r border-[#1b253b] flex flex-col h-[calc(100vh-8rem)] z-20 select-none overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* Date Filter */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Date Filter</span>
            </span>
            <span className="text-[11px] text-slate-500">{filteredMatches.length} Matches</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 bg-[#131b2c] p-1 rounded-lg border border-[#1f2c45]">
            <button
              onClick={() => onFilterChange((prev) => ({ ...prev, date: 'all' }))}
              className={`py-1 text-[11px] font-medium rounded transition-all ${
                filters.date === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a253c]'
              }`}
            >
              All Days
            </button>
            {availableDates.map((day) => {
              const label = day.replace('February_', 'Feb ');
              const isActive = filters.date === day;
              return (
                <button
                  key={day}
                  onClick={() => onFilterChange((prev) => ({ ...prev, date: day }))}
                  className={`py-1 text-[11px] font-medium rounded transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a253c]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Match Selector */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Select Match Session</span>
            </span>
            {isLoadingMatch && (
              <span className="text-[11px] text-blue-400 animate-pulse">Loading...</span>
            )}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search match ID..."
              value={matchSearch}
              onChange={(e) => setMatchSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#131b2c] border border-[#1f2c45] rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 bg-[#0b0f19] rounded-lg border border-[#1a243a] p-1.5">
            {filteredMatches.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                No matches found for this filter
              </div>
            ) : (
              filteredMatches.slice(0, 50).map((m) => {
                const isSelected = m.match_id === filters.matchId;
                return (
                  <button
                    key={m.match_id}
                    onClick={() => handleSelectMatch(m.match_id)}
                    className={`w-full text-left p-2 rounded-md transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-blue-600/20 border border-blue-500 text-blue-200'
                        : 'hover:bg-[#141d30] border border-transparent text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 truncate mr-2">
                      <div className="font-mono text-[11px] truncate font-medium">
                        {m.match_id.substring(0, 18)}...
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                        <span>{m.day.replace('February_', 'Feb ')}</span>
                        <span>•</span>
                        <span>{formatTime(m.duration_sec)}</span>
                        {m.kills > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-red-400 font-semibold">{m.kills} kills</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {m.humans_count > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          {m.humans_count}H
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {m.bots_count}B
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Player Type Toggles & Current Match Roster */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Player Filter & Roster</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                onFilterChange((prev) => ({ ...prev, showHumans: !prev.showHumans }))
              }
              className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-all ${
                filters.showHumans
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#131b2c] border-[#1f2c45] text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Human Players</span>
              </div>
              {filters.showHumans ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={() =>
                onFilterChange((prev) => ({ ...prev, showBots: !prev.showBots }))
              }
              className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-all ${
                filters.showBots
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-[#131b2c] border-[#1f2c45] text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Bots</span>
              </div>
              {filters.showBots ? (
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Active Match Player Journeys List */}
          {currentMatchDetail && (
            <div className="space-y-1 pt-1">
              <div className="text-[11px] text-slate-400 font-medium flex justify-between items-center">
                <span>Journeys in this match ({currentMatchDetail.players.length}):</span>
                {filters.selectedPlayerId && (
                  <button
                    onClick={() => onFilterChange((prev) => ({ ...prev, selectedPlayerId: null }))}
                    className="text-blue-400 hover:underline text-[10px]"
                  >
                    Clear Focus
                  </button>
                )}
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1 bg-[#0b0f19] p-1.5 rounded-lg border border-[#1a243a]">
                {currentMatchDetail.players
                  .filter((p) => (p.is_bot ? filters.showBots : filters.showHumans))
                  .map((p, idx) => {
                    const color = getPlayerColor(p.user_id, p.is_bot, idx);
                    const isFocused = filters.selectedPlayerId === p.user_id;
                    return (
                      <button
                        key={p.user_id}
                        onClick={() =>
                          onFilterChange((prev) => ({
                            ...prev,
                            selectedPlayerId: isFocused ? null : p.user_id
                          }))
                        }
                        className={`w-full text-left px-2 py-1 rounded flex items-center justify-between text-xs transition-all ${
                          isFocused
                            ? 'bg-blue-600/30 border border-blue-400 text-white'
                            : 'hover:bg-[#131c2e] text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-mono text-[11px] truncate">
                            {p.is_bot ? `Bot-${p.user_id}` : `Player-${p.user_id.substring(0, 8)}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                          <span>{p.path.length} pts</span>
                          {p.events.length > 0 && (
                            <span className="text-red-400 font-semibold">{p.events.length} ev</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </section>

        {/* Event Marker Filters */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Event Marker Toggles</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() =>
                onFilterChange((prev) => ({
                  ...prev,
                  events: { ...prev.events, kills: !prev.events.kills }
                }))
              }
              className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                filters.events.kills
                  ? 'bg-red-500/15 border-red-500/40 text-red-300'
                  : 'bg-[#131b2c] border-[#1f2c45] text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Crosshair className="w-3.5 h-3.5 text-red-400" />
                <span>Kills</span>
              </div>
              {filters.events.kills ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() =>
                onFilterChange((prev) => ({
                  ...prev,
                  events: { ...prev.events, deaths: !prev.events.deaths }
                }))
              }
              className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                filters.events.deaths
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : 'bg-[#131b2c] border-[#1f2c45] text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Skull className="w-3.5 h-3.5 text-rose-400" />
                <span>Deaths</span>
              </div>
              {filters.events.deaths ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() =>
                onFilterChange((prev) => ({
                  ...prev,
                  events: { ...prev.events, stormDeaths: !prev.events.stormDeaths }
                }))
              }
              className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                filters.events.stormDeaths
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                  : 'bg-[#131b2c] border-[#1f2c45] text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-purple-400" />
                <span>Storm Deaths</span>
              </div>
              {filters.events.stormDeaths ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() =>
                onFilterChange((prev) => ({
                  ...prev,
                  events: { ...prev.events, loot: !prev.events.loot }
                }))
              }
              className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                filters.events.loot
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-[#131b2c] border-[#1f2c45] text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>Loot Pickups</span>
              </div>
              {filters.events.loot ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>
          </div>
        </section>

        {/* Heatmap Overlay Layer Controls */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Map-Wide Heatmap Layer</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 bg-[#131b2c] p-1 rounded-lg border border-[#1f2c45]">
            {(
              [
                ['none', 'Off'],
                ['traffic', 'Traffic'],
                ['kills', 'Kill Zones'],
                ['deaths', 'Death Zones'],
                ['storm_deaths', 'Storm'],
                ['loot', 'Looting']
              ] as [HeatmapType, string][]
            ).map(([type, label]) => {
              const isActive = filters.heatmapType === type;
              return (
                <button
                  key={type}
                  onClick={() => onFilterChange((prev) => ({ ...prev, heatmapType: type }))}
                  className={`py-1 text-[11px] font-medium rounded transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a253c]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {filters.heatmapType !== 'none' && (
            <div className="bg-[#111726] p-2.5 rounded-lg border border-[#1c273e] space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span className="flex items-center space-x-1">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  <span>Heatmap Opacity</span>
                </span>
                <span className="font-mono text-orange-400">
                  {Math.round(filters.heatmapOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={filters.heatmapOpacity}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onFilterChange((prev) => ({ ...prev, heatmapOpacity: val }));
                }}
                className="w-full accent-orange-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </section>

      </div>

      {/* Map Legend Footer */}
      <div className="p-3 bg-[#0a0e17] border-t border-[#1b253b] text-[11px] text-slate-400 space-y-1.5">
        <div className="font-semibold text-slate-300 text-xs flex items-center space-x-1">
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>Visual Legend</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Human Trajectory</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 border-dashed border-2 border-amber-400 inline-block" />
            <span>Bot Trajectory</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Crosshair className="w-3 h-3 text-red-400" />
            <span>Kill Event</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Skull className="w-3 h-3 text-rose-400" />
            <span>Player Death</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Package className="w-3 h-3 text-cyan-400" />
            <span>Loot Pickup</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Flame className="w-3 h-3 text-purple-400" />
            <span>Storm Elimination</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
