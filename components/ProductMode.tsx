'use client';

import { useMemo, useState } from 'react';
import { authorizeOffer } from '@/lib/mockProof';
import type {
  AuthorizationProofResult,
  BuyerPolicyPrivate,
  ExtractedOfferFacts,
  VendorId,
} from '@/lib/proofTypes';

const PROOF_CYAN = '#4DB8B8';

const DEFAULT_POLICY = {
  maxBudget: 2500,
  requiredCategory: 'lead_data',
  requiredCredential: 'freshness_verified',
  forbiddenTerm: 'campaign_metadata_reuse',
  treasury: 10000,
};

const EMPTY_OFFER = {
  vendorName: '',
  priceDollars: '',
  category: '',
  credentials: '',
  forbiddenTerms: '',
  proposalText: '',
};

const BRIGHTREACH_EXAMPLE = {
  vendorName: 'BrightReach Data',
  priceDollars: '1900',
  category: 'lead_data',
  credentials: 'weekly_refresh, high_volume, crm_enrichment',
  forbiddenTerms: 'campaign_metadata_reuse',
  proposalText:
    'BrightReach Data delivers verified dental clinic leads with fast delivery and high volume. Campaign metadata may be used for partner enrichment and audience modeling across similar customers.',
};

const CLEANLIST_EXAMPLE = {
  vendorName: 'CleanList Pro',
  priceDollars: '2250',
  category: 'lead_data',
  credentials:
    'freshness_verified, delivery_72hr, customer_siloed, no_cross_client_modeling',
  forbiddenTerms: '',
  proposalText:
    'CleanList Pro delivers verified dental clinic leads from licensed sources. Customer datasets are siloed by engagement and are not used for cross-client modeling or partner enrichment.',
};

type OfferDraft = typeof EMPTY_OFFER;

const PROOF_CHECKLIST: { key: 'price' | 'category' | 'credential' | 'forbidden' | 'disclose'; label: string }[] = [
  { key: 'price', label: 'Offer price is below hidden max budget' },
  { key: 'category', label: 'Offer category matches hidden required category' },
  { key: 'credential', label: 'Required credential is present' },
  { key: 'forbidden', label: 'Forbidden term is absent' },
  { key: 'disclose', label: 'Only selected outputs are disclosed' },
];

