// Shared types for the SilentIntent authorization proof model.
//
// These types describe the demo's witness and public-output shape. They
// are the same shape the live Compact circuit defined in
// contracts/SilentIntent.compact would produce. Concrete values today
// come from the deterministic mock proof in lib/mockProof.ts; swapping
// in a real proof execution should not change any of these signatures.

// 'brightreach' | 'cleanlist' are the two known vendor IDs used by the
// scripted guided demo. The `string & {}` arm widens the type to any
// string while preserving editor autocomplete for the known IDs, so
// the Try-it-yourself product mode can stamp arbitrary user-entered
// vendor identifiers without needing a type cast.
export type VendorId = 'brightreach' | 'cleanlist' | (string & {});

/**
 * The buyer's private procurement policy. Never sent to a vendor and
 * never disclosed by the public verifier. Only the intent commitment
 * derived from this is public.
 */
export type BuyerPolicyPrivate = {
  maxPriceCents: number;
  requiredCategory: string;
  requiredCredential: string;
  forbiddenTerm: string;
  urgencyHours: number;
  priority: string;
  intentSalt: string;
};

/**
 * Structured facts extracted from a vendor's proposal. Treated as the
 * proof's offer-side witness. `proposalHashSource` lets a verifier (or
 * a teammate) bind the structured offer back to a specific proposal
 * blob without disclosing the text.
 */
export type ExtractedOfferFacts = {
  vendorId: VendorId;
  vendorName: string;
  priceCents: number;
  category: string;
  credentials: string[];
  detectedForbiddenTerms: string[];
  proposalHashSource: string;
  offerSalt: string;
};

/**
 * The complete private witness handed to the Compact circuit. Mirrors
 * the witness section in contracts/SilentIntentAuthorization.pseudo.compact.md.
 *
 * Credential and forbidden-term vectors are fixed-width to keep the
 * circuit bounded. Missing entries are padded with deterministic
 * "empty" hashes by the witness adapter so the array length is stable.
 */
export type AuthorizationWitness = {
  // Policy side
  maxPriceCents: number;
  requiredCategoryHash: string;
  requiredCredentialHash: string;
  forbiddenTermHash: string;
  intentSalt: string;

  // Offer side
  offerPriceCents: number;
  offerCategoryHash: string;
  offerCredentialHashes: string[]; // length 4 (padded)
  detectedForbiddenTermHashes: string[]; // length 4 (padded)
  vendorHash: string;
  offerSalt: string;

  authorizationNonce: string;
};

/**
 * Public-only output. This is the exact set of values that may be
 * disclosed by the public verifier. No private value belongs here.
 */
export type PublicAuthorizationOutput = {
  spendAuthorized: boolean;
  status: 'AUTHORIZED' | 'REJECTED';
  priceBand?: '$2k-$2.5k';
  dealId: string;
  policyId: string;
  intentCommitment: string;
  offerCommitment: string;
  authorizationCommitment: string;
  vendorCommitment?: string;
  treasuryAction: 'unchanged' | 'debit_authorized';
  debitCents?: number;
};

export type ProofCheck = {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'hidden' | 'pending';
  publicExplanation: string;
};

/**
 * What `generateProof` returns to the UI. Extends the public output
 * with display-only fields (vendor name, vendor id, per-step checks).
 *
 * Critically, this does NOT include the witness. The mock proof and a
 * future real proof must both keep witness data out of this type.
 */
export type AuthorizationProofResult = PublicAuthorizationOutput & {
  vendorId: VendorId;
  vendorName: string;
  checks: ProofCheck[];

  // Display-only convenience fields the existing UI already binds to.
  // Aliased to authorizationCommitment so the verifier card and the
  // treasury-debit ghost line can reuse the same hash.
  proofHash: string;
  commitmentHash: string;

  // Capture time, set at proof completion, not at server render time.
  timestamp: string;

  // Back-compat alias so the existing PublicVerifier copy that reads
  // `entry.publicSignal` keeps rendering. Mirrors `status`.
  authorized: boolean;
  publicSignal: 'AUTHORIZED' | 'POLICY_VIOLATION';
};
