import React from 'react';
import { History, X, ChevronRight, RotateCcw, Clock, DollarSign, Download } from 'lucide-react';

export default function SessionHistory({
  isOpen,
  onClose,
  history = [],
  onSelectRun,
  onClearHistory
}) {
  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0E0E0E] border-l border-white/10 shadow-2xl z-50 flex flex-col font-mono">
      {/* Header with Terminal Styling */}
      <div className="p-4 border-b border-white/10 bg-[#141414] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="font-bold text-xs text-white uppercase tracking-wider">Session Run History</h3>
          <span className="text-[10px] bg-[#1F1F1F] px-2 py-0.5 rounded-full text-[#00F0FF] border border-white/5">
            {history.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear history"
              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-[#1F1F1F] rounded-full transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1F1F1F] rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-16 text-slate-600 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-700 stroke-1" />
            <span>No previous executions in this session yet. Run a prompt optimization to populate history!</span>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectRun(item)}
              className="bg-[#121212] p-4 rounded-xl border border-white/5 hover:border-[#00F0FF]/40 cursor-pointer transition text-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#00F0FF] text-[11px]">
                  {item.modelUsed?.name || 'Model'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-slate-300 line-clamp-2 text-xs font-sans">
                {item.prompt}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Saved ${item.metrics?.costSaved?.toFixed(5) || '0'}
                </span>
                <span className="text-slate-500 group-hover:text-[#00F0FF] flex items-center gap-0.5 text-[11px] transition">
                  Reload <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cumulative Stats Footer & Export */}
      {history.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-[#121212] text-xs space-y-3">
          <div>
            <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">
              Net Session Token Savings:
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Saved:</span>
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
            className="w-full py-2.5 bg-[#1C1C1C] hover:bg-[#252525] text-slate-200 hover:text-[#00F0FF] rounded-full border border-white/10 font-bold text-xs transition text-center flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Session JSON</span>
          </button>
        </div>
      )}
    </aside>
  );
}
