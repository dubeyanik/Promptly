import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Terminal } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      num: '01',
      question: 'HOW DOES TOKEN REDUCTION WORK WITHOUT LOSING INTENT?',
      answer:
        'Promptly uses algorithmic token trimming that strips conversational filler, excessive polite phrasing, redundant constraints, and syntactic padding. The optimizer preserves variables, schemas, critical instructions, and system contexts with zero loss of task semantics.'
    },
    {
      num: '02',
      question: 'CAN I PLUG IN MY PRIVATE API KEYS SECURELY?',
      answer:
        'Absolutely. You can add your OpenRouter, Hugging Face, Groq, and Together AI API keys in the API Keys modal. Keys are saved locally in your browser’s localStorage and transmitted only via runtime request headers. They are never written to any database.'
    },
    {
      num: '03',
      question: 'HOW DOES PARALLEL BOUNDARY CHUNKING WORK?',
      answer:
        'When prompts exceed optimal token boundaries and contain divisible sub-tasks (e.g. multi-step data extractions, code reviews, batch evaluations), Promptly divides the payload into discrete chunks and dispatches them across providers in parallel, stitching the final output seamlessly.'
    },
    {
      num: '04',
      question: 'WHAT HAPPENS DURING AN HTTP 429 RATE LIMIT SPIKE?',
      answer:
        'Promptly tracks provider quota exhaustion in real time. If OpenRouter or any primary gateway hits a rate limit (HTTP 429), our intelligent dispatcher instantly reroutes the payload to fallback providers like Hugging Face or Groq without failing the user request.'
    },
    {
      num: '05',
      question: 'WHAT IS DEMO MODE VS LIVE API MODE?',
      answer:
        'Demo Mode provides instant simulated multi-provider completions and live cost-comparison calculations with zero API cost—ideal for judges and fast local testing. You can switch to Live API Mode at any time in the header or settings.'
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-24 border-b border-white/5 relative">
      {/* Scattered background accents */}
      <div className="absolute top-1/4 right-8 text-slate-800 select-none pointer-events-none text-2xl font-mono">
        ✦
      </div>
      <div className="absolute bottom-1/4 left-8 text-purple-500/20 select-none pointer-events-none text-3xl font-mono">
        ✱
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-[#00F0FF] uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20">
            <span>04 // KNOWLEDGE BASE</span>
            <span>✦</span>
            <span>FAQS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight uppercase text-white">
            FREQUENTLY ASKED <span className="text-[#00F0FF]">QUESTIONS</span>
          </h2>
          <p className="mt-3 text-slate-400 text-xs sm:text-sm font-sans max-w-lg mx-auto">
            Everything you need to know about Promptly’s routing pipeline, token reduction, and multi-provider failover.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.num}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#121212] border-[#00F0FF]/40 shadow-[0_0_20px_-5px_rgba(0,240,255,0.15)]'
                    : 'bg-[#0E0E0E] border-white/10 hover:border-white/20'
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#00F0FF] shrink-0">
                      {faq.num} //
                    </span>
                    <span className="font-sans font-bold text-sm sm:text-base text-slate-200">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                      isOpen
                        ? 'bg-[#00F0FF] text-black border-[#00F0FF] rotate-180'
                        : 'bg-[#1A1A1A] text-slate-400 border-white/10'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 font-sans text-xs sm:text-sm text-slate-400 leading-relaxed">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
