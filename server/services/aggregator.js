import { countTokens } from './tokenizer.js';

const AGGREGATOR_SYSTEM_PROMPT = "Combine into one coherent answer, remove redundancy, resolve conflicts. Output only merged answer.";

/**
 * Merges multi-chunk outputs into one coherent answer
 */
export async function aggregateOutputs({
  chunkResults = [],
  apiKey = null,
  model = null
}) {
  if (!chunkResults || chunkResults.length === 0) {
    return { mergedText: '', finalTokens: 0, latencyMs: 0 };
  }

  // If only 1 chunk, no merger LLM call needed
  if (chunkResults.length === 1) {
    const text = chunkResults[0].responseText;
    return {
      mergedText: text,
      finalTokens: countTokens(text),
      latencyMs: 0,
      mergerMethod: 'single-chunk-passthrough'
    };
  }

  const start = Date.now();
  const combinedRaw = chunkResults
    .map((r, i) => `--- Chunk ${i + 1} Output ---\n${r.responseText}`)
    .join('\n\n');

  let mergedOutput = '';
  let mergerMethod = 'heuristic-synthesis';

  const openRouterKey = apiKey || process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (openRouterKey) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://promptly.ai'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: AGGREGATOR_SYSTEM_PROMPT },
            { role: 'user', content: `Please merge these chunk outputs:\n\n${combinedRaw}` }
          ],
          temperature: 0.2
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          mergedOutput = text;
          mergerMethod = 'openrouter-llama-3.1-8b';
        }
      }
    } catch (e) {
      console.warn('Aggregator LLM call failed, fallback used:', e.message);
    }
  }

  // Fallback intelligent synthesizer
  if (!mergedOutput) {
    // Strip chunk headers and synthesize cleanly
    const cleanedSections = chunkResults.map((r) => {
      let text = r.responseText.replace(/^\[Part \d+\/\d+ Answer\]:\s*/m, '').trim();
      return text;
    });

    mergedOutput = cleanedSections.join('\n\n');
    mergerMethod = 'coherent-stitcher';
  }

  const latencyMs = Date.now() - start;
  return {
    mergedText: mergedOutput,
    finalTokens: countTokens(mergedOutput),
    latencyMs,
    mergerMethod
  };
}
