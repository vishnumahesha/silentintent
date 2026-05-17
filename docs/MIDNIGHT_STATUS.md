# Midnight Implementation Status

Brutal honesty snapshot. If you are a teammate or a judge, this is the
single source of truth for what is real vs mocked in this sandbox.

## Summary

| Layer | Status | Notes |
|---|---|---|
| Frontend demo | **Working** | Full vendor reject → vendor authorize → treasury debit flow, end-to-end, no API keys. |
| AI extraction | **Cached deterministic** | Static chip lists per vendor in `components/AIExtractionPanel.tsx`. No live model call. |
| Witness adapter | **Implemented** | `lib/witnessAdapter.ts` produces the full `AuthorizationWitness` and all four commitments from typed inputs. |
| Proof types | **Implemented** | `lib/proofTypes.ts` defines `BuyerPolicyPrivate`, `ExtractedOfferFacts`, `AuthorizationWitness`, `PublicAuthorizationOutput`, `AuthorizationProofResult`. |
| Mock proof | **Implemented** | `lib/mockProof.ts` evaluates the 4 constraints against the witness and emits the public output. Deterministic. |
| Compact contract (authorization, this sandbox) | **Attempted, not compiled** | `contracts/SilentIntent.compact` exists as a minimal best-effort source. Compact CLI not installed locally; see `MIDNIGHT_TOOLING_CHECK.md`. |
| Compact contract (intent-evaluation, team branch) | **Compiled** | A parallel intent-evaluation contract on the team repo's `alim_compact` branch compiled with `compiler 0.31.0` / `language 0.23.0` / `runtime 0.16.0`. Source + compiler output imported here under `contracts/intent-evaluation/`. Not wired into the sandbox runtime. |
| Circuit specification | **Documented** | `contracts/SilentIntentAuthorization.pseudo.compact.md` covers all 8 constraints + ledger sketch. |
| Proof server | **Not tested** | No Docker locally; no proof server image pulled. |
| Local devnet | **Not wired** | |
| Wallet integration | **Not wired** | |
| Real payment movement | **Not included** | Treasury debit is a `useState` decrement in `app/page.tsx`. |
| Mainnet deployment | **Not claimed** | The app surface explicitly says `Mode: Cached AI + mock proof`. |

## What is real

- The UI state machine: vendor states, treasury balance, public log,
  reset key, last debit, proof-timeline outcomes, prevention of double
  debit.
- The authorization logic. The constraint set in `lib/mockProof.ts`
  matches `contracts/SilentIntent.compact` matches
  `contracts/SilentIntentAuthorization.pseudo.compact.md`.
- The witness shape. `AuthorizationWitness` in `lib/proofTypes.ts` is
  exactly the shape a Compact prover would consume.
- The public output shape. `PublicAuthorizationOutput` is exactly the
  disclosure set the UI and a real verifier would publish — nothing
  more.
- The verify script. `npm run verify:demo` independently checks the
  reject/authorize outcomes, treasury debit amount, commitment
  determinism, and privacy boundary (raw `maxPriceCents` and salts
  never reach the public output).
- The honesty-first surface. Mode + Network badges live in the footer
  with a "Technical artifacts" row linking the Compact source, the
  verify script, and the README.

## What is mocked

- The hash primitive (`demoHash` in `lib/proofHash.ts`) is
  non-cryptographic FNV/imul. Stable, but not a real commitment.
  Production should use Midnight's `persistentHash` or a Poseidon
  family hash.
- AI extraction is a hardcoded chip list per vendor. No model, no API
  key, no extraction-truth guarantee.
- The treasury debit is a UI state transition. There is no
  on-chain transfer, no wallet, no payment rail.
- Proof generation is a 1400 ms `setTimeout` followed by the local
  constraint evaluation. There is no Compact prover invocation.
- Wallet, devnet, and the proof server are not wired. The Compact
  source has never been run through `compactc`.

## Next step for real Midnight integration

In rough order, smallest dependency to largest:

1. **Install Compact CLI + Docker** on a teammate machine.
   - `compactc --version` should succeed.
   - `docker --version` should succeed.
   - Update `docs/MIDNIGHT_TOOLING_CHECK.md` with the result.
2. **Compile `contracts/SilentIntent.compact`** and capture the
   `compactc` output.
   - Iterate on syntax against the spec in
     `contracts/SilentIntentAuthorization.pseudo.compact.md` when the
     compiler complains.
   - Reference: `contracts/intent-evaluation/SilentIntent.compact` is
     the team's already-compiling intent-evaluation contract; mirror
     its pragma + syntax patterns (e.g. `pragma language_version >= 0.14;`,
     witness/circuit declarations) to get the authorization contract
     past the compiler with minimum diff.
   - Move the row "Compact contract (authorization, this sandbox)"
     above from `Attempted, not compiled` to `Compiled`.
3. **Adapt `lib/witnessAdapter.ts`** to the real Compact witness
   binding (likely a `*Witnesses` JS module emitted by `compactc`).
   - Replace `demoHash` calls with `persistentHash` from the Midnight
     standard library.
   - Keep the same `AuthorizationWitness` field names so the rest of
     the code does not change.
4. **Run the local Midnight proof server** and invoke
   `submit_authorization` from a Node script under `scripts/`.
   - Confirm BrightReach proof rejects (assertion fails on
     `forbidden_absent`).
   - Confirm CleanList proof succeeds and writes to `authorizedDeals`.
5. **Wire the proof result into `PublicVerifier`.** Replace the
   `generateProof` body in `lib/mockProof.ts` with a call to the real
   prover. Keep the `AuthorizationProofResult` return type stable so
   no React code changes.
6. **Optional, larger** — integrate a wallet for signing, integrate a
   payment rail to make the treasury debit a real transfer, expose
   `usedAuthorizationNonces` lookups to the UI.

When step 5 lands, every "Mock" row in the table above flips, and the
sandbox is no longer a sandbox.

## Cross-references

- `docs/MIDNIGHT_TOOLING_CHECK.md` — local tool versions.
- `docs/SANDBOX_AUDIT.md` — what exists in the repo today.
- `docs/HANDOFF.md` — what to copy into the team repo.
- `contracts/README.md` — contract compile status + known gaps.
- `scripts/verify-demo-model.mjs` — assertions that the sandbox demo
  behaves correctly.
