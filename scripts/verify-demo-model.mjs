#!/usr/bin/env node
// SilentIntent — demo model verification.
//
// Re-derives the proof outcomes the sandbox UI depends on, without
// importing TypeScript so it runs with plain `node`. The constants and
// hash primitive below MUST stay in sync with lib/witnessAdapter.ts +
// lib/proofHash.ts. If the TS modules change, change this script too —
// its job is to fail loudly when the two drift.

// ---------------------------------------------------------------------------
// Constants (mirror lib/witnessAdapter.ts)
// ---------------------------------------------------------------------------

const POLICY = {
  maxPriceCents: 250000,
  requiredCategory: 'lead_data',
  requiredCredential: 'freshness_verified',
  forbiddenTerm: 'campaign_metadata_reuse',
  urgencyHours: 72,
  priority: 'quality_over_volume',
  intentSalt: 'salt:intent:dental_lead_v1',
};
const POLICY_ID = 'pol_dental_lead_v1';

const VENDOR_A = {
  vendorId: 'brightreach',
  vendorName: 'BrightReach Data',
  priceCents: 190000,
  category: 'lead_data',
  credentials: [
    'freshness_verified',
    'delivery_72hr',
    'high_volume',
    'partner_enrichment',
  ],
  detectedForbiddenTerms: ['campaign_metadata_reuse', 'partner_enrichment'],
  proposalHashSource: 'brightreach-data:dental-clinic-lead-list:v1',
  offerSalt: 'salt:offer:brightreach:v1',
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
  detectedForbiddenTerms: [],
  proposalHashSource: 'cleanlist-pro:dental-clinic-leads:v1',
  offerSalt: 'salt:offer:cleanlist:v1',
};

const CREDENTIAL_VECTOR_LENGTH = 4;
const FORBIDDEN_VECTOR_LENGTH = 4;
const NONCE = {
  brightreach: 'nonce:authz:brightreach:v1',
  cleanlist: 'nonce:authz:cleanlist:v1',
};

// ---------------------------------------------------------------------------
// Hash + canonical (mirror lib/proofHash.ts)
// ---------------------------------------------------------------------------

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const keys = Object.keys(value).sort();
  return (
    '{' +
    keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') +
    '}'
  );
}

