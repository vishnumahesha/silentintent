# silentintent-sandbox

Design and frontend experiments for SilentIntent — a confidential spend
authorization layer for AI agents.

This is a **sandbox repo**, not the hackathon submission. It exists to
iterate on visual design and component behavior in isolation, and pushes
on every meaningful change.

The submission lives in a separate private repo with the smart contract,
proof circuit, and team-owned integration code.

## What this demos

An AI agent receives two vendor proposals. The agent extracts structured
facts (price, category, credentials) and submits them to a smart contract
together with a zero-knowledge proof. The contract verifies the proof
against a committed-but-hidden procurement policy:

- Vendor A — flagged for a partner-enrichment clause — is **REJECTED**.
- Vendor B — customer-siloed delivery — is **AUTHORIZED**, the treasury
  debits, and a public proof is logged.

The contract sees the proof and the commitment hash. It never sees the
policy thresholds, the raw witness values, or competing bid details.

> Disclose by exception.

## Stack

- Next.js 16 (Turbopack)
- React 19
- TypeScript
- framer-motion
- Phosphor Icons
- Tailwind v4 tokens (via @theme)

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000.

## Repo etiquette

- Auto-push protocol in CLAUDE.md
- Each meaningful change is one commit, conventional `[area] message` format
- No secrets. No strategy notes. No judge Q&A drafts.
- This repo is intentionally public; treat it as a portfolio surface.
