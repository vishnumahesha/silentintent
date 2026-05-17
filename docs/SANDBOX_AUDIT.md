# SilentIntent Sandbox Audit

Snapshot captured immediately before the Midnight-bridge phase.

## Current working app

Single-page Next.js 16 App Router app. State machine lives in
`app/page.tsx`. Flow:

1. App loads — Hero treasury `$10,000 USDC`, hidden policy commitment
   visible, AI extraction idle, public verifier empty.
2. **Analyze BrightReach** → AI extraction reveals chips, including a
   flagged `partner_enrichment`. Vendor card border doesn't change yet.
3. **Attempt BrightReach Authorization** → proof timeline animates, the
   `forbiddenTerm absent` constraint fails, vendor card flips REJECTED
   red, a REJECTED proof receipt enters the public verifier, treasury
   stays at $10,000.
4. **Analyze CleanList** → AI extraction switches to CleanList facts,
   no flagged chips.
5. **Authorize CleanList** → vendor card flips AUTHORIZED green,
   treasury debits to $7,750 with a spring animation, AUTHORIZED proof
   receipt enters the public verifier (price band, four commitments).
6. **Reset Demo** → clears all state, bumps `resetKey` to retrigger
   commitment-hash scramble animations.

`Run Full Demo` exists but is gated behind
`process.env.NODE_ENV !== 'production'`.

## Existing components

| Component | Role |
|---|---|
| `TreasuryHeader` | Top bar with brand, subtitle, secondary treasury display |
| `HeroTreasury` | Big right-column treasury anchor inside the hero; primary DeFi visual |
| `NarrativeStepper` | 4-pill stepper under the hero explaining the product |
| `HiddenPolicyPanel` | 4 redacted fields + private-witness badge + policy commitment |
| `CompetitorIntelPanel` | Leaked-intent vs SilentIntent disclosure comparison |
| `VendorCard` | Per-vendor UI with chips, optional proposal, result block, two buttons |
| `AIExtractionPanel` | Extracted facts (active vendor) + truth badge with tooltip |
| `PublicVerifier` | Proof timeline (pass/fail per constraint) + disclosure receipt cards |
| `DemoControls` | Fixed bottom-right tray with manual action buttons |
| `CommitmentHash` | Mono hash display with hydration-safe scramble animation |
| `RedactedField` | Small label + shimmering redaction bar |
| `AppFooter` | Mode + Network honesty badges + Technical Artifacts link strip |

## Existing logic

`lib/mockProof.ts` is the entire backend today.

- Constants: `POLICY_MAX_CENTS = 250000`, `POLICY_REQUIRED_CATEGORY = 'lead_data'`,
  `POLICY_REQUIRED_CREDENTIAL = 'freshness_verified'`,
  `POLICY_FORBIDDEN_TERM = 'campaign_metadata_reuse'`, `POLICY_ID`.
- Vendor offer facts hardcoded inline (`VENDOR_A_FACTS`, `VENDOR_B_FACTS`).
- Deterministic `stableHash` based on two FNV/imul rounds; not cryptographic.
- `canonical` for stable JSON serialization.
- `evaluateOffer` returns four checks (`price`, `category`, `credential`,
  `forbidden`).
- `buildProof` emits commitments (intent / offer / vendor / authorization),
  status, deal ID, policy ID, price band, treasury action, debit cents,
  proof hash, and a 4-check list.
- `generateProof` adds a 1400 ms `setTimeout` so the proof animation
  registers, then returns the deterministic result.
- `__policyForTests` exposes constants for the verify script (the
  verify script duplicates them today to avoid a TS import).

## Existing docs

- `README.md` — public hackathon README with pitch, demo flow,
  privacy/disclosure lists, Midnight section, AI truth boundary,
  limitations, roadmap, run instructions.
- `docs/DEMO_SCRIPT.md` — voiceover script with timestamps.
- `docs/DEMO_FLOW.md` — manual click sequence (handoff sibling).
- `docs/DEVPOST_DRAFT.md` — Devpost submission draft.
- `docs/SUBMISSION_CHECKLIST.md` — pre-recording / recording / Devpost
  checklist.
- `docs/HANDOFF.md` — what to copy / not to copy into team repo.
- `docs/COMPONENT_MAP.md` — every component, its props, conventions.
- `docs/MIDNIGHT_TOOLING_CHECK.md` — local tool versions and gaps.
- `contracts/SilentIntentAuthorization.pseudo.compact.md` — circuit
  spec with private witnesses, public outputs, 8 constraints, ledger
  sketch.
- `scripts/verify-demo-model.mjs` — 19 assertions covering
  reject/authorize/debit/determinism/disclosure boundary.

## Current build status

`npm run build`: passing (Next.js 16.2.6 + Turbopack, 4/4 static
pages, TypeScript clean).
`npm run verify:demo`: passing (19/19 assertions).

## Missing Midnight-native pieces

| Piece | Status |
|---|---|
| `contracts/SilentIntent.compact` source file | **Missing.** Spec exists; no actual `.compact` file. |
| Witness adapter (`lib/witnessAdapter.ts`) | **Missing.** Constants and offer facts live inline in `mockProof.ts`. |
| Strongly typed proof types (`lib/proofTypes.ts`) | **Missing.** Types live inline in `mockProof.ts`. |
| Hash helper module (`lib/proofHash.ts`) | **Missing.** Stable hash is private to `mockProof.ts`. |
| Compiled contract | **Not compiled.** Compact CLI not installed locally. |
| Live proof execution | **Not wired.** No proof server image, no Docker locally. |
| Wallet integration | **Not wired.** |
| Local devnet integration | **Not wired.** |
| Real on-chain treasury debit | **Not implemented.** UI-state debit only. |
| Verification script alignment | Verify script duplicates constants from `mockProof.ts`; needs to re-verify after the refactor. |
| Honest implementation status doc | Partial — covered piecemeal in README + HANDOFF; needs a single `docs/MIDNIGHT_STATUS.md`. |

## Next steps (this session)

1. Extract types into `lib/proofTypes.ts`.
2. Extract hashing into `lib/proofHash.ts`.
3. Create `lib/witnessAdapter.ts` and centralize policy + offer facts.
4. Refactor `lib/mockProof.ts` to consume the adapter.
5. Write a minimal best-effort `contracts/SilentIntent.compact` and a
   companion `contracts/README.md` honest about compile status.
6. Write `docs/MIDNIGHT_STATUS.md`.
7. Expand `scripts/verify-demo-model.mjs` assertions (privacy guarantees,
   priceBand, treasuryAction).
8. Update `README.md` real-vs-mocked table to include the new modules.
9. Add a small implementation-status strip near the PublicVerifier
   pointing at `docs/MIDNIGHT_STATUS.md` and the Compact source.
