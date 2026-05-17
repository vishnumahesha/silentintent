# AI extraction artifacts

This folder documents the provenance of the vendor data the sandbox demo
asserts on. The raw vendor proposal text and the AI-extracted facts that
feed the witness adapter both live in `data/` so the demo's constants
can be audited end-to-end.

## Files

| File | Role |
|---|---|
| `data/procurementPolicy.json` | The hidden buyer policy. Mirrors the constants returned by `buildBuyerPolicyPrivate()` in `lib/witnessAdapter.ts` (max price, required credential, forbidden term, intent salt). |
| `data/vendorA.proposal.txt` | Raw BrightReach proposal text — the unstructured input an LLM extractor would see. Contains the buried "partner enrichment / audience modeling / cross-client modeling" clause that triggers the forbidden-term match. |
| `data/vendorA.extracted.json` | The structured facts an extractor produced from `vendorA.proposal.txt`: price, credentials, detected forbidden terms. Mirrors the BrightReach branch of `extractFactsFor()` in the witness adapter. |
| `data/vendorB.proposal.txt` | Raw CleanList Pro proposal text. Explicitly silos data and disclaims reuse — no forbidden terms surface. |
| `data/vendorB.extracted.json` | The structured facts from `vendorB.proposal.txt`. Mirrors the CleanList branch of `extractFactsFor()`. |

## How the sandbox uses them

The runtime UI does not call a live LLM. The witness adapter
(`lib/witnessAdapter.ts`) ships with the extracted values inlined, so
the demo and `npm run verify:demo` stay deterministic offline.

These data files are the canonical *source* the inlined values were
distilled from. They let reviewers:

1. Read the raw proposal text and confirm the forbidden clause is real,
   not invented for the demo.
2. Compare the extracted JSON against the witness adapter's inlined
   facts to confirm both views agree.

## Live extraction path (out of scope for the locked demo)

A live AI extractor would read the proposal text, return a
`vendor*.extracted.json`-shaped record, and the witness adapter would
consume that record instead of its inlined defaults. The locked demo
intentionally avoids that path so reviewers see the same proof every
time and so the build has no API-key dependency.

## Credit

Vendor proposals, extracted facts, and the procurement policy file
originated in the team repo's `data-ai-setup` branch (Shreyas Rao).
They were imported here as provenance for the sandbox's witness
constants; the inlined witness values and the verifier script are
sandbox-original.
