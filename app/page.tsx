'use client';

import { useState, useCallback } from 'react';
import { generateProof, type ProofResult } from '@/lib/mockProof';
import TreasuryHeader from '@/components/TreasuryHeader';
import HiddenPolicyPanel from '@/components/HiddenPolicyPanel';
import CompetitorIntelPanel from '@/components/CompetitorIntelPanel';
import VendorCard, { type VendorStatus } from '@/components/VendorCard';
import AIExtractionPanel from '@/components/AIExtractionPanel';
import PublicVerifier from '@/components/PublicVerifier';
import DemoControls from '@/components/DemoControls';

const TREASURY_START = 1000000;
const VENDOR_B_COST = 225000;
const VENDOR_A_PRICE_CENTS = 190000;
const VENDOR_B_PRICE_CENTS = 225000;

const VENDOR_A_PROPOSAL =
  'BrightReach Data delivers verified dental clinic lead data with full freshness verification. Each list includes name, practice details, role, contact information, and verification timestamps. \n\nBrightReach may use anonymized campaign metadata, segment performance, and buyer interaction signals for partner enrichment, audience modeling, and benchmark optimization across similar customers.';

const VENDOR_B_PROPOSAL =
  'CleanList Pro provides verified dental clinic lead data sourced from licensed commercial directories and direct provider relationships. Each dataset includes freshness verification, opt-out screening, and clear source documentation.\n\nCleanList maintains customer-specific delivery workspaces and does not combine campaign outputs across engagements. Data supplied for one engagement is not repackaged, benchmarked, enriched, or redistributed for other customers.';

interface VendorState {
  status: VendorStatus;
  proof: ProofResult | null;
}

const INITIAL_VENDOR_STATE: VendorState = { status: 'idle', proof: null };

export default function Page() {
  const [vendorA, setVendorA] = useState<VendorState>(INITIAL_VENDOR_STATE);
  const [vendorB, setVendorB] = useState<VendorState>(INITIAL_VENDOR_STATE);
  const [treasuryBalance, setTreasuryBalance] = useState<number>(TREASURY_START);
  const [publicLog, setPublicLog] = useState<ProofResult[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);

  const analyzeVendor = useCallback(async (vendor: 'A' | 'B') => {
    const priceCents = vendor === 'A' ? VENDOR_A_PRICE_CENTS : VENDOR_B_PRICE_CENTS;
    const vendorName = vendor === 'A' ? 'BrightReach Data' : 'CleanList Pro';
    const setVendor = vendor === 'A' ? setVendorA : setVendorB;

    setVendor({ status: 'analyzing', proof: null });

    const result = await generateProof(priceCents, vendorName);

    setVendor({
      status: result.authorized ? 'approved' : 'rejected',
      proof: result,
    });
  }, []);

  const authorizeVendor = useCallback((vendor: 'A' | 'B') => {
    const state = vendor === 'A' ? vendorA : vendorB;
    if (state.status !== 'approved' || !state.proof) return;

    if (vendor === 'B') {
      setTreasuryBalance((prev) => prev - VENDOR_B_COST);
    }

    setPublicLog((prev) => [state.proof!, ...prev]);
  }, [vendorA, vendorB]);

  const resetDemo = useCallback(() => {
    setVendorA(INITIAL_VENDOR_STATE);
    setVendorB(INITIAL_VENDOR_STATE);
    setTreasuryBalance(TREASURY_START);
    setPublicLog([]);
    setResetKey((k) => k + 1);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TreasuryHeader balanceCents={treasuryBalance} />

      <main
        style={{
          padding: '32px 24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ paddingTop: '48px', paddingBottom: '32px' }}>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'var(--font-size-hero)',
              fontWeight: 'var(--font-weight-hero)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-display)',
              letterSpacing: '-0.02em',
              maxWidth: '880px',
              margin: 0,
            }}
          >
            Confidential spend authorization for AI agents.
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '12px',
            }}
          >
            Private policy in. Public authorization out.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '16px',
          }}
        >
          <HiddenPolicyPanel resetKey={resetKey} />
          <CompetitorIntelPanel />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          <VendorCard
            vendorName="BrightReach Data"
            category="Lead Data"
            priceLabel="$1,900"
            proposalText={VENDOR_A_PROPOSAL}
            summaryLine="Verified dental clinic lead data, partner enrichment included"
            chips={[
              { label: 'freshness_verified' },
              { label: 'delivery_72hr' },
              { label: 'partner_enrichment', flagged: true },
              { label: 'category:lead_data' },
            ]}
            authorizeLabel="Attempt Spend Authorization"
            priceCents={VENDOR_A_PRICE_CENTS}
            status={vendorA.status}
            proof={vendorA.proof}
            resetKey={resetKey}
            isLogged={publicLog.some((p) => p === vendorA.proof)}
            onAnalyze={() => analyzeVendor('A')}
            onAuthorize={() => authorizeVendor('A')}
          />
          <VendorCard
            vendorName="CleanList Pro"
            category="Lead Data"
            priceLabel="$2,250"
            proposalText={VENDOR_B_PROPOSAL}
            summaryLine="Verified dental clinic lead data, customer-siloed delivery"
            chips={[
              { label: 'freshness_verified' },
              { label: 'delivery_72hr' },
              { label: 'customer_siloed' },
              { label: 'category:lead_data' },
            ]}
            priceCents={VENDOR_B_PRICE_CENTS}
            status={vendorB.status}
            proof={vendorB.proof}
            resetKey={resetKey}
            isLogged={publicLog.some((p) => p === vendorB.proof)}
            onAnalyze={() => analyzeVendor('B')}
            onAuthorize={() => authorizeVendor('B')}
          />
        </div>

        <AIExtractionPanel />

        <PublicVerifier
          log={publicLog}
          resetKey={resetKey}
          analyzing={vendorA.status === 'analyzing' || vendorB.status === 'analyzing'}
        />

        <DemoControls onReset={resetDemo} />
      </main>
    </div>
  );
}
