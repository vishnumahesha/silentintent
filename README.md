# SilentIntent

> Confidential spend authorization for AI agents.

An AI agent can spend company money only if a private proof says the
purchase follows hidden procurement policy.

**Private policy in. Public authorization out.**

---

## What is real vs mocked

| Layer | Sandbox status |
|---|---|
| Frontend flow | Working end-to-end |
| Vendor proposals | Synthetic but realistic |
| AI extraction | Cached deterministic extraction |
| Proof types | Implemented (`lib/proofTypes.ts`) |
| Witness adapter | Implemented (`lib/witnessAdapter.ts`) |
| Proof model | Deterministic mock proof (`lib/mockProof.ts`) |
| Compact contract | Compiled with Compact compiler `0.31.0`, language `0.23.0`, runtime `0.16.0` — see `contracts/intent-evaluation/`. The UI uses a deterministic proof model with matching witness shapes for demo reliability. |
| Treasury debit | Mock UI state gated by proof result |
| Real payment movement | Not included |
| Wallet / devnet | Not wired |

Mock status is on-screen in the app footer (`Mode: Cached AI + mock proof`,
`Network: Midnight local · mock proof layer`). The constraint shape and
public-output shape match the live Compact circuit defined in
[`contracts/SilentIntentAuthorization.pseudo.compact.md`](contracts/SilentIntentAuthorization.pseudo.compact.md),
so the UI bindings don't change when the real circuit ships.

## Technical artifacts

- [`lib/proofTypes.ts`](lib/proofTypes.ts) — typed witness, public output,
  and proof-result definitions consumed by the UI and the mock proof.
- [`lib/witnessAdapter.ts`](lib/witnessAdapter.ts) — maps the buyer
  policy and the extracted offer facts into a bounded
  `AuthorizationWitness` and produces all four commitments.
- [`lib/mockProof.ts`](lib/mockProof.ts) — evaluates the four authorization
  constraints and emits a `PublicAuthorizationOutput`-shaped result.
- [`contracts/intent-evaluation/SilentIntent.compact`](contracts/intent-evaluation/SilentIntent.compact) —
  compiled circuit (Compact compiler 0.31.0, language 0.23.0, runtime 0.16.0).
  Compiled metadata in [`contracts/intent-evaluation/contract-info.json`](contracts/intent-evaluation/contract-info.json).
- [`contracts/SilentIntentAuthorization.pseudo.compact.md`](contracts/SilentIntentAuthorization.pseudo.compact.md)
  — full circuit specification (witnesses, public outputs, 8 constraints,
  ledger sketch).
- [`scripts/verify-demo-model.mjs`](scripts/verify-demo-model.mjs) —
  34 assertions checking reject/authorize outcomes, treasury debit,
  commitment determinism, and the privacy boundary. Run with
  `npm run verify:demo`.
- [`docs/MIDNIGHT_STATUS.md`](docs/MIDNIGHT_STATUS.md) — single source
  of truth for what is real vs mocked + the next-step path to a real
  Midnight integration.

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

## Status

- Frontend demo working end-to-end (Vendor A rejects, Vendor B authorizes, treasury debits)
- Deterministic mock proof model (no real ZK proof, but constraint shape matches the Compact spec)
- AI extraction is cached/deterministic — no API key required
- No real payment movement
- No Midnight mainnet deployment claimed
- `npm run build` and `npm run verify:demo` pass on `main`

See [`docs/HANDOFF.md`](docs/HANDOFF.md) for the teammate handoff guide,
[`docs/COMPONENT_MAP.md`](docs/COMPONENT_MAP.md) for the component overview,
and [`docs/DEMO_FLOW.md`](docs/DEMO_FLOW.md) for the manual demo flow.

---

## Team contributions

- **Vishnu**: PM/demo, product framing, final integration.
- **Alim**: authored the intent-evaluation Compact contract on the team
  branch and ran it through the Compact compiler
  (`compiler 0.31.0` / `language 0.23.0` / `runtime 0.16.0`). Source
  and compiler output imported under `contracts/intent-evaluation/`.
- **Shreyas**: vendor proposal text, AI extraction schema, and the
  cached-fallback extraction path on the team branch. Provenance
  artifacts imported under `data/` with mapping notes in
  [`docs/AI_EXTRACTION.md`](docs/AI_EXTRACTION.md).
- **Martin** (and **Tyler**): early frontend scaffolding on the team
  branch (superseded by the sandbox UI in this repo).
- **Nako**: implementation support.
- **ThunderRoar**: implementation support.

Inclusion in the imported artifacts means the work was committed to a
team branch and brought across into this sandbox. The sandbox UI,
witness adapter, mock proof model, verify script, and authorization
Compact source remain sandbox-original.

---

### About this repo

This is the public **sandbox** — design and frontend experiments,
auto-pushed on every meaningful change. The team's working repo lives
elsewhere. Treat this as a portfolio surface.

No secrets, no strategy notes, no judge Q&A drafts. See `CLAUDE.md` for
the auto-push protocol.
