# SilentIntent contracts

This directory holds the Compact circuit source and the specification
document that the sandbox proof model mirrors.

## Files

| File | What it is |
|---|---|
| `SilentIntent.compact` | Minimal best-effort Compact source for the authorization circuit. |
| `SilentIntentAuthorization.pseudo.compact.md` | Full circuit specification — private witnesses, public outputs, constraints, ledger sketch. Treat as the canonical reference. |

## What the contract attempts

`submit_authorization` proves that a private offer satisfies a private
procurement policy and emits the minimum disclosure needed to authorize
a treasury debit.

Constraints enforced:

1. `offerPriceCents ≤ maxPriceCents`
2. `offerCategoryHash == requiredCategoryHash`
3. `requiredCredentialHash` is present in the offer's 4-credential
   vector
4. `forbiddenTermHash` is absent from the offer's 4-detected-term
   vector
5. `authorizationNonce` has not been used before (`usedAuthorizationNonces`)

Ledger writes on success:

- `authorizedDeals[dealId] = authorizationCommitment`
- `usedAuthorizationNonces += nonce`

Public output: `(spendAuthorized, dealId, intentCommitment, offerCommitment, authorizationCommitment)`.

## Compile status

**Not compiled.** The local environment in this sandbox does not have
the Compact toolchain installed:

```
$ compact --version
zsh: command not found: compact
$ compactc --version
compactc not found
$ docker --version
zsh: command not found: docker
```

See `docs/MIDNIGHT_TOOLING_CHECK.md` for the full tooling inventory.

This means the source has not been type-checked or compiled. Treat the
syntax as best-effort. A teammate with the toolchain installed should:

```
compactc contracts/SilentIntent.compact -o contracts/build/
```

and update `docs/MIDNIGHT_STATUS.md` with the result.

## Known gaps relative to the live circuit

- `priceBand` is not produced by the contract; the sandbox classifies
  `priceCents` into a band in `lib/witnessAdapter.ts`. A live circuit
  should expose the band as a public output and prove it.
- `policyId` and `treasuryAction` are surfaced by the UI but not
  emitted by `submit_authorization` here; both could be added to the
  return tuple.
- The intent and offer commitments use `persistent_hash` over a vector
  of fields. If Midnight ships a domain-separation helper, prefer it
  over the manual vector-of-hashes pattern.
- `deal_id_from` uses an unchecked `as Bytes<10>` truncation. Replace
  with a Compact-blessed slicing primitive when one is available.
- The contract does not yet wire to a treasury debit. Once a payment
  rail or chain transfer exists, gate it on
  `usedAuthorizationNonces.member(nonce)` so a single proof can only
  drive one debit.

## How to compile if you have the toolchain

1. Install Docker Desktop and the Midnight Compact CLI.
2. From the repo root:
   ```
   compactc contracts/SilentIntent.compact -o contracts/build/
   ```
3. If compilation fails on syntax, treat
   `SilentIntentAuthorization.pseudo.compact.md` as the source of
   truth for intent and adjust `SilentIntent.compact` accordingly.
4. Update `docs/MIDNIGHT_STATUS.md` row "Compact contract" to
   `Compiled` and append the `compactc` output.
