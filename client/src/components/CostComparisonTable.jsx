import React from 'react';
import { Table, DollarSign, TrendingDown, CheckCircle } from 'lucide-react';

const TIER_BADGES = {
  small: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  medium: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
  large: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  frontier: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
};

export default function CostComparisonTable({
  top3Candidates = [],
  selectedModel = {},
  onSelectCandidate
}) {
  if (!top3Candidates || top3Candidates.length === 0) return null;

  // Baseline is highest cost candidate (usually the Frontier model)
  const maxCost = Math.max(...top3Candidates.map((m) => m.totalCost || 0.0001));

  return (
    <div id="benchmarks" className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 hover:border-white/20">
      {/* Terminal Window Title Bar */}
      <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
          <span className="ml-2 text-slate-400 font-mono text-[11px]">root@promptly:~# cost_matrix.sql</span>
        </div>
        <span className="text-[10px] text-[#00F0FF] font-mono">03 // BENCHMARK_MATRIX</span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Table className="w-4 h-4 text-[#00F0FF]" /> CANDIDATE MODELS COST COMPARISON (TOP 3)
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Real-time pricing matrix derived dynamically from your current input token count.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                <th className="pb-3 pl-2">Model & Gateway</th>
                <th className="pb-3">Tier</th>
                <th className="pb-3">Context</th>
                <th className="pb-3">In / Out ($/M)</th>
                <th className="pb-3">Cost Est.</th>
                <th className="pb-3">Saved vs Frontier</th>
                <th className="pb-3 pr-2 text-right">Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {top3Candidates.map((model) => {
                const isCurrent = selectedModel?.id === model.id;
                const savingsAmt = Math.max(0, maxCost - model.totalCost);
                const savingsPct = maxCost > 0 ? Math.round((savingsAmt / maxCost) * 100) : 0;

                return (
                  <tr
                    key={model.id}
                    className={`hover:bg-[#161616] transition ${
                      isCurrent ? 'bg-[#00F0FF]/5' : ''
                    }`}
                  >
                    {/* Name */}
                    <td className="py-3.5 pl-2 font-sans font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{model.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] font-mono font-bold border border-[#00F0FF]/40">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        via {model.provider}
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          TIER_BADGES[model.tier] || TIER_BADGES.medium
                        }`}
                      >
                        {model.tier}
                      </span>
                    </td>

                    {/* Context */}
                    <td className="py-3.5 text-slate-400">
                      {(model.context_limit / 1024).toFixed(0)}k
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 text-slate-300">
                      ${model.price_in} / ${model.price_out}
                    </td>

                    {/* Run Cost */}
                    <td className="py-3.5 font-bold text-white">
                      ${model.totalCost?.toFixed(6) ?? '0.000000'}
                    </td>

                    {/* Savings % */}
                    <td className="py-3.5">
                      {savingsPct > 0 ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          {savingsPct}% saved
                        </span>
                      ) : (
                        <span className="text-purple-400 font-semibold">Frontier Baseline</span>
                      )}
                    </td>

                    {/* Select button */}
                    <td className="py-3.5 pr-2 text-right font-sans">
                      {!isCurrent ? (
                        <button
                          onClick={() => onSelectCandidate(model)}
                          className="px-3 py-1 rounded-full bg-[#181818] hover:bg-[#252525] text-slate-300 hover:text-[#00F0FF] border border-white/10 hover:border-[#00F0FF]/30 text-xs transition font-mono"
                        >
                          Select
                        </button>
                      ) : (
                        <span className="text-[#00F0FF] font-mono flex items-center justify-end gap-1 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Routed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
