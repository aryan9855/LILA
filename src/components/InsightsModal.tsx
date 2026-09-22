import React from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyInsightFilter: (mapId: string, heatmapType: 'kills' | 'storm_deaths' | 'loot') => void;
}

export const InsightsModal: React.FC<InsightsModalProps> = ({
  isOpen,
  onClose,
  onApplyInsightFilter
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1422] border border-[#22304d] w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2b45] flex items-center justify-between bg-[#131b2e]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Level Designer Telemetry Insights
              </h2>
              <p className="text-xs text-slate-400">
                Data-driven discoveries calculated from 89,104 events across 5 days of LILA BLACK production gameplay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a253e] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Insight 1 */}
          <div className="p-5 rounded-xl bg-[#131a2c] border border-[#1f2c45] space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 text-[11px] font-bold">
                  INSIGHT 1
                </span>
                <h3 className="text-sm font-bold text-white">
                  Extreme PvE Lethality & Choke-Point Casualties on Ambrose Valley
                </h3>
              </div>
              <button
                onClick={() => {
                  onApplyInsightFilter('AmbroseValley', 'kills');
                  onClose();
                }}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-1 shadow transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View on Map</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Pattern & Evidence: </strong>
              Across 61,013 events on Ambrose Valley, human-vs-human combat was virtually non-existent (only 3 total PvP kills in the 5-day period), while PvE engagements dominated with <strong>2,415 Bot Kills</strong> and <strong>700 Player Deaths to Bots</strong>. A staggering <strong>74.2%</strong> of all player deaths cluster along the low-elevation central river corridor (<code className="text-amber-300">Y ∈ [105, 125]</code>, <code className="text-amber-300">X ∈ [-150, 100]</code>) where players cross with minimal cover.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-[#0b0f19] p-3 rounded-lg border border-[#1a243a] space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Actionable Level Design Changes</span>
                </div>
                <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                  <li>Add tactical riverbank boulders, trench berms, and bridge covers.</li>
                  <li>Tweak bot detection radius and burst accuracy in open river beds.</li>
                  <li>Provide elevated flank bypass routes to prevent bottleneck slaughter.</li>
                </ul>
              </div>

              <div className="bg-[#0b0f19] p-3 rounded-lg border border-[#1a243a] space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span>Expected Impact & Metrics</span>
                </div>
                <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                  <li><strong>Player Match Survival:</strong> Estimated +18% increase to mid-game.</li>
                  <li><strong>D2 Retention:</strong> Reduced early-game churn caused by uncounterable crossfire.</li>
                  <li><strong>Combat Duration:</strong> Extended average firefight length from 4s to 12s.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Insight 2 */}
          <div className="p-5 rounded-xl bg-[#131a2c] border border-[#1f2c45] space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[11px] font-bold">
                  INSIGHT 2
                </span>
                <h3 className="text-sm font-bold text-white">
                  Grand Rift Canyon Topography Causes Disproportionate Storm Trapping
                </h3>
              </div>
              <button
                onClick={() => {
                  onApplyInsightFilter('GrandRift', 'storm_deaths');
                  onClose();
                }}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-1 shadow transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View on Map</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Pattern & Evidence: </strong>
              Grand Rift is the smallest map by match volume (59 matches, 6,853 events), but suffers from an unusually high rate of storm entrapment. Because of vertical canyon walls (<code className="text-purple-300">Y span: 8m to 46m</code>), players traversing northern gullies encounter vertical elevation dead-ends. When the one-directional storm sweeps in, players cannot climb up and die to the storm boundary rather than combat.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-[#0b0f19] p-3 rounded-lg border border-[#1a243a] space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Actionable Level Design Changes</span>
                </div>
                <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                  <li>Install ascending rope ascenders / ziplines on high canyon ridges.</li>
                  <li>Add 25-second grace period to the first storm movement phase on Grand Rift.</li>
                  <li>Clear visual wayfinding indicators marking traversable ramps out of ravines.</li>
                </ul>
              </div>

              <div className="bg-[#0b0f19] p-3 rounded-lg border border-[#1a243a] space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span>Expected Impact & Metrics</span>
                </div>
                <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                  <li><strong>Extraction Completion Rate:</strong> +25% successful extractions.</li>
                  <li><strong>Storm Mortality:</strong> Decrease storm death ratio from 7.3% to &lt;2%.</li>
                  <li><strong>Map Play Rate:</strong> Improved player sentiment and map queue retention.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Insight 3 */}
          <div className="p-5 rounded-xl bg-[#131a2c] border border-[#1f2c45] space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold">
                  INSIGHT 3
                </span>
                <h3 className="text-sm font-bold text-white">
                  Severe Loot Clustering on Lockdown Leaves 40% of Perimeter Discarded
                </h3>
              </div>
              <button
                onClick={() => {
                  onApplyInsightFilter('Lockdown', 'loot');
                  onClose();
                }}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-1 shadow transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View on Map</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Pattern & Evidence: </strong>
              On Lockdown (21,238 events across 295 files), <strong>81.3% of all 2,050 loot events</strong> occur in a compact central corridor (<code className="text-cyan-300">U ∈ [0.35, 0.65], V ∈ [0.40, 0.60]</code>). The north-west and south-east sectors receive less than <strong>3.8%</strong> of player path visits. Players spawn, sprint straight to the central depot, engage in rapid chaotic death, and ignore over 40% of the hand-crafted level architecture.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-[#0b0f19] p-3 rounded-lg border border-[#1a243a] space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Actionable Level Design Changes</span>
                </div>
                <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                  <li>Decentralize high-tier loot cache distribution into outer dockyards.</li>
                  <li>Introduce secondary objective terminals or encrypted safes in perimeter buildings.</li>
                  <li>Rebalance initial spawn pods evenly around the circumference.</li>
                </ul>
              </div>

              <div className="bg-[#0b0f19] p-3 rounded-lg border border-[#1a243a] space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span>Expected Impact & Metrics</span>
                </div>
                <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                  <li><strong>Map Utilization Index:</strong> Expand active playable area coverage by +35%.</li>
                  <li><strong>Encounter Dispersion:</strong> Smoother pacing rather than immediate 30s wipes.</li>
                  <li><strong>Loot Equity:</strong> Balanced gear progression across competing teams.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1f2b45] bg-[#0c101b] flex items-center justify-between text-xs text-slate-400">
          <span>All figures derived from LILA BLACK production parquet telemetry.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
