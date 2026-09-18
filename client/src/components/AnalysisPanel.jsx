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
  code: { icon: Code, label: 'Code & Dev', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
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

  // Complexity level label
  let complexityLabel = 'Low';
  let complexityColor = 'bg-emerald-500';
  if (complexity >= 8) {
    complexityLabel = 'Frontier / Extreme';
    complexityColor = 'bg-purple-500';
  } else if (complexity >= 5) {
    complexityLabel = 'High';
    complexityColor = 'bg-amber-500';
  } else if (complexity >= 3) {
    complexityLabel = 'Moderate';
    complexityColor = 'bg-cyan-500';
  }

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-xl">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Gauge className="w-4 h-4 text-cyan-400" /> Automated Intent & Complexity Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Classified Intent */}
        <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Detected Intent
          </span>
          <div className="mt-2 flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${currentIntent.bg}`}>
              <IntentIcon className={`w-5 h-5 ${currentIntent.color}`} />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-100">{currentIntent.label}</div>
              <div className="text-[11px] text-slate-400 capitalize">Intent key: {intent}</div>
            </div>
          </div>
        </div>

        {/* 2. Complexity Score 1-10 */}
        <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Complexity Score
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-dark-850 text-slate-200 border border-dark-750">
              {complexity} / 10
            </span>
          </div>

          <div className="mt-3">
            <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${complexityColor}`}
                style={{ width: `${(complexity / 10) * 100}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
              <span>Level: <strong className="text-slate-200">{complexityLabel}</strong></span>
              <span>1 = Simple, 10 = Frontier</span>
            </div>
          </div>
        </div>

        {/* 3. Divisibility & Splitting Flag */}
        <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Divisibility Strategy
            </span>
            <Split className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="mt-2">
            {!isDivisible ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Not recommended to split</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {splitReason}
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={forceSplitOverride}
                    onChange={(e) => onToggleSplitOverride(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-dark-800 border-dark-700 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-300 hover:text-cyan-400 transition">
                    Force split override anyway
                  </span>
                </label>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Divisible Task</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  {splitRecommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
