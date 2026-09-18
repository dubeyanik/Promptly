import React from 'react';
import { Table, DollarSign, TrendingDown, CheckCircle } from 'lucide-react';

const TIER_BADGES = {
  small: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  medium: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
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
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" /> Candidate Models Cost Comparison (Top 3)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pricing comparison based on your input token payload
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-dark-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <th className="pb-3 pl-2">Model & Provider</th>
              <th className="pb-3">Tier</th>
              <th className="pb-3">Context Limit</th>
              <th className="pb-3">Input / Output ($/M)</th>
              <th className="pb-3">Run Cost Est.</th>
              <th className="pb-3">Savings vs Frontier</th>
              <th className="pb-3 pr-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/60 font-mono">
            {top3Candidates.map((model) => {
              const isCurrent = selectedModel?.id === model.id;
              const savingsAmt = Math.max(0, maxCost - model.totalCost);
              const savingsPct = maxCost > 0 ? Math.round((savingsAmt / maxCost) * 100) : 0;

              return (
                <tr
                  key={model.id}
                  className={`hover:bg-dark-850/50 transition ${
                    isCurrent ? 'bg-cyan-500/5' : ''
                  }`}
                >
                  {/* Name */}
                  <td className="py-3 pl-2 font-sans font-medium text-slate-200">
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      via {model.provider}
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        TIER_BADGES[model.tier] || TIER_BADGES.medium
                      }`}
                    >
                      {model.tier}
                    </span>
                  </td>

                  {/* Context */}
                  <td className="py-3 text-slate-400">
                    {(model.context_limit / 1024).toFixed(0)}k
                  </td>

                  {/* Pricing */}
                  <td className="py-3 text-slate-300">
                    ${model.price_in} / ${model.price_out}
                  </td>

                  {/* Run Cost */}
                  <td className="py-3 font-bold text-slate-100">
                    ${model.totalCost?.toFixed(6) ?? '0.000000'}
                  </td>

                  {/* Savings % */}
                  <td className="py-3">
                    {savingsPct > 0 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {savingsPct}% saved
                      </span>
                    ) : (
                      <span className="text-purple-400 font-semibold">Frontier Baseline</span>
                    )}
                  </td>

                  {/* Select button */}
                  <td className="py-3 pr-2 text-right font-sans">
                    {!isCurrent ? (
                      <button
                        onClick={() => onSelectCandidate(model)}
                        className="px-2.5 py-1 rounded bg-dark-950 hover:bg-dark-800 text-slate-300 hover:text-cyan-400 border border-dark-750 text-[11px] transition font-medium"
                      >
                        Select
                      </button>
                    ) : (
                      <span className="text-cyan-400 flex items-center justify-end gap-1 text-[11px] font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Selected
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
  );
}
