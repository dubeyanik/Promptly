import { diffWordsWithSpace } from 'diff';
import { countTokens } from './tokenizer.js';

const REWRITE_SYSTEM_PROMPT = "Rewrite for max token efficiency, preserve full intent. Output only rewritten prompt.";

/**
 * Intelligent fallback rule-based compressor that strips filler, redundant polite tokens,
 * and collapses verbose instructions into compact imperative sentences.
 */
function algorithmicCompressPrompt(text) {
  let cleaned = text;

  // Code block protection: protect code blocks from being butchered
  const codeBlocks = [];
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Strip polite introductory padding
  cleaned = cleaned.replace(/\b(could you please|can you please|would you kindly|i would appreciate it if you could|i want you to act as|i would like you to|please help me to|hey there,?\s*|hello,?\s*|dear ai,?\s*)\b/gi, '');
  
  // Strip wordy filler phrases
  cleaned = cleaned.replace(/\b(in order to|as a matter of fact|at this point in time|for the purpose of|due to the fact that|it is important to note that|take into consideration that)\b/gi, '');
  
  // Compress common wordy constructs
  cleaned = cleaned.replace(/\bin order to\b/gi, 'to');
  cleaned = cleaned.replace(/\bmake sure (that )?you\b/gi, 'ensure');
  cleaned = cleaned.replace(/\bgive me a detailed\b/gi, 'provide');
  cleaned = cleaned.replace(/\bwrite down\b/gi, 'write');
  cleaned = cleaned.replace(/\bstep by step explanation\b/gi, 'step-by-step:');
  cleaned = cleaned.replace(/\bkeep in mind that\b/gi, 'note:');
  cleaned = cleaned.replace(/\bdo not forget to\b/gi, 'must');
  cleaned = cleaned.replace(/\ball of the\b/gi, 'all');

  // Strip repetitive spaces and clean lines
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter((line, idx, arr) => line.length > 0 || (idx > 0 && arr[idx - 1].length > 0))
    .join('\n')
    .trim();

  // Restore code blocks
  codeBlocks.forEach((block, idx) => {
    cleaned = cleaned.replace(`__CODE_BLOCK_${idx}__`, block);
  });

  // If compression resulted in empty or identical text, return a crisp imperative form
  if (!cleaned || cleaned.length < 5) {
    return text.trim();
  }

  return cleaned;
}

/**
 * Rewrites a prompt for maximum token efficiency via OpenRouter/Groq or fallback compressor
 */
export async function rewritePrompt(originalPrompt, apiKey = null) {
  const originalTokens = countTokens(originalPrompt);
  let rewrittenPrompt = '';
  let providerUsed = 'algorithmic-compressor';

  const openRouterKey = apiKey || process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (openRouterKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://promptly.ai',
          'X-Title': 'Promptly Optimizer'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: REWRITE_SYSTEM_PROMPT },
            { role: 'user', content: originalPrompt }
          ],
          temperature: 0.2,
          max_tokens: 1000
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        const data = await response.json();
        const output = data.choices?.[0]?.message?.content?.trim();
        if (output && output.length > 0) {
          rewrittenPrompt = output;
          providerUsed = 'openrouter (llama-3.1-8b)';
        }
      }
    } catch (err) {
      console.warn('OpenRouter rewrite call failed, falling back:', err.message);
    }
  }

  // If still empty and Groq is configured
  if (!rewrittenPrompt && groqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: REWRITE_SYSTEM_PROMPT },
            { role: 'user', content: originalPrompt }
          ],
          temperature: 0.2,
          max_tokens: 1000
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const data = await response.json();
        const output = data.choices?.[0]?.message?.content?.trim();
        if (output) {
          rewrittenPrompt = output;
          providerUsed = 'groq (llama-3.1-8b)';
        }
      }
    } catch (err) {
      console.warn('Groq rewrite call failed:', err.message);
    }
  }

  // Fallback to high efficiency heuristic compressor
  if (!rewrittenPrompt) {
    rewrittenPrompt = algorithmicCompressPrompt(originalPrompt);
    providerUsed = 'promptly-token-engine (heuristic)';
  }

  const optimizedTokens = countTokens(rewrittenPrompt);
  const tokenDelta = originalTokens - optimizedTokens;
  const reductionPercent = originalTokens > 0 
    ? Math.max(0, Math.round((tokenDelta / originalTokens) * 100))
    : 0;

  // Compute text diff for frontend rendering
  const diffParts = diffWordsWithSpace(originalPrompt, rewrittenPrompt);

  return {
    originalPrompt,
    rewrittenPrompt,
    originalTokens,
    optimizedTokens,
    tokensSaved: Math.max(0, tokenDelta),
    reductionPercent,
    providerUsed,
    diffParts
  };
}
