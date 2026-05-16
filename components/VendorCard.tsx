'use client';

import { type ProofResult } from '@/lib/mockProof';
import CommitmentHash from './CommitmentHash';

export type VendorStatus = 'idle' | 'analyzing' | 'approved' | 'rejected';

interface VendorCardProps {
  vendorName: string;
  category: string;
  priceLabel: string;
  proposalText?: string;
  authorizeLabel?: string;
  priceCents: number;
  status: VendorStatus;
  proof: ProofResult | null;
  resetKey: number;
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

  if (status === 'approved') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(61, 122, 92, 0.12)',
          border: '1px solid rgba(61, 122, 92, 0.4)',
          borderRadius: '9999px',
          padding: '4px 12px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-success)',
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: 'var(--color-success)',
            letterSpacing: '0.06em',
          }}
        >
          Authorized
        </span>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(122, 61, 61, 0.12)',
          border: '1px solid rgba(122, 61, 61, 0.4)',
          borderRadius: '9999px',
          padding: '4px 12px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-reject)',
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: 'var(--color-reject)',
            letterSpacing: '0.06em',
          }}
        >
          Policy threshold exceeded
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
  authorizeLabel,
  priceCents: _priceCents,
  status,
  proof,
  resetKey,
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
            per unit
          </span>
        </div>
      </div>

      {proposalText && (
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
