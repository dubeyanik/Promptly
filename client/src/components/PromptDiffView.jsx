import React, { useState } from 'react';
import { ArrowRight, Copy, Check, Sparkles } from 'lucide-react';

export default function PromptDiffView({
  rewriteData,
  useOptimized,
  onToggleUseOptimized,
  isLoadingRewrite
}) {
  const [copied, setCopied] = useState(false);

  if (isLoadingRewrite) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-pulse">
        <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center gap-2 text-xs font-mono">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
          <span className="ml-2 text-[#00F0FF]">root@promptly:~# compressing_payload...</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="h-4 bg-[#1A1A1A] rounded-full w-1/3" />
          <div className="h-20 bg-[#0A0A0A] rounded-xl" />
        </div>
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
    <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 hover:border-white/20">
      {/* Terminal Window Title Bar */}
      <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
          <span className="ml-2 text-slate-400 font-mono text-[11px]">root@promptly:~# prompt_rewriter.diff</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-500">engine: {providerUsed}</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Header & Token Reduction Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              04 // TOKEN REDUCTION DIFF
            </h3>
          </div>

          {/* Token Savings Badge & Copy Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <span>-{reductionPercent}% TOKENS</span>
              <span className="text-slate-500 font-normal">
                ({originalTokens} → {optimizedTokens})
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#161616] hover:bg-[#202020] text-slate-300 hover:text-[#00F0FF] border border-white/10 transition"
              title="Copy optimized prompt"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Diff View Box */}
        <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/5 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs font-mono">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useOptimized}
              onChange={(e) => onToggleUseOptimized(e.target.checked)}
              className="w-4 h-4 rounded bg-[#181818] border-white/20 text-[#00F0FF] focus:ring-0"
            />
            <span className="text-slate-200 font-medium">
              Dispatch with compressed prompt <span className="text-[#00F0FF]">(-{reductionPercent}% payload cost)</span>
            </span>
          </label>

          <div className="text-[11px] text-slate-500 font-mono">
            Trimmed {tokensSaved} input tokens
          </div>
        </div>
      </div>
    </div>
  );
}