function demoHash(value) {
  const input = typeof value === 'string' ? value : stableStringify(value);
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

function hashLabel(label) {
  return demoHash('label:' + label.trim().toLowerCase());
}

function padToLength(values, length, label) {
  const out = values.slice(0, length).map(hashLabel);
  while (out.length < length) out.push(demoHash(`${label}:empty:${out.length}`));
  return out;
}

// ---------------------------------------------------------------------------
// Witness adapter (mirror lib/witnessAdapter.ts)
// ---------------------------------------------------------------------------

function buildWitness(offer) {
  return {
    maxPriceCents: POLICY.maxPriceCents,
    requiredCategoryHash: hashLabel(POLICY.requiredCategory),
    requiredCredentialHash: hashLabel(POLICY.requiredCredential),
    forbiddenTermHash: hashLabel(POLICY.forbiddenTerm),
    intentSalt: POLICY.intentSalt,
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
    authorizationNonce: NONCE[offer.vendorId],
  };
}

function intentCommitment() {
  return demoHash({
    label: 'intent',
    payload: {
      maxPriceCents: POLICY.maxPriceCents,
      requiredCategoryHash: hashLabel(POLICY.requiredCategory),
      requiredCredentialHash: hashLabel(POLICY.requiredCredential),
      forbiddenTermHash: hashLabel(POLICY.forbiddenTerm),
      urgencyHours: POLICY.urgencyHours,
      priority: POLICY.priority,
    },
    salt: POLICY.intentSalt,
  });
}

function offerCommitment(offer) {
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

function vendorCommitment(offer) {
  return demoHash({
    label: 'vendor',
    payload: { vendorId: offer.vendorId, vendorName: offer.vendorName },
  });
}

function authorizationCommitment(parts) {
  return demoHash({
    label: 'authorization',
    payload: {
      intentCommitment: parts.intentCommitment,
      offerCommitment: parts.offerCommitment,
      vendorCommitment: parts.vendorCommitment ?? null,
      status: parts.status,
      dealId: parts.dealId,
    },
  });
}

function priceBandFor(priceCents) {
  if (priceCents >= 200000 && priceCents <= 250000) return '$2k-$2.5k';
  return undefined;
}

function evaluate(witness) {
  return {
    price: witness.offerPriceCents <= witness.maxPriceCents,
    category: witness.offerCategoryHash === witness.requiredCategoryHash,
    credential: witness.offerCredentialHashes.includes(witness.requiredCredentialHash),
    forbidden: !witness.detectedForbiddenTermHashes.includes(witness.forbiddenTermHash),
  };
}

function authorize(offer) {
  const witness = buildWitness(offer);
  const checks = evaluate(witness);
  const authorized = Object.values(checks).every(Boolean);
  const status = authorized ? 'AUTHORIZED' : 'REJECTED';

  const ic = intentCommitment();
  const oc = offerCommitment(offer);
  const vc = authorized ? vendorCommitment(offer) : undefined;
  const dealId = 'deal_' + demoHash(`deal:${offer.vendorId}:${offer.priceCents}`).slice(2, 12);
  const ac = authorizationCommitment({
    intentCommitment: ic,
    offerCommitment: oc,
    vendorCommitment: vc,
    status,
    dealId,
  });

  return {
    spendAuthorized: authorized,
    status,
    priceBand: authorized ? priceBandFor(offer.priceCents) : undefined,
    dealId,
    policyId: POLICY_ID,
    intentCommitment: ic,
    offerCommitment: oc,
    authorizationCommitment: ac,
    vendorCommitment: vc,
    treasuryAction: authorized ? 'debit_authorized' : 'unchanged',
    debitCents: authorized ? offer.priceCents : undefined,
    checks,
  };
}

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------

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
expect('status REJECTED', a.status, 'REJECTED');
expect('spendAuthorized false', a.spendAuthorized, false);
expect('treasuryAction unchanged', a.treasuryAction, 'unchanged');
expect('debitCents undefined', a.debitCents, undefined);
expect('price check passes', a.checks.price, true);
expect('category check passes', a.checks.category, true);
expect('credential check passes', a.checks.credential, true);
expect('forbidden check FAILS', a.checks.forbidden, false);
expect('vendorCommitment withheld when rejected', a.vendorCommitment, undefined);
expect('priceBand withheld when rejected', a.priceBand, undefined);

console.log(`\n${BOLD}CleanList Pro${RESET}`);
expect('status AUTHORIZED', b.status, 'AUTHORIZED');
expect('spendAuthorized true', b.spendAuthorized, true);
expect('treasuryAction debit_authorized', b.treasuryAction, 'debit_authorized');
expect('debitCents 225000', b.debitCents, 225000);
expect('priceBand "$2k-$2.5k"', b.priceBand, '$2k-$2.5k');
expect('all four checks pass', b.checks, {
  price: true,
  category: true,
  credential: true,
  forbidden: true,
});

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

// Privacy guarantees: the public-output shape must not leak any raw
// witness value. Both raw maxPriceCents and either salt must be absent
// from JSON.stringify(result).
console.log(`\n${BOLD}Privacy guarantees${RESET}`);
const blob = JSON.stringify({ a, b });
expect(
  'raw maxPriceCents (250000) absent from public output',
  blob.includes('250000'),
  false,
);
expect(
  'intentSalt value absent from public output',
  blob.includes(POLICY.intentSalt),
  false,
);
expect(
  'BrightReach offerSalt absent from public output',
  blob.includes(VENDOR_A.offerSalt),
  false,
);
expect(
  'CleanList offerSalt absent from public output',
  blob.includes(VENDOR_B.offerSalt),
  false,
);
expect(
  'requiredCredential literal absent from public output',
  blob.includes(POLICY.requiredCredential),
  false,
);
expect(
  'forbiddenTerm literal absent from public output',
  blob.includes(POLICY.forbiddenTerm),
  false,
);

console.log('');
if (failures === 0) {
  console.log(`${GREEN}${BOLD}All checks passed.${RESET}`);
  process.exit(0);
} else {
  console.log(`${RED}${BOLD}${failures} check(s) failed.${RESET}`);
  process.exit(1);
}
