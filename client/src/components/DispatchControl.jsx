import React, { useState, useEffect } from 'react';
import { Play, Loader2, ArrowRight, Zap, Sparkles } from 'lucide-react';

const LOADING_MESSAGES = [
  'Optimizing prompt...',
  'Picking the right model...',
  'Running...'
];

export default function DispatchControl({
  onDispatch,
  isDispatching,
  hasPrompt,
  selectedModel,
  useOptimized,
  isSplitEnabled,
  totalChunks,
  showAdvanced = false
}) {
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!isDispatching) {
      setLoadingMsgIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 700);

    return () => clearInterval(interval);
  }, [isDispatching]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Advanced Breadcrumbs (Rendered ONLY in Advanced view) */}
      {showAdvanced && (
        <div className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-slate-300 font-bold">ROUTE:</span>
            <span className="px-2 py-0.5 rounded-full bg-[#0A0A0A] text-[#00F0FF] border border-white/5">
              {useOptimized ? 'Compressed' : 'Original'}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded-full bg-[#0A0A0A] text-purple-300 border border-white/5">
              {selectedModel?.name || 'Auto Match'}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded-full bg-[#0A0A0A] text-emerald-400 border border-white/5">
              {isSplitEnabled && totalChunks > 1 ? `${totalChunks} Chunks` : 'Direct'}
            </span>
          </div>
        </div>
      )}

      {/* Single "Optimize & Run" Button */}
      <button
        onClick={onDispatch}
        disabled={!hasPrompt || isDispatching}
        className={`w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-full font-mono font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
          !hasPrompt || isDispatching
            ? 'bg-[#181818] text-slate-600 cursor-not-allowed border border-white/5'
            : 'bg-[#00F0FF] hover:bg-white text-black glow-neon-cyan active:scale-95 cursor-pointer'
        }`}
      >
        {isDispatching ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span className="text-black font-bold">
              {LOADING_MESSAGES[loadingMsgIdx]}
            </span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-black" />
            <span>Optimize & Run</span>
            <span className="text-black/60">→</span>
          </>
        )}
      </button>
    </div>
  );
}
