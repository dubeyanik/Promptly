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
import { History, Zap, Shield, Sparkles, Terminal, ArrowUpRight } from 'lucide-react';

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

  // 2. Options & Toggles
  const [useOptimized, setUseOptimized] = useState(true);
  const [isSplitEnabled, setIsSplitEnabled] = useState(true);
  const [forceSplitOverride, setForceSplitOverride] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // 3. UI Flow & Modals
  const [isLoadingRewrite, setIsLoadingRewrite] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchPhase, setDispatchPhase] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);

  // 4. API Keys from localStorage
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('promptly_api_keys');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Client-side live token counter (instant on every keystroke)
  const tokenStats = useMemo(() => {
    const tokens = countTokensClient(prompt);
    const chars = prompt ? prompt.length : 0;
    const words = prompt ? prompt.trim().split(/\s+/).filter(Boolean).length : 0;
    return { tokens, chars, words };
  }, [prompt]);

  // Load models & initial quotas
  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        setAllModels(data.models || []);
      })
      .catch((err) => console.error('Failed to load models:', err));

    fetchQuotas();
  }, []);

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

  // Debounced real-time analysis & prompt rewrite whenever prompt or forceSplitOverride changes
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
        // 1. Analyze intent & model recommendation
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const analyzeData = await analyzeRes.json();
        setAnalysis(analyzeData);

        // Keep current selected model or auto-select recommended
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
  }, [prompt, forceSplitOverride, apiKeys]);

  // Execute Dispatch
  const handleDispatch = async () => {
    if (!prompt.trim() || !selectedModel) return;

    setIsDispatching(true);
    setDispatchPhase('Analyzing payload...');

    try {
      await new Promise((r) => setTimeout(r, 200));
      setDispatchPhase('Routing chunks across providers...');

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
          forceDemoMode: isDemoMode
        })
      });

      setDispatchPhase('Aggregating coherent answer...');
      const result = await res.json();
      setExecutionResult(result);
      if (result.updatedQuotas) setQuotas(result.updatedQuotas);

      // Record to session history
      const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        prompt: activePrompt,
        modelUsed: selectedModel,
        result: result.finalOutput,
        metrics: result.metrics,
        providersUsed: result.providersUsed
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
      {/* Authentic Non-blocking Film Grain Overlay */}
      <div className="grain-overlay" />

      {/* 1. Header with Numbered Navigation, Gateways Monitor, and Pill CTA */}
      <Header
        quotas={quotas}
        onResetQuotas={handleResetQuotas}
        onSimulate429={handleSimulate429}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
      />

      {/* 2. Hero Section */}
      <HeroSection onScrollToWorkspace={handleScrollToWorkspace} />

      {/* 3. Marquee Ticker Strip Divider 1 */}
      <MarqueeStrip />

      {/* 4. 4-Stage Architecture Steps (Terminal Windows) */}
      <FeatureSteps />

      {/* 5. Marquee Ticker Strip Divider 2 (Reversed direction) */}
      <MarqueeStrip reverse={true} />

      {/* 6. Core Interactive Workspace Section */}
      <main id="workspace" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-16 space-y-8 relative">
        {/* Workspace Title & History Pill Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#00F0FF] uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
              <span>01 // INTERACTIVE CONSOLE</span>
              <span>✦</span>
              <span>LIVE AI ROUTER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black tracking-tight uppercase text-white">
              OPTIMIZATION & <span className="text-[#00F0FF]">DISPATCH WORKSPACE</span>
            </h2>
          </div>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#141414] hover:bg-[#1E1E1E] text-slate-300 hover:text-[#00F0FF] rounded-full text-xs font-mono border border-white/10 hover:border-[#00F0FF]/40 transition duration-150 self-start sm:self-auto active:scale-95"
          >
            <History className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>SESSION RUNS ({sessionHistory.length})</span>
          </button>
        </div>

        {/* 1. Prompt Input with live tiktoken counter and preset selection */}
        <PromptInput
          prompt={prompt}
          onChangePrompt={setPrompt}
          tokenStats={tokenStats}
          onSelectPreset={handleSelectPreset}
          onClear={() => setPrompt('')}
        />

        {/* 2. Intent Classifier & Complexity Meter & Divisibility */}
        {analysis && (
          <AnalysisPanel
            classification={analysis.classification}
            forceSplitOverride={forceSplitOverride}
            onToggleSplitOverride={setForceSplitOverride}
          />
        )}

        {/* 3. Model Recommendation Engine & Override Picker */}
        {analysis?.recommendation && selectedModel && (
          <ModelRecommender
            recommendation={analysis.recommendation}
            allModels={allModels}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        )}

        {/* 4. Prompt Rewriter & Diff View */}
        <PromptDiffView
          rewriteData={rewriteData}
          useOptimized={useOptimized}
          onToggleUseOptimized={setUseOptimized}
          isLoadingRewrite={isLoadingRewrite}
        />

        {/* 5. Oversized Split Banner */}
        {splitData && (
          <SplitBanner
            splitData={splitData}
            providerCount={quotas ? Object.keys(quotas).length : 2}
            isSplitEnabled={isSplitEnabled}
            onToggleSplit={setIsSplitEnabled}
          />
        )}

        {/* 6. Execution / Dispatch Control with glowing pill button */}
        <DispatchControl
          onDispatch={handleDispatch}
          isDispatching={isDispatching}
          dispatchPhase={dispatchPhase}
          hasPrompt={prompt.trim().length > 0}
          selectedModel={selectedModel}
          useOptimized={useOptimized}
          isSplitEnabled={isSplitEnabled}
          totalChunks={splitData?.totalChunks || 1}
        />

        {/* 7. Output Panel with Cost Saved vs Largest Model */}
        {executionResult && (
          <OutputPanel executionResult={executionResult} />
        )}

        {/* 8. Candidate Models Cost Comparison Table (Top 3) */}
        {analysis?.recommendation?.top3Candidates && (
          <CostComparisonTable
            top3Candidates={analysis.recommendation.top3Candidates}
            selectedModel={selectedModel}
            onSelectCandidate={setSelectedModel}
          />
        )}
      </main>

      {/* 7. Knowledge Base / FAQ Accordion */}
      <FAQSection />

      {/* 8. Footer with Scrolling Marquee Tagline & Monospace Links */}
      <footer className="border-t border-white/10 bg-[#080808] relative">
        {/* Footer Marquee Tagline */}
        <div className="overflow-hidden border-b border-white/5 bg-[#0C0C0C] py-3">
          <div className="flex w-max animate-marquee whitespace-nowrap font-mono text-xs text-slate-400 font-semibold tracking-widest">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="mx-4 flex items-center gap-4">
                <span className="text-[#00F0FF] text-glow-cyan">⚡ PROMPTLY</span>
                <span>—</span>
                <span>ONE PROMPT. EVERY AI. OPTIMIZED FOR EVERY TOKEN.</span>
                <span className="text-purple-400">✦</span>
                <span>ZERO LATENCY OVERHEAD</span>
                <span className="text-emerald-400">✦</span>
                <span>FAILOVER READY</span>
                <span className="text-[#00F0FF]">✱</span>
              </span>
            ))}
          </div>
        </div>

        {/* Footer Bottom Bar */}
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
            <span>ALL SYSTEMS OPERATIONAL</span>
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
