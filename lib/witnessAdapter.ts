// Witness adapter for the SilentIntent authorization proof.
//
// This module is the bridge between the demo's human-shaped data
// (BuyerPolicyPrivate, ExtractedOfferFacts) and the circuit-shaped
// data (AuthorizationWitness, PublicAuthorizationOutput).
//
// Every value the live Compact circuit consumes should be produced
// here, not inline in components. When the real witness binding lands,
// only the body of these helpers changes; downstream consumers
// (mockProof.ts, page.tsx, PublicVerifier.tsx) keep the same shape.

import { demoHash, hashLabel } from './proofHash';
import type {
  BuyerPolicyPrivate,
  ExtractedOfferFacts,
  AuthorizationWitness,
  PublicAuthorizationOutput,
  VendorId,
} from './proofTypes';

// ---------------------------------------------------------------------------
// Fixed-width vector configuration
// ---------------------------------------------------------------------------

export const CREDENTIAL_VECTOR_LENGTH = 4;
export const FORBIDDEN_VECTOR_LENGTH = 4;

function padToLength(values: string[], length: number, label: string): string[] {
  const out = values.slice(0, length).map(hashLabel);
  while (out.length < length) {
    out.push(demoHash(`${label}:empty:${out.length}`));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Hidden buyer policy
// ---------------------------------------------------------------------------

/**
 * The hidden procurement policy used by the demo. Never disclosed
 * publicly; only the intent commitment is.
 *
 * `intentSalt` is the salt mixed into the intent commitment to prevent
 * an attacker from reversing categorical fields by dictionary attack.
 */
export function buildBuyerPolicyPrivate(): BuyerPolicyPrivate {
  return {
    maxPriceCents: 250000,
    requiredCategory: 'lead_data',
    requiredCredential: 'freshness_verified',
    forbiddenTerm: 'campaign_metadata_reuse',
    urgencyHours: 72,
    priority: 'quality_over_volume',
    intentSalt: 'intent_salt_demo_001',
  };
}

// ---------------------------------------------------------------------------
// Extracted offer facts (one per vendor)
// ---------------------------------------------------------------------------

const BRIGHTREACH_PROPOSAL_SOURCE = 'BrightReach proposal text';
const CLEANLIST_PROPOSAL_SOURCE = 'CleanList proposal text';

export function extractBrightReachFacts(): ExtractedOfferFacts {
  // `partner_enrichment` appears in BOTH credentials and
  // detectedForbiddenTerms: BrightReach pitches it as a credential
  // (a value-add badge), while the AI extraction catches it as a
  // forbidden reuse signal. The proof rejects on the forbidden
  // membership check, not on the credentials list.
  return {
    vendorId: 'brightreach',
    vendorName: 'BrightReach Data',
    priceCents: 190000,
    category: 'lead_data',
    credentials: [
      'freshness_verified',
      'delivery_48hr',
      'high_volume',
      'partner_enrichment',
    ],
    detectedForbiddenTerms: ['campaign_metadata_reuse', 'partner_enrichment'],
    proposalHashSource: BRIGHTREACH_PROPOSAL_SOURCE,
    offerSalt: 'offer_salt_brightreach_001',
  };
}

export function extractCleanListFacts(): ExtractedOfferFacts {
  return {
    vendorId: 'cleanlist',
    vendorName: 'CleanList Pro',
    priceCents: 225000,
    category: 'lead_data',
    credentials: [
      'freshness_verified',
      'delivery_72hr',
      'customer_siloed',
      'no_cross_client_modeling',
    ],
    detectedForbiddenTerms: [],
    proposalHashSource: CLEANLIST_PROPOSAL_SOURCE,
    offerSalt: 'offer_salt_cleanlist_001',
  };
}

export function extractFactsFor(vendorId: VendorId): ExtractedOfferFacts {
  return vendorId === 'brightreach'
    ? extractBrightReachFacts()
    : extractCleanListFacts();
}

// ---------------------------------------------------------------------------
// Commitment builders
// ---------------------------------------------------------------------------

/**
 * Intent commitment. Production: `persistentHash(label || policy || salt)`.
 * The label is part of the hash input so different commitment kinds
 * cannot be cross-matched.
 */
export function buildIntentCommitment(policy: BuyerPolicyPrivate): string {
  return demoHash({
    label: 'intent',
    payload: {
      maxPriceCents: policy.maxPriceCents,
      requiredCategoryHash: hashLabel(policy.requiredCategory),
      requiredCredentialHash: hashLabel(policy.requiredCredential),
      forbiddenTermHash: hashLabel(policy.forbiddenTerm),
      urgencyHours: policy.urgencyHours,
      priority: policy.priority,
    },
    salt: policy.intentSalt,
  });
}

export function buildOfferCommitment(offer: ExtractedOfferFacts): string {
  return demoHash({
    label: 'offer',
    payload: {
      vendorHash: hashLabel(offer.vendorId),
      priceCents: offer.priceCents,
      categoryHash: hashLabel(offer.category),
      credentialHashes: padToLength(
        offer.credentials,
        CREDENTIAL_VECTOR_LENGTH,
        'credential',
      ),
      detectedForbiddenHashes: padToLength(
        offer.detectedForbiddenTerms,
        FORBIDDEN_VECTOR_LENGTH,
        'forbidden',
      ),
      proposalHashSource: demoHash('proposal:' + offer.proposalHashSource),
    },
    salt: offer.offerSalt,
  });
}

export function buildVendorCommitment(offer: ExtractedOfferFacts): string {
  return demoHash({
    label: 'vendor',
    payload: {
      vendorId: offer.vendorId,
      vendorName: offer.vendorName,
    },
  });
}

export function buildAuthorizationCommitment(
  output: Pick<
    PublicAuthorizationOutput,
    'intentCommitment' | 'offerCommitment' | 'vendorCommitment' | 'status' | 'dealId'
  >,
): string {
  return demoHash({
    label: 'authorization',
    payload: {
      intentCommitment: output.intentCommitment,
      offerCommitment: output.offerCommitment,
      vendorCommitment: output.vendorCommitment ?? null,
      status: output.status,
      dealId: output.dealId,
    },
  });
}

// ---------------------------------------------------------------------------
// Full witness assembly
// ---------------------------------------------------------------------------

/**
 * Build the full private witness for the authorization proof. Anything
 * the circuit needs to verify lives in this object. None of it is
 * disclosed publicly; only the commitments derived from these fields
 * are.
 */
export function buildAuthorizationWitness(
  policy: BuyerPolicyPrivate,
  offer: ExtractedOfferFacts,
  authorizationNonce: string,
): AuthorizationWitness {
  return {
    maxPriceCents: policy.maxPriceCents,
    requiredCategoryHash: hashLabel(policy.requiredCategory),
    requiredCredentialHash: hashLabel(policy.requiredCredential),
    forbiddenTermHash: hashLabel(policy.forbiddenTerm),
    intentSalt: policy.intentSalt,

    offerPriceCents: offer.priceCents,
    offerCategoryHash: hashLabel(offer.category),
    offerCredentialHashes: padToLength(
      offer.credentials,
      CREDENTIAL_VECTOR_LENGTH,
      'credential',
    ),
    detectedForbiddenTermHashes: padToLength(
      offer.detectedForbiddenTerms,
      FORBIDDEN_VECTOR_LENGTH,
      'forbidden',
    ),
    vendorHash: hashLabel(offer.vendorId),
    offerSalt: offer.offerSalt,

    authorizationNonce,
  };
}

// ---------------------------------------------------------------------------
// Price band classification
// ---------------------------------------------------------------------------

/**
 * Returns the public price band an authorized deal falls into.
 *
 * Price bands are categorical on purpose: emitting `priceCents` would
 * leak gradient information about the hidden cap over many
 * authorizations. The demo only uses one band today.
 */
export function priceBandFor(priceCents: number): '$2k-$2.5k' | undefined {
  if (priceCents >= 200000 && priceCents <= 250000) return '$2k-$2.5k';
  return undefined;
}

// ---------------------------------------------------------------------------
// Constants re-exported for tests / scripts
// ---------------------------------------------------------------------------

export const POLICY_ID = 'pol_dental_lead_v1';
export const AUTHORIZATION_NONCE_BRIGHTREACH = 'nonce:authz:brightreach:v1';
export const AUTHORIZATION_NONCE_CLEANLIST = 'nonce:authz:cleanlist:v1';
