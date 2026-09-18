import express from 'express';
import { countTokens, getTokenStats } from '../services/tokenizer.js';
import { classifyIntentAndComplexity } from '../services/classifier.js';
import { recommendModel, getAllModels } from '../services/recommender.js';
import { rewritePrompt } from '../services/rewriter.js';
import { splitPrompt } from '../services/splitter.js';
import { getQuotas, resetProviderQuota, markExhausted } from '../services/quotaTracker.js';
import { dispatchChunks } from '../services/dispatcher.js';
import { aggregateOutputs } from '../services/aggregator.js';

const router = express.Router();

/**
 * GET /api/models
 * Returns all configured models grouped by tier
 */
router.get('/models', (req, res) => {
  try {
    const models = getAllModels();
    const grouped = {
      small: models.filter(m => m.tier === 'small'),
      medium: models.filter(m => m.tier === 'medium'),
      large: models.filter(m => m.tier === 'large'),
      frontier: models.filter(m => m.tier === 'frontier')
    };
    res.json({ models, grouped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/quotas
 * Returns live in-memory provider quotas
 */
router.get('/quotas', (req, res) => {
  try {
    const quotas = getQuotas();
    res.json(quotas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/quotas/reset
 * Resets quota counters (useful for demo & testing)
 */
router.post('/quotas/reset', (req, res) => {
  try {
    const { provider } = req.body;
    const quotas = resetProviderQuota(provider);
    res.json({ message: 'Quotas reset successfully', quotas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/quotas/simulate-429
 * Simulates a 429 rate limit error for a provider (for testing and judging demos)
 */
router.post('/quotas/simulate-429', (req, res) => {
  try {
    const { provider = 'openrouter', cooldownSeconds = 180 } = req.body;
    markExhausted(provider, cooldownSeconds);
    const quotas = getQuotas();
    res.json({ message: `Simulated 429: ${provider} marked exhausted`, quotas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/analyze
 * Live token counting + intent classification + complexity + model recommendation
 */
router.post('/analyze', (req, res) => {
  try {
    const { prompt = '' } = req.body;
    const stats = getTokenStats(prompt);
    const classification = classifyIntentAndComplexity(prompt);
    
    const recommendation = recommendModel({
      intent: classification.intent,
      complexity: classification.complexity,
      tokens: stats.tokens
    });

    res.json({
      stats,
      classification,
      recommendation
    });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/rewrite
 * Rewrites prompt for max token efficiency and returns diff
 */
router.post('/rewrite', async (req, res) => {
  try {
    const { prompt = '', apiKey = null } = req.body;
    if (!prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await rewritePrompt(prompt, apiKey);
    res.json(result);
  } catch (err) {
    console.error('Rewrite error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/split
 * Analyzes and generates chunk partitions for oversized prompts
 */
router.post('/split', (req, res) => {
  try {
    const {
      prompt = '',
      maxChunkTokens = 600,
      intent = 'qa',
      isDivisible = true,
      forceSplit = false
    } = req.body;

    const result = splitPrompt({
      prompt,
      maxChunkTokens,
      intent,
      isDivisible,
      forceSplit
    });

    res.json(result);
  } catch (err) {
    console.error('Split error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/dispatch
 * Complete execution: round-robin dispatch across providers, 429 failover, aggregation, cost
 */
router.post('/dispatch', async (req, res) => {
  try {
    const {
      chunks = [],
      prompt = '',
      model,
      customKeys = {},
      forceDemoMode = false
    } = req.body;

    if (!model) {
      return res.status(400).json({ error: 'Selected model is required' });
    }

    // If chunks not provided, build single chunk from prompt
    let executionChunks = chunks;
    if (!executionChunks || executionChunks.length === 0) {
      executionChunks = [{
        chunkIndex: 0,
        totalChunks: 1,
        tokens: countTokens(prompt),
        title: 'Single Prompt',
        content: prompt
      }];
    }

    // Step 1: Dispatch across providers
    const dispatchResult = await dispatchChunks({
      chunks: executionChunks,
      model,
      customKeys,
      forceDemoMode
    });

    // Step 2: If multi-chunk, aggregate outputs
    let aggregationResult = {
      mergedText: dispatchResult.results[0]?.responseText || '',
      finalTokens: dispatchResult.results[0]?.tokensOut || 0,
      latencyMs: 0
    };

    if (executionChunks.length > 1) {
      aggregationResult = await aggregateOutputs({
        chunkResults: dispatchResult.results,
        apiKey: customKeys.openrouter,
        model
      });
    }

    // Step 3: Compute final cost & comparison vs frontier
    const allModels = getAllModels();
    const frontierModel = allModels.find(m => m.id === 'deepseek/deepseek-v4') || allModels[allModels.length - 1];
    
    const frontierCost = Number(
      ((dispatchResult.totalTokensIn / 1_000_000) * frontierModel.price_in +
       (dispatchResult.totalTokensOut / 1_000_000) * frontierModel.price_out).toFixed(6)
    );

    const costSaved = Math.max(0, Number((frontierCost - dispatchResult.actualCost).toFixed(6)));
    const percentSaved = frontierCost > 0 ? Math.round((costSaved / frontierCost) * 100) : 0;

    res.json({
      success: true,
      modelUsed: model,
      frontierBenchmark: frontierModel.name,
      finalOutput: aggregationResult.mergedText,
      aggregation: aggregationResult,
      dispatch: dispatchResult,
      metrics: {
        totalTokensIn: dispatchResult.totalTokensIn,
        totalTokensOut: dispatchResult.totalTokensOut,
        totalTokens: dispatchResult.totalTokens,
        totalLatencyMs: dispatchResult.totalLatencyMs + aggregationResult.latencyMs,
        actualCost: dispatchResult.actualCost,
        frontierCost,
        costSaved,
        percentSaved
      },
      providersUsed: dispatchResult.providersUsed,
      providerCount: dispatchResult.providerCount,
      updatedQuotas: getQuotas()
    });
  } catch (err) {
    console.error('Dispatch error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
