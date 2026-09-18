import React from 'react';
import { SAMPLE_PRESETS } from '../mockData';
import { Hash, FileText, DollarSign, RotateCcw, Sparkles } from 'lucide-react';

export default function PromptInput({
  prompt,
  onChangePrompt,
  tokenStats,
  onSelectPreset,
  onClear
}) {
  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-xl">
      {/* Preset Pills */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Hackathon Quick Presets
          </span>
          {prompt && (
            <button
              onClick={onClear}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-cyan-300 border border-dark-750 hover:border-cyan-500/40 transition duration-150 text-left"
              title={preset.tagline}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          placeholder="Paste or write your prompt here... (Try one of the presets above to see automatic token optimization, intent classification, and multi-provider routing)"
          rows={6}
          className="w-full bg-dark-950/80 border border-dark-750 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm font-sans focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition duration-150 resize-y"
        />
      </div>

      {/* Live Stats Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-dark-800/80 text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5 bg-dark-950 px-2.5 py-1 rounded-md border border-dark-800 font-mono">
            <Hash className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">{tokenStats.tokens.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400">tiktoken</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>{tokenStats.chars.toLocaleString()} chars</span>
            <span className="text-dark-600">•</span>
            <span>{tokenStats.words.toLocaleString()} words</span>
          </div>
        </div>

        {/* Real-time Frontier Baseline Cost Estimate */}
        <div className="flex items-center gap-1.5 bg-dark-950/60 px-2.5 py-1 rounded-md border border-dark-800 text-[11px] text-slate-400 font-mono">
          <DollarSign className="w-3 h-3 text-amber-400" />
          <span>Frontier est:</span>
          <span className="text-amber-300 font-semibold">
            ${((tokenStats.tokens / 1_000_000) * 1.5).toFixed(6)}
          </span>
        </div>
      </div>
    </div>
  );
}
