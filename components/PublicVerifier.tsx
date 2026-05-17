'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CommitmentHash from './CommitmentHash';
import { type ProofResult, type CheckStatus } from '@/lib/mockProof';

interface PublicVerifierProps {
  log: ProofResult[];
  resetKey: number;
  analyzing: boolean;
  latestProof: ProofResult | null;
}

type StepKey =
  | 'commit_policy'
  | 'commit_offer'
  | 'price'
  | 'category'
  | 'credential'
  | 'forbidden'
  | 'disclose';

const PROOF_STEPS: { key: StepKey; label: string }[] = [
  { key: 'commit_policy', label: 'Commit hidden policy' },
  { key: 'commit_offer', label: 'Commit extracted offer facts' },
  { key: 'price', label: 'Verify offerPrice ≤ maxPrice' },
  { key: 'category', label: 'Verify offerCategory matches requiredCategory' },
  { key: 'credential', label: 'Verify requiredCredential present in offerCredentials' },
  { key: 'forbidden', label: 'Verify forbiddenTerm absent from offerForbidden' },
  { key: 'disclose', label: 'Disclose authorization result only' },
];

type StepState = 'idle' | 'running' | 'pass' | 'fail';

function outcomesFromProof(proof: ProofResult): StepState[] {
  const checkMap = new Map<string, CheckStatus>(
    proof.checks.map((c) => [c.id, c.status]),
  );
  return PROOF_STEPS.map((step) => {
    if (step.key in { commit_policy: 1, commit_offer: 1, disclose: 1 }) {
      return 'pass';
    }
    const status = checkMap.get(step.key);
    if (status === 'pass') return 'pass';
    if (status === 'fail') return 'fail';
    return 'pass';
  });
}

