export const SAMPLE_PRESETS = [
  {
    id: 'code-optimization',
    title: '💻 Code Refactor',
    tagline: 'Code intent • Medium Tier • Token Savings',
    prompt: `Could you please be so kind as to write a detailed Python implementation of the classic LRU (Least Recently Used) Cache algorithm? 

Make sure that you include the following:
1. Use an internal doubly linked list combined with a hash map in order to achieve strict O(1) time complexity for both get() and put() operations.
2. Please do not forget to handle edge cases like capacity zero or updating existing keys with new values.
3. Write clean docstrings and add brief unit tests verifying eviction ordering.`
  },
  {
    id: 'multi-part-qa',
    title: '🧩 Multi-Part Q&A (Parallel Split)',
    tagline: 'Divisible Task • Multi-Provider Round Robin',
    prompt: `Please provide comprehensive and technical answers to the following 4 independent architectural questions:

Question 1:
What are the key differences between optimistic and pessimistic concurrency control in distributed databases, and when should each approach be preferred?

Question 2:
How does Raft consensus handle network partitions and split-brain scenarios when a majority quorum cannot be reached?

Question 3:
Explain the fundamental mechanics of Log-Structured Merge (LSM) trees versus B-Trees for write-heavy database workloads.

Question 4:
What are the trade-offs between event-driven architectures using Kafka versus distributed message queues like RabbitMQ?`
  },
  {
    id: 'long-doc-summary',
    title: '📄 Long Document (Oversized Split)',
    tagline: 'Oversized text • Paragraph boundary splitting & aggregation',
    prompt: `Please synthesize and summarize the key technical concepts from this system architecture document into an executive summary:

Section 1: Distributed Token Routing
Modern AI gateway architectures require intelligent dynamic load distribution to prevent provider rate limiting (HTTP 429). By tracking token consumption, burst capacities, and provider rate windows in real-time, requests can be dynamically routed to the cheapest available model that satisfies the task requirements.

Section 2: Prompt Compression Mechanics
Prompt tokens represent direct latency and billing overhead. Reducing unnecessary polite fillers, conversational padding, and redundant preambles drops the payload footprint by 30% to 50% without altering instruction intent. This improves time-to-first-token (TTFT) across high-concurrency pipelines.

Section 3: Chunk Splitting and Map-Reduce Aggregation
When token payloads exceed model context windows or provider free tier limits, inputs should be partitioned across natural paragraph or header boundaries. Independent chunks are processed concurrently across heterogeneous providers and then stitched into a single cohesive response via a light aggregation step.

Section 4: Cost Discrepancies Across Model Tiers
Frontier tier reasoning models (like DeepSeek V4 or Kimi K2.6) command up to $2.00 to $4.50 per million tokens. In contrast, small and medium tiers (such as Phi-4 or Mistral Small) cost less than $0.20 per million tokens. Routing straightforward summarization and code extraction away from frontier models yields over 85% cost savings.`
  },
  {
    id: 'reasoning-task',
    title: '🧠 Deep Reasoning (No-Split Flag)',
    tagline: 'Reasoning intent • Single-thread chain-of-thought flag',
    prompt: `Prove step by step using mathematical induction that for every positive integer n, the sum of the cubes of the first n positive integers equals the square of the sum of the first n positive integers:

1^3 + 2^3 + ... + n^3 = (1 + 2 + ... + n)^2

Show the base case clearly, state the induction hypothesis, and detail each algebraic step in the induction step without skipping any intermediate deductions.`
  },
  {
    id: 'translation-task',
    title: '🌐 Multilingual Batch',
    tagline: 'Translate intent • Small Tier • High Speed',
    prompt: `Please translate the following technical notice into Spanish, French, and German with professional tone:

"Notice: Scheduled maintenance will occur this Saturday at 02:00 UTC. API requests may experience elevated latency of up to 500ms. All background token optimization jobs will queue automatically until system health is restored."`
  }
];
