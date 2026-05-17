'use client';

import { useState, useCallback } from 'react';
import { generateProof, type ProofResult } from '@/lib/mockProof';
import TreasuryHeader from '@/components/TreasuryHeader';
import HiddenPolicyPanel from '@/components/HiddenPolicyPanel';
import CompetitorIntelPanel from '@/components/CompetitorIntelPanel';
import VendorCard, { type VendorStatus } from '@/components/VendorCard';
import AIExtractionPanel from '@/components/AIExtractionPanel';
import GuidedDemoControls from '@/components/GuidedDemoControls';
import NarrativeStepper from '@/components/NarrativeStepper';
import HeroTreasury from '@/components/HeroTreasury';
import AppFooter from '@/components/AppFooter';
import ImplementationStatusStrip from '@/components/ImplementationStatusStrip';
import DemoStepBanner from '@/components/DemoStepBanner';
import HomeScreen from '@/components/HomeScreen';
import IntroSlides from '@/components/IntroSlides';
import ProductMode from '@/components/ProductMode';
import WhyNotPromptBox from '@/components/WhyNotPromptBox';
import PublicReceipt from '@/components/PublicReceipt';
import CompactCircuitPanel from '@/components/CompactCircuitPanel';

const TREASURY_START = 1000000;
const VENDOR_B_COST = 225000;
const VENDOR_A_PRICE_CENTS = 190000;
const VENDOR_B_PRICE_CENTS = 225000;

const VENDOR_A_CHIPS = [
  { label: 'freshness_verified' },
  { label: 'delivery_72hr' },
  { label: 'partner_enrichment', flagged: true },
  { label: 'category:lead_data' },
];

const VENDOR_B_CHIPS = [
  { label: 'freshness_verified' },
  { label: 'delivery_72hr' },
  { label: 'customer_siloed' },
  { label: 'category:lead_data' },
];

const VENDOR_A_PROPOSAL =
  'BrightReach Data delivers verified dental clinic lead data with full freshness verification. Each list includes name, practice details, role, contact information, and verification timestamps. \n\nBrightReach may use anonymized campaign metadata, segment performance, and buyer interaction signals for partner enrichment, audience modeling, and benchmark optimization across similar customers.';

const VENDOR_B_PROPOSAL =
  'CleanList Pro provides verified dental clinic lead data sourced from licensed commercial directories and direct provider relationships. Each dataset includes freshness verification, opt-out screening, and clear source documentation.\n\nCleanList maintains customer-specific delivery workspaces and does not combine campaign outputs across engagements. Data supplied for one engagement is not repackaged, benchmarked, enriched, or redistributed for other customers.';

interface VendorState {
  status: VendorStatus;
  proof: ProofResult | null;
}

const INITIAL_VENDOR_STATE: VendorState = { status: 'idle', proof: null };

type AppView = 'home' | 'intro' | 'demo';

export default function Page() {
  const [view, setView] = useState<AppView>('demo');

  if (view === 'home') {
    return (
      <HomeScreen
        onViewIntro={() => setView('intro')}
        onOpenDemo={() => setView('demo')}
      />
    );
  }

  if (view === 'intro') {
    return (
      <IntroSlides
        onExitToHome={() => setView('home')}
        onOpenDemo={() => setView('demo')}
      />
    );
  }

  return (
    <DemoView
      onGoHome={() => setView('home')}
      onGoIntro={() => setView('intro')}
    />
  );
}

type DemoMode = 'guided' | 'product';

function DemoView({
  onGoHome,
  onGoIntro,
}: {
  onGoHome: () => void;
  onGoIntro: () => void;
}) {
  const [mode, setMode] = useState<DemoMode>('guided');

  if (mode === 'product') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DemoNav onGoHome={onGoHome} onGoIntro={onGoIntro} />
        <ModeToggle mode={mode} onChange={setMode} />
        <main
          style={{
            padding: '24px 24px 120px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <ProductMode />
        </main>
      </div>
    );
  }

  return <GuidedDemoView onGoHome={onGoHome} onGoIntro={onGoIntro} />;
}

