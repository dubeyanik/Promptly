import { countTokens } from './tokenizer.js';
import { hasQuota, recordUsage, markExhausted } from './quotaTracker.js';

// Provider API endpoints
const PROVIDER_ENDPOINTS = {
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  together: 'https://api.together.xyz/v1/chat/completions',
  huggingface: 'https://api-inference.huggingface.co/models/'
};

/**
 * Generates realistic responses when in demo/simulation mode
 */
function generateDemoResponse(prompt, model, chunkIndex, totalChunks) {
  const isMulti = totalChunks > 1;
  const prefix = isMulti ? `[Part ${chunkIndex + 1}/${totalChunks} Answer]:\n` : '';

  if (/code|function|debug|algorithm|script/i.test(prompt)) {
    return `${prefix}Here is the optimized solution using ${model.name}:\n\n\`\`\`javascript\n// High-efficiency implementation\nexport function solveTask(input) {\n  const cache = new Map();\n  return input.map(item => {\n    if (cache.has(item)) return cache.get(item);\n    const result = { id: item.id, processed: true, timestamp: Date.now() };\n    cache.set(item, result);\n    return result;\n  });\n}\n\`\`\`\n\n**Analysis:** Time complexity is O(N), space complexity is O(N) using in-memory caching.`;
  }

  if (/summarize|tldr|summary/i.test(prompt)) {
    return `${prefix}**Executive Summary:**\n- **Core Finding:** Systematic token optimization directly reduces API latency and billing by up to 78%.\n- **Architecture:** Multi-provider fallback and boundary chunking prevent context saturation.\n- **Action Item:** Route deterministic tasks to lightweight models, reserving frontier tiers for non-linear reasoning.`;
  }

  if (/translate/i.test(prompt)) {
    return `${prefix}**Traducción Optimizada:**\nLa inteligencia artificial y los modelos de lenguaje modernos permiten procesar flujos de trabajo complejos con una eficiencia de tokens sin precedentes, reduciendo los costos operativos de manera significativa.`;
  }

  if (/prove|why|reason|calculate/i.test(prompt)) {
    return `${prefix}**Step-by-Step Chain of Thought:**\n1. **Premise:** We examine the fundamental constraints of the system.\n2. **Deduction:** By routing through ${model.name}, the reasoning overhead is managed with high-precision output tokens.\n3. **Conclusion:** The logical proposition holds under all tested boundary conditions.`;
  }

  return `${prefix}Processed successfully by ${model.name}. The prompt was analyzed, condensed, and routed through the optimal provider tier to maximize output coherence while minimizing token usage.`;
}

/**
 * Calls a specific provider API
 */
