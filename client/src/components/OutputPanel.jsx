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
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-dark-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Optimized Execution Output
          </h3>
          <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            {modelUsed.name || 'Model'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-950 hover:bg-dark-850 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-medium border border-dark-750 transition self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy Output'}</span>
        </button>
      </div>

      {/* Metrics Row (Cost, Savings, Tokens, Latency) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Actual Cost */}
        <div className="bg-dark-950 p-3 rounded-xl border border-dark-800 font-mono">
          <div className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-cyan-400" /> Actual Cost
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1">
            ${metrics.actualCost?.toFixed(6) ?? '0.000000'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Model: ${modelUsed.price_in}/${modelUsed.price_out}
          </div>
        </div>

        {/* Cost Saved vs Largest Frontier */}
        <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30 font-mono">
          <div className="text-[10px] uppercase text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingDown className="w-3 h-3 text-emerald-400" /> Saved vs Frontier
          </div>
          <div className="text-sm font-bold text-emerald-300 mt-1">
            ${metrics.costSaved?.toFixed(6) ?? '0.000000'}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5 font-bold">
            {metrics.percentSaved ?? 0}% cheaper than {frontierBenchmark}
          </div>
        </div>

        {/* Total Tokens Used */}
        <div className="bg-dark-950 p-3 rounded-xl border border-dark-800 font-mono">
          <div className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
            <Hash className="w-3 h-3 text-indigo-400" /> Total Tokens
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1">
            {(metrics.totalTokens ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            In: {metrics.totalTokensIn ?? 0} • Out: {metrics.totalTokensOut ?? 0}
          </div>
        </div>

        {/* Latency */}
        <div className="bg-dark-950 p-3 rounded-xl border border-dark-800 font-mono">
          <div className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-400" /> Latency
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1">
            {metrics.totalLatencyMs ?? 0} ms
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {providersUsed.length} provider{providersUsed.length > 1 ? 's' : ''} routed
          </div>
        </div>
      </div>

      {/* Provider Trace & Aggregator note */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-dark-950/60 p-2.5 rounded-lg border border-dark-850">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Routed via:</span>
          <div className="flex items-center gap-1.5">
            {providersUsed.map((p, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-dark-900 border border-dark-750 text-cyan-400 font-mono text-[11px] font-semibold"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {aggregation.mergerMethod && (
          <span className="text-[11px] text-slate-500 font-mono">
            Aggregation: {aggregation.mergerMethod}
          </span>
        )}
      </div>

      {/* Output Content */}
      <div className="bg-dark-950 rounded-xl p-4 border border-dark-800 font-sans text-sm leading-relaxed text-slate-200 whitespace-pre-wrap select-text">
        {finalOutput}
      </div>
    </div>
  );
}
