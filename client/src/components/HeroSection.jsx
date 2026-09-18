import React from 'react';
import { Terminal, Zap, ArrowDown, ArrowUpRight, Sparkles, Shield, Cpu } from 'lucide-react';

export default function HeroSection({ onScrollToWorkspace }) {
  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-white/5">
      {/* Scattered SVG Background Accents */}
      <div className="absolute top-8 left-8 text-slate-700 select-none pointer-events-none hidden md:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20" />
        </svg>
      </div>
      <div className="absolute top-1/3 right-12 text-[#00F0FF]/20 select-none pointer-events-none text-2xl font-mono">
        ✦
      </div>
      <div className="absolute bottom-12 left-16 text-purple-500/20 select-none pointer-events-none text-3xl font-mono">
        ✱
      </div>
      <div className="absolute bottom-8 right-1/4 text-slate-700 select-none pointer-events-none hidden lg:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        {/* Rotated Sticker Badges Top Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 -rotate-2 hover:rotate-0 transition-transform duration-200 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
            <span>[ ⚡ 78% TOKEN SAVINGS ]</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 rotate-2 hover:rotate-0 transition-transform duration-200">
            <span>✧ ZERO LATENCY OVERHEAD</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#1A1A1A] text-slate-300 border border-white/10 -rotate-1 hover:rotate-0 transition-transform duration-200">
            <span>✱ MULTI-GATEWAY FAILOVER</span>
          </div>
        </div>

        {/* Bold Sans Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight uppercase text-white leading-[1.05] max-w-4xl">
          ONE PROMPT. EVERY AI.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-cyan-200 to-white text-glow-cyan">
            ZERO WASTED TOKENS.
          </span>
        </h1>

        {/* Terminal-Style Code-Line Subtext */}
        <div className="mt-6 max-w-2xl w-full">
          <div className="bg-[#111111] border border-white/10 rounded-full px-5 py-2.5 shadow-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-mono text-slate-300">
            <span className="text-[#00F0FF] font-bold">&gt;</span>
            <span className="text-slate-100 font-semibold">promptly</span>
            <span className="text-slate-400">--compress</span>
            <span className="text-purple-400">--classify-intent</span>
            <span className="text-[#00F0FF]">--auto-route</span>
            <span className="text-emerald-400 hidden sm:inline">--failover=active</span>
            <span className="w-2 h-4 bg-[#00F0FF] inline-block animate-blink ml-1" />
          </div>
        </div>

        {/* Descriptive Monospace / Sans Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl font-sans">
          The intelligent router that classifies prompt intent, shrinks payloads losslessly,
          matches the most cost-effective AI tier, and transparently failovers across providers.
        </p>

        {/* Pill-Shaped CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onScrollToWorkspace}
            className="group px-7 py-3 rounded-full font-mono font-bold text-xs uppercase tracking-wider bg-[#00F0FF] text-black hover:bg-white transition-all duration-200 glow-neon-cyan active:scale-95 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>⚡ Launch Optimizer</span>
            <span className="text-black/60 group-hover:translate-x-0.5 transition-transform">→</span>
          </button>

          <a
            href="#benchmarks"
            className="px-6 py-3 rounded-full font-mono text-xs uppercase tracking-wider bg-[#141414] hover:bg-[#1C1C1C] text-slate-300 hover:text-[#00F0FF] border border-white/10 hover:border-[#00F0FF]/40 transition-all duration-200 flex items-center gap-2"
          >
            <span>02 // Cost Matrix</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </a>

          <a
            href="#features"
            className="px-6 py-3 rounded-full font-mono text-xs uppercase tracking-wider bg-[#141414] hover:bg-[#1C1C1C] text-slate-300 hover:text-purple-300 border border-white/10 hover:border-purple-500/40 transition-all duration-200 flex items-center gap-2"
          >
            <span>03 // How It Works</span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>

        {/* Terminal Window Teaser */}
        <div className="mt-12 w-full max-w-3xl rounded-2xl bg-[#111111] border border-white/10 shadow-2xl overflow-hidden text-left">
          {/* Terminal Window Top Bar */}
          <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="terminal-dot-red" />
              <span className="terminal-dot-yellow" />
              <span className="terminal-dot-green" />
              <span className="ml-2 text-slate-400 font-mono text-[11px]">root@promptly:~# pipeline_benchmark.sh</span>
            </div>
            <div className="text-[11px] text-[#00F0FF] font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
              <span>LIVE DEMO READY</span>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-4 sm:p-5 font-mono text-xs space-y-2 text-slate-300 leading-relaxed bg-[#0D0D0D]">
            <div className="flex items-center justify-between text-slate-500 text-[11px] border-b border-white/5 pb-2">
              <span>[SYSTEM_INITIALIZE] MULTI_GATEWAY_ROUTER_V1</span>
              <span>GATEWAYS: 4 ONLINE</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-[#141414] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Input Tokens</div>
                <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">1,248 tok</div>
                <div className="text-[10px] text-slate-500 font-mono">Frontier: $0.00187</div>
              </div>

              <div className="bg-[#141414] p-2.5 rounded-lg border border-[#00F0FF]/30">
                <div className="text-[10px] text-[#00F0FF] uppercase font-mono font-semibold">Optimized</div>
                <div className="text-sm font-bold text-[#00F0FF] font-mono mt-0.5">384 tok (-69%)</div>
                <div className="text-[10px] text-[#00F0FF]/70 font-mono">Lossless Compress</div>
              </div>

              <div className="bg-[#141414] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Router Match</div>
                <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">Llama 3.3 70B</div>
                <div className="text-[10px] text-slate-500 font-mono">Medium Tier ($0.12/M)</div>
              </div>

              <div className="bg-[#141414] p-2.5 rounded-lg border border-emerald-500/30">
                <div className="text-[10px] text-emerald-400 uppercase font-mono font-semibold">Total Savings</div>
                <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">93.6% Saved</div>
                <div className="text-[10px] text-emerald-400/70 font-mono">vs Frontier Model</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
