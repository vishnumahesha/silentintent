'use client';

import { motion } from 'framer-motion';
import { type ProofResult } from '@/lib/mockProof';
import CommitmentHash from './CommitmentHash';

export type VendorStatus = 'idle' | 'analyzing' | 'approved' | 'rejected';

interface Chip {
  label: string;
  flagged?: boolean;
}

interface VendorCardProps {
  vendorName: string;
  category: string;
  priceLabel: string;
  proposalText?: string;
  summaryLine?: string;
  chips?: Chip[];
  authorizeLabel?: string;
  surfaceLabel?: 'Surface-best offer' | 'Compliant offer';
  priceCents: number;
  status: VendorStatus;
  proof: ProofResult | null;
  resetKey: number;
  isLogged?: boolean;
  onAnalyze: () => void;
  onAuthorize: () => void;
}

function StatusIndicator({ status, isLogged }: { status: VendorStatus; isLogged: boolean }) {
  if (status === 'idle') return null;

  if (status === 'analyzing') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-treasury-gold)',
            display: 'inline-block',
            animation: 'pulse-dot 1.2s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: 'var(--color-treasury-gold)',
            letterSpacing: '0.04em',
          }}
        >
          Generating proof...
        </span>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          padding: '16px 18px',
          borderRadius: '10px',
          backgroundColor: 'rgba(122,61,61,0.10)',
          border: '1px solid rgba(122,61,61,0.45)',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 0 0 4px rgba(122,61,61,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '34px',
            fontWeight: 700,
            color: 'var(--color-reject)',
            letterSpacing: '0.02em',
            lineHeight: 0.95,
          }}
        >
          REJECTED
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Hidden reuse clause detected.
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Treasury unchanged.
        </span>
      </motion.div>
    );
  }

  if (status === 'approved') {
    return (
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          padding: '16px 18px',
          borderRadius: '10px',
          backgroundColor: 'rgba(61,122,92,0.10)',
          border: '1px solid rgba(61,122,92,0.45)',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 0 0 4px rgba(61,122,92,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '34px',
            fontWeight: 700,
            color: 'var(--color-success)',
            letterSpacing: '0.02em',
            lineHeight: 0.95,
          }}
        >
          AUTHORIZED
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Policy satisfied.
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {isLogged
            ? 'Treasury debit approved: −$2,250.'
            : 'Treasury debit ready: −$2,250 — click Authorize to confirm.'}
        </span>
      </motion.div>
    );
  }

  return null;
}

