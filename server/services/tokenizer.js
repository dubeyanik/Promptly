import { getEncoding } from 'js-tiktoken';

let encoder = null;
try {
  encoder = getEncoding('cl100k_base');
} catch (err) {
  console.warn('Could not initialize cl100k_base tokenizer directly, fallback will be used:', err.message);
}

/**
 * Counts tokens in text accurately using tiktoken cl100k_base
 * @param {string} text 
 * @returns {number} token count
 */
export function countTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  if (encoder) {
    try {
      const tokens = encoder.encode(text);
      return tokens.length;
    } catch (e) {
      // Fallback
    }
  }
  // Standard heuristic: ~4 characters per token
  return Math.max(1, Math.ceil(text.length / 3.8));
}

export function getTokenStats(text) {
  const tokens = countTokens(text);
  const chars = text ? text.length : 0;
  const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  return {
    tokens,
    chars,
    words,
    avgCharsPerToken: tokens > 0 ? (chars / tokens).toFixed(2) : 0
  };
}
