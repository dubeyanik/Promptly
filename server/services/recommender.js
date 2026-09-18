import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load models catalog once at startup and cache in memory
let cachedModels = [];

function loadModelsCatalog() {
  const possiblePaths = [
    path.join(__dirname, '../../models/models.json'),
    path.join(__dirname, '../config/models.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        cachedModels = JSON.parse(raw);
        console.log(`[Recommender] Loaded ${cachedModels.length} models into memory cache from ${p}`);
        return cachedModels;
      } catch (e) {
        console.error(`[Recommender] Error parsing ${p}:`, e);
      }
    }
  }

  return cachedModels;
}

loadModelsCatalog();

/**
 * Checks if a provider's API key is available in process.env or customKeys
 */
export function isProviderAvailable(provider, customKeys = {}) {
  if (!provider) return false;
  const p = provider.toLowerCase();

  if (p === 'openrouter') return true; // Free models use OpenRouter gateway / demo
  if (p === 'huggingface') return true;

  if (p === 'openai') {
    return Boolean(process.env.OPENAI_API_KEY || customKeys.openai);
  }
  if (p === 'anthropic') {
    return Boolean(process.env.ANTHROPIC_API_KEY || customKeys.anthropic);
  }
  if (p === 'google') {
    return Boolean(process.env.GOOGLE_API_KEY || customKeys.google);
  }
  if (p === 'groq') {
    return Boolean(process.env.GROQ_API_KEY || customKeys.groq);
  }
  if (p === 'together') {
    return Boolean(process.env.TOGETHER_API_KEY || customKeys.together);
  }

  return false;
}

/**
 * Returns all active models. Paid models with missing API keys are silently excluded.
 */
export function getAllModels(customKeys = {}) {
  return cachedModels.filter((m) => {
    if (m.is_free) return true;
    return isProviderAvailable(m.provider, customKeys);
  });
}

/**
 * Maps task, quality toggle, and tokens to optimal model with paid comparison
 */
