import React, { useState } from 'react';
import { X, Key, Shield, Info, Check, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">API Provider Configuration</h3>
              <p className="text-xs text-slate-400">Manage gateway keys and execution mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-dark-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Demo Mode Toggle Banner */}
          <div className="bg-dark-950 p-3.5 rounded-xl border border-dark-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Simulation / Demo Mode</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Generates realistic responses with zero API costs. Perfect for hackathon judging.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => onToggleDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-dark-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="text-[11px] text-slate-400 flex items-start gap-1.5 bg-dark-950/60 p-2.5 rounded-lg border border-dark-850">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Keys are stored only in your browser session and forwarded securely via backend headers. Never committed to git.
            </span>
          </div>

          {/* OpenRouter Key */}
          <div className="space-y-1">
            <label className="font-medium text-slate-300 flex items-center justify-between">
              <span>OpenRouter API Key (Primary Gateway)</span>
              <span className="text-[10px] text-cyan-400 font-mono">OPENROUTER_API_KEY</span>
            </label>
            <input
              type="password"
              placeholder="sk-or-v1-..."
              value={keys.openrouter || ''}
              onChange={(e) => setKeys({ ...keys, openrouter: e.target.value })}
              className="w-full bg-dark-950 border border-dark-750 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Hugging Face Key */}
          <div className="space-y-1">
            <label className="font-medium text-slate-300 flex items-center justify-between">
              <span>Hugging Face Inference API (Fallback)</span>
              <span className="text-[10px] text-amber-400 font-mono">HF_API_KEY</span>
            </label>
            <input
              type="password"
              placeholder="hf_..."
              value={keys.huggingface || ''}
              onChange={(e) => setKeys({ ...keys, huggingface: e.target.value })}
              className="w-full bg-dark-950 border border-dark-750 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Groq Key */}
          <div className="space-y-1">
            <label className="font-medium text-slate-300 flex items-center justify-between">
              <span>Groq API Key (Optional Fast LPU)</span>
              <span className="text-[10px] text-emerald-400 font-mono">GROQ_API_KEY</span>
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              value={keys.groq || ''}
              onChange={(e) => setKeys({ ...keys, groq: e.target.value })}
              className="w-full bg-dark-950 border border-dark-750 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Together AI Key */}
          <div className="space-y-1">
            <label className="font-medium text-slate-300 flex items-center justify-between">
              <span>Together AI Key (Optional)</span>
              <span className="text-[10px] text-purple-400 font-mono">TOGETHER_API_KEY</span>
            </label>
            <input
              type="password"
              placeholder="together_..."
              value={keys.together || ''}
              onChange={(e) => setKeys({ ...keys, together: e.target.value })}
              className="w-full bg-dark-950 border border-dark-750 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-dark-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {savedMessage ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved!
                </span>
              ) : (
                'Saved locally in browser'
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-dark-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
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