export default function ProductMode() {
  const [maxBudget, setMaxBudget] = useState(String(DEFAULT_POLICY.maxBudget));
  const [requiredCategory, setRequiredCategory] = useState(DEFAULT_POLICY.requiredCategory);
  const [requiredCredential, setRequiredCredential] = useState(DEFAULT_POLICY.requiredCredential);
  const [forbiddenTerm, setForbiddenTerm] = useState(DEFAULT_POLICY.forbiddenTerm);
  const [treasury, setTreasury] = useState(String(DEFAULT_POLICY.treasury));

  const [offer, setOffer] = useState<OfferDraft>(EMPTY_OFFER);

  const [result, setResult] = useState<AuthorizationProofResult | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [debitedSoFar, setDebitedSoFar] = useState(0);

  const treasuryNumeric = Number(treasury) || 0;
  const remainingTreasury = treasuryNumeric - debitedSoFar;

  const checkMap = useMemo(() => {
    const map = new Map<string, 'pass' | 'fail'>();
    if (result) {
      for (const c of result.checks) {
        if (c.status === 'pass' || c.status === 'fail') {
          map.set(c.id, c.status);
        }
      }
    }
    return map;
  }, [result]);

  const isAuthorized = result?.authorized ?? false;
  const offerReady = offer.vendorName.trim().length > 0 && Number(offer.priceDollars) > 0;

  function loadExample(example: typeof BRIGHTREACH_EXAMPLE) {
    setOffer(example);
    setResult(null);
    setCopied(false);
  }

  function clearOffer() {
    setOffer(EMPTY_OFFER);
    setResult(null);
    setCopied(false);
  }

  async function runAuthorization() {
    if (!offerReady || running) return;

    const vendorIdStamp =
      offer.vendorName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '') || 'product_vendor';

    const policy: BuyerPolicyPrivate = {
      maxPriceCents: Math.round((Number(maxBudget) || 0) * 100),
      requiredCategory: requiredCategory.trim() || 'unspecified',
      requiredCredential: requiredCredential.trim() || 'unspecified',
      forbiddenTerm: forbiddenTerm.trim() || 'none',
      urgencyHours: 72,
      priority: 'product_mode',
      intentSalt: `intent_salt_product:${vendorIdStamp}`,
    };

    const offerFacts: ExtractedOfferFacts = {
      vendorId: vendorIdStamp as VendorId,
      vendorName: offer.vendorName.trim(),
      priceCents: Math.round((Number(offer.priceDollars) || 0) * 100),
      category: offer.category.trim() || 'unspecified',
      credentials: splitCsv(offer.credentials),
      detectedForbiddenTerms: splitCsv(offer.forbiddenTerms),
      proposalHashSource: offer.proposalText.slice(0, 120) || `product:${vendorIdStamp}`,
      offerSalt: `offer_salt_product:${vendorIdStamp}`,
    };

    setRunning(true);
    setResult(null);
    setCopied(false);

    // Small async tick so the running indicator can render.
    await new Promise((r) => setTimeout(r, 600));

    const timestamp = new Date().toISOString();
    const nonce = `nonce:product:${vendorIdStamp}:${Date.now()}`;
    const res = authorizeOffer(policy, offerFacts, timestamp, nonce);

    setResult(res);
    setRunning(false);

    if (res.authorized && res.debitCents) {
      setDebitedSoFar((d) => d + res.debitCents! / 100);
    }
  }

  function resetTreasury() {
    setDebitedSoFar(0);
  }

  async function copyReceipt() {
    if (!result) return;
    const receipt = {
      project: 'SilentIntent',
      status: result.status,
      priceBand: isAuthorized ? result.priceBand ?? null : null,
      dealId: result.dealId,
      policyId: result.policyId,
      intentCommitment: result.intentCommitment,
      offerCommitment: result.offerCommitment,
      treasuryAction: result.treasuryAction,
      disclosedFields: [
        'status',
        'priceBand',
        'dealId',
        'policyId',
        'intentCommitment',
        'offerCommitment',
        'treasuryAction',
      ],
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const failedCheck = result?.checks.find((c) => c.status === 'fail');
  const failedCheckLabel = failedCheck
    ? PROOF_CHECKLIST.find((row) => row.key === failedCheck.id)?.label ?? failedCheck.label
    : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingTop: '4px',
      }}
    >
      <ExplanationBlock />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: '16px',
        }}
      >
        <PrivatePolicyCard
          maxBudget={maxBudget}
          setMaxBudget={setMaxBudget}
          requiredCategory={requiredCategory}
          setRequiredCategory={setRequiredCategory}
          requiredCredential={requiredCredential}
          setRequiredCredential={setRequiredCredential}
          forbiddenTerm={forbiddenTerm}
          setForbiddenTerm={setForbiddenTerm}
          treasury={treasury}
          setTreasury={setTreasury}
          remainingTreasury={remainingTreasury}
          debitedSoFar={debitedSoFar}
          onResetTreasury={resetTreasury}
        />

        <VendorOfferCard
          offer={offer}
          setOffer={setOffer}
          onLoadBrightreach={() => loadExample(BRIGHTREACH_EXAMPLE)}
          onLoadCleanlist={() => loadExample(CLEANLIST_EXAMPLE)}
          onClear={clearOffer}
          onRun={runAuthorization}
          running={running}
          offerReady={offerReady}
        />
      </div>

      {(result || running) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: '16px',
          }}
        >
          <PrivateResultCard
            running={running}
            result={result}
            failedCheckLabel={failedCheckLabel}
            remainingTreasury={remainingTreasury}
            debitedSoFar={debitedSoFar}
          />
          <PublicReceiptCard
            result={result}
            isAuthorized={isAuthorized}
            running={running}
            copied={copied}
            onCopy={copyReceipt}
          />
        </div>
      )}

      <ChecklistCard checkMap={checkMap} hasResult={result !== null} />

      <HonestyFooter />
    </div>
  );
}

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ----------------------------------------------------------------------------
// Subcomponents
// ----------------------------------------------------------------------------

function ExplanationBlock() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--color-treasury-gold)',
        }}
      >
        Try it yourself · spend gate prototype
      </span>
      <p
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '14px',
          color: 'var(--color-text-primary)',
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        Prompting tells an AI what to do. SilentIntent proves whether a
        proposed spend is allowed. This prototype lets you create a private
        policy, test a vendor offer, and export the public receipt without
        exposing the policy.
      </p>
    </div>
  );
}

