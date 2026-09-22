import React from 'react';
import { PlaybackState, MatchDetail, TelemetryEvent } from '../types/telemetry';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { formatTime } from '../utils/coordinates';

interface TimelineControlsProps {
  playback: PlaybackState;
  onPlaybackChange: (updater: (prev: PlaybackState) => PlaybackState) => void;
  matchDetail: MatchDetail | null;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  playback,
  onPlaybackChange,
  matchDetail
}) => {
  const duration = matchDetail?.duration_sec || 0;
  const currentTime = Math.min(playback.currentTime, duration);

  const handleTogglePlay = () => {
    onPlaybackChange((prev) => {
      // If at end, reset to 0 before playing
      const nextTime = prev.currentTime >= duration ? 0 : prev.currentTime;
      return {
        ...prev,
        isPlaying: !prev.isPlaying,
        currentTime: nextTime
      };
    });
  };

  const handleReset = () => {
    onPlaybackChange((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onPlaybackChange((prev) => ({
      ...prev,
      currentTime: val
    }));
  };

  const handleSpeedChange = (speed: number) => {
    onPlaybackChange((prev) => ({
      ...prev,
      speed
    }));
  };

  // Extract notable events to plot on scrubber
  const scrubberEvents = React.useMemo(() => {
    if (!matchDetail || duration <= 0) return [];
    return matchDetail.events.filter((e) =>
      ['Kill', 'Killed', 'BotKill', 'BotKilled', 'KilledByStorm'].includes(e.event)
    );
  }, [matchDetail, duration]);

  const getEventTickColor = (e: TelemetryEvent) => {
    if (e.event === 'KilledByStorm') return '#a855f7';
    if (e.event === 'Kill' || e.event === 'BotKill') return '#ef4444';
    return '#f43f5e';
  };

  return (
    <div className="h-16 bg-[#0c101b] border-t border-[#1b253b] px-6 flex items-center justify-between z-30 select-none">
      {/* Play / Pause / Reset Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleTogglePlay}
          disabled={!matchDetail}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
            playback.isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
          } disabled:opacity-40 disabled:pointer-events-none`}
        >
          {playback.isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={handleReset}
          disabled={!matchDetail}
          className="p-2 rounded-lg bg-[#141d2f] hover:bg-[#1c273e] text-slate-400 hover:text-slate-200 transition-all disabled:opacity-40"
          title="Reset playback to start"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Time Stamp display */}
        <div className="font-mono text-xs text-slate-300 min-w-[110px]">
          <span className="text-white font-semibold">{formatTime(currentTime)}</span>
          <span className="text-slate-500"> / </span>
          <span className="text-slate-400">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Scrubber Slider with Combat Event Ticks */}
      <div className="flex-1 mx-8 relative flex items-center">
        {/* Event tick indicators on the scrubber */}
        <div className="absolute left-0 right-0 h-2 pointer-events-none z-10">
          {scrubberEvents.map((ev, i) => {
            const pct = Math.min(100, Math.max(0, (ev.t / duration) * 100));
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-1 rounded-full cursor-pointer pointer-events-auto"
                style={{
                  left: `${pct}%`,
                  backgroundColor: getEventTickColor(ev)
                }}
                onClick={() =>
                  onPlaybackChange((prev) => ({ ...prev, currentTime: ev.t }))
                }
                title={`${ev.event} at ${formatTime(ev.t)}`}
              />
            );
          })}
        </div>

        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.1"
          value={currentTime}
          onChange={handleSliderChange}
          disabled={!matchDetail}
          className="w-full h-2 bg-[#172238] rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-40"
        />
      </div>

      {/* Playback Speed Multipliers */}
      <div className="flex items-center space-x-1 bg-[#131c2e] p-1 rounded-lg border border-[#1f2b45]">
        <FastForward className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5" />
        {[0.5, 1, 2, 5, 10].map((s) => (
          <button
            key={s}
            onClick={() => handleSpeedChange(s)}
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-all ${
              playback.speed === s
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a253e]'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};
