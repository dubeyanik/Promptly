import React, { useState } from 'react';
import { Check, Copy, Clock, Hash, DollarSign, TrendingDown, Layers, Terminal, AlertCircle, Sparkles } from 'lucide-react';

export default function OutputPanel({ executionResult, showAdvanced = false }) {
  const [copied, setCopied] = useState(false);

  if (!executionResult) return null;

  const {
    finalOutput = '',
    modelUsed = {},
    metrics = {},
    providersUsed = [],
    frontierBenchmark = 'Frontier Baseline',
    aggregation = {},
    plainEnglishSummary = '',
    fallbackNotes = []
  } = executionResult;

  const handleCopy = () => {
    navigator.clipboard.writeText(finalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build default summary line if not directly provided
  const summaryLine =
    plainEnglishSummary ||
    `Used ${modelUsed.name || 'Model'} — saved ${metrics.percentSaved ?? 0}% tokens vs ${frontierBenchmark}`;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-200">
      {/* Terminal Window Title Bar */}
      <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
          <span className="ml-2 text-slate-400 font-mono text-[11px]">root@promptly:~# result.txt</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#222222] hover:bg-[#2A2A2A] text-slate-300 hover:text-[#00F0FF] rounded-full text-xs font-mono border border-white/10 transition active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Output'}</span>
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* ONE PLAIN-ENGLISH SUMMARY LINE (Always visible) */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#00F0FF]/30 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide">
                {summaryLine}
              </div>
            </div>
          </div>
        </div>

        {/* Clean Output Content Box */}
        <div className="bg-[#080808] rounded-xl p-5 border border-white/5 font-sans text-sm leading-relaxed text-[#EDEDED] whitespace-pre-wrap select-text">
          {finalOutput}
        </div>

        {/* ADVANCED TECHNICAL BREAKDOWN (Rendered ONLY in Advanced view) */}
        {showAdvanced && (
          <div className="pt-4 border-t border-white/10 space-y-4 animate-fadeIn">
            {/* Fallback Note (Advanced Only) */}
            {fallbackNotes && fallbackNotes.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2 text-xs font-mono text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold">Provider Fallback Event: </span>
                  {fallbackNotes.join(' • ')}
                </div>
              </div>
            )}

            {/* Metrics Row (Actual Cost, Saved, Total Tokens, Latency) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 font-mono">
                <div className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-[#00F0FF]" /> Actual Cost
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  ${metrics.actualCost?.toFixed(6) ?? '0.000000'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  ${modelUsed.price_in}/${modelUsed.price_out} /M
                </div>
              </div>

              <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30 font-mono">
                <div className="text-[10px] uppercase text-emerald-400 flex items-center gap-1 font-semibold">
                  <TrendingDown className="w-3 h-3 text-emerald-400" /> Cost Saved
                </div>
                <div className="text-sm font-bold text-emerald-300 mt-1">
                  ${metrics.costSaved?.toFixed(6) ?? '0.000000'}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5 font-bold">
                  {metrics.percentSaved ?? 0}% vs {frontierBenchmark}
                </div>
              </div>

              <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 font-mono">
                <div className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-indigo-400" /> Total Tokens
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  {(metrics.totalTokens ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  In: {metrics.totalTokensIn ?? 0} • Out: {metrics.totalTokensOut ?? 0}
                </div>
              </div>

              <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 font-mono">
                <div className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-400" /> Latency
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  {metrics.totalLatencyMs ?? 0} ms
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {providersUsed.length} gateway{providersUsed.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Provider Routing Trace */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-[#0A0A0A] p-3 rounded-xl border border-white/5 font-mono">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Gateway Trace:</span>
                <div className="flex items-center gap-1.5">
                  {providersUsed.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-[#181818] border border-white/10 text-[#00F0FF] text-[11px] font-semibold"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {aggregation.mergerMethod && (
                <span className="text-[11px] text-slate-500">
                  Aggregation: {aggregation.mergerMethod}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