type PolicyCardProps = {
  maxBudget: string;
  setMaxBudget: (v: string) => void;
  requiredCategory: string;
  setRequiredCategory: (v: string) => void;
  requiredCredential: string;
  setRequiredCredential: (v: string) => void;
  forbiddenTerm: string;
  setForbiddenTerm: (v: string) => void;
  treasury: string;
  setTreasury: (v: string) => void;
  remainingTreasury: number;
  debitedSoFar: number;
  onResetTreasury: () => void;
};

function PrivatePolicyCard(props: PolicyCardProps) {
  return (
    <SectionCard accent="gold" label="Private policy" subLabel="visible only to company agent">
      <TextField
        label="Max budget (USD)"
        type="number"
        value={props.maxBudget}
        onChange={props.setMaxBudget}
        placeholder="2500"
        suffix="$"
      />
      <TextField
        label="Required category"
        value={props.requiredCategory}
        onChange={props.setRequiredCategory}
        placeholder="lead_data"
      />
      <TextField
        label="Required credential"
        value={props.requiredCredential}
        onChange={props.setRequiredCredential}
        placeholder="freshness_verified"
      />
      <TextField
        label="Forbidden term"
        value={props.forbiddenTerm}
        onChange={props.setForbiddenTerm}
        placeholder="campaign_metadata_reuse"
      />
      <TextField
        label="Treasury balance (USD)"
        type="number"
        value={props.treasury}
        onChange={props.setTreasury}
        placeholder="10000"
        suffix="$"
      />

      <div
        style={{
          marginTop: '8px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={smallLabelStyle}>Remaining treasury</span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '20px',
              color: 'var(--color-treasury-gold)',
              fontWeight: 600,
            }}
          >
            ${props.remainingTreasury.toLocaleString('en-US')}
          </span>
          {props.debitedSoFar > 0 && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
              }}
            >
              −${props.debitedSoFar.toLocaleString('en-US')} authorized this session
            </span>
          )}
        </div>
        {props.debitedSoFar > 0 && (
          <button
            type="button"
            onClick={props.onResetTreasury}
            style={ghostButtonStyle}
          >
            Reset treasury
          </button>
        )}
      </div>
    </SectionCard>
  );
}

type OfferCardProps = {
  offer: OfferDraft;
  setOffer: (next: OfferDraft) => void;
  onLoadBrightreach: () => void;
  onLoadCleanlist: () => void;
  onClear: () => void;
  onRun: () => void;
  running: boolean;
  offerReady: boolean;
};

function VendorOfferCard(props: OfferCardProps) {
  const { offer, setOffer } = props;

  function update<K extends keyof OfferDraft>(key: K, value: OfferDraft[K]) {
    setOffer({ ...offer, [key]: value });
  }

  return (
    <SectionCard accent="cyan" label="Vendor offer" subLabel="structured facts">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '6px',
        }}
      >
        <button type="button" onClick={props.onLoadBrightreach} style={ghostButtonStyle}>
          Load BrightReach example
        </button>
        <button type="button" onClick={props.onLoadCleanlist} style={ghostButtonStyle}>
          Load CleanList example
        </button>
        <button
          type="button"
          onClick={props.onClear}
          style={{ ...ghostButtonStyle, marginLeft: 'auto' }}
        >
          Clear offer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
        <TextField
          label="Vendor name"
          value={offer.vendorName}
          onChange={(v) => update('vendorName', v)}
          placeholder="Acme Data Co."
        />
        <TextField
          label="Price (USD)"
          type="number"
          value={offer.priceDollars}
          onChange={(v) => update('priceDollars', v)}
          placeholder="1900"
          suffix="$"
        />
      </div>

      <TextField
        label="Category"
        value={offer.category}
        onChange={(v) => update('category', v)}
        placeholder="lead_data"
      />

      <TextField
        label="Credentials (comma-separated)"
        value={offer.credentials}
        onChange={(v) => update('credentials', v)}
        placeholder="freshness_verified, delivery_72hr"
      />

      <TextField
        label="Forbidden terms detected (comma-separated)"
        value={offer.forbiddenTerms}
        onChange={(v) => update('forbiddenTerms', v)}
        placeholder="campaign_metadata_reuse"
      />

      <TextAreaField
        label="Proposal text"
        value={offer.proposalText}
        onChange={(v) => update('proposalText', v)}
        placeholder="Paste raw vendor proposal text…"
        rows={4}
      />

      <button
        type="button"
        onClick={props.onRun}
        disabled={!props.offerReady || props.running}
        aria-label="Generate authorization proof for this offer"
        style={{
          ...primaryButtonStyle,
          opacity: !props.offerReady || props.running ? 0.55 : 1,
          cursor: !props.offerReady || props.running ? 'not-allowed' : 'pointer',
        }}
      >
        {props.running ? 'Running proof…' : 'Generate authorization proof'}
      </button>
    </SectionCard>
  );
}

