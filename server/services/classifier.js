/**
 * Rule-based intent classifier & complexity scoring engine
 * Supported intents: code | creative | summarize | qa | reasoning | translate
 */

export function classifyIntentAndComplexity(text = '') {
  const prompt = text.trim();
  const lower = prompt.toLowerCase();
  
  // 1. Intent Detection Scores
  const scores = {
    code: 0,
    creative: 0,
    summarize: 0,
    reasoning: 0,
    translate: 0,
    qa: 0
  };

  // Code indicators
  if (/```|`[^`]+`|\b(function|def|const|let|var|class|import|return|async|await|console\.log|print\(|SELECT|FROM|WHERE|INSERT|UPDATE|<div>|export|interface|struct|impl|fn)\b/.test(prompt)) {
    scores.code += 5;
  }
  if (/\b(code|script|python|javascript|typescript|java|c\+\+|rust|golang|bash|sql|csv|json|html|css|react|node|api|endpoint|debug|refactor|compile|syntax error|stack trace|algorithm|regex|runtime|unit test|database|lru|cache|parse|parser|hash map|linked list)\b/.test(lower)) {
    scores.code += 5;
  }

  // Creative indicators
  if (/\b(story|poem|verse|metaphor|character|dialogue|fiction|screenplay|sci-fi|fantasy|rhyme|creative writing|novel|plot twist)\b/.test(lower)) {
    scores.creative += 5;
  }
  if (/\b(imagine|write an essay|write a scene|tone of voice|vivid description|narrative)\b/.test(lower)) {
    scores.creative += 3;
  }

  // Summarize indicators
  if (/\b(summarize|summary|tldr|tl;dr|key takeaways|bullet points|brief overview|condense|abstract|synopsis|executive summary)\b/.test(lower)) {
    scores.summarize += 6;
  }
  if (/\b(in short|in a few words|main points|sum up)\b/.test(lower)) {
    scores.summarize += 4;
  }

  // Reasoning indicators
  if (/\b(prove|step by step|deduce|deduction|theorem|contradiction|derivation|calculate|probability|bayes|hypothesis|counterexample|logic puzzle)\b/.test(lower)) {
    scores.reasoning += 6;
  }
  if (/\b(why is|explain the underlying cause|chain of thought|first principles|implications of|what if)\b/.test(lower)) {
    scores.reasoning += 4;
  }

  // Translation indicators
  if (/\b(translate|translation|english to|spanish|french|german|chinese|japanese|russian|portuguese|hindi|arabic|multilingual)\b/.test(lower)) {
    scores.translate += 6;
  }

  // QA indicators
  const questionMatches = (prompt.match(/\bquestion\s*\d+:|\?/gi) || []).length;
  if (questionMatches >= 2) {
    scores.qa += questionMatches * 4;
  }
  if (/\b(what is|who is|where is|when did|how do I|can you explain|difference between|pros and cons|which is better|answer the following)\b/i.test(lower)) {
    scores.qa += 5;
  }
  if (prompt.includes('?') || /^(how|what|why|who|where|when|can|should|is|are)\b/i.test(prompt)) {
    scores.qa += 3;
  }

  // Determine top intent
  let primaryIntent = 'qa';
  let highestScore = 0;
  for (const [intent, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      primaryIntent = intent;
    }
  }

  // If score is too low and text is simple, fall back to qa or creative
  if (highestScore <= 2) {
    if (prompt.length < 80 && !prompt.includes('?')) {
      primaryIntent = 'creative';
    } else {
      primaryIntent = 'qa';
    }
  }

  // 2. Complexity Calculation (1 to 10)
  let complexity = 1;
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;

  // Length factor (up to 3 points)
  if (wordCount > 600) complexity += 3;
  else if (wordCount > 250) complexity += 2;
  else if (wordCount > 80) complexity += 1;

  // Structural complexity (paragraphs, bullets, code blocks) (up to 2 points)
  const paragraphCount = prompt.split(/\n\s*\n/).length;
  const bulletCount = (prompt.match(/^[\s*•\-|\d+\.]/gm) || []).length;
  if (paragraphCount > 3 || bulletCount > 4) complexity += 1;
  if (prompt.includes('```')) complexity += 1;

  // Technical & constraint depth (up to 3 points)
  const constraints = (prompt.match(/\b(must|should not|do not|ensure|strictly|constraint|format as|json|schema|regex|performance|o\(n\))\b/gi) || []).length;
  if (constraints >= 4) complexity += 2;
  else if (constraints >= 1) complexity += 1;

  // Reasoning / Multi-step depth (up to 2 points)
  const multiStepKeywords = (prompt.match(/\b(first|then|next|subsequently|finally|secondly|step 1|phase|analyze|evaluate|critique|compare and contrast)\b/gi) || []).length;
  if (multiStepKeywords >= 3) complexity += 2;
  else if (multiStepKeywords >= 1) complexity += 1;

  // Domain specific boost
  if (primaryIntent === 'reasoning') complexity += 3;
  if (/\b(induction|theorem|prove|hypothesis|derivation|contradiction)\b/i.test(prompt)) complexity += 2;
  if (primaryIntent === 'code' && (prompt.includes('class') || prompt.includes('algorithm') || prompt.includes('async') || prompt.includes('lru'))) complexity += 2;

  // Clamp 1 to 10
  complexity = Math.max(1, Math.min(10, complexity));

  // 3. Divisibility & Splitting Recommendation
  // Divisible tasks: multi-part Q&A, long documents to summarize, batch translations, independent sub-questions
  // Single-thread reasoning prompts should be flagged "not recommended to split"
  let isDivisible = true;
  let splitRecommendation = "recommended to split (parallelizable chunks)";
  let splitReason = "Prompt contains modular sections that can be processed concurrently.";

  if (primaryIntent === 'reasoning') {
    isDivisible = false;
    splitRecommendation = "not recommended to split";
    splitReason = "Single-thread reasoning task requires holistic context across deduction steps.";
  } else if (wordCount < 60 && !prompt.includes('1.') && !prompt.includes('?')) {
    isDivisible = false;
    splitRecommendation = "not recommended to split";
    splitReason = "Prompt is concise and atomic; chunking adds overhead.";
  } else if (bulletCount >= 3 || paragraphCount >= 3 || (prompt.match(/\?/g) || []).length >= 3) {
    isDivisible = true;
    splitRecommendation = "recommended to split (high efficiency)";
    splitReason = "Clear distinct questions, paragraphs, or enumerated items identified for parallel dispatch.";
  } else if (primaryIntent === 'summarize' && wordCount > 200) {
    isDivisible = true;
    splitRecommendation = "recommended to split (section map-reduce)";
    splitReason = "Long text can be divided into section summaries and aggregated.";
  } else if (primaryIntent === 'translate' && paragraphCount >= 2) {
    isDivisible = true;
    splitRecommendation = "recommended to split (batch translation)";
    splitReason = "Independent paragraphs can be translated concurrently.";
  }

  return {
    intent: primaryIntent,
    intentScores: scores,
    complexity,
    isDivisible,
    splitRecommendation,
    splitReason,
    metrics: {
      wordCount,
      paragraphCount,
      bulletCount,
      hasCode: scores.code > 0
    }
  };
}
