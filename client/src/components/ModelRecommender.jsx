import React, { useState } from 'react';
import { Cpu, Check, ChevronDown, Sparkles, DollarSign, ShieldAlert } from 'lucide-react';

const TIER_COLORS = {
  small: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  medium: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  large: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  frontier: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
};

export default function ModelRecommender({
  recommendation,
  allModels = [],
  selectedModel,
  onSelectModel
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!recommendation || !selectedModel) return null;

  const {
    targetTier,
    recommendedModel,
    confidenceLabel,
    reason,
    costSavings
  } = recommendation;

  const isOverridden = selectedModel.id !== recommendedModel.id;

  // Group all models by tier
  const tiers = ['small', 'medium', 'large', 'frontier'];
  const groupedModels = tiers.reduce((acc, tier) => {
    acc[tier] = allModels.filter((m) => m.tier === tier);
    return acc;
  }, {});

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> Model Recommendation Engine
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{reason}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3" /> {confidenceLabel}
          </span>
          {isOverridden && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              User Override Active
            </span>
          )}
        </div>
      </div>

      {/* Recommended Model Highlight Card */}
      <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-dark-900 border border-dark-700 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-bold text-base text-slate-100">{selectedModel.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${TIER_COLORS[selectedModel.tier] || TIER_COLORS.medium}`}>
                {selectedModel.tier} Tier
              </span>
              <span className="text-xs text-slate-500 font-mono">
                via {selectedModel.provider}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {selectedModel.description}
            </p>
          </div>
        </div>

        {/* Specs & Pricing */}
        <div className="flex items-center gap-4 text-xs font-mono border-t md:border-t-0 md:border-l border-dark-800 pt-3 md:pt-0 md:pl-4 shrink-0">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Input / Output</div>
            <div className="text-slate-200 font-semibold mt-0.5">
              ${selectedModel.price_in} / ${selectedModel.price_out} <span className="text-[10px] text-slate-500">/M</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Context Limit</div>
            <div className="text-slate-200 font-semibold mt-0.5">
              {(selectedModel.context_limit / 1024).toFixed(0)}k tokens
            </div>
          </div>
        </div>
      </div>

      {/* Model Picker (Override Dropdown) */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-dark-950 hover:bg-dark-850 text-slate-200 rounded-lg border border-dark-700 text-xs font-medium transition"
          >
            <span>Change / Override Model: <strong className="text-cyan-400">{selectedModel.name}</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-dark-900 border border-dark-700 rounded-xl shadow-2xl z-50 p-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 mb-1">
                Select Model by Tier
              </div>

              {tiers.map((tier) => (
                <div key={tier} className="mb-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5">
                    {tier} Tier
                  </div>
                  {groupedModels[tier]?.map((m) => {
                    const isSelected = selectedModel.id === m.id;
                    const isRec = recommendedModel.id === m.id;

                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectModel(m);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                            : 'text-slate-300 hover:bg-dark-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{m.name}</span>
                            {isRec && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ${m.price_in}/${m.price_out} • {(m.context_limit / 1024).toFixed(0)}k ctx
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings Stat Pill */}
        {costSavings && costSavings.savedPercent > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Saves <strong>{costSavings.savedPercent}%</strong> vs {costSavings.frontierBaselineModel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
