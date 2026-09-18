import React, { useState } from 'react';
import { Check, Copy, Clock, Hash, DollarSign, TrendingDown, Layers, Terminal } from 'lucide-react';

export default function OutputPanel({ executionResult }) {
  const [copied, setCopied] = useState(false);

  if (!executionResult) return null;

  const {
    finalOutput = '',
    modelUsed = {},
    metrics = {},
    providersUsed = [],
    frontierBenchmark = 'DeepSeek V4',
    aggregation = {}
  } = executionResult;

  const handleCopy = () => {
    navigator.clipboard.writeText(finalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-4 transition-all duration-200">
      {/* Terminal Window Title Bar */}
      <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
          <span className="ml-2 text-slate-400 font-mono text-[11px]">root@promptly:~# stdout_buffer.log</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            COMPLETION SUCCESS
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0 space-y-4">
        {/* Header & Stats Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              07 // PIPELINE COMPLETION RESULT
            </h3>
            <span className="text-xs font-mono text-[#00F0FF] font-bold bg-[#00F0FF]/10 px-2.5 py-0.5 rounded-full border border-[#00F0FF]/30">
              {modelUsed.name || 'Model'}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#161616] hover:bg-[#222222] text-slate-300 hover:text-[#00F0FF] rounded-full text-xs font-mono border border-white/10 transition self-start sm:self-auto active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Output'}</span>
          </button>
        </div>

        {/* Metrics Row (Cost, Savings, Tokens, Latency) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Actual Cost */}
          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 font-mono">
            <div className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#00F0FF]" /> Actual Cost
            </div>
            <div className="text-base font-bold text-white mt-1">
              ${metrics.actualCost?.toFixed(6) ?? '0.000000'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ${modelUsed.price_in}/${modelUsed.price_out} /M
            </div>
          </div>

          {/* Cost Saved vs Largest Frontier */}
          <div className="bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/30 font-mono">
            <div className="text-[10px] uppercase text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingDown className="w-3 h-3 text-emerald-400" /> Saved vs Frontier
            </div>
            <div className="text-base font-bold text-emerald-300 mt-1">
              ${metrics.costSaved?.toFixed(6) ?? '0.000000'}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5 font-bold">
              {metrics.percentSaved ?? 0}% cheaper vs {frontierBenchmark}
            </div>
          </div>

          {/* Total Tokens Used */}
          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 font-mono">
            <div className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
              <Hash className="w-3 h-3 text-indigo-400" /> Total Tokens
            </div>
            <div className="text-base font-bold text-white mt-1">
              {(metrics.totalTokens ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              In: {metrics.totalTokensIn ?? 0} • Out: {metrics.totalTokensOut ?? 0}
            </div>
          </div>

          {/* Latency */}
          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 font-mono">
            <div className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-400" /> Latency
            </div>
            <div className="text-base font-bold text-white mt-1">
              {metrics.totalLatencyMs ?? 0} ms
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {providersUsed.length} gateway{providersUsed.length > 1 ? 's' : ''} routed
            </div>
          </div>
        </div>

        {/* Provider Trace & Aggregator note */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-[#0A0A0A] p-3 rounded-xl border border-white/5 font-mono">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Gateways Routed:</span>
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
              merger: {aggregation.mergerMethod}
            </span>
          )}
        </div>

        {/* Output Content */}
        <div className="bg-[#080808] rounded-xl p-4 sm:p-5 border border-white/5 font-sans text-sm leading-relaxed text-[#EDEDED] whitespace-pre-wrap select-text">
          {finalOutput}
        </div>
      </div>
    </div>
  );
}
