// Deterministic mock proof for the SilentIntent demo.
//
// `generateProof` is the boundary the UI calls. Today it runs the
// witness adapter + the constraint logic locally and returns a public
// authorization output plus per-step checks for the proof timeline.
//
// To wire a real Compact circuit later: keep `AuthorizationProofResult`
// stable, build the witness with `buildAuthorizationWitness`, hand it
// to the Compact prover, and translate the resulting public output
// into the same `AuthorizationProofResult` shape returned here.

import { demoHash } from './proofHash';
import {
  buildAuthorizationCommitment,
  buildAuthorizationWitness,
  buildBuyerPolicyPrivate,
  buildIntentCommitment,
  buildOfferCommitment,
  buildVendorCommitment,
  extractFactsFor,
  priceBandFor,
  AUTHORIZATION_NONCE_BRIGHTREACH,
  AUTHORIZATION_NONCE_CLEANLIST,
  POLICY_ID,
} from './witnessAdapter';
import type {
  AuthorizationProofResult,
  AuthorizationWitness,
  BuyerPolicyPrivate,
  ExtractedOfferFacts,
  ProofCheck,
  VendorId,
} from './proofTypes';

// Re-export type for downstream consumers (PublicVerifier, VendorCard,
// page.tsx) that import { ProofResult } from this module.
export type ProofResult = AuthorizationProofResult;
// CheckStatus is the binary status the UI binds to. The wider
// ProofCheck.status union from proofTypes can be narrowed to this when
// the timeline outcomes are derived.
export type CheckStatus = 'pass' | 'fail';

// ---------------------------------------------------------------------------
// Constraint evaluation (mirrors contracts/SilentIntent.compact)
// ---------------------------------------------------------------------------

function evaluateConstraints(witness: AuthorizationWitness): {
  pricePass: boolean;
  categoryPass: boolean;
  credentialPass: boolean;
  forbiddenPass: boolean;
} {
  const pricePass = witness.offerPriceCents <= witness.maxPriceCents;
  const categoryPass = witness.offerCategoryHash === witness.requiredCategoryHash;
  const credentialPass = witness.offerCredentialHashes.includes(
    witness.requiredCredentialHash,
  );
  const forbiddenPass = !witness.detectedForbiddenTermHashes.includes(
    witness.forbiddenTermHash,
  );
  return { pricePass, categoryPass, credentialPass, forbiddenPass };
}

// ---------------------------------------------------------------------------
// Public proof checks (what the timeline + receipt render)
// ---------------------------------------------------------------------------

function buildProofChecks(
  ev: ReturnType<typeof evaluateConstraints>,
  authorized: boolean,
): ProofCheck[] {
  const toStatus = (b: boolean): 'pass' | 'fail' => (b ? 'pass' : 'fail');
  return [
    {
      id: 'commit_policy',
      label: 'Commit hidden policy',
      status: 'pass',
      publicExplanation:
        'Hidden policy values stay private; only the intent commitment is published.',
    },
    {
      id: 'commit_offer',
      label: 'Commit extracted offer facts',
      status: 'pass',
      publicExplanation:
        'Structured offer facts are committed; raw proposal text is not disclosed.',
    },
    {
      id: 'price',
      label: 'Verify offerPrice ≤ maxPrice',
      status: toStatus(ev.pricePass),
      publicExplanation:
        'Public verifier learns whether the price was within the hidden cap.',
    },
    {
      id: 'category',
      label: 'Verify offerCategory matches requiredCategory',
      status: toStatus(ev.categoryPass),
      publicExplanation:
        'Public verifier learns whether the offer category matched, not what the category is.',
    },
    {
      id: 'credential',
      label: 'Verify requiredCredential present in offerCredentials',
      status: toStatus(ev.credentialPass),
      publicExplanation:
        'Public verifier learns whether a required credential was attested.',
    },
    {
      id: 'forbidden',
      label: 'Verify forbiddenTerm absent from offerForbidden',
      status: toStatus(ev.forbiddenPass),
      publicExplanation:
        'Public verifier learns whether the forbidden clause was detected, not the clause itself.',
    },
    {
      id: 'disclose',
      label: 'Disclose authorization result only',
      status: authorized ? 'pass' : 'pass',
      publicExplanation:
        'Only the public authorization output (status, price band, commitments) leaves the prover.',
    },
  ];
}

