'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CommitmentHash from './CommitmentHash';
import { type ProofResult } from '@/lib/mockProof';

interface PublicVerifierProps {
  log: ProofResult[];
  resetKey: number;
  analyzing: boolean;
}

const PROOF_STEPS = [
  'Commit hidden policy',
  'Commit extracted offer facts',
  'Verify offerPrice ≤ maxPrice',
  'Verify offerCategory matches requiredCategory',
  'Verify requiredCredential present in offerCredentials',
  'Verify forbiddenTerm absent from offerForbidden',
  'Disclose authorization result',
];

type StepState = 'idle' | 'running' | 'complete';

function ProofTimeline({ analyzing }: { analyzing: boolean }) {
  const [stepStates, setStepStates] = useState<StepState[]>(
    PROOF_STEPS.map(() => 'idle')
  );

  useEffect(() => {
    if (!analyzing) {
      setStepStates(PROOF_STEPS.map(() => 'idle'));
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    PROOF_STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setStepStates((prev) =>
            prev.map((s, j) => (j === i ? 'running' : s))
          );
        }, i * 200)
      );
      timers.push(
        setTimeout(() => {
          setStepStates((prev) =>
            prev.map((s, j) => (j === i ? 'complete' : s))
          );
        }, i * 200 + 160)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [analyzing]);

  return (
    <AnimatePresence>
      {analyzing && (
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
              Proof generation
            </span>
            {PROOF_STEPS.map((step, i) => {
              const state = stepStates[i];
              const dotColor =
                state === 'running'
                  ? '#4DB8B8'
                  : state === 'complete'
                  ? 'var(--color-success)'
                  : 'var(--color-border-accent)';
              const textColor =
                state === 'running'
                  ? '#4DB8B8'
                  : state === 'complete'
                  ? 'var(--color-success)'
                  : 'var(--color-text-tertiary)';

              return (
                <div
                  key={step}
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
                    {step}
                  </span>
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

export default function PublicVerifier({ log, resetKey, analyzing }: PublicVerifierProps) {
  const hasAuthorized = log.some((e) => e.authorized);

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
        gap: '24px',
        minHeight: '160px',
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: 'var(--color-text-primary)',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        Public Verifier
      </span>

      <ProofTimeline analyzing={analyzing} />

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
              padding: '32px 0',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: 'var(--color-text-tertiary)',
                fontSize: '14px',
              }}
            >
              Disclose by exception
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: 'var(--color-text-tertiary)',
                fontSize: '12px',
              }}
            >
              Proof submissions appear here after authorization.
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="log"
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <AnimatePresence>
              {log.map((entry) => (
                <motion.div
                  key={entry.proofHash}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-surface-raised)',
                    borderRadius: '8px',
                    border: `1px solid ${entry.authorized ? 'rgba(61,122,92,0.25)' : 'rgba(122,61,61,0.25)'}`,
                    boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={labelStyle}>Proof Hash</span>
                    <CommitmentHash hash={entry.proofHash} resetKey={resetKey} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={labelStyle}>Vendor</span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {entry.vendorName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={labelStyle}>Result</span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '11px',
                        color: entry.authorized ? 'var(--color-success)' : 'var(--color-reject)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {entry.publicSignal}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={labelStyle}>Timestamp</span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '12px',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {hasAuthorized && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: 'var(--color-text-tertiary)',
                  textAlign: 'center',
                  marginTop: '8px',
                  lineHeight: '1.5',
                }}
              >
                The proof layer between AI agents and company money: private policy in, public authorization out.
              </motion.p>
            )}
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