type PrivateResultProps = {
  running: boolean;
  result: AuthorizationProofResult | null;
  failedCheckLabel: string | null;
  remainingTreasury: number;
  debitedSoFar: number;
};

function PrivateResultCard(props: PrivateResultProps) {
  const result = props.result;
  const authorized = result?.authorized ?? false;
  const accent = authorized
    ? 'var(--color-success)'
    : result
    ? 'var(--color-reject)'
    : 'var(--color-border-accent)';

  return (
    <SectionCard accent={authorized ? 'success' : result ? 'reject' : 'gold'} label="Private result" subLabel="company agent only">
      {props.running ? (
        <span style={{ ...smallLabelStyle, color: PROOF_CYAN }}>Generating proof…</span>
      ) : result ? (
        <>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '36px',
              fontWeight: 700,
              color: accent,
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}
          >
            {result.status}
          </span>
          {authorized ? (
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              All hidden policy checks passed. Treasury debit authorized
              {result.debitCents
                ? `: −$${(result.debitCents / 100).toLocaleString('en-US')}.`
                : '.'}
            </p>
          ) : (
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Failed check (private): <strong style={{ color: 'var(--color-reject)' }}>{props.failedCheckLabel ?? 'policy check failed'}</strong>. Treasury unchanged.
            </p>
          )}

          <div
            style={{
              marginTop: '6px',
              paddingTop: '12px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={smallLabelStyle}>Remaining treasury (private)</span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '18px',
                color: 'var(--color-treasury-gold)',
                fontWeight: 600,
              }}
            >
              ${props.remainingTreasury.toLocaleString('en-US')}
            </span>
            {props.debitedSoFar > 0 && (
              <span style={{ ...smallLabelStyle, color: 'var(--color-text-tertiary)' }}>
                −${props.debitedSoFar.toLocaleString('en-US')} authorized this session
              </span>
            )}
          </div>
        </>
      ) : (
        <span style={smallLabelStyle}>No result yet.</span>
      )}
    </SectionCard>
  );
}

type PublicReceiptProps = {
  result: AuthorizationProofResult | null;
  isAuthorized: boolean;
  running: boolean;
  copied: boolean;
  onCopy: () => void;
};

function PublicReceiptCard(props: PublicReceiptProps) {
  const r = props.result;
  return (
    <SectionCard
      accent={props.isAuthorized ? 'success' : r ? 'reject' : 'cyan'}
      label="Public receipt"
      subLabel="safe to share"
    >
      {props.running ? (
        <span style={{ ...smallLabelStyle, color: PROOF_CYAN }}>Waiting for proof…</span>
      ) : !r ? (
        <span style={smallLabelStyle}>
          No receipt yet. Run a proof to generate one.
        </span>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '24px',
                fontWeight: 700,
                color: props.isAuthorized ? 'var(--color-success)' : 'var(--color-reject)',
                letterSpacing: '0.02em',
              }}
            >
              {r.status}
            </span>
            <span style={smallLabelStyle}>
              Treasury · {r.treasuryAction.replace('_', ' ')}
            </span>
          </div>

          <ReceiptRow label="Price band" value={props.isAuthorized ? r.priceBand ?? '—' : '—'} />
          <ReceiptRow label="Deal ID" value={r.dealId} mono />
          <ReceiptRow label="Policy ID" value={r.policyId} mono />
          <ReceiptRow label="Intent commitment" value={r.intentCommitment} mono truncate />
          <ReceiptRow label="Offer commitment" value={r.offerCommitment} mono truncate />

          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={props.onCopy}
              style={primaryButtonStyle}
            >
              {props.copied ? '✓ Copied' : 'Copy Public Receipt'}
            </button>
            <span style={smallLabelStyle}>
              Public saw only status + price band + commitments.
            </span>
          </div>
        </>
      )}
    </SectionCard>
  );
}

