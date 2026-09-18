import React from 'react';
import { Gauge, Sparkles, Cpu, Split, ArrowUpRight } from 'lucide-react';

export default function FeatureSteps() {
  const steps = [
    {
      step: '01',
      command: 'sys:intent_classifier.sh',
      badge: 'INTENT_SCORER',
      title: 'Real-Time Intent & Complexity',
      description:
        'Instant syntactic evaluation. Detects whether your task requires deep frontier reasoning or lightweight execution, preventing $15/M model overkill.',
      badgeColor: 'text-[#00F0FF] border-[#00F0FF]/30 bg-[#00F0FF]/10',
      icon: Gauge,
      output: 'intent: "code_gen" | complexity: 4/10 | tier: "medium"'
    },
    {
      step: '02',
      command: 'sys:token_compressor.rs',
      badge: 'TOKEN_COMPRESSION',
      title: 'Lossless Semantic Reducer',
      description:
        'Strips conversational fluff, duplicate constraints, and syntactic padding. Shrinks payload size by 30% to 78% while preserving 100% intent.',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      icon: Sparkles,
      output: 'tokens: 1,480 -> 420 | saved: -71.6% input cost'
    },
    {
      step: '03',
      command: 'sys:model_recommender.py',
      badge: 'DYNAMIC_ROUTER',
      title: 'Matrix Cost Matchmaker',
      description:
        'Evaluates real-time token pricing across Small, Medium, Large, and Frontier tiers to find the Pareto-optimal price-to-accuracy sweet spot.',
      badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      icon: Cpu,
      output: 'matched: Llama-3.3-70b | baseline: DeepSeek V4 | -92% cost'
    },
    {
      step: '04',
      command: 'sys:parallel_dispatch.go',
      badge: 'FAILOVER_DISPATCH',
      title: 'Parallel Split & 429 Failover',
      description:
        'Splits oversized prompts along natural boundary lines across multiple providers with zero downtime auto-failover during HTTP 429 quota exhaustion.',
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      icon: Split,
      output: 'failover: openrouter -> groq -> huggingface -> ready'
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 border-b border-white/5 relative">
      {/* Scattered background accents */}
      <div className="absolute top-12 left-10 text-slate-800 select-none pointer-events-none text-3xl font-mono">
        ✦
      </div>
      <div className="absolute bottom-12 right-12 text-[#00F0FF]/10 select-none pointer-events-none text-4xl font-mono">
        ✱
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#00F0FF] uppercase tracking-widest mb-2">
              <span>02 // ARCHITECTURE</span>
              <span>✦</span>
              <span>4-STAGE PIPELINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight uppercase text-white">
              HOW PROMPTLY <span className="text-[#00F0FF]">CRUSHES COSTS</span>
            </h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-md">
            Every prompt flows through our four-stage optimization matrix before single or parallel multi-provider dispatch.
          </p>
        </div>

        {/* Feature Cards Grid (Styled as Terminal Windows with Hover-Expand) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative bg-[#111111] hover:bg-[#141414] border border-white/10 hover:border-[#00F0FF]/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_30px_-5px_rgba(0,240,255,0.2)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Terminal Header */}
                <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="terminal-dot-red" />
                    <span className="terminal-dot-yellow" />
                    <span className="terminal-dot-green" />
                    <span className="ml-2 text-slate-400 font-mono text-[11px]">{item.command}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${item.badgeColor}`}>
                    [{item.step} // {item.badge}]
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-[#1A1A1A] border border-white/10 text-[#00F0FF] group-hover:scale-110 transition-transform duration-200">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-sans font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans mt-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Terminal Code Output snippet */}
                  <div className="mt-4 bg-[#0A0A0A] p-3 rounded-xl border border-white/5 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      <span className="text-[#00F0FF] font-bold">&gt;</span>
                      <span className="text-slate-400 font-mono truncate">{item.output}</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00F0FF] transition-colors shrink-0 ml-2" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
