# SilentIntent

> Confidential spend authorization for AI agents.

An AI agent can spend company money only if a private proof says the
purchase follows hidden procurement policy.

**Private policy in. Public authorization out.**

---

## 30-second pitch

AI agents are starting to spend money on behalf of companies. Today that
spend either runs through a trusted backend (the agent's prompts and the
company's policy live in the same database) or through a public chain
(every line of the procurement policy is visible to every vendor).

SilentIntent is a third option. The procurement policy is committed
privately. The agent submits a zero-knowledge proof that a chosen offer
satisfies the policy. The only public outputs are: authorized or not,
which deal, a price band, and commitments. The exact budget, the
forbidden clauses, the vendor's raw terms, and the agent's reasoning
never leave the buyer's side.

## Demo flow

1. Agent treasury starts at **$10,000 USDC**.
2. Hidden procurement policy is committed (max budget, required category,
   required credential, forbidden term).
3. **BrightReach Data** ($1,900) looks like the strongest offer.
4. The AI extraction layer pulls structured facts out of the proposal
   and surfaces a `campaign_metadata_reuse` clause buried inside
   "partner enrichment".
5. The authorization proof **rejects** BrightReach. Treasury unchanged.
6. **CleanList Pro** ($2,250) is customer-siloed, no cross-client modeling.
7. The proof **authorizes** the spend. Treasury debits $2,250, leaving
   **$7,750**.
8. The public verifier records the authorization with status, deal ID,
   price band, treasury action, and four commitments — nothing else.

## What stays private

- Exact maximum budget
- Hidden procurement constraints
- The specific forbidden term
- The vendor's full proposal text
- Raw witness values
- Commitment salts
- The agent's reasoning trace

## What gets disclosed

- Authorization status (`AUTHORIZED` / `REJECTED`)
- Price band (only when authorized; e.g. `$2k-$2.5k`)
- Deal ID
- Policy ID
- Intent commitment, offer commitment, authorization commitment
- Vendor commitment (only when authorized)
- Treasury action (`unchanged` / `debit_authorized`)

## How Midnight fits

Midnight provides the private-witness + selective-disclosure substrate
that this proof model targets. The intended Compact circuit is
documented in
[`contracts/SilentIntentAuthorization.pseudo.compact.md`](contracts/SilentIntentAuthorization.pseudo.compact.md)
and includes private witnesses for the policy and the offer facts,
plus the four equality / membership / range constraints the proof
verifies.

This sandbox ships a deterministic **mock proof layer**
(`lib/mockProof.ts`) so the demo runs without a chain. The proof
shapes, commitments, and disclosure boundary mirror what the live
Compact circuit would expose. **Mock status is honest and on-screen.**

## How AI is used

The AI extraction layer turns the messy English vendor proposal into
structured offer facts: `price_cents`, `category`,
`freshness_verified`, `campaign_metadata_reuse`. Those structured
facts are what the proof commits to and verifies.

In this sandbox, extraction is deterministic and cached — no API key
required.

### Truth boundary

The proof does **not** prove that the AI extracted the proposal
correctly. A production deployment would replace freeform proposals
with vendor-signed structured offer artifacts (signed JSON, EIP-712,
or a verifiable credential), so the proof input has cryptographic
provenance.

The badge in the UI says it plainly:

> AI extracts facts. Midnight verifies constraints.

## Proof model (mock)

Six constraint checks, plus a final disclosure step:

1. Commit hidden policy
2. Commit extracted offer facts
3. `offerPrice ≤ maxPrice`
4. `offerCategory == requiredCategory`
5. `requiredCredential ∈ offerCredentials`
6. `forbiddenTerm ∉ offerForbidden`
7. Disclose authorization result only

For BrightReach, step 6 fails. For CleanList, all six pass.

## Limitations

- Mock proof, not a compiled Compact circuit (yet).
- Authorization, not payment settlement — debit is a UI state
  transition, not an on-chain transfer.
- AI extraction truth is out of scope for v1.
- Single-policy, two-vendor demo.

## Roadmap

- Real Compact circuit + on-chain verification
- Vendor-signed offer artifacts (remove the AI truth assumption)
- Payment rail integration
- Multi-agent treasuries, nonce-tracked reuse prevention
- Richer policy language (numeric bands, multi-criteria)

## Tech stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript (strict)
- framer-motion for state transitions
- Phosphor Icons
- Tailwind v4 tokens via `@theme`

## Run locally

```
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional:

```
npm run build
npm run verify:demo
```

---

### About this repo

This is the public **sandbox** — design and frontend experiments,
auto-pushed on every meaningful change. The team's working repo lives
elsewhere. Treat this as a portfolio surface.

No secrets, no strategy notes, no judge Q&A drafts. See `CLAUDE.md` for
the auto-push protocol.