function ReceiptRow({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <span style={smallLabelStyle}>{label}</span>
      <span
        style={{
          fontFamily: mono ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif",
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          overflow: 'hidden',
          textOverflow: truncate ? 'ellipsis' : undefined,
          whiteSpace: truncate ? 'nowrap' : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ChecklistCard({
  checkMap,
  hasResult,
}: {
  checkMap: Map<string, 'pass' | 'fail'>;
  hasResult: boolean;
}) {
  return (
    <SectionCard accent="gold" label="What the proof checks" subLabel="constraints applied in this run">
      {PROOF_CHECKLIST.map((row) => {
        const state =
          row.key === 'disclose'
            ? hasResult
              ? 'pass'
              : 'idle'
            : (checkMap.get(row.key) as 'pass' | 'fail' | undefined) ?? 'idle';
        const marker = state === 'fail' ? '✕' : state === 'pass' ? '✓' : '·';
        const markerColor =
          state === 'fail'
            ? 'var(--color-reject)'
            : state === 'pass'
            ? 'var(--color-success)'
            : 'var(--color-text-tertiary)';
        const textColor =
          state === 'fail' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)';
        return (
          <div
            key={row.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '4px',
              paddingBottom: '4px',
            }}
          >
            <span
              aria-hidden
              style={{
                width: '14px',
                textAlign: 'center',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '14px',
                color: markerColor,
                flexShrink: 0,
              }}
            >
              {marker}
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '13px',
                color: textColor,
                lineHeight: 1.5,
              }}
            >
              {row.label}
            </span>
            {state === 'fail' && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  color: 'var(--color-reject)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Fail
              </span>
            )}
          </div>
        );
      })}
    </SectionCard>
  );
}

function HonestyFooter() {
  return (
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
      Hackathon prototype: authorization uses the deterministic proof model and
      Compact circuit artifacts in this repo. Real payment movement and live
      proof-server wiring are not included in this demo.
    </p>
  );
}

// ----------------------------------------------------------------------------
// Primitives
// ----------------------------------------------------------------------------

function SectionCard({
  accent,
  label,
  subLabel,
  children,
}: {
  accent: 'gold' | 'cyan' | 'success' | 'reject';
  label: string;
  subLabel: string;
  children: React.ReactNode;
}) {
  const accentColor =
    accent === 'gold'
      ? 'var(--color-treasury-gold)'
      : accent === 'cyan'
      ? PROOF_CYAN
      : accent === 'success'
      ? 'var(--color-success)'
      : 'var(--color-reject)';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '14px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '2px',
          width: '36px',
          backgroundColor: accentColor,
          borderTopLeftRadius: '14px',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 600,
            color: accentColor,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <span style={smallLabelStyle}>— {subLabel}</span>
      </div>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  suffix?: string;
}) {
  return (
    <label style={fieldLabelWrapStyle}>
      <span style={smallLabelStyle}>{label}</span>
      <div style={fieldShellStyle}>
        {suffix && <span style={suffixStyle}>{suffix}</span>}
        <input
          type={type ?? 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={fieldInputStyle}
        />
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label style={fieldLabelWrapStyle}>
      <span style={smallLabelStyle}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows ?? 4}
        style={{
          ...fieldInputStyle,
          ...fieldShellStyle,
          resize: 'vertical',
          padding: '10px 12px',
          minHeight: '92px',
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      />
    </label>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

const smallLabelStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '11px',
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const fieldLabelWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
};

const fieldShellStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  border: '1px solid var(--color-border-accent)',
  borderRadius: '8px',
  backgroundColor: 'var(--color-bg)',
  padding: '0 10px',
};

const fieldInputStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  color: 'var(--color-text-primary)',
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '14px',
  padding: '10px 4px',
  letterSpacing: '0.01em',
};

const suffixStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '13px',
  color: 'var(--color-treasury-gold)',
};

const primaryButtonStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '12px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '12px 22px',
  backgroundColor: 'transparent',
  color: 'var(--color-treasury-gold)',
  border: '1px solid var(--color-treasury-gold)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'background-color 0.15s, color 0.15s',
};

const ghostButtonStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '7px 12px',
  backgroundColor: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border-accent)',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'color 0.15s, border-color 0.15s',
};
