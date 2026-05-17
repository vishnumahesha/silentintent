# Intent-evaluation Compact model (Alim's branch)

This folder holds a **second** Compact contract authored on the team's
`alim_compact` branch, kept as evidence that the team's Compact
toolchain actually compiled real circuits. It is **not** the contract
the sandbox demo runs against — the sandbox runs against the
authorization model in `contracts/SilentIntent.compact` and
`contracts/SilentIntentAuthorization.pseudo.compact.md`.

## Files

| File | Source | Role |
|---|---|---|
| `SilentIntent.compact` | `contracts/silentintent/SilentIntent.compact` on the team repo's `alim_compact` branch | The Compact source. Two circuits: `registerIntent` (buyer publishes an intent commitment) and `evaluateOffer` (vendor offer is checked against the hidden policy). |
| `contract-info.json` | `contracts/silentintent/out/compiler/contract-info.json` on the same branch | Compiler output. Confirms the source compiled with `compiler-version 0.31.0`, `language-version 0.23.0`, `runtime-version 0.16.0` and lists the produced witnesses and circuits. |

The compiled `index.d.ts` / `index.js` artifacts were intentionally
left out: they import `@midnight-ntwrk/compact-runtime`, which the
sandbox does not install. `contract-info.json` already documents the
shape of the compiled API without dragging that dependency in.

## How this relates to the sandbox model

Both contracts encode the same procurement-privacy goal, but split it
across the buyer/vendor pipeline differently:

- **`contracts/intent-evaluation/SilentIntent.compact`** (this folder)
  models the **first half**: a buyer registers a hidden intent
  commitment, then evaluates a vendor offer against that commitment
  with four explicit constraints (price ≤ max, intent commitment
  matches, required credential present, forbidden term absent).
- **`contracts/SilentIntent.compact`** (sandbox root contracts/) models
  the **second half**: once an offer passes evaluation, the buyer
  produces an authorization commitment that gates treasury debit and
  prevents replay via a nonce set.

The constraint logic in both files is the same. The sandbox's
mirroring helper in `lib/mockProof.ts` evaluates the same four
constraints offline so the UI demo and `npm run verify:demo` stay
deterministic without a live prover.

## Credit

Compact source and compiler output: Alim (team repo `alim_compact`
branch). Imported here as provenance and toolchain proof; not modified.
