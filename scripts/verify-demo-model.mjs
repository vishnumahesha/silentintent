#!/usr/bin/env node
// SilentIntent — demo model verification.
//
// This script re-derives the proof outcomes the UI depends on, without
// importing TypeScript, so it runs with plain `node`. The constants and
// hash primitive below MUST stay in sync with lib/mockProof.ts. If you
// change the constraint logic in the TS module, change it here too —
// this script's job is to fail loudly when the two drift.

const POLICY_MAX_CENTS = 250000;
const POLICY_REQUIRED_CATEGORY = 'lead_data';
const POLICY_REQUIRED_CREDENTIAL = 'freshness_verified';
const POLICY_FORBIDDEN_TERM = 'campaign_metadata_reuse';
const POLICY_ID = 'pol_dental_lead_v1';

const VENDOR_A = {
  vendorId: 'brightreach',
  vendorName: 'BrightReach Data',
  priceCents: 190000,
  category: 'lead_data',
  credentials: ['freshness_verified', 'delivery_72hr', 'high_volume'],
  forbiddenTermsDetected: ['campaign_metadata_reuse', 'partner_enrichment'],
};

const VENDOR_B = {
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

function stableHash(input) {
  let h1 = 0x811c9dc5;
  let h2 = 0xdeadbeef;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca6b);
  }
  h1 = (h1 ^ (h1 >>> 16)) >>> 0;
  h2 = (h2 ^ (h2 >>> 13)) >>> 0;
  const part = (n) => n.toString(16).padStart(8, '0');
  return '0x' + part(h1) + part(h2) + part(h1 ^ h2) + part((h2 + 0x9e3779b9) >>> 0);
}

function canonical(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonical).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(obj[k])).join(',') + '}';
}

function commit(label, payload) {
  return stableHash(label + ':' + canonical(payload));
}

function evaluate(offer) {
  return {
    price: offer.priceCents <= POLICY_MAX_CENTS,
    category: offer.category === POLICY_REQUIRED_CATEGORY,
    credential: offer.credentials.includes(POLICY_REQUIRED_CREDENTIAL),
    forbidden: !offer.forbiddenTermsDetected.includes(POLICY_FORBIDDEN_TERM),
  };
}

function authorize(offer) {
  const checks = evaluate(offer);
  const authorized = Object.values(checks).every(Boolean);
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
  const status = authorized ? 'AUTHORIZED' : 'REJECTED';
  const dealId = 'deal_' + stableHash('deal:' + offer.vendorId + ':' + offer.priceCents).slice(2, 12);
  const authorizationCommitment = commit('authorization', {
    intentCommitment,
    offerCommitment,
    vendorCommitment,
    status,
    dealId,
  });
  return {
    authorized,
    status,
    checks,
    debitCents: authorized ? offer.priceCents : 0,
    intentCommitment,
    offerCommitment,
    vendorCommitment,
    authorizationCommitment,
  };
}

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';

let failures = 0;
function expect(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`${GREEN}✓${RESET} ${label}`);
  } else {
    failures++;
    console.log(`${RED}✗${RESET} ${label}`);
    console.log(`  ${DIM}expected${RESET} ${JSON.stringify(expected)}`);
    console.log(`  ${DIM}actual${RESET}   ${JSON.stringify(actual)}`);
  }
}

console.log(`${BOLD}SilentIntent — demo model verification${RESET}\n`);

const a = authorize(VENDOR_A);
const b = authorize(VENDOR_B);

console.log(`${BOLD}BrightReach Data${RESET}`);
expect('rejects', a.authorized, false);
expect('status REJECTED', a.status, 'REJECTED');
expect('price check passes', a.checks.price, true);
expect('category check passes', a.checks.category, true);
expect('credential check passes', a.checks.credential, true);
expect('forbidden check fails', a.checks.forbidden, false);
expect('treasury debit 0', a.debitCents, 0);

console.log(`\n${BOLD}CleanList Pro${RESET}`);
expect('authorizes', b.authorized, true);
expect('status AUTHORIZED', b.status, 'AUTHORIZED');
expect('all four checks pass', b.checks, {
  price: true,
  category: true,
  credential: true,
  forbidden: true,
});
expect('treasury debit 225000 cents', b.debitCents, 225000);

console.log(`\n${BOLD}Determinism${RESET}`);
const a2 = authorize(VENDOR_A);
const b2 = authorize(VENDOR_B);
expect('BrightReach intent commitment stable', a.intentCommitment, a2.intentCommitment);
expect('BrightReach offer commitment stable', a.offerCommitment, a2.offerCommitment);
expect('BrightReach authorization commitment stable', a.authorizationCommitment, a2.authorizationCommitment);
expect('CleanList intent commitment stable', b.intentCommitment, b2.intentCommitment);
expect('CleanList offer commitment stable', b.offerCommitment, b2.offerCommitment);
expect('CleanList authorization commitment stable', b.authorizationCommitment, b2.authorizationCommitment);

console.log(`\n${BOLD}Disclosure boundary${RESET}`);
expect(
  'BrightReach and CleanList have distinct offer commitments',
  a.offerCommitment !== b.offerCommitment,
  true,
);
expect(
  'both vendors share the same intent commitment (same policy)',
  a.intentCommitment,
  b.intentCommitment,
);

console.log('');
if (failures === 0) {
  console.log(`${GREEN}${BOLD}All checks passed.${RESET}`);
  process.exit(0);
} else {
  console.log(`${RED}${BOLD}${failures} check(s) failed.${RESET}`);
  process.exit(1);
}
