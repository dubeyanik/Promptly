import React from 'react';
import { Sparkles, Key, RefreshCw, Layers, ShieldCheck, Zap } from 'lucide-react';

export default function Header({
  quotas,
  onResetQuotas,
  onSimulate429,
  onOpenSettings,
  isDemoMode,
  onToggleDemoMode
}) {
  const providerList = [
    { id: 'openrouter', name: 'OpenRouter', color: 'bg-cyan-500' },
    { id: 'huggingface', name: 'Hugging Face', color: 'bg-amber-500' },
    { id: 'groq', name: 'Groq', color: 'bg-emerald-500' },
    { id: 'together', name: 'Together AI', color: 'bg-purple-500' }
  ];

  return (
    <header className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/10">
            <div className="w-full h-full bg-dark-950 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Promptly
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Hackathon MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-tight">
              One Prompt. Every AI. <span className="text-cyan-400 font-semibold">Optimized for Every Token.</span>
            </p>
          </div>
        </div>

        {/* Quota Indicators per Provider & Controls */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Provider Quota Meters */}
          <div className="hidden lg:flex items-center gap-2 bg-dark-950/70 p-1.5 rounded-lg border border-dark-800">
            <span className="text-[11px] font-medium text-slate-400 px-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" /> Quotas:
            </span>
            {providerList.map((p) => {
              const q = quotas?.[p.id];
              const pct = q?.requests_remaining_pct ?? 100;
              const isExhausted = q?.is_exhausted;

              return (
                <div
                  key={p.id}
                  title={`${p.name}: ${q?.requests_remaining ?? 0}/${q?.requests_limit ?? 0} requests remaining (${pct}%)`}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] border ${
                    isExhausted
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-dark-900 text-slate-300 border-dark-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isExhausted ? 'bg-red-400' : p.color}`} />
                  <span className="font-mono text-[10px] font-semibold">{p.name.split(' ')[0]}</span>
                  <span className="text-slate-400 text-[10px] font-mono">{isExhausted ? '429' : `${pct}%`}</span>
                </div>
              );
            })}
            <button
              onClick={() => onSimulate429('openrouter')}
              title="Simulate 429 Rate Limit on OpenRouter (Test auto-failover)"
              className="px-1.5 py-0.5 text-[10px] font-mono text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded border border-amber-500/30 transition"
            >
              Sim 429
            </button>
            <button
              onClick={onResetQuotas}
              title="Reset in-memory quotas"
              className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-dark-800 rounded transition"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Demo Mode Pill */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              isDemoMode
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25'
                : 'bg-dark-900 text-slate-400 border-dark-700 hover:bg-dark-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isDemoMode ? 'Demo Mode Active' : 'Live API Mode'}</span>
          </button>

          {/* API Keys / Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-900 hover:bg-dark-800 text-slate-200 border border-dark-700 hover:border-dark-600 transition"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>API Keys</span>
          </button>
        </div>
      </div>
    </header>
  );
}
