import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MarqueeStrip from './components/MarqueeStrip';
import FeatureSteps from './components/FeatureSteps';
import FAQSection from './components/FAQSection';
import PromptInput from './components/PromptInput';
import AnalysisPanel from './components/AnalysisPanel';
import ModelRecommender from './components/ModelRecommender';
import PromptDiffView from './components/PromptDiffView';
import SplitBanner from './components/SplitBanner';
import DispatchControl from './components/DispatchControl';
import OutputPanel from './components/OutputPanel';
import CostComparisonTable from './components/CostComparisonTable';
import SessionHistory from './components/SessionHistory';
import SettingsModal from './components/SettingsModal';
import { countTokensClient } from './utils/tokenizer';
import { SAMPLE_PRESETS } from './mockData';
import { History, Zap, Shield, Sparkles, Terminal, ArrowUpRight, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

export default function App() {
  // 1. Core State
  const [prompt, setPrompt] = useState(SAMPLE_PRESETS[0].prompt);
  const [analysis, setAnalysis] = useState(null);
  const [allModels, setAllModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [rewriteData, setRewriteData] = useState(null);
  const [splitData, setSplitData] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [quotas, setQuotas] = useState(null);

  // 2. 3-Way Plain Quality Toggle ("Fastest & Cheapest" / "Balanced" / "Best Quality")
  const [qualityTier, setQualityTier] = useState('medium');

  // 3. Options & Toggles
  const [useOptimized, setUseOptimized] = useState(true);
  const [isSplitEnabled, setIsSplitEnabled] = useState(true);
  const [forceSplitOverride, setForceSplitOverride] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // 4. "Show Advanced" Toggle (persisted via localStorage, hidden by default)
  const [showAdvanced, setShowAdvanced] = useState(() => {
    try {
      return localStorage.getItem('promptly_show_advanced') === 'true';
    } catch {
      return false;
    }
  });

  // 5. UI Flow & Modals
  const [isLoadingRewrite, setIsLoadingRewrite] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchPhase, setDispatchPhase] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);

  // 6. API Keys from localStorage
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('promptly_api_keys');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleAdvanced = () => {
    setShowAdvanced((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('promptly_show_advanced', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Client-side live token counter
  const tokenStats = useMemo(() => {
    const tokens = countTokensClient(prompt);
    const chars = prompt ? prompt.length : 0;
    const words = prompt ? prompt.trim().split(/\s+/).filter(Boolean).length : 0;
    return { tokens, chars, words };
  }, [prompt]);

  // Load models & initial quotas
  useEffect(() => {
    fetchModels();
    fetchQuotas();
  }, [apiKeys]);

  const fetchModels = () => {
    const query = Object.keys(apiKeys).length > 0 ? `?keys=${encodeURIComponent(JSON.stringify(apiKeys))}` : '';
    fetch(`/api/models${query}`)
      .then((res) => res.json())
      .then((data) => {
        setAllModels(data.models || []);
      })
      .catch((err) => console.error('Failed to load models:', err));
  };

  const fetchQuotas = async () => {
    try {
      const res = await fetch('/api/quotas');
      const data = await res.json();
      setQuotas(data);
    } catch (err) {
      console.error('Failed to fetch quotas:', err);
    }
  };

  const handleResetQuotas = async () => {
    try {
      const res = await fetch('/api/quotas/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      const data = await res.json();
      setQuotas(data.quotas);
    } catch (err) {
      console.error('Failed to reset quotas:', err);
    }
  };

  const handleSimulate429 = async (provider = 'openrouter') => {
    try {
      const res = await fetch('/api/quotas/simulate-429', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, cooldownSeconds: 180 })
      });
      const data = await res.json();
      setQuotas(data.quotas);
    } catch (err) {
      console.error('Failed to simulate 429:', err);
    }
  };

  // Debounced real-time analysis & prompt rewrite whenever prompt, qualityTier, or forceSplitOverride changes
  useEffect(() => {
    if (!prompt.trim()) {
      setAnalysis(null);
      setSelectedModel(null);
      setRewriteData(null);
      setSplitData(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // 1. Analyze intent & model recommendation based on quality tier
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, qualityTier, customKeys: apiKeys })
        });
        const analyzeData = await analyzeRes.json();
        setAnalysis(analyzeData);

        const recommended = analyzeData.recommendation?.recommendedModel;
        setSelectedModel(recommended);

        // 2. Rewrite prompt for token efficiency
        setIsLoadingRewrite(true);
        const rewriteRes = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            apiKey: apiKeys.openrouter || null
          })
        });
        const rewriteResult = await rewriteRes.json();
        setRewriteData(rewriteResult);
        setIsLoadingRewrite(false);

        // 3. Oversized prompt splitting analysis
        const splitRes = await fetch('/api/split', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: rewriteResult.rewrittenPrompt || prompt,
            maxChunkTokens: 250,
            intent: analyzeData.classification?.intent,
            isDivisible: analyzeData.classification?.isDivisible,
            forceSplit: forceSplitOverride
          })
        });
        const splitResult = await splitRes.json();
        setSplitData(splitResult);
      } catch (err) {
        console.error('Pipeline analysis error:', err);
        setIsLoadingRewrite(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [prompt, qualityTier, forceSplitOverride, apiKeys]);

  // Execute Dispatch
  const handleDispatch = async () => {
    if (!prompt.trim() || !selectedModel) return;

    setIsDispatching(true);
    setDispatchPhase('Optimizing prompt...');

    try {
      await new Promise((r) => setTimeout(r, 200));

      const activePrompt =
        useOptimized && rewriteData?.rewrittenPrompt
          ? rewriteData.rewrittenPrompt
          : prompt;

      const activeChunks =
        isSplitEnabled && splitData?.shouldSplit && splitData?.chunks?.length > 1
          ? splitData.chunks
          : [
              {
                chunkIndex: 0,
                totalChunks: 1,
                tokens: tokenStats.tokens,
                title: 'Single Chunk',
                content: activePrompt
              }
            ];

      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chunks: activeChunks,
          prompt: activePrompt,
          model: selectedModel,
          customKeys: apiKeys,
          forceDemoMode: isDemoMode,
          comparisonModel: analysis?.recommendation?.comparisonModel || null
        })
      });

      const result = await res.json();
      setExecutionResult(result);
      if (result.updatedQuotas) setQuotas(result.updatedQuotas);

      // Record to session history
      const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        prompt: activePrompt,
        modelUsed: result.modelUsed || selectedModel,
        result: result.finalOutput,
        metrics: result.metrics,
        providersUsed: result.providersUsed,
        plainEnglishSummary: result.plainEnglishSummary
      };
      setSessionHistory((prev) => [historyItem, ...prev]);

      setDispatchPhase('');
      setIsDispatching(false);
    } catch (err) {
      console.error('Dispatch failed:', err);
      setDispatchPhase('');
      setIsDispatching(false);
    }
  };

  // Preset Selection
  const handleSelectPreset = (preset) => {
    setPrompt(preset.prompt);
    setForceSplitOverride(false);
  };

  // Restore from Session History
  const handleSelectHistoryRun = (item) => {
    setPrompt(item.prompt);
    if (item.modelUsed) setSelectedModel(item.modelUsed);
    setIsHistoryOpen(false);
  };

  // Save Keys to LocalStorage
  const handleSaveKeys = (keys) => {
    setApiKeys(keys);
    localStorage.setItem('promptly_api_keys', JSON.stringify(keys));
  };

  const handleScrollToWorkspace = () => {
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] flex flex-col relative selection:bg-[#00F0FF] selection:text-black">
      {/* Authentic Film Grain Overlay */}
      <div className="grain-overlay" />

      {/* Header with Numbered Navigation, Pill CTA, and Quotas on Advanced mode */}
      <Header
        quotas={quotas}
        onResetQuotas={handleResetQuotas}
        onSimulate429={handleSimulate429}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        showAdvanced={showAdvanced}
        onToggleAdvanced={handleToggleAdvanced}
      />

      {/* Hero Section */}
      <HeroSection onScrollToWorkspace={handleScrollToWorkspace} />

      {/* Marquee Strip Divider 1 */}
      <MarqueeStrip />

      {/* 4-Stage Architecture Steps */}
      <FeatureSteps />

      {/* Marquee Strip Divider 2 (Reversed) */}
      <MarqueeStrip reverse={true} />

      {/* Main Interactive Workspace */}
      <main id="workspace" className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-16 space-y-8 relative">
        {/* Workspace Title & History Pill Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#00F0FF] uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
              <span>01 // PROMPT OPTIMIZER</span>
              <span>✦</span>
              <span>SIMPLIFIED ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black tracking-tight uppercase text-white">
              OPTIMIZE & <span className="text-[#00F0FF]">RUN</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#141414] hover:bg-[#1E1E1E] text-slate-300 hover:text-[#00F0FF] rounded-full text-xs font-mono border border-white/10 hover:border-[#00F0FF]/40 transition duration-150 active:scale-95"
            >
              <History className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>History ({sessionHistory.length})</span>
            </button>
          </div>
        </div>

        {/* 1. Prompt Input with 3-Way Plain Toggle (No Jargon in default view) */}
        <PromptInput
          prompt={prompt}
          onChangePrompt={setPrompt}
          tokenStats={tokenStats}
          onSelectPreset={handleSelectPreset}
          onClear={() => setPrompt('')}
          qualityTier={qualityTier}
          onChangeQualityTier={setQualityTier}
          showAdvanced={showAdvanced}
        />

        {/* 2. Single "Optimize & Run" Button (Default View) */}
        <DispatchControl
          onDispatch={handleDispatch}
          isDispatching={isDispatching}
          dispatchPhase={dispatchPhase}
          hasPrompt={prompt.trim().length > 0}
          selectedModel={selectedModel}
          useOptimized={useOptimized}
          isSplitEnabled={isSplitEnabled}
          totalChunks={splitData?.totalChunks || 1}
          showAdvanced={showAdvanced}
        />

        {/* 3. Output Panel (Always shows one plain-English summary line + answer) */}
        {executionResult && (
          <OutputPanel
            executionResult={executionResult}
            showAdvanced={showAdvanced}
          />
        )}

        {/* 4. "Show Advanced" Pill Toggle Button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleToggleAdvanced}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs transition-all duration-200 border ${
              showAdvanced
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                : 'bg-[#141414] hover:bg-[#1A1A1A] text-slate-300 hover:text-white border-white/10 hover:border-white/20'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>
              {showAdvanced
                ? 'Hide Advanced Breakdown & Settings'
                : 'Show Advanced (Model Picker, Token Diff, Cost Matrix)'}
            </span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 5. ADVANCED PANELS (Hidden by default, revealed on Show Advanced) */}
        {showAdvanced && (
          <div className="space-y-6 pt-4 border-t border-white/10 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider pb-2">
              <span className="text-[#00F0FF] font-bold">&gt;&gt;</span>
              <span>ADVANCED SYSTEM DIAGNOSTICS & MANUAL CONTROLS</span>
            </div>

            {/* A. Automated Intent Classifier & Complexity Meter */}
            {analysis && (
              <AnalysisPanel
                classification={analysis.classification}
                forceSplitOverride={forceSplitOverride}
                onToggleSplitOverride={setForceSplitOverride}
              />
            )}

            {/* B. Model Recommendation & Full Catalog Picker */}
            {analysis?.recommendation && selectedModel && (
              <ModelRecommender
                recommendation={analysis.recommendation}
                allModels={allModels}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
              />
            )}

            {/* C. Token-Optimized Diff View */}
            <PromptDiffView
              rewriteData={rewriteData}
              useOptimized={useOptimized}
              onToggleUseOptimized={setUseOptimized}
              isLoadingRewrite={isLoadingRewrite}
            />

            {/* D. Oversized Boundary Splitting Banner */}
            {splitData && (
              <SplitBanner
                splitData={splitData}
                providerCount={quotas ? Object.keys(quotas).length : 2}
                isSplitEnabled={isSplitEnabled}
                onToggleSplit={setIsSplitEnabled}
              />
            )}

            {/* E. Candidate Models Cost Comparison Table */}
            {analysis?.recommendation?.top3Candidates && (
              <CostComparisonTable
                top3Candidates={analysis.recommendation.top3Candidates}
                selectedModel={selectedModel}
                onSelectCandidate={setSelectedModel}
              />
            )}
          </div>
        )}
      </main>

      {/* FAQ Accordion Section */}
      <FAQSection />

      {/* Footer with Marquee Tagline */}
      <footer className="border-t border-white/10 bg-[#080808] relative">
        <div className="overflow-hidden border-b border-white/5 bg-[#0C0C0C] py-3">
          <div className="flex w-max animate-marquee whitespace-nowrap font-mono text-xs text-slate-400 font-semibold tracking-widest">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="mx-4 flex items-center gap-4">
                <span className="text-[#00F0FF] text-glow-cyan">⚡ PROMPTLY</span>
                <span>—</span>
                <span>ONE PROMPT. EVERY AI. OPTIMIZED FOR EVERY TOKEN.</span>
                <span className="text-purple-400">✦</span>
                <span>FASTEST & CHEAPEST TO BEST QUALITY</span>
                <span className="text-emerald-400">✦</span>
                <span>ZERO LATENCY</span>
                <span className="text-[#00F0FF]">✱</span>
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="text-slate-300 font-bold tracking-tight">PROMPTLY v1.0</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">ENGINEERED FOR HACKATHON MVP</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <a href="#workspace" className="hover:text-[#00F0FF] transition">01 // APP</a>
            <a href="#features" className="hover:text-[#00F0FF] transition">02 // PIPELINE</a>
            <a href="#benchmarks" className="hover:text-[#00F0FF] transition">03 // MATRIX</a>
            <a href="#faq" className="hover:text-[#00F0FF] transition">04 // FAQ</a>
          </div>

          <div className="text-slate-500 text-[11px] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>ALL GATEWAYS ONLINE</span>
          </div>
        </div>
      </footer>

      {/* Session History Sidebar Drawer */}
      <SessionHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={sessionHistory}
        onSelectRun={handleSelectHistoryRun}
        onClearHistory={() => setSessionHistory([])}
      />

      {/* Settings Modal (API Keys & Mode) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onSaveKeys={handleSaveKeys}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
      />
    </div>
  );
}
