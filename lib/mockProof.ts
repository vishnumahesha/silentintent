// Hidden policy threshold — never expose this in UI or logs
const POLICY_MAX_CENTS = 38; // $0.38 per unit

export type ProofResult = {
  authorized: boolean;
  proofHash: string;
  publicSignal: 'AUTHORIZED' | 'POLICY_THRESHOLD_EXCEEDED';
  commitmentHash: string;
  timestamp: string;
  vendorName: string;
};

function randomHex(bytes: number): string {
  return '0x' + Array.from({ length: bytes * 2 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export async function generateProof(
  priceCents: number,
  vendorName: string
): Promise<ProofResult> {
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));

  const authorized = priceCents <= POLICY_MAX_CENTS;

  return {
    authorized,
    proofHash: randomHex(16),
    publicSignal: authorized ? 'AUTHORIZED' : 'POLICY_THRESHOLD_EXCEEDED',
    commitmentHash: randomHex(16),
    timestamp: new Date().toISOString(),
    vendorName,
  };
}