export default function VendorCard({
  vendorName,
  category,
  priceLabel,
  proposalText,
  summaryLine,
  chips,
  authorizeLabel,
  surfaceLabel,
  priceCents: _priceCents,
  status,
  proof,
  resetKey,
  isLogged = false,
  onAnalyze,
  onAuthorize,
}: VendorCardProps) {
  const canAnalyze = status === 'idle';
  const canAuthorize = status === 'approved';
  const authLabel = authorizeLabel ?? `Authorize ${vendorName}`;

  const borderColor =
    status === 'rejected'
      ? 'var(--color-reject)'
      : status === 'approved'
      ? 'var(--color-success)'
      : 'var(--color-border)';

  const borderWidth = status === 'rejected' || status === 'approved' ? '2px' : '1px';

  const badge = (() => {
    if (status === 'rejected' && surfaceLabel === 'Surface-best offer') {
      return {
        text: 'Hidden risk detected',
        color: 'var(--color-reject)',
        bg: 'rgba(122,61,61,0.14)',
        border: 'rgba(122,61,61,0.50)',
      };
    }
    if (surfaceLabel === 'Surface-best offer') {
      return {
        text: 'Best surface offer',
        color: 'var(--color-treasury-gold)',
        bg: 'rgba(201,168,76,0.10)',
        border: 'rgba(201,168,76,0.40)',
      };
    }
    if (surfaceLabel === 'Compliant offer') {
      return {
        text: 'Compliant offer',
        color: 'var(--color-success)',
        bg: 'rgba(61,122,92,0.10)',
        border: 'rgba(61,122,92,0.40)',
      };
    }
    return null;
  })();

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '14px',
        padding: '24px',
        border: `${borderWidth} solid ${borderColor}`,
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'border-color 200ms ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {badge && (
            <motion.span
              key={badge.text}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                display: 'inline-block',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                fontWeight: 600,
                color: badge.color,
                backgroundColor: badge.bg,
                border: `1px solid ${badge.border}`,
                padding: '4px 10px',
                borderRadius: '999px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                alignSelf: 'flex-start',
              }}
            >
              {badge.text}
            </motion.span>
          )}
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: 'var(--color-text-primary)',
              fontSize: '20px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          >
            {vendorName}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              border: '1px solid var(--color-border-accent)',
              borderRadius: '9999px',
              padding: '2px 8px',
              display: 'inline-block',
              alignSelf: 'flex-start',
            }}
          >
            {category}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: 'var(--color-text-primary)',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            {priceLabel}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              color: 'var(--color-text-tertiary)',
              fontSize: '11px',
            }}
          >
            per list
          </span>
        </div>
      </div>

      {summaryLine && (
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            margin: 0,
            paddingTop: '8px',
          }}
        >
          {summaryLine}
        </p>
      )}

      {chips && chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
          {chips.map((chip) => {
            const isFlagged = chip.flagged && status === 'rejected';
            return (
              <span
                key={chip.label}
                style={{
                  padding: isFlagged ? '5px 12px' : '4px 10px',
                  fontSize: isFlagged ? '12px' : '11px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: isFlagged ? 600 : 400,
                  borderRadius: '999px',
                  border: isFlagged
                    ? '1.5px solid var(--color-reject)'
                    : '1px solid var(--color-border-accent)',
                  background: isFlagged
                    ? 'rgba(122,61,61,0.22)'
                    : 'var(--color-surface)',
                  color: isFlagged
                    ? 'var(--color-reject)'
                    : 'var(--color-text-secondary)',
                  boxShadow: isFlagged
                    ? '0 0 0 4px rgba(122,61,61,0.10)'
                    : undefined,
                }}
              >
                {chip.label}
                {isFlagged && (
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      opacity: 0.85,
                      marginLeft: '6px',
                    }}
                  >
                    FLAGGED
                  </span>
                )}
              </span>
            );
          })}
        </div>
      )}

      {proof && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '12px',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.04em',
            }}
          >
            Price commitment
          </span>
          <CommitmentHash hash={proof.commitmentHash} resetKey={resetKey} />
        </div>
      )}

      {proposalText && status !== 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-tertiary)',
              marginBottom: '8px',
            }}
          >
            ANALYSIS
          </span>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              lineHeight: '1.65',
              margin: 0,
              paddingTop: '4px',
            }}
          >
            {proposalText}
          </p>
        </div>
      )}

      <StatusIndicator status={status} isLogged={isLogged} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.04em',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--color-border-accent)',
            backgroundColor: canAnalyze
              ? 'var(--color-surface-raised)'
              : 'rgba(30,37,48,0.4)',
            color: canAnalyze
              ? 'var(--color-treasury-gold)'
              : 'var(--color-text-tertiary)',
            cursor: canAnalyze ? 'pointer' : 'not-allowed',
            boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
            transition: 'background-color 0.15s, color 0.15s',
            width: '100%',
          }}
        >
          Analyze {vendorName}
        </button>

        <button
          onClick={onAuthorize}
          disabled={!canAuthorize}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.04em',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: canAuthorize
              ? 'rgba(61,122,92,0.5)'
              : 'var(--color-border)',
            backgroundColor: canAuthorize
              ? 'rgba(61,122,92,0.12)'
              : 'rgba(30,37,48,0.4)',
            color: canAuthorize
              ? 'var(--color-success)'
              : 'var(--color-text-tertiary)',
            cursor: canAuthorize ? 'pointer' : 'not-allowed',
            boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
            transition: 'background-color 0.15s, color 0.15s',
            width: '100%',
          }}
        >
          {authLabel}
        </button>
      </div>
    </div>
  );
}
