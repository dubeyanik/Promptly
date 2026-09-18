import { getEncoding } from 'js-tiktoken';

let encoder = null;
try {
  encoder = getEncoding('cl100k_base');
} catch (e) {
  console.warn('Clientside js-tiktoken cl100k_base initialization note:', e);
}

export function countTokensClient(text) {
  if (!text || typeof text !== 'string') return 0;
  if (encoder) {
    try {
      return encoder.encode(text).length;
    } catch (e) {
      // fallback
    }
  }
  return Math.max(1, Math.ceil(text.length / 3.8));
}
