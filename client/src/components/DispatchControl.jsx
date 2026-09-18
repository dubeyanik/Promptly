import React from 'react';
import { Play, Loader2, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';

export default function DispatchControl({
  onDispatch,
  isDispatching,
  dispatchPhase,
  hasPrompt,
  selectedModel,
  useOptimized,
  isSplitEnabled,
  totalChunks
}) {
  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Pipeline Summary Line */}
      <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400">
        <span className="text-slate-300 font-semibold">Active Pipeline:</span>
        <span className="px-2 py-0.5 rounded bg-dark-950 text-cyan-400 border border-dark-800 font-mono">
          {useOptimized ? 'Compressed Prompt' : 'Original Prompt'}
        </span>
        <ArrowRight className="w-3 h-3 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-dark-950 text-indigo-400 border border-dark-800 font-mono">
          {selectedModel?.name || 'Selected Model'}
        </span>
        <ArrowRight className="w-3 h-3 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-dark-950 text-purple-400 border border-dark-800 font-mono">
          {isSplitEnabled && totalChunks > 1 ? `${totalChunks} Parallel Chunks` : 'Direct Dispatch'}
        </span>
      </div>

      {/* Action Button & Status */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {isDispatching && (
          <span className="text-xs text-cyan-400 font-mono animate-pulse flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {dispatchPhase || 'Processing...'}
          </span>
        )}

        <button
          onClick={onDispatch}
          disabled={!hasPrompt || isDispatching}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg transition flex items-center justify-center gap-2 ${
            !hasPrompt || isDispatching
              ? 'bg-dark-800 text-slate-600 cursor-not-allowed border border-dark-750'
              : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.98]'
          }`}
        >
          {isDispatching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Dispatching...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Dispatch & Optimize</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
