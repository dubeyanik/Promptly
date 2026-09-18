import React from 'react';

export default function MarqueeStrip({
  text = '⚡ REAL-TIME TOKEN COMPRESSION ✦ ZERO LATENCY OVERHEAD ✦ MULTI-PROVIDER FAILOVER ✦ OPTIMIZED FOR EVERY TOKEN ✦ TIKTOKEN PRECISION ✦ DYNAMIC MODEL ROUTER ✦ AUTOMATED REWRITE ✦ 100% CLIENT READY ✦',
  reverse = false,
  className = ''
}) {
  const items = [text, text, text, text];

  return (
    <div className={`relative overflow-hidden w-full border-y border-white/10 bg-[#0E0E0E] py-2.5 select-none ${className}`}>
      {/* Subtle edge fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

      <div className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} whitespace-nowrap`}>
        {items.map((str, idx) => (
          <span
            key={idx}
            className="mx-4 text-xs font-mono tracking-wider text-slate-400 font-medium flex items-center gap-4"
          >
            <span className="text-[#00F0FF] text-glow-cyan font-bold">⚡</span>
            <span>REAL-TIME TOKEN COMPRESSION</span>
            <span className="text-purple-400">✦</span>
            <span>MULTI-PROVIDER FAILOVER</span>
            <span className="text-[#00F0FF]">✱</span>
            <span>ZERO LATENCY ROUTING</span>
            <span className="text-emerald-400">✦</span>
            <span>OPTIMIZED FOR EVERY TOKEN</span>
            <span className="text-[#00F0FF]">↗</span>
            <span>DYNAMIC MODEL ROUTER</span>
            <span className="text-slate-600">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
