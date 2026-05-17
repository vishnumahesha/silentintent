'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, InfoIcon, ArrowDownIcon } from '@phosphor-icons/react';

const PIPELINE_STEPS: { label: string; sample: string; flagOnReject?: boolean }[] = [
  { label: 'Vendor proposal text', sample: '"…freshness verified… 48-hour delivery…"' },
  { label: 'Extracted price', sample: 'price_cents: …' },
  { label: 'Extracted category', sample: 'category: …' },
  { label: 'Extracted credentials', sample: 'credentials: […]' },
  { label: 'Detected forbidden terms', sample: 'forbidden_terms: […]', flagOnReject: true },
  { label: 'Proof inputs ready', sample: '→ Midnight authorization circuit' },
];

const AGENT_CANNOT_SEE = [
  'Policy threshold value',
  'Raw witness values',
  'Competing bid details',
  'Proof circuit internals',
  'Private policy parameters',
];

const containerVariants = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

interface ActiveVendor {
  name: string;
  status: 'idle' | 'analyzing' | 'approved' | 'rejected';
  chips: Array<{ label: string; flagged?: boolean }>;
}

interface AIExtractionPanelProps {
  activeVendor?: ActiveVendor | null;
}

function TruthBadge() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    timerRef.current = setTimeout(() => setVisible(true), 600);
  }

  function handleLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          backgroundColor: 'var(--color-bg)',
          cursor: 'default',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035)',
        }}
      >
        <InfoIcon size={12} weight="regular" color="var(--color-text-tertiary)" />
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          AI extracts facts. Midnight verifies constraints.
        </span>
      </div>
      {visible && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 10,
            width: '320px',
            padding: '10px 14px',
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border-accent)',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
            }}
          >
            v1 proves the structured offer facts satisfy the policy. Production would use vendor-signed offer artifacts to remove this assumption.
          </span>
        </div>
      )}
    </div>
  );
}

function ExtractedFacts({ activeVendor }: { activeVendor: ActiveVendor }) {
  const isAnalyzing = activeVendor.status === 'analyzing';
  const isRejected = activeVendor.status === 'rejected';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <EyeIcon size={16} weight="regular" color="var(--color-text-tertiary)" />
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
        >
          EXTRACTED FACTS — {activeVendor.name}
        </span>
        {isAnalyzing && (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-text-tertiary)',
              display: 'inline-block',
              animation: 'pulse-dot 1.2s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeVendor.name}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
        >
          {activeVendor.chips.map((chip) => {
            const flagged = chip.flagged && isRejected;
            return (
              <motion.div
                key={chip.label}
                variants={itemVariants}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  backgroundColor: flagged ? 'rgba(122,61,61,0.08)' : 'rgba(17,20,24,0.6)',
                  border: flagged
                    ? '1px solid var(--color-reject)'
                    : '1px solid var(--color-border)',
                  borderRadius: '6px',
                }}
              >
                {flagged && (
                  <span
                    style={{
                      color: 'var(--color-reject)',
                      fontSize: '10px',
                      marginRight: '8px',
                      lineHeight: 1,
                    }}
                  >
                    ●
                  </span>
                )}
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: flagged ? 'var(--color-reject)' : 'var(--color-text-tertiary)',
                  }}
                >
                  {'{ '}
                  <span style={{ color: flagged ? 'var(--color-reject)' : 'var(--color-text-tertiary)' }}>
                    &quot;{chip.label}&quot;
                  </span>
                  {': '}
                  <span style={{ color: flagged ? 'var(--color-reject)' : 'var(--color-text-secondary)' }}>
                    true
                  </span>
                  {' }'}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function AIExtractionPanel({ activeVendor }: AIExtractionPanelProps) {
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
      }}
    >
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
        AI Extraction Layer
      </span>

      <TruthBadge />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {activeVendor ? (
          <ExtractedFacts activeVendor={activeVendor} />
        ) : (
          <PipelinePreview />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EyeSlashIcon size={16} weight="regular" color="var(--color-text-tertiary)" />
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
              }}
            >
              Agent Cannot See
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {AGENT_CANNOT_SEE.map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(122,61,61,0.06)',
                  border: '1px solid rgba(122,61,61,0.15)',
                  borderRadius: '8px',
                }}
              >
                <EyeSlashIcon size={16} weight="regular" color="var(--color-text-tertiary)" />
                <span
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
