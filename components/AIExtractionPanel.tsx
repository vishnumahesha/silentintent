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
  extracted?: {
    priceLabel: string;
    category: string;
    credentials: string[];
    forbiddenTermsDetected: string[];
  };
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
            The proof checks structured values, not the semantic truth of the original proposal. Production would use vendor-signed offer artifacts to remove this assumption.
          </span>
        </div>
      )}
    </div>
  );
}

function PipelinePreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <EyeIcon size={16} weight="regular" color="var(--color-text-tertiary)" />
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          Extraction pipeline
        </span>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-text-tertiary)',
            display: 'inline-block',
            animation: 'pulse-dot 1.8s ease-in-out infinite',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginLeft: 'auto',
          }}
        >
          Awaiting offer
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 12px',
                backgroundColor: 'rgba(17,20,24,0.55)',
                border: '1px dashed var(--color-border)',
                borderRadius: '6px',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.04em',
                  minWidth: '180px',
                  flexShrink: 0,
                }}
              >
                {step.label}
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  opacity: 0.65,
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {step.sample}
              </span>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '14px' }}>
                <ArrowDownIcon size={10} weight="regular" color="var(--color-border-accent)" />
              </div>
            )}
          </div>
        ))}
      </div>

      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.55,
          paddingTop: '4px',
        }}
      >
        Choose a vendor. AI will extract price, category, credentials, and
        forbidden terms.
      </span>
    </div>
  );
}

function ExtractedFacts({ activeVendor }: { activeVendor: ActiveVendor }) {
  const isAnalyzing = activeVendor.status === 'analyzing';
  const isRejected = activeVendor.status === 'rejected';
  const ex = activeVendor.extracted;

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
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Extracted facts — {activeVendor.name}
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
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          {ex ? (
            <>
              <motion.div variants={itemVariants}>
                <FactRow label="Price" value={ex.priceLabel} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FactRow label="Category" value={ex.category} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FactRow
                  label="Credentials"
                  value={ex.credentials.length > 0 ? ex.credentials.join(', ') : '—'}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FactRow
                  label="Forbidden terms detected"
                  value={
                    ex.forbiddenTermsDetected.length > 0
                      ? ex.forbiddenTermsDetected.join(', ')
                      : 'none'
                  }
                  flagged={ex.forbiddenTermsDetected.length > 0 && isRejected}
                />
              </motion.div>
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FactRow({
  label,
  value,
  flagged,
}: {
  label: string;
  value: string;
  flagged?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '8px 12px',
        backgroundColor: flagged ? 'rgba(122,61,61,0.08)' : 'rgba(17,20,24,0.6)',
        border: flagged ? '1px solid var(--color-reject)' : '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          minWidth: '170px',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '13px',
          color: flagged ? 'var(--color-reject)' : 'var(--color-text-primary)',
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: 'var(--color-text-primary)',
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '-0.005em',
            lineHeight: 1.25,
          }}
        >
          Proposal text becomes structured proof input
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          AI extraction layer
        </span>
      </div>

      <TruthBadge />

      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          lineHeight: 1.55,
          marginTop: '-12px',
        }}
      >
        The proof checks structured values, not the semantic truth of the
        original proposal.
      </span>

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
              Not disclosed publicly
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
