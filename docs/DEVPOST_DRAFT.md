# SilentIntent — Devpost draft

Public-safe draft. Edit before submitting.

## Project name

SilentIntent

## Tagline

Confidential spend authorization for AI agents.

## Track

DeFi primary, AI secondary.

## Inspiration

Agentic commerce is happening in two unsatisfying ways. Either an AI
agent spends money behind a trusted backend (the agent prompts and the
company policy live in the same database, so privacy is internal-only
and centralized) or the agent acts through a public chain where every
line of the procurement policy becomes intelligence the seller side can
scrape, model, and price against.

We wanted a third option: a procurement layer where the AI agent's
policy is private, the vendor offer facts are private, and the only
public outputs are the authorization result, a price band, the treasury
action, and a handful of commitments. The buyer keeps their strategy.
The chain still gets enough state to settle a deal.

## What it does

SilentIntent is a confidential spend authorization console for an AI
agent treasury. The demo runs a single policy: buying dental clinic
lead data with a hidden budget cap, required credentials, and a
forbidden reuse clause.

Two vendor proposals arrive:

- **BrightReach Data** at $1,900 — looks like the obvious winner, but
  the AI extraction layer surfaces a campaign-metadata reuse clause
  buried in "partner enrichment".
- **CleanList Pro** at $2,250 — customer-siloed delivery, no
  cross-client modeling.

The authorization proof rejects BrightReach and authorizes CleanList.
The treasury debits $2,250 to a vendor commitment, and the public
verifier records status, deal ID, price band, treasury action, and
four commitments. Nothing else.

## How we built it

- **Frontend**: Next.js 16 App Router, React 19, TypeScript strict.
- **Motion**: framer-motion for proof-timeline and disclosure
  transitions.
- **Proof model**: a deterministic mock proof layer in `lib/mockProof.ts`
  that mirrors the constraint shape of the intended Compact circuit.
- **Extraction layer**: cached, deterministic AI extraction surfaced
  through the AI Extraction panel — no API key required for the demo.
- **Contract spec**: `contracts/SilentIntentAuthorization.pseudo.compact.md`
  documents the private witnesses, public outputs, and constraints the
  live circuit would enforce.
- **Verification**: `scripts/verify-demo-model.mjs` asserts the
  expected reject/authorize outcomes and treasury debit.

## How we used Midnight

The product's selective-disclosure shape is the Midnight angle:

- Private witnesses (policy + offer facts) are committed.
- Public outputs are limited to status, price band, deal ID,
  commitments, and treasury action.
- The constraint shape matches a Compact circuit (price range,
  category equality, credential membership, forbidden-term exclusion).

The sandbox uses a deterministic mock proof so the demo runs without a
chain. Mock status is shown on-screen and stated in the README. The
spec for the live circuit lives in `contracts/`.

## How we used AI

The AI extraction layer turns the messy English vendor proposal into
typed offer facts. Those facts are what the proof commits to and
verifies.

We're explicit about the boundary: the proof does **not** prove the AI
interpreted the proposal correctly. Production would replace freeform
proposals with vendor-signed structured offer artifacts so the proof
input has cryptographic provenance.

## Challenges

- Drawing the line between selective disclosure (good) and leaking
  enough metadata to reverse the hidden policy (bad).
- Keeping the privacy claims precise — what the proof actually
  guarantees, where the trust assumptions remain.
- Hitting demo-readable proof animations without sacrificing the
  determinism the verification script depends on.

## Accomplishments

- Full demo loop: hidden policy → AI extraction → proof → public
  disclosure → treasury debit.
- Constraint-level proof timeline that lights up the failing check on
  the rejected vendor.
- Deterministic mock proof model with a verification script.
- A "leaked intent" comparison that makes the privacy beat tangible
  instead of abstract.

## What we learned

- The hardest design decision was what to disclose. Almost every
  honest extra disclosure leaks more about the hidden policy.
- AI extraction is a different trust surface than ZK proof
  verification. Conflating them in the pitch makes the project sound
  weaker than it is.

## What's next

- Compile the Compact circuit and wire on-chain verification.
- Vendor-signed offer artifacts (remove the AI truth assumption).
- Payment rail integration so treasury debits settle.
- Multi-agent treasuries with nonce reuse prevention.
- Richer policy language (numeric bands, multi-criteria scoring under
  ZK).

## AI tool disclosure

We used AI coding assistants for frontend scaffolding, design
iteration, documentation drafts, and demo polish. All code was
human-reviewed before commit.

## Built with

Next.js, React, TypeScript, framer-motion, Tailwind v4, Phosphor Icons,
Midnight (target).
