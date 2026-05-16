# SilentIntentAuthorization — Compact circuit specification

> **Status: pseudocode + spec.** This document describes the intended
> Compact circuit. It is **not** a compiled, deployed Midnight contract.
> The sandbox UI runs against `lib/mockProof.ts`, which mirrors the
> public input/output shape but does not produce ZK proofs.

## Purpose

Given a hidden procurement policy and a structured offer extracted from
a vendor proposal, the circuit:

1. Verifies the offer satisfies every policy constraint.
2. Emits a minimal authorization disclosure.
3. Reveals nothing about the policy thresholds, the offer's raw terms,
   the salts, or the agent's internal reasoning.

## Private witnesses

| Field | Type | Source |
|---|---|---|
| `maxPriceCents` | `Uint<64>` | hidden policy |
| `requiredCategoryHash` | `Bytes<32>` | hidden policy |
| `requiredCredentialHash` | `Bytes<32>` | hidden policy |
| `forbiddenTermHash` | `Bytes<32>` | hidden policy |
| `intentSalt` | `Bytes<32>` | buyer |
| `offerPriceCents` | `Uint<64>` | extracted offer |
| `offerCategoryHash` | `Bytes<32>` | extracted offer |
| `offerCredentialHashes` | `Vector<4, Bytes<32>>` | extracted offer |
| `detectedForbiddenHashes` | `Vector<4, Bytes<32>>` | extracted offer |
| `offerSalt` | `Bytes<32>` | buyer |
| `vendorIdHash` | `Bytes<32>` | extracted offer |
| `authorizationNonce` | `Bytes<32>` | buyer, monotonically issued |

## Public outputs

| Field | Type | Notes |
|---|---|---|
| `spendAuthorized` | `Bool` | true ⇔ every constraint passes |
| `priceBand` | `Enum<PriceBand>` | only set when authorized |
| `dealId` | `Bytes<10>` | derived from offer commitment |
| `policyId` | `Bytes<16>` | non-sensitive policy identifier |
| `intentCommitment` | `Bytes<32>` | `H("intent", policy, intentSalt)` |
| `offerCommitment` | `Bytes<32>` | `H("offer", offerFacts, offerSalt)` |
| `vendorCommitment` | `Bytes<32>` | `H("vendor", vendorIdHash)` |
| `authorizationCommitment` | `Bytes<32>` | binds intent, offer, vendor, result |
| `treasuryAction` | `Enum<TreasuryAction>` | `unchanged` or `debit_authorized` |

## Constraints (must all hold for `spendAuthorized = true`)

```text
1. persistentHash("intent", {maxPriceCents,
                            requiredCategoryHash,
                            requiredCredentialHash,
                            forbiddenTermHash,
                            policyId},
                  intentSalt) == intentCommitment

2. persistentHash("offer",  {offerPriceCents,
                             offerCategoryHash,
                             offerCredentialHashes,
                             detectedForbiddenHashes,
                             vendorIdHash},
                  offerSalt) == offerCommitment

3. offerPriceCents <= maxPriceCents

4. offerCategoryHash == requiredCategoryHash

5. ∃ i ∈ [0,4) such that
       offerCredentialHashes[i] == requiredCredentialHash

6. ∀ i ∈ [0,4)
       detectedForbiddenHashes[i] != forbiddenTermHash

7. authorizationNonce ∉ usedNonceSet      (if stateful nonce tracking)

8. authorizationCommitment ==
       persistentHash("auth",
                      {intentCommitment,
                       offerCommitment,
                       vendorCommitment,
                       spendAuthorized,
                       dealId})
```

Constraints 1–2 bind the public commitments to the witnesses.
Constraints 3–6 are the policy checks.
Constraint 7 prevents replay of an already-spent authorization.
Constraint 8 binds the disclosed result to the committed inputs so a
verifier can't mix-and-match.

## Disclosure contract

The circuit may disclose: `spendAuthorized`, `priceBand`, `dealId`,
`policyId`, `intentCommitment`, `offerCommitment`, `vendorCommitment`,
`authorizationCommitment`, `treasuryAction`.

The circuit must **not** disclose: any `*Cents`, any `*Hash` of the
policy or offer in plaintext, either salt, the full credential vector,
the full forbidden vector, or the AI extraction trace.

## State (if instantiated as a contract)

```text
ledger {
  authorizedDeals: Map<Bytes<10>, AuthEntry>
  usedNonces: Set<Bytes<32>>
}

struct AuthEntry {
  intentCommitment: Bytes<32>
  offerCommitment: Bytes<32>
  vendorCommitment: Bytes<32>
  authorizationCommitment: Bytes<32>
  priceBand: PriceBand
  treasuryAction: TreasuryAction
  timestamp: Uint<64>
}
```

`submitAuthorization(...)` takes a proof, verifies, and on success
inserts an `AuthEntry` and marks the nonce used.

## Notes for the live wiring

- `persistentHash` here stands in for the Midnight-blessed primitive
  (Poseidon-family or the native `persistent_hash` exposed by Compact).
- `Vector<4, _>` is a fixed-width vector; resize to match the actual
  upper bound on credentials / forbidden terms.
- `priceBand` is enumerated rather than emitted as a numeric range to
  prevent gradient leakage about the policy threshold over many
  authorizations.
- The sandbox uses non-cryptographic FNV/imul-based `stableHash`. Do
  not port that primitive — replace with `persistentHash` when
  compiling.

## Sandbox parity

The mock in `lib/mockProof.ts` exposes the same `ProofResult` fields as
this spec's public outputs, so the UI bindings won't change when the
real circuit lands. Constraint IDs (`price`, `category`, `credential`,
`forbidden`) line up 1:1 between the mock and steps 3–6 above.