// ---------------------------------------------------------------------------
// Build the full result
// ---------------------------------------------------------------------------

function nonceFor(vendorId: VendorId): string {
  return vendorId === 'brightreach'
    ? AUTHORIZATION_NONCE_BRIGHTREACH
    : AUTHORIZATION_NONCE_CLEANLIST;
}

function dealIdFor(vendorId: VendorId, priceCents: number): string {
  return 'deal_' + demoHash(`deal:${vendorId}:${priceCents}`).slice(2, 12);
}

export function authorizeOffer(
  policy: BuyerPolicyPrivate,
  offer: ExtractedOfferFacts,
  timestamp: string,
  authorizationNonce?: string,
): AuthorizationProofResult {
  const witness = buildAuthorizationWitness(
    policy,
    offer,
    authorizationNonce ?? nonceFor(offer.vendorId),
  );
  const ev = evaluateConstraints(witness);
  const authorized =
    ev.pricePass && ev.categoryPass && ev.credentialPass && ev.forbiddenPass;
  const status: 'AUTHORIZED' | 'REJECTED' = authorized ? 'AUTHORIZED' : 'REJECTED';

  const intentCommitment = buildIntentCommitment(policy);
  const offerCommitment = buildOfferCommitment(offer);
  const vendorCommitment = authorized ? buildVendorCommitment(offer) : undefined;
  const dealId = dealIdFor(offer.vendorId, offer.priceCents);
  const authorizationCommitment = buildAuthorizationCommitment({
    intentCommitment,
    offerCommitment,
    vendorCommitment,
    status,
    dealId,
  });

  const checks = buildProofChecks(ev, authorized);

  return {
    spendAuthorized: authorized,
    status,
    priceBand: authorized ? priceBandFor(offer.priceCents) : undefined,
    dealId,
    policyId: POLICY_ID,
    intentCommitment,
    offerCommitment,
    authorizationCommitment,
    vendorCommitment,
    treasuryAction: authorized ? 'debit_authorized' : 'unchanged',
    debitCents: authorized ? offer.priceCents : undefined,

    vendorId: offer.vendorId,
    vendorName: offer.vendorName,
    checks,

    // Display-only aliases. The UI binds to these names today.
    proofHash: authorizationCommitment,
    commitmentHash: authorizationCommitment,
    timestamp,

    authorized,
    publicSignal: authorized ? 'AUTHORIZED' : 'POLICY_VIOLATION',
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function buildProofResult(
  vendorId: VendorId,
  timestamp: string,
): AuthorizationProofResult {
  const policy = buildBuyerPolicyPrivate();
  const offer = extractFactsFor(vendorId);
  return authorizeOffer(policy, offer, timestamp);
}

function vendorIdFromName(vendorName: string): VendorId {
  return vendorName.toLowerCase().includes('cleanlist') ? 'cleanlist' : 'brightreach';
}

export async function generateProof(
  _priceCents: number,
  vendorName: string,
): Promise<AuthorizationProofResult> {
  // Fixed latency so the proof animation registers on every demo run.
  await new Promise((r) => setTimeout(r, 1400));
  const vendorId = vendorIdFromName(vendorName);
  // Timestamp captured at proof completion, never at server render time.
  const timestamp = new Date().toISOString();
  return buildProofResult(vendorId, timestamp);
}

// ---------------------------------------------------------------------------
// Test/script surface
// ---------------------------------------------------------------------------

export const __testing = {
  buildBuyerPolicyPrivate,
  extractFactsFor,
  buildAuthorizationWitness,
  authorizeOffer,
};
