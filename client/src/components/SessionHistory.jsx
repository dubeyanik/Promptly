import React from 'react';
import { History, X, ChevronRight, RotateCcw, Clock, DollarSign, Sparkles } from 'lucide-react';

export default function SessionHistory({
  isOpen,
  onClose,
  history = [],
  onSelectRun,
  onClearHistory
}) {
  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 w-full sm:w-96 bg-dark-900 border-l border-dark-800 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-sm text-slate-200">Session History</h3>
          <span className="text-xs font-mono bg-dark-800 px-2 py-0.5 rounded text-slate-400">
            {history.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear history"
              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-dark-800 rounded transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-dark-800 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-1" />
            No previous prompts in this session yet. Run an optimization to track stats!
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectRun(item)}
              className="bg-dark-950 p-3.5 rounded-xl border border-dark-800 hover:border-cyan-500/40 cursor-pointer transition text-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-400 font-mono text-[11px]">
                  {item.modelUsed?.name || 'Model'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-slate-300 line-clamp-2 text-xs font-sans">
                {item.prompt}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-dark-850 text-[11px] font-mono">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Saved ${item.metrics?.costSaved?.toFixed(5) || '0'}
                </span>
                <span className="text-slate-400 group-hover:text-cyan-400 flex items-center gap-0.5 font-sans text-[11px] transition">
                  Reload <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cumulative Stats Footer & Export */}
      {history.length > 0 && (
        <div className="p-4 border-t border-dark-800 bg-dark-950/60 text-xs space-y-3">
          <div>
            <div className="text-slate-400 text-[11px] font-medium uppercase mb-1">
              Total Session Savings:
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-300">Net Cost Saved:</span>
              <span className="text-emerald-400 font-bold text-sm">
                $
                {history
                  .reduce((acc, h) => acc + (h.metrics?.costSaved || 0), 0)
                  .toFixed(5)}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `promptly_session_report_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="w-full py-2 bg-dark-850 hover:bg-dark-800 text-slate-200 hover:text-cyan-300 rounded-lg border border-dark-750 font-medium text-xs transition text-center"
          >
            📥 Export Benchmark Report (.json)
          </button>
        </div>
      )}
    </aside>
  );
}
