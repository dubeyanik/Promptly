import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load models catalog
const modelsPath = path.join(__dirname, '../config/models.json');
let models = [];
try {
  models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));
} catch (err) {
  console.error('Error reading models.json:', err);
}

/**
 * Maps task intent, complexity, and token length to the cheapest sufficient model tier
 */
export function recommendModel({ intent, complexity, tokens = 100 }) {
  // Estimated output tokens based on intent & input length
  let estimatedOutputTokens = 350;
  if (intent === 'code') estimatedOutputTokens = Math.max(300, Math.min(1200, Math.round(tokens * 0.8)));
  else if (intent === 'summarize') estimatedOutputTokens = Math.max(150, Math.min(500, Math.round(tokens * 0.25)));
  else if (intent === 'creative') estimatedOutputTokens = 600;
  else if (intent === 'reasoning') estimatedOutputTokens = 800;
  else if (intent === 'translate') estimatedOutputTokens = Math.round(tokens * 1.05);

  // Determine minimum sufficient tier
  let targetTier = 'small';
  let tierConfidence = 95;
  let reason = 'Task requirements match lightweight high-speed small tier.';

  if (complexity >= 8 || (intent === 'reasoning' && complexity >= 5)) {
    targetTier = 'frontier';
    tierConfidence = 96;
    reason = 'Heavy reasoning or high complexity proof requires frontier-class architecture.';
  } else if (complexity >= 6 || (intent === 'reasoning' && complexity >= 3) || (intent === 'code' && complexity >= 5) || tokens > 16000) {
    targetTier = 'large';
    tierConfidence = 92;
    reason = 'Deep domain complexity, code architecture, or reasoning warrants high-parameter large tier.';
  } else if (complexity >= 3 || intent === 'code' || intent === 'reasoning' || tokens > 3500) {
    targetTier = 'medium';
    tierConfidence = 90;
    reason = 'Balanced instruction following and multi-step reasoning needs medium tier.';
  } else {
    targetTier = 'small';
    tierConfidence = 94;
    reason = 'Concise task with straightforward intent fits optimal low-cost small tier.';
  }

  // Calculate pricing for all models
  const evaluatedModels = models.map((m) => {
    const inputCost = (tokens / 1_000_000) * m.price_in;
    const outputCost = (estimatedOutputTokens / 1_000_000) * m.price_out;
    const totalCost = inputCost + outputCost;

    return {
      ...m,
      estimatedOutputTokens,
      inputCost: Number(inputCost.toFixed(6)),
      outputCost: Number(outputCost.toFixed(6)),
      totalCost: Number(totalCost.toFixed(6)),
      isContextSufficient: m.context_limit >= (tokens + estimatedOutputTokens)
    };
  });

  // Filter candidates matching target tier with sufficient context
  let tierCandidates = evaluatedModels.filter(
    (m) => m.tier === targetTier && m.isContextSufficient
  );

  // If none in target tier fit context, escalate to next tiers
  if (tierCandidates.length === 0) {
    const tierOrder = ['small', 'medium', 'large', 'frontier'];
    const currentTierIdx = tierOrder.indexOf(targetTier);
    for (let i = currentTierIdx + 1; i < tierOrder.length; i++) {
      tierCandidates = evaluatedModels.filter(
        (m) => m.tier === tierOrder[i] && m.isContextSufficient
      );
      if (tierCandidates.length > 0) {
        targetTier = tierOrder[i];
        reason += ` Escalated to ${targetTier} due to context limit requirements.`;
        break;
      }
    }
  }

  // Fallback to any model that fits context if still empty
  if (tierCandidates.length === 0) {
    tierCandidates = evaluatedModels.filter((m) => m.isContextSufficient);
  }

  // Sort by total cost ascending to pick cheapest sufficient
  tierCandidates.sort((a, b) => a.totalCost - b.totalCost);
  const recommendedModel = tierCandidates[0] || evaluatedModels[0];

  // Baseline comparison model: pick the standard Frontier model (e.g. deepseek-v4 or kimi-k2.6)
  const frontierBaseline = evaluatedModels.find((m) => m.id === 'deepseek/deepseek-v4') || evaluatedModels[evaluatedModels.length - 1];
  const savingsAmount = Math.max(0, frontierBaseline.totalCost - recommendedModel.totalCost);
  const savingsPercent = frontierBaseline.totalCost > 0
    ? Math.round((savingsAmount / frontierBaseline.totalCost) * 100)
    : 0;

  // Select Top 3 comparison models:
  // 1: Recommended
  // 2: Medium/Large alternative (or different tier)
  // 3: Frontier benchmark
  const top3 = [recommendedModel];

  // Add alternative from another tier
  const alternative = evaluatedModels.find(
    (m) => m.id !== recommendedModel.id && m.tier !== recommendedModel.tier && m.tier !== 'frontier'
  ) || evaluatedModels.find((m) => m.id !== recommendedModel.id && m.id !== frontierBaseline.id);

  if (alternative && !top3.some((m) => m.id === alternative.id)) {
    top3.push(alternative);
  }

  // Ensure frontierBaseline is present
  if (!top3.some((m) => m.id === frontierBaseline.id)) {
    top3.push(frontierBaseline);
  } else if (top3.length < 3) {
    const third = evaluatedModels.find((m) => !top3.some((t) => t.id === m.id));
    if (third) top3.push(third);
  }

  // Sort top 3 by cost
  top3.sort((a, b) => a.totalCost - b.totalCost);

  return {
    targetTier,
    recommendedModel,
    confidenceLabel: `${tierConfidence}% Confidence`,
    confidenceScore: tierConfidence,
    reason,
    costSavings: {
      frontierBaselineModel: frontierBaseline.name,
      frontierCost: frontierBaseline.totalCost,
      recommendedCost: recommendedModel.totalCost,
      savedDollars: Number(savingsAmount.toFixed(6)),
      savedPercent: savingsPercent
    },
    top3Candidates: top3,
    allEvaluatedModels: evaluatedModels
  };
}

export function getAllModels() {
  return models;
}
