# MedGuard

Node.js + TypeScript backend for MedGuard.

## Install

```bash
npm install
```

Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`.

## Run

Start the development server (watches for file changes):

```bash
npm run dev
```

The server listens on port `3000` by default (`PORT` can override this). Confirm it is up with:

```bash
curl http://localhost:3000/health
```

## Test

```bash
npm test
```
