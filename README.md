# Promptly — AI Prompt & Model Optimizer ⚡
> **Tagline:** *"One Prompt. Every AI. Optimized for Every Token."*

Promptly is an AI Prompt & Model Optimizer and intelligent router designed as a hackathon MVP. It eliminates AI token waste and optimizes inference costs by classifying user prompt intent, evaluating structural complexity, rewriting payloads for maximum token efficiency, splitting oversized tasks across provider boundaries, and routing requests to the cheapest sufficient model tier.

---

## 🚀 Key Features Built

1. **Live BPE / TikToken Counter (`cl100k_base`)**: Instant keystroke-level token counting, character metrics, and real-time Frontier cost estimation.
2. **Rule-Based Intent Classifier & Complexity Meter (1–10)**:
   - Categorizes prompts into: `code`, `creative`, `summarize`, `qa`, `reasoning`, `translate`.
   - Generates a 1–10 complexity score based on syntax, length, depth, and multi-step constraints.
   - Evaluates task divisibility; flags single-thread reasoning prompts as *"not recommended to split"* with a user override toggle.
3. **Model Recommendation Engine**:
   - Maps task + size to the cheapest sufficient tier:
     - `small`: Phi-4 (14B), Gemma 4 (9B)
     - `medium`: Mistral Small (24B), Llama 4 Scout (70B)
     - `large`: Qwen 3.7 (235B), GLM 5.1
     - `frontier`: DeepSeek V4, GLM 5.2, Kimi K2.6
   - Outputs a confidence score (e.g. `95% Confidence`).
4. **Token-Efficiency Prompt Rewriter**:
   - Employs system prompt: *"Rewrite for max token efficiency, preserve full intent. Output only rewritten prompt."*
   - Includes a high-efficiency algorithmic fallback compressor that strips conversational padding, redundant politeness, and repetitive filler.
5. **Prompt Diff View**:
   - Visual before/after diff showing strikethrough deletions (`diff-del`) and optimized insertions (`diff-ins`).
   - Token reduction badge (e.g., `-34% Tokens Saved`) with a one-click copy button.
6. **Model Picker Override**:
   - Grouped dropdown allowing users to override the recommendation with any model across Small, Medium, Large, or Frontier tiers.
7. **Oversized Prompt Chunker**:
   - Splits oversized payloads across natural paragraph and section boundaries into $N$ self-contained chunks.
   - Retains context headers across chunk boundaries.
8. **In-Memory Quota Tracker (`quotas.json`)**:
   - Tracks `{ provider: requests_used, tokens_used, reset_time }` in real-time.
   - Live percentage meters in header for OpenRouter, Hugging Face, Groq, and Together AI with a reset trigger.
9. **Multi-Provider Round-Robin Dispatcher**:
   - Round-robin chunk distribution across available quota pools.
   - Primary gateway: OpenRouter; Fallback: Hugging Face Inference API; Extra: Groq, Together AI.
   - On HTTP 429 / quota exhaustion, marks provider exhausted and fails over to the next provider.
10. **Output Aggregator**:
    - Merges multi-chunk responses via system prompt: *"Combine into one coherent answer, remove redundancy, resolve conflicts. Output only merged answer."*
11. **Execution Output & Cost Savings Panel**:
    - Displays final answer, token totals (in/out), latency (ms), actual cost, and glowing metric: **"Saved $X.XX (XX%) vs Frontier Baseline"**.
12. **Top 3 Candidate Models Cost Comparison Table**:
    - Side-by-side comparison of Recommended vs Alternative vs Frontier models.
13. **Collapsible Session History Sidebar**:
    - Stores past prompts, models used, and cumulative dollar savings with quick reload and JSON benchmark report export.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, `js-tiktoken`.
- **Backend**: Node.js, Express, `js-tiktoken`, `diff`, `dotenv`, `cors`.
- **State**: In-memory session state (zero database overhead).
- **Deployment**: Deploy-ready for Vercel (`vercel.json`) & Render (`render.yaml`).

---

## 🏁 Quick Start

### 1. Install dependencies
```bash
# In project root
npm install

# In client directory
npm install --prefix client
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` and fill in any keys you have:
```bash
cp .env.example .env
```
*(Keys can also be configured dynamically in the web UI via the **API Keys** modal.)*

### 3. Run Development Server
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🧪 Hackathon Demoing & Evaluation

Promptly comes pre-configured with **Hackathon Quick Presets** so judges can test every feature in a single click:
1. **💻 Code Refactor**: Tests code intent, medium/large tier routing, and token reduction diffs.
2. **🧩 Multi-Part Q&A**: Triggers parallel chunk splitting across 4 providers with the banner: *"⚡ Split into 4 parts across 4 providers"*, followed by aggregation.
3. **📄 Long Document Summary**: Demonstrates boundary-aware oversized chunking and map-reduce synthesis.
4. **🧠 Deep Reasoning**: Highlights single-thread chain-of-thought detection, displaying *"Not recommended to split"* with a manual override.
5. **🌐 Multilingual Batch**: Demonstrates ultra-low-cost small tier routing (Phi-4 / Gemma 4).
