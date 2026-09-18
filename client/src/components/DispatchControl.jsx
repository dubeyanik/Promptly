import React from 'react';
import { Play, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

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
    <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 hover:border-white/20">
      {/* Terminal Window Title Bar */}
      <div className="bg-[#161616] px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
          <span className="ml-2 text-slate-400 font-mono text-[11px]">root@promptly:~# route_payload.sh</span>
        </div>
        <span className="text-[10px] text-[#00F0FF] font-mono">06 // DISPATCH_READY</span>
      </div>

      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Active Pipeline Breadcrumb Flow */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-300 font-semibold">ROUTE:</span>
          <span className="px-2.5 py-1 rounded-full bg-[#0A0A0A] text-[#00F0FF] border border-white/5">
            {useOptimized ? 'Compressed' : 'Original'}
          </span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2.5 py-1 rounded-full bg-[#0A0A0A] text-purple-300 border border-white/5">
            {selectedModel?.name || 'Selected Model'}
          </span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2.5 py-1 rounded-full bg-[#0A0A0A] text-emerald-400 border border-white/5">
            {isSplitEnabled && totalChunks > 1 ? `${totalChunks} Parallel Chunks` : 'Direct Dispatch'}
          </span>
        </div>

        {/* Action Button & Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isDispatching && (
            <span className="text-xs text-[#00F0FF] font-mono animate-pulse flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {dispatchPhase || 'Processing...'}
            </span>
          )}

          <button
            onClick={onDispatch}
            disabled={!hasPrompt || isDispatching}
            className={`w-full md:w-auto px-7 py-3 rounded-full font-mono font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              !hasPrompt || isDispatching
                ? 'bg-[#181818] text-slate-600 cursor-not-allowed border border-white/5'
                : 'bg-[#00F0FF] hover:bg-white text-black glow-neon-cyan active:scale-95 cursor-pointer'
            }`}
          >
            {isDispatching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Pipeline...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-black" />
                <span>Dispatch & Optimize</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
