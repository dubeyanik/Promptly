# Promptly ⚡
> **One Prompt. Every AI. Optimized for Every Token.**

Promptly is an intelligent AI Prompt & Model Optimizer built for hackathons and production workflows. It analyzes prompt intent and complexity, counts tokens in real time, recommends the cheapest sufficient model tier, rewrites prompts for token minimization, intelligently chunks oversized prompts across multiple providers with quota tracking and failover, aggregates responses, and computes real-time cost savings.

## 🚀 Key Features
- **Live Token Counter**: Real-time token tracking powered by 	iktoken.
- **Rule-Based Intent Classifier**: Accurately classifies prompts into code, creative, summarize, qa, easoning, or 	ranslate with complexity scoring (1-10).
- **Smart Model Recommender**: Selects the cheapest sufficient model tier (small, medium, large, rontier) with confidence ratings.
- **Prompt Token Optimizer**: Rewrites prompts to eliminate redundancy while preserving 100% semantic intent.
- **Side-by-Side Diff Viewer**: Visual token diff showing before vs. after optimization and savings percentage.
- **Oversized-Prompt Handler**: Divides long prompts into self-contained chunks along natural boundaries with single-thread reasoning guards.
- **Multi-Provider Dispatcher & Quota Tracker**: In-memory quota monitoring with automatic failover across OpenRouter, Hugging Face, Groq, and Together AI.
- **Response Aggregator**: Merges chunked outputs into a unified, coherent answer.
- **Cost Savings Analytics**: Live cost comparison across top candidate models and savings vs. frontier models.

## 🛠️ Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express
- **State**: In-memory session state (zero database overhead)

---
*Work in progress — building core MVP features.*
