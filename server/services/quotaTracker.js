import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const quotasPath = path.join(__dirname, '../config/quotas.json');

// In-memory quota state store
let quotaStore = {};

function initQuotas() {
  try {
    const raw = JSON.parse(fs.readFileSync(quotasPath, 'utf8'));
    const now = Date.now();
    for (const [key, val] of Object.entries(raw)) {
      quotaStore[key] = {
        ...val,
        is_exhausted: false,
        exhausted_until: null,
        reset_time: new Date(now + (val.reset_period_seconds || 3600) * 1000).toISOString()
      };
    }
  } catch (err) {
    console.error('Failed to load quotas.json:', err);
  }
}

initQuotas();

export function getQuotas() {
  const now = Date.now();
  const summary = {};

  for (const [provider, data] of Object.entries(quotaStore)) {
    // Check if auto-reset or exhaustion expired
    if (data.is_exhausted && data.exhausted_until && now > data.exhausted_until) {
      data.is_exhausted = false;
      data.exhausted_until = null;
    }

    const reqRemaining = Math.max(0, data.requests_limit - data.requests_used);
    const tokensRemaining = Math.max(0, data.tokens_limit - data.tokens_used);

    const reqPercent = Math.max(0, Math.min(100, Math.round((reqRemaining / data.requests_limit) * 100)));
    const tokenPercent = Math.max(0, Math.min(100, Math.round((tokensRemaining / data.tokens_limit) * 100)));

    summary[provider] = {
      ...data,
      requests_remaining: reqRemaining,
      tokens_remaining: tokensRemaining,
      requests_remaining_pct: reqPercent,
      tokens_remaining_pct: tokenPercent,
      is_available: !data.is_exhausted && reqRemaining > 0 && tokensRemaining > 0
    };
  }

  return summary;
}

export function hasQuota(provider, tokensNeeded = 100) {
  const data = quotaStore[provider];
  if (!data) return false;
  if (data.is_exhausted) return false;
  return (data.requests_used < data.requests_limit) && 
         ((data.tokens_used + tokensNeeded) <= data.tokens_limit);
}

export function recordUsage(provider, { requests = 1, tokens = 0 }) {
  if (quotaStore[provider]) {
    quotaStore[provider].requests_used += requests;
    quotaStore[provider].tokens_used += tokens;
  }
}

export function markExhausted(provider, cooldownSeconds = 180) {
  if (quotaStore[provider]) {
    quotaStore[provider].is_exhausted = true;
    quotaStore[provider].exhausted_until = Date.now() + cooldownSeconds * 1000;
  }
}

export function resetProviderQuota(provider) {
  if (provider && quotaStore[provider]) {
    quotaStore[provider].requests_used = 0;
    quotaStore[provider].tokens_used = 0;
    quotaStore[provider].is_exhausted = false;
    quotaStore[provider].exhausted_until = null;
  } else if (!provider) {
    initQuotas();
  }
  return getQuotas();
}
