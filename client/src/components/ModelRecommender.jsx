import React, { useState } from 'react';
import { Cpu, Check, ChevronDown, Sparkles, DollarSign } from 'lucide-react';

const TIER_COLORS = {
  small: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  medium: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
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
    recommendedModel,
    confidenceLabel,
    reason,
    costSavings
  } = recommendation;

  const isOverridden = selectedModel.id !== recommendedModel.id;

  const tiers = ['small', 'medium', 'large', 'frontier'];
  const groupedModels = tiers.reduce((acc, tier) => {
    acc[tier] = allModels.filter((m) => m.tier === tier);
    return acc;
  }, {});

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 hover:border-white/20">
      {/* Terminal Window Title Bar */}
      <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
          <span className="ml-2 text-slate-400 font-mono text-[11px]">root@promptly:~# model_recommender.py</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> {confidenceLabel}
          </span>
          {isOverridden && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              OVERRIDE
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00F0FF]" /> 03 // RECOMMENDED ENGINE
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">{reason}</p>
          </div>
        </div>

        {/* Recommended Model Highlight Card */}
        <div className="bg-[#0A0A0A] p-4 sm:p-5 rounded-xl border border-[#00F0FF]/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-[0_0_20px_-5px_rgba(0,240,255,0.1)]">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#00F0FF]/40 flex items-center justify-center shrink-0 glow-neon-cyan-sm">
              <Cpu className="w-6 h-6 text-[#00F0FF]" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-sans font-bold text-base sm:text-lg text-white">{selectedModel.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${TIER_COLORS[selectedModel.tier] || TIER_COLORS.medium}`}>
                  {selectedModel.tier} Tier
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  via {selectedModel.provider}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans">
                {selectedModel.description}
              </p>
            </div>
          </div>

          {/* Specs & Pricing in Monospace */}
          <div className="flex items-center gap-5 text-xs font-mono border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5 shrink-0">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Input / Output</div>
              <div className="text-[#EDEDED] font-bold mt-0.5">
                ${selectedModel.price_in} / ${selectedModel.price_out} <span className="text-[10px] text-slate-500">/M</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Context Window</div>
              <div className="text-[#00F0FF] font-bold mt-0.5">
                {(selectedModel.context_limit / 1024).toFixed(0)}k tok
              </div>
            </div>
          </div>
        </div>

        {/* Model Override Picker and Savings Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#161616] hover:bg-[#202020] text-slate-200 rounded-full border border-white/10 text-xs font-mono transition"
            >
              <span>Switch Model: <strong className="text-[#00F0FF]">{selectedModel.name}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 font-mono">
                <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 mb-1">
                  Select Model by Tier
                </div>

                {tiers.map((tier) => (
                  <div key={tier} className="mb-2">
                    <div className="text-[10px] font-bold text-[#00F0FF] uppercase px-2 py-0.5">
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition ${
                            isSelected
                              ? 'bg-[#00F0FF]/20 text-[#00F0FF] font-medium'
                              : 'text-slate-300 hover:bg-[#1A1A1A]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{m.name}</span>
                              {isRec && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] font-bold">
                                  Rec
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              ${m.price_in}/${m.price_out} • {(m.context_limit / 1024).toFixed(0)}k
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00F0FF]" />}
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
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Saves <strong>{costSavings.savedPercent}%</strong> vs {costSavings.frontierBaselineModel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