async function callProviderAPI({
  provider,
  model,
  prompt,
  systemPrompt = 'You are a helpful and concise AI assistant. Output direct answers without conversational padding.',
  apiKey
}) {
  const start = Date.now();
  const inputTokens = countTokens(prompt);

  // 1. OpenRouter
  if (provider === 'openrouter') {
    const key = apiKey || process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error('NO_API_KEY');

    const res = await fetch(PROVIDER_ENDPOINTS.openrouter, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://promptly.ai',
        'X-Title': 'Promptly Optimizer'
      },
      body: JSON.stringify({
        model: model.id,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (res.status === 429) {
      const err = new Error('RATE_LIMIT_429');
      err.status = 429;
      throw err;
    }
    if (!res.ok) {
      throw new Error(`OpenRouter error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const outputTokens = countTokens(text);
    return {
      text,
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - start
    };
  }

  // 2. Groq
  if (provider === 'groq') {
    const key = apiKey || process.env.GROQ_API_KEY;
    if (!key) throw new Error('NO_API_KEY');

    const res = await fetch(PROVIDER_ENDPOINTS.groq, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      }),
      signal: AbortSignal.timeout(12000)
    });

    if (res.status === 429) {
      const err = new Error('RATE_LIMIT_429');
      err.status = 429;
      throw err;
    }
    if (!res.ok) throw new Error(`Groq error: ${res.status}`);

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return {
      text,
      inputTokens,
      outputTokens: countTokens(text),
      latencyMs: Date.now() - start
    };
  }

  // 3. Hugging Face Inference API
  if (provider === 'huggingface') {
    const key = apiKey || process.env.HF_API_KEY;
    if (!key) throw new Error('NO_API_KEY');

    const hfModel = model.hf_model_id || 'mistralai/Mistral-7B-Instruct-v0.3';
    const res = await fetch(`${PROVIDER_ENDPOINTS.huggingface}${hfModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`,
        parameters: { max_new_tokens: 600, return_full_text: false }
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (res.status === 429 || res.status === 503) {
      const err = new Error('RATE_LIMIT_429');
      err.status = res.status;
      throw err;
    }
    if (!res.ok) throw new Error(`Hugging Face error: ${res.status}`);

    const data = await res.json();
    const text = Array.isArray(data) ? data[0]?.generated_text : (data.generated_text || JSON.stringify(data));
    return {
      text: text.trim(),
      inputTokens,
      outputTokens: countTokens(text),
      latencyMs: Date.now() - start
    };
  }

  // 4. Together AI
  if (provider === 'together') {
    const key = apiKey || process.env.TOGETHER_API_KEY;
    if (!key) throw new Error('NO_API_KEY');

    const res = await fetch(PROVIDER_ENDPOINTS.together, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3-70b-chat-hf',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      }),
      signal: AbortSignal.timeout(12000)
    });

    if (res.status === 429) {
      const err = new Error('RATE_LIMIT_429');
      err.status = 429;
      throw err;
    }
    if (!res.ok) throw new Error(`Together error: ${res.status}`);

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return {
      text,
      inputTokens,
      outputTokens: countTokens(text),
      latencyMs: Date.now() - start
    };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

/**
 * Dispatches chunks round-robin across providers with quota, handling 429 failover
 */
export async function dispatchChunks({
  chunks = [],
  model,
  customKeys = {},
  forceDemoMode = false
}) {
  const providerPool = ['openrouter', 'huggingface', 'groq', 'together'];
  const results = [];
  const providersUsedSet = new Set();
  const routingEvents = [];

  let roundRobinIndex = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkTokens = chunk.tokens || countTokens(chunk.content);
    let chunkCompleted = false;
    let attempts = 0;
    const maxAttempts = providerPool.length;

    // Check if any keys exist or demo mode is active
    const hasAnyRealKey = (
      customKeys.openrouter || process.env.OPENROUTER_API_KEY ||
      customKeys.huggingface || process.env.HF_API_KEY ||
      customKeys.groq || process.env.GROQ_API_KEY ||
      customKeys.together || process.env.TOGETHER_API_KEY
    );

    if (forceDemoMode || !hasAnyRealKey) {
      // High-speed realistic simulation for hackathon demo
      // Filter out providers marked exhausted (e.g. via 429)
      const availablePool = providerPool.filter(p => hasQuota(p, chunkTokens));
      const activePool = availablePool.length > 0 ? availablePool : providerPool;
      const selectedProvider = activePool[i % activePool.length];
      providersUsedSet.add(selectedProvider);
      
      const latency = Math.floor(Math.random() * 250) + 180;
      const simText = generateDemoResponse(chunk.content, model, i, chunks.length);
      const outTokens = countTokens(simText);

      recordUsage(selectedProvider, { requests: 1, tokens: chunkTokens + outTokens });
      routingEvents.push({
        chunkIndex: i,
        provider: selectedProvider,
        status: availablePool.length < providerPool.length ? 'FAILOVER_SUCCESS' : 'SUCCESS',
        note: availablePool.length < providerPool.length ? 'Bypassed exhausted providers' : 'Optimal routing',
        mode: 'simulation-demo',
        latencyMs: latency
      });

      results.push({
        chunkIndex: i,
        title: chunk.title || `Chunk ${i + 1}`,
        provider: selectedProvider,
        modelUsed: model.name,
        responseText: simText,
        tokensIn: chunkTokens,
        tokensOut: outTokens,
        latencyMs: latency,
        status: 'success'
      });
      continue;
    }

    // Live dispatch with round-robin and 429 failover
    while (!chunkCompleted && attempts < maxAttempts) {
      const candidateProvider = providerPool[(roundRobinIndex + attempts) % providerPool.length];

      // Check quota
      if (!hasQuota(candidateProvider, chunkTokens)) {
        routingEvents.push({
          chunkIndex: i,
          provider: candidateProvider,
          status: 'SKIPPED_NO_QUOTA'
        });
        attempts++;
        continue;
      }

      try {
        const apiKey = customKeys[candidateProvider];
        const res = await callProviderAPI({
          provider: candidateProvider,
          model,
          prompt: chunk.content,
          apiKey
        });

        // Record quota usage
        recordUsage(candidateProvider, { requests: 1, tokens: res.inputTokens + res.outputTokens });
        providersUsedSet.add(candidateProvider);
        chunkCompleted = true;
        roundRobinIndex = (roundRobinIndex + attempts + 1) % providerPool.length;

        routingEvents.push({
          chunkIndex: i,
          provider: candidateProvider,
          status: 'SUCCESS',
          latencyMs: res.latencyMs
        });

        results.push({
          chunkIndex: i,
          title: chunk.title || `Chunk ${i + 1}`,
          provider: candidateProvider,
          modelUsed: model.name,
          responseText: res.text,
          tokensIn: res.inputTokens,
          tokensOut: res.outputTokens,
          latencyMs: res.latencyMs,
          status: 'success'
        });
      } catch (err) {
        if (err.message === 'RATE_LIMIT_429' || err.status === 429) {
          markExhausted(candidateProvider, 180);
          routingEvents.push({
            chunkIndex: i,
            provider: candidateProvider,
            status: 'EXHAUSTED_429_FAILOVER',
            error: 'Rate limit 429: marked exhausted. Falling over to next provider.'
          });
          attempts++;
        } else if (err.message === 'NO_API_KEY') {
          attempts++;
        } else {
          // Unexpected error, log and attempt next provider
          routingEvents.push({
            chunkIndex: i,
            provider: candidateProvider,
            status: 'FAILED',
            error: err.message
          });
          attempts++;
        }
      }
    }

    // If all providers failed or lacked keys, fallback to simulated answer to preserve UX
    if (!chunkCompleted) {
      const fallbackProvider = 'openrouter';
      const simText = generateDemoResponse(chunk.content, model, i, chunks.length);
      const outTokens = countTokens(simText);
      providersUsedSet.add(fallbackProvider);

      routingEvents.push({
        chunkIndex: i,
        provider: fallbackProvider,
        status: 'FALLBACK_SIMULATED',
        note: 'All live providers exhausted or unconfigured. Demo response generated.'
      });

      results.push({
        chunkIndex: i,
        title: chunk.title || `Chunk ${i + 1}`,
        provider: fallbackProvider,
        modelUsed: `${model.name} (Demo Fallback)`,
        responseText: simText,
        tokensIn: chunkTokens,
        tokensOut: outTokens,
        latencyMs: 150,
        status: 'demo_fallback'
      });
    }
  }

  // Aggregate totals
  const totalTokensIn = results.reduce((acc, r) => acc + r.tokensIn, 0);
  const totalTokensOut = results.reduce((acc, r) => acc + r.tokensOut, 0);
  const totalLatencyMs = results.reduce((acc, r) => acc + r.latencyMs, 0);

  // Calculate actual cost
  const actualCost = Number(
    ((totalTokensIn / 1_000_000) * model.price_in + (totalTokensOut / 1_000_000) * model.price_out).toFixed(6)
  );

  return {
    results,
    providersUsed: Array.from(providersUsedSet),
    providerCount: providersUsedSet.size,
    totalChunks: chunks.length,
    totalTokensIn,
    totalTokensOut,
    totalTokens: totalTokensIn + totalTokensOut,
    totalLatencyMs,
    actualCost,
    routingEvents
  };
}
