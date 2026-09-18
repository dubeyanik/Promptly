import React, { useState } from 'react';
import { Key, RefreshCw, Layers, Zap, Sparkles, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Header({
  quotas,
  onResetQuotas,
  onSimulate429,
  onOpenSettings,
  isDemoMode,
  onToggleDemoMode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const providerList = [
    { id: 'openrouter', name: 'OpenRouter', color: 'bg-[#00F0FF]' },
    { id: 'huggingface', name: 'Hugging Face', color: 'bg-amber-400' },
    { id: 'groq', name: 'Groq', color: 'bg-emerald-400' },
    { id: 'together', name: 'Together', color: 'bg-purple-400' }
  ];

  const navLinks = [
    { num: '01', label: 'APP', href: '#workspace' },
    { num: '02', label: 'PIPELINE', href: '#features' },
    { num: '03', label: 'MATRIX', href: '#benchmarks' },
    { num: '04', label: 'FAQ', href: '#faq' }
  ];

  return (
    <header className="border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Monospace Bracketed Tag */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#00F0FF] p-[1px] flex items-center justify-center glow-neon-cyan-sm">
              <div className="w-full h-full bg-[#0A0A0A] rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#00F0FF] fill-[#00F0FF]/30 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-black tracking-tight text-lg text-white group-hover:text-[#00F0FF] transition-colors">
                  PROMPTLY
                </span>
                <span className="font-mono text-[10px] text-[#00F0FF] font-bold px-1.5 py-0.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 -rotate-2">
                  v1.0
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Numbered Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          {navLinks.map((link) => (
            <a
              key={link.num}
              href={link.href}
              className="px-3 py-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
            >
              <span className="text-[#00F0FF] font-bold text-[11px]">{link.num} //</span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Right Controls: Quotas & Pill CTA Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Provider Quota Terminal Monitor (Desktop) */}
          <div className="hidden xl:flex items-center gap-1.5 bg-[#121212] p-1 rounded-full border border-white/10 font-mono">
            <span className="text-[10px] text-slate-400 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#00F0FF]" /> GATEWAYS:
            </span>
            {providerList.map((p) => {
              const q = quotas?.[p.id];
              const pct = q?.requests_remaining_pct ?? 100;
              const isExhausted = q?.is_exhausted;

              return (
                <div
                  key={p.id}
                  title={`${p.name}: ${q?.requests_remaining ?? 0}/${q?.requests_limit ?? 0} remaining`}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${
                    isExhausted
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-[#181818] text-slate-300 border-white/5'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isExhausted ? 'bg-red-400 animate-ping' : p.color}`} />
                  <span className="font-semibold">{p.name.slice(0, 4)}</span>
                  <span className="text-slate-500">{isExhausted ? '429' : `${pct}%`}</span>
                </div>
              );
            })}
            <button
              onClick={() => onSimulate429('openrouter')}
              title="Simulate 429 Rate Limit on OpenRouter"
              className="px-2 py-0.5 text-[10px] font-mono text-amber-400 hover:text-black hover:bg-amber-400 rounded-full border border-amber-500/40 transition"
            >
              Sim 429
            </button>
            <button
              onClick={onResetQuotas}
              title="Reset Quotas"
              className="p-1 text-slate-400 hover:text-[#00F0FF] rounded-full transition"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Demo Mode Pill */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition ${
              isDemoMode
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25'
                : 'bg-[#141414] text-slate-400 border-white/10 hover:border-white/20'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">{isDemoMode ? 'Demo Mode' : 'Live API'}</span>
          </button>

          {/* Pill CTA Button for API Keys */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-[#00F0FF] text-black hover:bg-white transition-all duration-200 glow-neon-cyan-sm active:scale-95"
          >
            <Key className="w-3.5 h-3.5 fill-black" />
            <span>API Keys</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-slate-400 hover:text-white rounded-lg hover:bg-[#141414]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Numbered Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0E0E0E] px-4 py-4 space-y-3 font-mono text-xs">
          {navLinks.map((link) => (
            <a
              key={link.num}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-[#00F0FF]"
            >
              <span>
                <span className="text-[#00F0FF] font-bold mr-2">{link.num} //</span>
                {link.label}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
            </a>
          ))}

          {/* Mobile Gateways Status */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] text-slate-500 uppercase mb-2">Gateways Status</div>
            <div className="grid grid-cols-2 gap-2">
              {providerList.map((p) => {
                const q = quotas?.[p.id];
                const pct = q?.requests_remaining_pct ?? 100;
                const isExhausted = q?.is_exhausted;
                return (
                  <div
                    key={p.id}
                    className="p-2 rounded bg-[#141414] border border-white/5 flex items-center justify-between"
                  >
                    <span className="text-slate-300">{p.name}</span>
                    <span className={`text-[10px] ${isExhausted ? 'text-red-400' : 'text-[#00F0FF]'}`}>
                      {isExhausted ? '429' : `${pct}%`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => onSimulate429('openrouter')}
                className="flex-1 py-1 text-center text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded"
              >
                Simulate 429 Failover
              </button>
              <button
                onClick={onResetQuotas}
                className="py-1 px-3 text-center text-[10px] font-mono text-slate-300 bg-[#1A1A1A] border border-white/10 rounded"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
