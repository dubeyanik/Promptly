import React, { useState } from 'react';
import { ArrowRight, Copy, Check, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function PromptDiffView({
  rewriteData,
  useOptimized,
  onToggleUseOptimized,
  isLoadingRewrite
}) {
  const [copied, setCopied] = useState(false);

  if (isLoadingRewrite) {
    return (
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-xl animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Optimizing Prompt for Token Efficiency...
          </span>
        </div>
        <div className="h-24 bg-dark-950 rounded-xl" />
      </div>
    );
  }

  if (!rewriteData) return null;

  const {
    originalTokens = 0,
    optimizedTokens = 0,
    tokensSaved = 0,
    reductionPercent = 0,
    rewrittenPrompt = '',
    diffParts = [],
    providerUsed = ''
  } = rewriteData;

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-xl">
      {/* Header & Token Reduction Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Token-Optimized Prompt Rewrite
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            via {providerUsed}
          </span>
        </div>

        {/* Token Savings Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <span>-{reductionPercent}% Tokens</span>
            <span className="text-slate-400 text-[11px] font-normal">
              ({originalTokens} → {optimizedTokens})
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-dark-950 hover:bg-dark-850 text-slate-300 hover:text-cyan-400 border border-dark-750 transition"
            title="Copy optimized prompt"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Diff View Box */}
      <div className="bg-dark-950 rounded-xl p-4 border border-dark-800 font-mono text-xs leading-relaxed max-h-60 overflow-y-auto">
        <div className="text-slate-300 whitespace-pre-wrap">
          {diffParts && diffParts.length > 0 ? (
            diffParts.map((part, idx) => {
              if (part.added) {
                return (
                  <span key={idx} className="diff-ins">
                    {part.value}
                  </span>
                );
              }
              if (part.removed) {
                return (
                  <span key={idx} className="diff-del">
                    {part.value}
                  </span>
                );
              }
              return <span key={idx}>{part.value}</span>;
            })
          ) : (
            <span>{rewrittenPrompt}</span>
          )}
        </div>
      </div>

      {/* Toggle: Use Optimized Prompt */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-dark-800/80 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useOptimized}
            onChange={(e) => onToggleUseOptimized(e.target.checked)}
            className="w-4 h-4 rounded bg-dark-800 border-dark-700 text-cyan-500 focus:ring-0"
          />
          <span className="text-slate-200 font-medium">
            Dispatch with token-optimized prompt <span className="text-slate-400 font-normal">(-{reductionPercent}% cheaper payload)</span>
          </span>
        </label>

        <div className="text-[11px] text-slate-500 font-mono">
          Saved {tokensSaved} input tokens
        </div>
      </div>
    </div>
  );
}
