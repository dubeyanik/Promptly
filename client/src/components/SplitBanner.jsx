import React, { useState } from 'react';
import { Split, ChevronDown, ChevronUp, Layers, Cpu } from 'lucide-react';

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
    <div className="bg-[#111111] border border-[#00F0FF]/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-200">
      {/* Terminal Window Title Bar */}
      <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
          <span className="ml-2 text-[#00F0FF] font-mono text-[11px]">root@promptly:~# chunk_partitioner.sh</span>
        </div>
        <span className="text-[10px] text-purple-400 font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30">
          PARALLEL PIPELINE
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Banner Headline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center shrink-0">
              <Split className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00F0FF]">
                  05 // OVERSIZED BOUNDARY PARTITIONING
                </span>
              </div>
              <div className="text-sm font-sans font-bold text-white mt-0.5">
                ⚡ Split into <span className="text-[#00F0FF] font-mono">{totalChunks} parts</span> across{' '}
                <span className="text-purple-400 font-mono">{providerCount} providers</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 self-end sm:self-center font-mono">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={isSplitEnabled}
                onChange={(e) => onToggleSplit(e.target.checked)}
                className="w-4 h-4 rounded bg-[#181818] border-white/20 text-[#00F0FF] focus:ring-0"
              />
              <span className="text-slate-300">Enable chunking</span>
            </label>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-[#00F0FF] px-3 py-1 rounded-full bg-[#181818] hover:bg-[#202020] border border-white/10 transition"
            >
              <span>{isExpanded ? 'Hide Chunks' : 'View Chunks'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Chunk Details */}
        {isExpanded && isSplitEnabled && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
              Chunk Partitions & Routing Preview:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {chunks.map((chunk, idx) => (
                <div
                  key={idx}
                  className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 text-xs font-mono flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#00F0FF]">
                      {chunk.title}
                    </span>
                    <span className="text-slate-500 text-[10px] px-2 py-0.5 rounded-full bg-[#161616]">
                      {chunk.tokens} tok
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
    </div>
  );
}
