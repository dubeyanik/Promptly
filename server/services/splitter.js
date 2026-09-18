import { countTokens } from './tokenizer.js';

/**
 * Splits oversized prompts into N self-contained chunks along natural boundaries
 */
export function splitPrompt({
  prompt,
  maxChunkTokens = 800,
  intent = 'qa',
  isDivisible = true,
  forceSplit = false
}) {
  const totalTokens = countTokens(prompt);

  // If prompt is small or doesn't exceed target chunk size, no split needed
  if (totalTokens <= maxChunkTokens && !forceSplit) {
    return {
      shouldSplit: false,
      totalChunks: 1,
      totalTokens,
      chunks: [{
        chunkIndex: 0,
        totalChunks: 1,
        tokens: totalTokens,
        title: 'Full Prompt',
        content: prompt
      }]
    };
  }

  // If flagged as non-divisible (e.g. single-thread reasoning) and user didn't force split
  if (!isDivisible && !forceSplit) {
    return {
      shouldSplit: false,
      reasoningWarning: true,
      message: 'Single-thread reasoning prompt: splitting is NOT recommended as it may disrupt chain-of-thought.',
      canOverride: true,
      totalChunks: 1,
      totalTokens,
      chunks: [{
        chunkIndex: 0,
        totalChunks: 1,
        tokens: totalTokens,
        title: 'Full Prompt (Undivided)',
        content: prompt
      }]
    };
  }

  // Detect potential global instruction/preamble in first line
  const lines = prompt.split('\n');
  let preamble = '';
  let body = prompt;

  if (lines.length > 2 && (lines[0].toLowerCase().includes('instruction') || lines[0].toLowerCase().includes('following') || lines[0].endsWith(':'))) {
    preamble = lines[0].trim();
    body = lines.slice(1).join('\n').trim();
  }

  // Split boundaries strategy
  let rawSections = [];

  // Try splitting by Markdown Headers (## or ###)
  if (/#+\s+.+/.test(body)) {
    rawSections = body.split(/(?=^#+\s+)/m).map(s => s.trim()).filter(Boolean);
  }

  // Try splitting by Numbered list items (e.g. 1., 2., or Question 1:)
  if (rawSections.length <= 1 && /(?:^|\n)(?:\d+[\.\)]|Question\s*\d+:)/i.test(body)) {
    rawSections = body.split(/(?=(?:^|\n)(?:\d+[\.\)]|Question\s*\d+:))/i).map(s => s.trim()).filter(Boolean);
  }

  // Fallback: split by paragraph double-newlines
  if (rawSections.length <= 1) {
    rawSections = body.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  }

  // Fallback if still single block: split by sentences or line groups
  if (rawSections.length <= 1) {
    const sentences = body.match(/[^.!?]+[.!?]+(\s+|$)/g) || [body];
    const grouped = [];
    let currentGroup = '';

    for (const sent of sentences) {
      if ((currentGroup + sent).length > 600) {
        if (currentGroup) grouped.push(currentGroup.trim());
        currentGroup = sent;
      } else {
        currentGroup += sent;
      }
    }
    if (currentGroup.trim()) grouped.push(currentGroup.trim());
    rawSections = grouped.length > 0 ? grouped : [body];
  }

  // Group smaller adjacent sections together up to maxChunkTokens
  const groupedChunks = [];
  let currentChunkText = '';

  for (const sec of rawSections) {
    const secTokens = countTokens(sec);
    const currTokens = countTokens(currentChunkText);

    if (currTokens + secTokens <= maxChunkTokens || currentChunkText === '') {
      currentChunkText = currentChunkText ? `${currentChunkText}\n\n${sec}` : sec;
    } else {
      groupedChunks.push(currentChunkText);
      currentChunkText = sec;
    }
  }
  if (currentChunkText) {
    groupedChunks.push(currentChunkText);
  }

  // Format into final self-contained chunks
  const totalChunks = groupedChunks.length;
  const chunks = groupedChunks.map((content, idx) => {
    let finalContent = content;
    if (preamble && totalChunks > 1) {
      finalContent = `[Instruction: ${preamble}]\n\n[Section ${idx + 1} of ${totalChunks}]:\n${content}`;
    }

    return {
      chunkIndex: idx,
      totalChunks,
      tokens: countTokens(finalContent),
      title: `Chunk ${idx + 1} of ${totalChunks}`,
      content: finalContent
    };
  });

  return {
    shouldSplit: totalChunks > 1,
    totalChunks,
    totalTokens,
    splitStrategy: 'boundary-aware-chunking',
    reasoningWarning: !isDivisible,
    canOverride: true,
    chunks
  };
}