function ProofTimeline({
  analyzing,
  latestProof,
}: {
  analyzing: boolean;
  latestProof: ProofResult | null;
}) {
  const [stepStates, setStepStates] = useState<StepState[]>(
    PROOF_STEPS.map(() => 'idle'),
  );

  useEffect(() => {
    if (analyzing) {
      setStepStates(PROOF_STEPS.map(() => 'idle'));
      const timers: ReturnType<typeof setTimeout>[] = [];
      PROOF_STEPS.forEach((_, i) => {
        timers.push(
          setTimeout(() => {
            setStepStates((prev) =>
              prev.map((s, j) => (j === i ? 'running' : s)),
            );
          }, i * 180),
        );
      });
      return () => timers.forEach(clearTimeout);
    }

    if (latestProof) {
      setStepStates(outcomesFromProof(latestProof));
      return;
    }

    setStepStates(PROOF_STEPS.map(() => 'idle'));
  }, [analyzing, latestProof]);

  const visible = analyzing || latestProof !== null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="timeline"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          style={{ overflow: 'hidden' }}
        >
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              {analyzing ? 'Proof generation' : 'Proof constraints'}
            </span>
            {PROOF_STEPS.map((step, i) => {
              const state = stepStates[i];
              const dotColor =
                state === 'running'
                  ? '#4DB8B8'
                  : state === 'pass'
                  ? 'var(--color-success)'
                  : state === 'fail'
                  ? 'var(--color-reject)'
                  : 'var(--color-border-accent)';
              const textColor =
                state === 'running'
                  ? '#4DB8B8'
                  : state === 'pass'
                  ? 'var(--color-success)'
                  : state === 'fail'
                  ? 'var(--color-reject)'
                  : 'var(--color-text-tertiary)';

              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '9999px',
                      backgroundColor: dotColor,
                      flexShrink: 0,
                      transition: 'background-color 0.15s',
                      animation:
                        state === 'running'
                          ? 'pulse-dot 0.8s ease-in-out infinite'
                          : undefined,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      color: textColor,
                      transition: 'color 0.15s',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {step.label}
                  </span>
                  {state === 'fail' && (
                    <span
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: '10px',
                        color: 'var(--color-reject)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginLeft: 'auto',
                      }}
                    >
                      Fails
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function DisclosureRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={labelStyle}>{label}</span>
      <span
        style={{
          fontFamily: mono ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif",
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function HashRow({ label, hash, resetKey }: { label: string; hash: string; resetKey: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={labelStyle}>{label}</span>
      <CommitmentHash hash={hash} resetKey={resetKey} />
    </div>
  );
}

function DisclosureEntry({
  entry,
  resetKey,
  isLatest,
}: {
  entry: ProofResult;
  resetKey: number;
  isLatest: boolean;
}) {
  const isAuthorized = entry.authorized;
  const accent = isAuthorized
    ? 'rgba(61,122,92,0.35)'
    : 'rgba(122,61,61,0.35)';
  const accentBg = isAuthorized
    ? 'rgba(61,122,92,0.06)'
    : 'rgba(122,61,61,0.06)';
  const accentColor = isAuthorized
    ? 'var(--color-success)'
    : 'var(--color-reject)';

  return (
    <motion.div
      key={entry.proofHash}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'relative',
        padding: isLatest ? '20px 22px 20px 28px' : '14px 16px 14px 22px',
        backgroundColor: 'var(--color-surface-raised)',
        borderRadius: '10px',
        border: `${isLatest ? '2px' : '1px'} solid ${accent}`,
        boxShadow: isLatest
          ? `inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 6px ${accentBg}`
          : 'inset 0 1px 0 0 rgba(255,255,255,0.035)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        opacity: isLatest ? 1 : 0.78,
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          backgroundColor: accentColor,
          opacity: isLatest ? 1 : 0.6,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {isLatest && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Proof Receipt
            </span>
          )}
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: isLatest ? '32px' : '18px',
              fontWeight: 700,
              color: accentColor,
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}
          >
            {entry.status}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.4,
            }}
          >
            {isAuthorized
              ? 'Treasury debit authorized'
              : 'Hidden policy violation. Treasury unchanged.'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLatest && (
            <div
              style={{
                padding: '4px 10px',
                borderRadius: '999px',
                border: `1px solid ${accent}`,
                backgroundColor: accentBg,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px',
                color: accentColor,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Latest
            </div>
          )}
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              border: '1px solid var(--color-border-accent)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.06em',
            }}
          >
            {formatTimestamp(entry.timestamp)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          paddingTop: '4px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <DisclosureRow label="Deal ID" value={entry.dealId} mono />
        <DisclosureRow label="Policy ID" value={entry.policyId} mono />
        <DisclosureRow
          label="Price band"
          value={isAuthorized && entry.priceBand ? entry.priceBand : '—'}
          mono
        />
        <DisclosureRow
          label="Treasury"
          value={isAuthorized && entry.debitCents
            ? `−$${(entry.debitCents / 100).toLocaleString('en-US')}`
            : 'unchanged'}
          mono
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}
      >
        <HashRow label="Intent commitment" hash={entry.intentCommitment} resetKey={resetKey} />
        <HashRow label="Offer commitment" hash={entry.offerCommitment} resetKey={resetKey} />
        <HashRow
          label="Vendor commitment"
          hash={isAuthorized ? entry.vendorCommitment : ''}
          resetKey={resetKey}
        />
        <HashRow label="Authorization commitment" hash={entry.authorizationCommitment} resetKey={resetKey} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          paddingTop: '4px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={labelStyle}>Disclosed</span>
          <span style={discreteText}>
            status, deal ID, price band, treasury action, commitments
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={labelStyle}>Hidden</span>
          <span style={discreteText}>
            exact budget, forbidden rule, vendor terms, salts, raw witnesses
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function PublicVerifier({
  log,
  resetKey,
  analyzing,
  latestProof,
}: PublicVerifierProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '14px',
        padding: '24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: '180px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--color-text-primary)',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Public Verifier
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Disclose by exception
        </span>
      </div>

      <ProofTimeline analyzing={analyzing} latestProof={latestProof} />

      <AnimatePresence mode="wait">
        {log.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flex: 1,
              padding: '24px 0',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: 'var(--color-text-tertiary)',
                fontSize: '14px',
              }}
            >
              No public authorization yet
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: 'var(--color-text-tertiary)',
                fontSize: '12px',
                textAlign: 'center',
                maxWidth: '420px',
              }}
            >
              Private policy and vendor terms are not shown.
              Proof submissions appear here after each authorization attempt.
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="log"
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '4px',
              }}
            >
              <span style={labelStyle}>Latest authorization</span>
              {log.length > 1 && (
                <span style={labelStyle}>
                  {log.length - 1} previous
                </span>
              )}
            </div>
            <AnimatePresence>
              {log.map((entry, i) => (
                <DisclosureEntry
                  key={entry.proofHash}
                  entry={entry}
                  resetKey={resetKey}
                  isLatest={i === 0}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '11px',
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const discreteText: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '11px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.6,
};
