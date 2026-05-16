// Deterministic mock proof model for SilentIntent.
// All commitments and hashes are content-derived so the same inputs always
// yield the same outputs. No Math.random, no Date.now in rendered values.
//
// This is a demo proof layer, not a real Midnight Compact circuit.

const POLICY_MAX_CENTS = 250000;
const POLICY_REQUIRED_CATEGORY = 'lead_data';
const POLICY_REQUIRED_CREDENTIAL = 'freshness_verified';
const POLICY_FORBIDDEN_TERM = 'campaign_metadata_reuse';
const POLICY_ID = 'pol_dental_lead_v1';

export type CheckStatus = 'pass' | 'fail';

export type ProofCheck = {
  id: string;
  label: string;
  status: CheckStatus;
};

export type ProofResult = {
  authorized: boolean;
  publicSignal: 'AUTHORIZED' | 'POLICY_VIOLATION';
  status: 'AUTHORIZED' | 'REJECTED';
  vendorId: 'brightreach' | 'cleanlist';
  vendorName: string;
  dealId: string;
  policyId: string;
  priceBand?: '$2k-$2.5k';
  treasuryAction: 'unchanged' | 'debit_authorized';
  debitCents?: number;
  proofHash: string;
  commitmentHash: string;
  intentCommitment: string;
  offerCommitment: string;
  vendorCommitment: string;
  authorizationCommitment: string;
  checks: ProofCheck[];
  timestamp: string;
};

type OfferFacts = {
  vendorId: 'brightreach' | 'cleanlist';
  vendorName: string;
  priceCents: number;
  category: string;
  credentials: string[];
  forbiddenTermsDetected: string[];
};

const VENDOR_A_FACTS: OfferFacts = {
  vendorId: 'brightreach',
  vendorName: 'BrightReach Data',
  priceCents: 190000,
  category: 'lead_data',
  credentials: ['freshness_verified', 'delivery_72hr', 'high_volume'],
  forbiddenTermsDetected: ['campaign_metadata_reuse', 'partner_enrichment'],
};

const VENDOR_B_FACTS: OfferFacts = {
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
  forbiddenTermsDetected: [],
};

// Deterministic non-cryptographic hash. Stable for the same input string.
// Returns a 0x-prefixed 32-hex-char pseudo-commitment.
function stableHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0xdeadbeef;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca6b);
  }
  h1 = (h1 ^ (h1 >>> 16)) >>> 0;
  h2 = (h2 ^ (h2 >>> 13)) >>> 0;
  const part = (n: number) => n.toString(16).padStart(8, '0');
  return '0x' + part(h1) + part(h2) + part(h1 ^ h2) + part(h2 + 0x9e3779b9);
}

function canonical(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonical).join(',') + ']';
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return (
    '{' +
    keys
      .map((k) => JSON.stringify(k) + ':' + canonical((obj as Record<string, unknown>)[k]))
      .join(',') +
    '}'
  );
}

function commit(label: string, payload: unknown): string {
  return stableHash(label + ':' + canonical(payload));
}

function evaluateOffer(offer: OfferFacts): ProofCheck[] {
  return [
    {
      id: 'price',
      label: 'offerPrice ≤ maxPrice',
      status: offer.priceCents <= POLICY_MAX_CENTS ? 'pass' : 'fail',
    },
    {
      id: 'category',
      label: 'offerCategory matches requiredCategory',
      status: offer.category === POLICY_REQUIRED_CATEGORY ? 'pass' : 'fail',
    },
    {
      id: 'credential',
      label: 'requiredCredential present in offerCredentials',
      status: offer.credentials.includes(POLICY_REQUIRED_CREDENTIAL) ? 'pass' : 'fail',
    },
    {
      id: 'forbidden',
      label: 'forbiddenTerm absent from offerForbidden',
      status: offer.forbiddenTermsDetected.includes(POLICY_FORBIDDEN_TERM) ? 'fail' : 'pass',
    },
  ];
}

function buildProof(offer: OfferFacts, timestamp: string): ProofResult {
  const policyPayload = {
    policyId: POLICY_ID,
    maxPriceCents: POLICY_MAX_CENTS,
    requiredCategory: POLICY_REQUIRED_CATEGORY,
    requiredCredential: POLICY_REQUIRED_CREDENTIAL,
    forbiddenTerm: POLICY_FORBIDDEN_TERM,
  };

  const intentCommitment = commit('intent', policyPayload);
  const offerCommitment = commit('offer', offer);
  const vendorCommitment = commit('vendor', {
    vendorId: offer.vendorId,
    vendorName: offer.vendorName,
  });

  const checks = evaluateOffer(offer);
  const authorized = checks.every((c) => c.status === 'pass');
  const status: 'AUTHORIZED' | 'REJECTED' = authorized ? 'AUTHORIZED' : 'REJECTED';

  const dealId =
    'deal_' +
    stableHash('deal:' + offer.vendorId + ':' + offer.priceCents).slice(2, 12);

  const authorizationCommitment = commit('authorization', {
    intentCommitment,
    offerCommitment,
    vendorCommitment,
    status,
    dealId,
  });

  const proofHash = commit('proof', {
    intentCommitment,
    offerCommitment,
    authorizationCommitment,
    checks: checks.map((c) => ({ id: c.id, status: c.status })),
  });

  return {
    authorized,
    publicSignal: authorized ? 'AUTHORIZED' : 'POLICY_VIOLATION',
    status,
    vendorId: offer.vendorId,
    vendorName: offer.vendorName,
    dealId,
    policyId: POLICY_ID,
    priceBand: authorized ? '$2k-$2.5k' : undefined,
    treasuryAction: authorized ? 'debit_authorized' : 'unchanged',
    debitCents: authorized ? offer.priceCents : undefined,
    proofHash,
    commitmentHash: authorizationCommitment,
    intentCommitment,
    offerCommitment,
    vendorCommitment,
    authorizationCommitment,
    checks,
    timestamp,
  };
}

export function buildProofResult(
  vendorId: 'brightreach' | 'cleanlist',
  timestamp: string,
): ProofResult {
  const offer = vendorId === 'brightreach' ? VENDOR_A_FACTS : VENDOR_B_FACTS;
  return buildProof(offer, timestamp);
}

function vendorIdFromName(vendorName: string): 'brightreach' | 'cleanlist' {
  return vendorName.toLowerCase().includes('cleanlist') ? 'cleanlist' : 'brightreach';
}

export async function generateProof(
  _priceCents: number,
  vendorName: string,
): Promise<ProofResult> {
  // Fixed 1400ms latency so the proof animation reads on every demo run.
  await new Promise((r) => setTimeout(r, 1400));
  const vendorId = vendorIdFromName(vendorName);
  // Timestamp is captured at proof completion time, not render time, so it
  // does not cause hydration mismatch.
  const timestamp = new Date().toISOString();
  return buildProofResult(vendorId, timestamp);
}

export const __policyForTests = {
  POLICY_MAX_CENTS,
  POLICY_REQUIRED_CATEGORY,
  POLICY_REQUIRED_CREDENTIAL,
  POLICY_FORBIDDEN_TERM,
  POLICY_ID,
  VENDOR_A_FACTS,
  VENDOR_B_FACTS,
  buildProofResult,
};
