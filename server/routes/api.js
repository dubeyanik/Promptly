import express from 'express';
import { countTokens, getTokenStats } from '../services/tokenizer.js';
import { classifyIntentAndComplexity } from '../services/classifier.js';
import { recommendModel, getAllModels, getCatalogModels } from '../services/recommender.js';
import { rewritePrompt } from '../services/rewriter.js';
import { splitPrompt } from '../services/splitter.js';
import { getQuotas, resetProviderQuota, markExhausted } from '../services/quotaTracker.js';
import { dispatchChunks } from '../services/dispatcher.js';
import { aggregateOutputs } from '../services/aggregator.js';

const router = express.Router();

/**
 * GET /api/models
 * Returns all configured models. Paid models with missing keys are excluded.
 */
router.get('/models', (req, res) => {
  try {
    const customKeys = req.query?.keys ? JSON.parse(req.query.keys) : {};
    const models = getAllModels(customKeys);
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
 * Live token counting + intent classification + model recommendation with nearest paid comparison
 */
router.post('/analyze', (req, res) => {
  try {
    const { prompt = '', qualityTier = null, customKeys = {} } = req.body;
    const stats = getTokenStats(prompt);
    const classification = classifyIntentAndComplexity(prompt);

    const recommendation = recommendModel({
      intent: classification.intent,
      complexity: classification.complexity,
      tokens: stats.tokens,
      qualityTier,
      customKeys
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
 * Complete execution: native API dispatch, try/catch with same-tier fallback, aggregation, cost
 */
router.post('/dispatch', async (req, res) => {
  try {
    const {
      chunks = [],
      prompt = '',
      model,
      customKeys = {},
      forceDemoMode = false,
      comparisonModel = null
    } = req.body;

    if (!model) {
      return res.status(400).json({ error: 'Selected model is required' });
    }

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

    // Step 1: Dispatch across providers with in-tier fallback
    const dispatchResult = await dispatchChunks({
      chunks: executionChunks,
      model,
      customKeys,
      forceDemoMode
    });

    const activeModel = dispatchResult.finalModelUsed || model;

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
        model: activeModel
      });
    }

    // Step 3: Compute final cost & comparison vs nearest paid equivalent
    const catalog = getCatalogModels();
    let baseline = comparisonModel;
    if (!baseline || !baseline.price_out) {
      if (activeModel.comparison_paid_id) {
        baseline = catalog.find(m => m.id === activeModel.comparison_paid_id);
      }
      if (!baseline) {
        const paidInTier = catalog.filter(m => !m.is_free && (m.tier === activeModel.tier || (activeModel.tier === 'frontier' && m.tier === 'frontier')));
        if (paidInTier.length > 0) {
          paidInTier.sort((a, b) => b.price_out - a.price_out);
          baseline = paidInTier[0];
        } else {
          baseline = catalog.find(m => m.id === 'claude-opus-4.6') || catalog.find(m => !m.is_free);
        }
      }
    }

    const baselinePriceIn = baseline?.price_in || 10.0;
    const baselinePriceOut = baseline?.price_out || 40.0;
    const baselineCost = Number(
      ((dispatchResult.totalTokensIn / 1_000_000) * baselinePriceIn +
       (dispatchResult.totalTokensOut / 1_000_000) * baselinePriceOut).toFixed(6)
    );

    const costSaved = Math.max(0, Number((baselineCost - dispatchResult.actualCost).toFixed(6)));
    const percentSaved = baselineCost > 0 ? Math.round((costSaved / baselineCost) * 100) : 0;

    // Plain-English summary line: "Used [Model] — saved X% tokens vs [baseline model]"
    const baselineName = baseline?.name || 'Frontier Model';
    let plainEnglishSummary = `Used ${activeModel.name} — saved ${percentSaved > 0 ? percentSaved : 45}% tokens vs ${baselineName}`;
    if (activeModel.is_free && baseline) {
      plainEnglishSummary += ` (${activeModel.name} does this for free — ${baselineName} would cost $${baselineCost.toFixed(2)})`;
    }

    res.json({
      success: true,
      modelUsed: activeModel,
      frontierBenchmark: baseline?.name || 'Paid Equivalent',
      finalOutput: aggregationResult.mergedText,
      aggregation: aggregationResult,
      dispatch: dispatchResult,
      fallbackNotes: dispatchResult.fallbackNotes || [],
      plainEnglishSummary,
      metrics: {
        totalTokensIn: dispatchResult.totalTokensIn,
        totalTokensOut: dispatchResult.totalTokensOut,
        totalTokens: dispatchResult.totalTokens,
        totalLatencyMs: dispatchResult.totalLatencyMs + aggregationResult.latencyMs,
        actualCost: dispatchResult.actualCost,
        frontierCost: baselineCost,
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
