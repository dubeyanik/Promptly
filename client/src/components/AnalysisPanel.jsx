import React from 'react';
import {
  Code,
  Palette,
  FileText,
  HelpCircle,
  Brain,
  Languages,
  Gauge,
  Split,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const INTENT_ICONS = {
  code: { icon: Code, label: 'Code & Dev', color: 'text-[#00F0FF]', bg: 'bg-[#00F0FF]/10 border-[#00F0FF]/30' },
  creative: { icon: Palette, label: 'Creative Writing', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30' },
  summarize: { icon: FileText, label: 'Summarization', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  reasoning: { icon: Brain, label: 'Deep Reasoning', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  translate: { icon: Languages, label: 'Translation', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  qa: { icon: HelpCircle, label: 'Direct Q&A', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' }
};

export default function AnalysisPanel({
  classification,
  forceSplitOverride,
  onToggleSplitOverride
}) {
  if (!classification) return null;

  const {
    intent = 'qa',
    complexity = 1,
    isDivisible = true,
    splitRecommendation = '',
    splitReason = ''
  } = classification;

  const currentIntent = INTENT_ICONS[intent] || INTENT_ICONS.qa;
  const IntentIcon = currentIntent.icon;

  let complexityLabel = 'Low';
  let complexityColor = 'bg-emerald-400';
  if (complexity >= 8) {
    complexityLabel = 'Frontier / Extreme';
    complexityColor = 'bg-purple-500';
  } else if (complexity >= 5) {
    complexityLabel = 'High';
    complexityColor = 'bg-amber-400';
  } else if (complexity >= 3) {
    complexityLabel = 'Moderate';
    complexityColor = 'bg-[#00F0FF]';
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 hover:border-white/20">
      {/* Terminal Window Title Bar */}
      <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
          <span className="ml-2 text-slate-400 font-mono text-[11px]">root@promptly:~# intent_classifier.py</span>
        </div>
        <span className="text-[10px] text-[#00F0FF] font-mono uppercase tracking-wider">
          02 // CLASSIFIER_ACTIVE
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Classified Intent */}
          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Detected Intent
            </span>
            <div className="mt-3 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${currentIntent.bg}`}>
                <IntentIcon className={`w-5 h-5 ${currentIntent.color}`} />
              </div>
              <div>
                <div className="font-sans font-bold text-sm text-[#EDEDED]">{currentIntent.label}</div>
                <div className="text-[11px] text-slate-500 font-mono">key: {intent}</div>
              </div>
            </div>
          </div>

          {/* 2. Complexity Score 1-10 */}
          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Complexity Meter
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#00F0FF] border border-[#00F0FF]/30">
                {complexity} / 10
              </span>
            </div>

            <div className="mt-3">
              <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${complexityColor}`}
                  style={{ width: `${(complexity / 10) * 100}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-mono text-slate-500">
                <span>Tier: <strong className="text-slate-200">{complexityLabel}</strong></span>
                <span>[1=Light, 10=Frontier]</span>
              </div>
            </div>
          </div>

          {/* 3. Divisibility & Splitting Flag */}
          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Divisibility Strategy
              </span>
              <Split className="w-3.5 h-3.5 text-slate-600" />
            </div>

            <div className="mt-3">
              {!isDivisible ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Monolithic Task</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight font-sans">
                    {splitReason}
                  </p>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={forceSplitOverride}
                      onChange={(e) => onToggleSplitOverride(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-[#181818] border-white/20 text-[#00F0FF] focus:ring-0"
                    />
                    <span className="text-[11px] font-mono text-slate-400 hover:text-[#00F0FF] transition">
                      Force split anyway
                    </span>
                  </label>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Divisible Payload</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight font-sans">
                    {splitRecommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
