# MedGuard

A demo AI service that checks drug interactions. A pharmacist (or any caller) submits a patient's current medications plus a newly prescribed drug; MedGuard asks Claude to look up known interactions against a small local dataset, then returns a grounded, plain-language risk summary.

This is a demonstration of tool-use plus retrieval, not a clinical product. The interaction list is a handful of curated examples, not a licensed drug database.

## What it does

- Accepts `POST /check-interaction` with `currentMeds` (array of drug names) and `newDrug`.
- Sends those names to Claude (`claude-sonnet-4-5`) with a `lookup_interactions` tool.
- Looks up matching rows in `src/data/interactions.json` (severity + summary).
- Feeds the lookup results back as a tool result so Claude's final answer is grounded in that data rather than model memory alone.
- Exposes `GET /health` for a simple liveness check.

Example request:

```bash
curl -X POST http://localhost:3000/check-interaction \
  -H "Content-Type: application/json" \
  -d '{"currentMeds": ["warfarin"], "newDrug": "aspirin"}'
```

## Architecture

```
Client
  → Express API  (POST /check-interaction)
    → Claude tool-use call  (lookup_interactions)
      → Local interaction lookup  (JSON dataset, name-matched)
        → Tool result returned to Claude
          → Grounded pharmacist-facing response
```

| Layer | Role |
| --- | --- |
| Express (`src/app.ts`, `src/routes/`) | Validates input with Zod and returns `{ assessment }`. |
| Claude agent (`src/services/claudeAgent.ts`) | Runs the tool-use loop: first message may request a lookup; second message produces the summary. |
| Retriever (`src/services/retriever.ts`) | Filters `src/data/interactions.json` by drug name. This is the RAG knowledge base — a static JSON file instead of embeddings. |

Claude never invents the interaction records. It can only summarize what the tool returned (or report that nothing matched).

## Run locally

**Requirements:** Node.js, an [Anthropic API key](https://console.anthropic.com/).

```bash
npm install
```

Copy `.env.example` to `.env` and set your key:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Start the development server (watches for file changes):

```bash
npm run dev
```

The server listens on port `3000` by default (`PORT` can override this). Confirm it is up with:

```bash
curl http://localhost:3000/health
```

## Evals

```bash
npm test
```

Vitest runs unit tests (`src/**/*.test.ts`) and interaction evals (`src/**/*.eval.ts`). The evals call the live Anthropic API, so `ANTHROPIC_API_KEY` must be set — they check that a known major pair (warfarin + aspirin) is flagged for bleeding risk, and that an unrelated pair is not labeled contraindicated.

Eval timeout is 30 seconds (`vitest.config.ts`).

## Production considerations

This demo is intentionally small. Taking it toward a real clinical workflow would require, at least:

- **Licensed knowledge base.** Swap `interactions.json` for a vector store over a licensed drug-interaction database (with embeddings, synonym/RxNorm resolution, and freshness). Name-matching a static file will miss aliases, combination products, and updates.
- **HIPAA-compliant logging and audit trails.** Do not log raw PHI to stdout. Record who requested what, which knowledge-base version was used, and what Claude returned, with retention and access controls appropriate for protected health information.
- **Rate limiting and auth.** The current API is unauthenticated. Production needs identity (API keys or SSO), per-caller rate limits, and abuse protection around the Claude spend path.
- **A real eval platform.** The Vitest checks are ad hoc smoke tests against two examples. Use something like [Langfuse](https://langfuse.com/) (or equivalent) for traced runs, regression datasets, human review, and scoring over a maintained interaction corpus — not a couple of string `expect`s in CI.