function GuidedDemoView({
  onGoHome,
  onGoIntro,
}: {
  onGoHome: () => void;
  onGoIntro: () => void;
}) {
  const [vendorA, setVendorA] = useState<VendorState>(INITIAL_VENDOR_STATE);
  const [vendorB, setVendorB] = useState<VendorState>(INITIAL_VENDOR_STATE);
  const [treasuryBalance, setTreasuryBalance] = useState<number>(TREASURY_START);
  const [publicLog, setPublicLog] = useState<ProofResult[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);
  const [lastDebit, setLastDebit] = useState<{ amountCents: number; commitmentHash: string } | null>(null);

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

    if (!result.authorized) {
      // Rejected proofs are still publicly disclosed (status + commitments).
      setPublicLog((prev) =>
        prev.some((p) => p.proofHash === result.proofHash) ? prev : [result, ...prev],
      );
    }
  }, []);

  const authorizeVendor = useCallback((vendor: 'A' | 'B') => {
    const state = vendor === 'A' ? vendorA : vendorB;
    if (state.status !== 'approved' || !state.proof) return;
    const proof = state.proof;

    setPublicLog((prev) => {
      if (prev.some((p) => p.proofHash === proof.proofHash)) return prev;

      if (vendor === 'B') {
        setTreasuryBalance((bal) => bal - VENDOR_B_COST);
        setLastDebit({
          amountCents: VENDOR_B_COST,
          commitmentHash: proof.authorizationCommitment,
        });
      }

      return [proof, ...prev];
    });
  }, [vendorA, vendorB]);

  const resetDemo = useCallback(() => {
    setVendorA(INITIAL_VENDOR_STATE);
    setVendorB(INITIAL_VENDOR_STATE);
    setTreasuryBalance(TREASURY_START);
    setPublicLog([]);
    setResetKey((k) => k + 1);
    setLastDebit(null);
  }, []);

  const VENDOR_A_EXTRACTED = {
    priceLabel: '$1,900',
    category: 'lead_data',
    credentials: ['freshness_verified', 'delivery_72hr', 'partner_enrichment'],
    forbiddenTermsDetected: ['campaign_metadata_reuse'],
  };
  const VENDOR_B_EXTRACTED = {
    priceLabel: '$2,250',
    category: 'lead_data',
    credentials: ['freshness_verified', 'delivery_72hr', 'customer_siloed'],
    forbiddenTermsDetected: [],
  };

  const activeVendor = (() => {
    if (vendorA.status === 'analyzing') {
      return { name: 'BrightReach Data', status: vendorA.status, chips: VENDOR_A_CHIPS, extracted: VENDOR_A_EXTRACTED };
    }
    if (vendorB.status === 'analyzing') {
      return { name: 'CleanList Pro', status: vendorB.status, chips: VENDOR_B_CHIPS, extracted: VENDOR_B_EXTRACTED };
    }
    if (vendorB.proof) {
      return { name: 'CleanList Pro', status: vendorB.status, chips: VENDOR_B_CHIPS, extracted: VENDOR_B_EXTRACTED };
    }
    if (vendorA.proof) {
      return { name: 'BrightReach Data', status: vendorA.status, chips: VENDOR_A_CHIPS, extracted: VENDOR_A_EXTRACTED };
    }
    return null;
  })();

  const isVendorBAuthorized = vendorB.proof
    ? publicLog.some((p) => p.proofHash === vendorB.proof?.proofHash)
    : false;

  const latestProof = vendorB.status === 'analyzing' || vendorA.status === 'analyzing'
    ? null
    : vendorB.proof ?? vendorA.proof ?? null;
  const isLatestAuthorized = latestProof?.authorized ?? false;
  const isAnalyzing = vendorA.status === 'analyzing' || vendorB.status === 'analyzing';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DemoNav onGoHome={onGoHome} onGoIntro={onGoIntro} />
      <TreasuryHeader balanceCents={treasuryBalance} lastDebit={lastDebit} />

      <main
        style={{
          padding: '32px 24px 200px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ paddingTop: '24px', paddingBottom: '40px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: '32px',
              alignItems: 'center',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'var(--font-size-hero)',
                  fontWeight: 'var(--font-weight-hero)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--line-height-display)',
                  letterSpacing: '-0.02em',
                  maxWidth: '720px',
                  margin: 0,
                }}
              >
                Your AI agent has <span style={{ color: 'var(--color-treasury-gold)' }}>$10,000</span> of company money.
                <br />
                SilentIntent proves it can only spend on offers that match hidden policy.
              </p>
              <p
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '14px',
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: '14px',
                }}
              >
                Private policy in. Public authorization out.
              </p>
            </div>
            <HeroTreasury
              balanceCents={treasuryBalance}
              hasDebit={lastDebit !== null}
              debitCents={lastDebit?.amountCents}
              hasAnyResult={
                vendorA.status === 'rejected' ||
                vendorA.status === 'approved' ||
                vendorB.status === 'rejected' ||
                vendorB.status === 'approved'
              }
            />
          </div>
          <div style={{ marginTop: '28px' }}>
            <NarrativeStepper />
          </div>
        </div>

        <WhyNotPromptBox />

        <GuidedDemoControls
          vendorAStatus={vendorA.status}
          vendorBStatus={vendorB.status}
          isVendorBAuthorized={isVendorBAuthorized}
          onAnalyzeA={() => analyzeVendor('A')}
          onAnalyzeB={() => analyzeVendor('B')}
          onAuthorizeB={() => authorizeVendor('B')}
          onReset={resetDemo}
        />

        <DemoStepBanner
          vendorAStatus={vendorA.status}
          vendorBStatus={vendorB.status}
        />

        <SectionLabel
          title="Private buyer view"
          subtitle="only the company agent sees this"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.6fr',
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
            descriptiveLine="Cheaper and faster, but risky after extraction."
            chips={VENDOR_A_CHIPS}
            surfaceLabel="Surface-best offer"
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
            descriptiveLine="More expensive, but policy-safe."
            chips={VENDOR_B_CHIPS}
            surfaceLabel="Compliant offer"
            priceCents={VENDOR_B_PRICE_CENTS}
            status={vendorB.status}
            proof={vendorB.proof}
            resetKey={resetKey}
            isLogged={publicLog.some((p) => p === vendorB.proof)}
            onAnalyze={() => analyzeVendor('B')}
            onAuthorize={() => authorizeVendor('B')}
          />
        </div>

        <AIExtractionPanel activeVendor={activeVendor} />

        <SectionLabel
          title="Public view"
          subtitle="visible to everyone"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          <PublicReceipt
            latestProof={latestProof}
            isLatestAuthorized={isLatestAuthorized}
            analyzing={isAnalyzing}
          />
          <CompactCircuitPanel />
        </div>

        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            lineHeight: 1.55,
            letterSpacing: '0.02em',
            margin: '4px 0 0',
            textAlign: 'center',
          }}
        >
          Demo note: UI uses deterministic proof execution for reliability. Compiled Compact artifacts are included in contracts/intent-evaluation/.
        </p>

        <ImplementationStatusStrip />

        <AppFooter />
      </main>
    </div>
  );
}