export function recommendModel({
  intent = 'qa',
  complexity = 3,
  tokens = 100,
  qualityTier = null,
  customKeys = {}
}) {
  // Estimated output tokens based on intent
  let estimatedOutputTokens = 350;
  if (intent === 'code') estimatedOutputTokens = Math.max(300, Math.min(1200, Math.round(tokens * 0.8)));
  else if (intent === 'summarize') estimatedOutputTokens = Math.max(150, Math.min(500, Math.round(tokens * 0.25)));
  else if (intent === 'creative') estimatedOutputTokens = 600;
  else if (intent === 'reasoning') estimatedOutputTokens = 800;
  else if (intent === 'translate') estimatedOutputTokens = Math.round(tokens * 1.05);

  // Map 3-way toggle if provided:
  // "Fastest & Cheapest" -> small
  // "Balanced" -> medium
  // "Best Quality" -> frontier / large
  let targetTier = 'small';
  let tierConfidence = 95;
  let reason = 'Optimal balance for task requirements.';

  if (qualityTier) {
    if (qualityTier === 'small' || qualityTier === 'fastest') {
      targetTier = 'small';
      reason = 'Configured for fastest response and lowest token cost.';
    } else if (qualityTier === 'medium' || qualityTier === 'balanced') {
      targetTier = 'medium';
      reason = 'Configured for balanced accuracy, reasoning depth, and cost.';
    } else if (qualityTier === 'frontier' || qualityTier === 'large' || qualityTier === 'quality') {
      targetTier = 'frontier';
      reason = 'Configured for maximum intelligence and best quality output.';
    }
  } else {
    // Auto-derive from complexity & intent
    if (complexity >= 8 || (intent === 'reasoning' && complexity >= 5)) {
      targetTier = 'frontier';
      reason = 'Heavy reasoning or high complexity proof requires frontier-class architecture.';
    } else if (complexity >= 6 || (intent === 'code' && complexity >= 5) || tokens > 16000) {
      targetTier = 'large';
      reason = 'Deep domain complexity or large payload warrants high-parameter tier.';
    } else if (complexity >= 3 || intent === 'code' || intent === 'reasoning' || tokens > 3500) {
      targetTier = 'medium';
      reason = 'Balanced instruction following and multi-step reasoning needs medium tier.';
    } else {
      targetTier = 'small';
      reason = 'Concise task with straightforward intent fits optimal low-cost tier.';
    }
  }

  // Calculate pricing for all models in catalog (needed for comparison)
  const allEvaluated = cachedModels.map((m) => {
    const inputCost = (tokens / 1_000_000) * m.price_in;
    const outputCost = (estimatedOutputTokens / 1_000_000) * m.price_out;
    const totalCost = Number((inputCost + outputCost).toFixed(6));

    return {
      ...m,
      estimatedOutputTokens,
      inputCost: Number(inputCost.toFixed(6)),
      outputCost: Number(outputCost.toFixed(6)),
      totalCost,
      isContextSufficient: m.context_limit >= (tokens + estimatedOutputTokens),
      isKeyConfigured: m.is_free ? true : isProviderAvailable(m.provider, customKeys)
    };
  });

  // Available models for selection: exclude paid models without keys
  const availableModels = allEvaluated.filter((m) => m.isKeyConfigured);

  // Filter candidates matching target tier (for frontier, also accept large if needed)
  let tierCandidates = availableModels.filter(
    (m) => (m.tier === targetTier || (targetTier === 'frontier' && m.tier === 'large')) && m.isContextSufficient
  );

  // Fallback to any available if none fit
  if (tierCandidates.length === 0) {
    tierCandidates = availableModels.filter((m) => m.isContextSufficient);
  }
  if (tierCandidates.length === 0) {
    tierCandidates = availableModels;
  }

  // Free models in tier vs Paid models
  const freeCandidates = tierCandidates.filter((m) => m.is_free);
  let recommendedModel;

  if (freeCandidates.length > 0) {
    // Pick cheapest sufficient free model
    freeCandidates.sort((a, b) => a.totalCost - b.totalCost);
    recommendedModel = freeCandidates[0];
  } else {
    // If no free model exists in selected tier, pick the cheapest paid option instead
    tierCandidates.sort((a, b) => a.totalCost - b.totalCost);
    recommendedModel = tierCandidates[0];
  }

  // Find nearest paid equivalent comparison model in the same tier
  let comparisonModel = null;
  if (recommendedModel.is_free) {
    if (recommendedModel.comparison_paid_id) {
      comparisonModel = allEvaluated.find((m) => m.id === recommendedModel.comparison_paid_id);
    }
    if (!comparisonModel) {
      // Find closest paid model in same tier by capability
      const paidInTier = allEvaluated.filter(
        (m) => !m.is_free && (m.tier === recommendedModel.tier || (recommendedModel.tier === 'frontier' && m.tier === 'frontier'))
      );
      if (paidInTier.length > 0) {
        paidInTier.sort((a, b) => b.totalCost - a.totalCost);
        comparisonModel = paidInTier[0];
      }
    }
  }

  // If still no comparison model, fall back to Claude Opus or GPT-5.4
  if (!comparisonModel && recommendedModel.is_free) {
    comparisonModel = allEvaluated.find((m) => m.id === 'claude-opus-4.6') || allEvaluated.find((m) => !m.is_free);
  }

  // Construct comparison lines
  let comparisonLine = '';
  let plainEnglishSummary = '';
  let comparisonCost = 0;
  let savedPercent = 0;

  if (recommendedModel.is_free && comparisonModel) {
    comparisonCost = comparisonModel.totalCost;
    comparisonLine = `${recommendedModel.name} does this for free — ${comparisonModel.name} would cost $${comparisonCost.toFixed(2)} for this prompt`;
    savedPercent = 100;
    plainEnglishSummary = `Used ${recommendedModel.name} — saved 100% vs ${comparisonModel.name} ($${comparisonCost.toFixed(2)})`;
  } else if (!recommendedModel.is_free) {
    // No free model existed in tier: show cheapest paid option with no comparison line
    comparisonLine = '';
    plainEnglishSummary = `Used ${recommendedModel.name} ($${recommendedModel.totalCost.toFixed(4)})`;
  }

  // Generate Top 3 comparison models for Advanced panel
  const top3 = [recommendedModel];
  if (comparisonModel && !top3.some((m) => m.id === comparisonModel.id)) {
    top3.push(comparisonModel);
  }
  const otherCandidates = availableModels.filter((m) => !top3.some((t) => t.id === m.id));
  if (otherCandidates.length > 0) {
    top3.push(otherCandidates[0]);
  }
  top3.sort((a, b) => a.totalCost - b.totalCost);

  return {
    targetTier,
    recommendedModel,
    confidenceLabel: `${tierConfidence}% Confidence`,
    confidenceScore: tierConfidence,
    reason,
    comparisonModel: comparisonModel ? {
      id: comparisonModel.id,
      name: comparisonModel.name,
      totalCost: comparisonModel.totalCost
    } : null,
    comparisonLine,
    plainEnglishSummary,
    costSavings: {
      frontierBaselineModel: comparisonModel ? comparisonModel.name : 'Paid Equivalent',
      frontierCost: comparisonCost,
      recommendedCost: recommendedModel.totalCost,
      savedDollars: comparisonCost > 0 ? Number(comparisonCost.toFixed(6)) : 0,
      savedPercent
    },
    top3Candidates: top3,
    allEvaluatedModels: availableModels
  };
}

export function getCatalogModels() {
  return cachedModels;
}

