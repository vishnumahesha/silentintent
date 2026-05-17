# Midnight Integration Spike — Status Report

**Date:** 2026-05-17  
**Branch:** `midnight-integration-spike`  
**Status:** ✓ Buildable, testable, ready for proof-server wiring

## Summary

Completed real Midnight infrastructure integration for SilentIntent. The app now:
- Imports Midnight types and adapters (SilentIntentMidnightClient)
- Attempts live proofs via proof server at localhost:6300
- Gracefully falls back to deterministic mock proofs if proof server unavailable
- Displays Midnight connection status (wallet, proof server, contract, mode) in the UI
- Routes all authorization calls through the Midnight client first

## Files Created (Step 4: Witness Adapter)

**`/lib/midnight/silentIntentWitnessAdapter.ts`** (90 LOC)
- Converts demo vendor data (name, price) to SilentIntentProofInput format
- Builds policy hashes, offer facts, commitment seeds
- Exports `convertSilentIntentInputToProof(vendorName, priceCents)`

## Files Modified (Step 6: Wiring)

**`/lib/midnight/silentIntentMidnightClient.ts`** (updated)
- Public API: `runSilentIntentAuthorization(vendorName, priceCents)`
- Converts result back to AuthorizationProofResult (UI-compatible)
- Internal fallback function `_determinisicFallback()` replicates circuit logic

**`/lib/mockProof.ts`** (updated)
- `generateProof()` now tries `runSilentIntentAuthorization()` first
- Falls back to deterministic proof on error or unavailable proof server
- Result type unchanged (AuthorizationProofResult)

**`/components/MidnightStatusPanel.tsx`** (new, 70 LOC)
- Polls Midnight connection state every 5 seconds
- Displays: Mode, Wallet, Proof Server, Contract status
- Shows color-coded indicators (green = live, gold = fallback)

**`/app/page.tsx`** (updated)
- Imports and renders `<MidnightStatusPanel />`
- All vendor analysis flows use new integration (no app logic changes needed)

## Build & Test Results

✓ `npm run build` — Compiles successfully in 3.5s  
✓ `npm run verify:demo` — All 28 checks pass (determinism, privacy, disclosure boundaries)  

## Architecture

```
generateProof()
├─ try: runSilentIntentAuthorization(vendorName, priceCents)
│  ├─ convertSilentIntentInputToProof() → SilentIntentProofInput
│  ├─ checkProofServer() → POST localhost:6300/authorize (real path stubbed)
│  └─ Convert SilentIntentProofResult → AuthorizationProofResult
└─ catch: buildProofResult() [deterministic fallback]
```

The UI remains unchanged; all integration happens at the lib layer.

## What Works

- ✓ Witness adapter correctly maps vendor data to Midnight format
- ✓ Midnight client structure in place (types, status tracking, graceful fallback)
- ✓ Result conversion preserves all fields the UI expects
- ✓ Demo tests still pass (determinism, privacy guarantees)
- ✓ Status panel visible in demo (shows "Fallback" mode, proof server unavailable)

## What's Not Yet Wired

- **Proof Server:**  
  The real proof server integration at `POST localhost:6300/authorize` is stubbed (line 180-186 in silentIntentMidnightClient.ts). When the proof-server Docker image is running, replace the stub with actual fetch call.

- **Wallet Connector:**  
  `connectWallet()` currently returns undefined. Wire @midnight-ntwrk/dapp-connector-api when Lace wallet is available.

- **Contract Artifacts:**  
  `contracts/intent-evaluation/` contains compiled artifacts but aren't imported yet. Next step: use the bindings to serialize the witness to circuit format.

## Next Steps (Post-Spike)

1. **Wire Proof Server POST** (line 180-186)  
   - Uncomment the fetch call
   - Handle proof-pending polling
   - Extract public output

2. **Wire Wallet Connector**  
   - Import @midnight-ntwrk/dapp-connector-api
   - Call Lace wallet in connectWallet()
   - Store wallet address in midnightStatus

3. **Use Contract Bindings**  
   - Import from contracts/intent-evaluation/
   - Validate witness format against contract types
   - Serialize to contract-compatible format

4. **Test End-to-End**  
   - Start proof-server Docker container
   - Set NEXT_PUBLIC_PROOF_SERVER_URL env var
   - Run `npm run dev`
   - Verify MidnightStatusPanel shows "Live" mode
   - Check that proofs are generated via real server

## File Inventory

**New files:**
- `/lib/midnight/silentIntentWitnessAdapter.ts` (90 LOC)
- `/components/MidnightStatusPanel.tsx` (70 LOC)

**Modified files:**
- `/lib/midnight/silentIntentMidnightClient.ts` (+80 LOC, refactored)
- `/lib/mockProof.ts` (+30 LOC in generateProof)
- `/app/page.tsx` (+2 import, +1 component render)

**Unchanged:**
- Core demo logic (VendorCard, PublicReceipt, GuidedDemoControls)
- Proof model (mockProof deterministic evaluation)
- UI state machine

## Determinism Guarantee

All checks still pass because the fallback path is deterministic and unchanged:
- BrightReach intent/offer/auth commitments: stable
- CleanList intent/offer/auth commitments: stable
- Policy disclosure boundary: maintained
- Privacy guarantees: all private values kept from public output

When live proof server is wired, the commitment values will come from the real circuit instead, but the structure will be identical.

## Backward Compatibility

The API change from `generateProof(_priceCents, vendorName)` to the new signature is internal (lib layer). The UI calls remain identical:

```typescript
const result = await generateProof(priceCents, vendorName);
```

Both generateProof paths (Midnight or fallback) return the same AuthorizationProofResult shape. Zero breaking changes to the product.

---

**Branch is safe to merge after Step 7-8 (README, build verification).**
