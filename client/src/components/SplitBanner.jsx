import React, { useState } from 'react';
import { Split, ChevronDown, ChevronUp, Layers, Cpu, ArrowRight } from 'lucide-react';

export default function SplitBanner({
  splitData,
  providerCount = 2,
  isSplitEnabled,
  onToggleSplit
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!splitData || !splitData.shouldSplit) return null;

  const { totalChunks = 1, chunks = [] } = splitData;

  return (
    <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-dark-900 border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Banner Headline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Split className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Oversized Boundary Splitting Active
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Parallel Pipeline
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-100 mt-0.5">
              ⚡ Split into <span className="text-cyan-400 font-bold">{totalChunks} parts</span> across{' '}
              <span className="text-indigo-400 font-bold">{providerCount} providers</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
            <input
              type="checkbox"
              checked={isSplitEnabled}
              onChange={(e) => onToggleSplit(e.target.checked)}
              className="w-4 h-4 rounded bg-dark-800 border-dark-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-slate-300">Enable chunking</span>
          </label>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 bg-dark-950 rounded border border-cyan-500/20 transition"
          >
            <span>{isExpanded ? 'Hide Chunks' : 'View Chunks'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Chunk Details */}
      {isExpanded && isSplitEnabled && (
        <div className="mt-4 pt-3 border-t border-cyan-500/20 space-y-2">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
            Chunk Partitions & Routing Preview:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {chunks.map((chunk, idx) => (
              <div
                key={idx}
                className="bg-dark-950/80 p-3 rounded-xl border border-dark-800 text-xs font-mono flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-cyan-400">
                    {chunk.title}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {chunk.tokens} tokens
                  </span>
                </div>
                <p className="text-slate-400 line-clamp-2 text-[11px] font-sans">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
