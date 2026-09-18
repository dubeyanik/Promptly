import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
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
import { History, Zap, Shield, Sparkles } from 'lucide-react';

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
      const res = await fetch('/api/quotas/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
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
            maxChunkTokens: 250, // optimal boundary size for demoing multi-chunk parallelization
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

      // Determine prompt to execute
      const activePrompt = (useOptimized && rewriteData?.rewrittenPrompt)
        ? rewriteData.rewrittenPrompt
        : prompt;

      // Determine chunks
      const activeChunks = (isSplitEnabled && splitData?.shouldSplit && splitData?.chunks?.length > 1)
        ? splitData.chunks
        : [{
            chunkIndex: 0,
            totalChunks: 1,
            tokens: tokenStats.tokens,
            title: 'Single Chunk',
            content: activePrompt
          }];

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

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      {/* 1. App Header & Provider Quotas */}
      <Header
        quotas={quotas}
        onResetQuotas={handleResetQuotas}
        onSimulate429={handleSimulate429}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Top Control Bar with Session History Trigger */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI Prompt & Model Router Pipeline</span>
          </div>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-900 hover:bg-dark-850 text-slate-300 hover:text-cyan-400 rounded-lg text-xs border border-dark-750 transition"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>History ({sessionHistory.length})</span>
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

        {/* 5. Oversized Split Banner ("Split into N parts across M providers") */}
        {splitData && (
          <SplitBanner
            splitData={splitData}
            providerCount={quotas ? Object.keys(quotas).length : 2}
            isSplitEnabled={isSplitEnabled}
            onToggleSplit={setIsSplitEnabled}
          />
        )}

        {/* 6. Execution / Dispatch Control */}
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

      {/* Footer */}
      <footer className="border-t border-dark-850 py-4 text-center text-xs text-slate-500 font-mono">
        Promptly — One Prompt. Every AI. Optimized for Every Token.
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
