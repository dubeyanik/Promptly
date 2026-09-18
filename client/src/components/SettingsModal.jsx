import React, { useState } from 'react';
import { X, Key, Info, Check, Sparkles } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
  isDemoMode,
  onToggleDemoMode
}) {
  const [keys, setKeys] = useState(apiKeys);
  const [savedMessage, setSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKeys(keys);
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-mono max-h-[90vh] flex flex-col">
        {/* Terminal Window Header Bar */}
        <div className="bg-[#161616] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="terminal-dot-red" />
            <span className="terminal-dot-yellow" />
            <span className="terminal-dot-green" />
            <span className="ml-2 text-slate-400 text-[11px]">root@promptly:~# config_gateways.sh</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white rounded-full transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Demo Mode Toggle Banner */}
          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-purple-500/30 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Simulation / Demo Mode</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Generates realistic completions with zero API charges. Ideal for testing and judging.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => onToggleDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#222222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="text-[11px] text-slate-400 flex items-start gap-2 bg-[#0A0A0A] p-3 rounded-xl border border-white/5 font-sans">
            <Info className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
            <span>
              Keys are stored locally in your browser and used to route direct native API calls. Missing keys silently exclude paid models from picker.
            </span>
          </div>

          {/* OpenAI Key */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center justify-between text-[11px]">
              <span>OpenAI API Key (GPT-5 series)</span>
              <span className="text-[#00F0FF]">OPENAI_API_KEY</span>
            </label>
            <input
              type="password"
              placeholder="sk-proj-..."
              value={keys.openai || ''}
              onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]"
            />
          </div>

          {/* Anthropic Key */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center justify-between text-[11px]">
              <span>Anthropic API Key (Claude models)</span>
              <span className="text-purple-400">ANTHROPIC_API_KEY</span>
            </label>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={keys.anthropic || ''}
              onChange={(e) => setKeys({ ...keys, anthropic: e.target.value })}
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Google Gemini Key */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center justify-between text-[11px]">
              <span>Google Gemini API Key</span>
              <span className="text-emerald-400">GOOGLE_API_KEY</span>
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keys.google || ''}
              onChange={(e) => setKeys({ ...keys, google: e.target.value })}
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* OpenRouter Key */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center justify-between text-[11px]">
              <span>OpenRouter API Key (Open/Free Models)</span>
              <span className="text-amber-400">OPENROUTER_API_KEY</span>
            </label>
            <input
              type="password"
              placeholder="sk-or-v1-..."
              value={keys.openrouter || ''}
              onChange={(e) => setKeys({ ...keys, openrouter: e.target.value })}
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Hugging Face Key */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center justify-between text-[11px]">
              <span>Hugging Face API Key (Fallback)</span>
              <span className="text-slate-500">HF_API_KEY</span>
            </label>
            <input
              type="password"
              placeholder="hf_..."
              value={keys.huggingface || ''}
              onChange={(e) => setKeys({ ...keys, huggingface: e.target.value })}
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:border-white/40"
            />
          </div>

          {/* Modal Footer with Pill Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-500">
              {savedMessage ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> Keys Saved!
                </span>
              ) : (
                'Stored in session'
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-[#1C1C1C] transition text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#00F0FF] hover:bg-white text-black font-mono font-bold transition glow-neon-cyan-sm text-xs active:scale-95"
              >
                Save Keys
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
