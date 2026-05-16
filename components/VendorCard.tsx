'use client';

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
  priceCents: number;
  status: VendorStatus;
  proof: ProofResult | null;
  resetKey: number;
  isLogged?: boolean;
  onAnalyze: () => void;
  onAuthorize: () => void;
}

function StatusIndicator({ status }: { status: VendorStatus }) {
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
  priceCents: _priceCents,
  status,
  proof,
  resetKey,
  isLogged: _isLogged,
  onAnalyze,
  onAuthorize,
}: VendorCardProps) {
  const canAnalyze = status === 'idle';
  const canAuthorize = status === 'approved';
  const authLabel = authorizeLabel ?? `Authorize ${vendorName}`;

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
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: 'var(--color-text-primary)',
              fontSize: '16px',
              fontWeight: 500,
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
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  borderRadius: '999px',
                  border: isFlagged
                    ? '1px solid var(--color-reject)'
                    : '1px solid var(--color-border-accent)',
                  background: isFlagged
                    ? 'rgba(122,61,61,0.12)'
                    : 'var(--color-surface)',
                  color: isFlagged
                    ? 'var(--color-reject)'
                    : 'var(--color-text-secondary)',
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

      <StatusIndicator status={status} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.04em',
            padding: '10px 16px',
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
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.04em',
            padding: '10px 16px',
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
