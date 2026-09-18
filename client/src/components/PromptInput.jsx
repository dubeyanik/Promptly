import React from 'react';
import { SAMPLE_PRESETS } from '../mockData';
import { Hash, FileText, DollarSign, RotateCcw, Sparkles, Terminal } from 'lucide-react';

export default function PromptInput({
  prompt,
  onChangePrompt,
  tokenStats,
  onSelectPreset,
  onClear
}) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 hover:border-white/20">
      {/* Terminal Window Title Bar */}
      <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
          <span className="ml-2 text-slate-400 font-mono text-[11px]">root@promptly:~# input_stream.sh</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#00F0FF] font-mono uppercase tracking-wider hidden sm:inline">
            [BUFFER READY]
          </span>
          {prompt && (
            <button
              onClick={onClear}
              className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 hover:text-white bg-[#1F1F1F] hover:bg-[#2A2A2A] border border-white/5 transition flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Preset Pills */}
        <div>
          <div className="flex items-center justify-between mb-2 font-mono text-xs text-slate-400">
            <span className="flex items-center gap-1.5 uppercase tracking-wider font-semibold text-[11px] text-[#00F0FF]">
              <Sparkles className="w-3.5 h-3.5" /> 01 // QUICK TEST PRESETS
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-[#161616] hover:bg-[#202020] text-slate-300 hover:text-[#00F0FF] border border-white/10 hover:border-[#00F0FF]/40 transition duration-150 text-left active:scale-95"
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
            placeholder="Enter or paste your prompt payload here... (Select a preset above to test instant token optimization, intent classification, and multi-model routing)"
            rows={5}
            className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3.5 text-[#EDEDED] placeholder-slate-600 text-sm font-sans focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition duration-150 resize-y leading-relaxed font-normal"
          />
        </div>

        {/* Live Stats Footer (Pill badges & Monospace counts) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Tiktoken Counter */}
            <div className="flex items-center gap-1.5 bg-[#080808] px-3 py-1 rounded-full border border-[#00F0FF]/30 text-[#00F0FF] font-mono">
              <Hash className="w-3 h-3 text-[#00F0FF]" />
              <span className="font-bold">{tokenStats.tokens.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">tiktoken</span>
            </div>

            {/* Chars & Words */}
            <div className="flex items-center gap-1.5 bg-[#141414] px-3 py-1 rounded-full border border-white/5 text-slate-400 text-[11px]">
              <FileText className="w-3 h-3 text-slate-500" />
              <span>{tokenStats.chars.toLocaleString()} chars</span>
              <span className="text-slate-600">•</span>
              <span>{tokenStats.words.toLocaleString()} words</span>
            </div>
          </div>

          {/* Frontier Baseline Cost Estimate */}
          <div className="flex items-center gap-1.5 bg-[#141414] px-3 py-1 rounded-full border border-white/10 text-[11px] text-slate-300">
            <DollarSign className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Frontier Baseline:</span>
            <span className="text-amber-300 font-bold">
              ${((tokenStats.tokens / 1_000_000) * 1.5).toFixed(6)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