function DemoNav({
  onGoHome,
  onGoIntro,
}: {
  onGoHome: () => void;
  onGoIntro: () => void;
}) {
  return (
    <div
      style={{
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(10,12,15,0.6)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <button
        type="button"
        onClick={onGoHome}
        aria-label="Return to SilentIntent home screen"
        style={navChipStyle}
        onMouseEnter={navChipHover}
        onMouseLeave={navChipUnhover}
      >
        ← Home
      </button>
      <button
        type="button"
        onClick={onGoIntro}
        aria-label="Restart intro slides"
        style={navChipStyle}
        onMouseEnter={navChipHover}
        onMouseLeave={navChipUnhover}
      >
        ↺ Intro
      </button>
      <span
        style={{
          marginLeft: 'auto',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        Live demo
      </span>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: DemoMode;
  onChange: (next: DemoMode) => void;
}) {
  const options: { value: DemoMode; label: string; sub: string }[] = [
    { value: 'guided', label: 'Guided demo', sub: 'scripted BrightReach / CleanList flow' },
    { value: 'product', label: 'Try it yourself', sub: 'build a policy, paste an offer, run the proof' },
  ];

  return (
    <div
      style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'rgba(10,12,15,0.4)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        role="tablist"
        aria-label="Demo mode"
        style={{
          display: 'inline-flex',
          padding: '4px',
          border: '1px solid var(--color-border-accent)',
          borderRadius: '10px',
          backgroundColor: 'var(--color-bg)',
          gap: '4px',
        }}
      >
        {options.map((opt) => {
          const isActive = opt.value === mode;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(opt.value)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '10px 18px',
                borderRadius: '7px',
                border: 'none',
                cursor: isActive ? 'default' : 'pointer',
                backgroundColor: isActive ? 'var(--color-surface-raised)' : 'transparent',
                color: isActive ? 'var(--color-treasury-gold)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                transition: 'background-color 0.15s, color 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px',
                minWidth: '210px',
                textAlign: 'left',
              }}
              title={opt.sub}
            >
              <span>{opt.label}</span>
              <span
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.04em',
                  textTransform: 'none',
                  fontWeight: 400,
                  color: isActive ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
                }}
              >
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navChipStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '6px 12px',
  backgroundColor: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border-accent)',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'color 0.15s, border-color 0.15s',
};

function navChipHover(e: React.MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.color = 'var(--color-treasury-gold)';
  el.style.borderColor = 'var(--color-treasury-gold-dim)';
}

function navChipUnhover(e: React.MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.color = 'var(--color-text-secondary)';
  el.style.borderColor = 'var(--color-border-accent)';
}

function SectionLabel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '14px',
        paddingTop: '4px',
        paddingBottom: '2px',
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--color-treasury-gold)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        — {subtitle}
      </span>
      <div
        style={{
          flex: 1,
          height: '1px',
          backgroundColor: 'var(--color-border)',
        }}
      />
    </div>
  );
}
