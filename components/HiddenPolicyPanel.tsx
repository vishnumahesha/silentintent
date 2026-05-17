'use client';

import { LockSimpleIcon } from '@phosphor-icons/react';
import CommitmentHash from './CommitmentHash';

const POLICY_COMMITMENT = '0x4a2f8e1c3b9d7f2a8c5b4d6e1f3a2b7c';

interface HiddenPolicyPanelProps {
  resetKey: number;
}

const PRIVATE_FIELDS = [
  { label: 'Max budget' },
  { label: 'Required category' },
  { label: 'Required credential' },
  { label: 'Forbidden term' },
];

function RedactedBar() {
  return (
    <div
      style={{
        width: '120px',
        height: '12px',
        borderRadius: '3px',
        border: '1px solid var(--color-redact-border)',
        background: `linear-gradient(
          90deg,
          var(--color-redact) 0%,
          rgba(45, 30, 42, 0.6) 50%,
          var(--color-redact) 100%
        )`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 2.4s linear infinite',
      }}
    />
  );
}

export default function HiddenPolicyPanel({ resetKey }: HiddenPolicyPanelProps) {
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
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LockSimpleIcon size={14} weight="regular" color="var(--color-treasury-gold)" />
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
            Hidden Procurement Policy
          </span>
        </div>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '10px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '2px 8px',
            border: '1px solid var(--color-border-accent)',
            borderRadius: '999px',
          }}
        >
          Private witness
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {PRIVATE_FIELDS.map((f) => (
          <div
            key={f.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(26,16,24,0.4)',
              border: '1px solid var(--color-redact-border)',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.02em',
              }}
            >
              {f.label}
            </span>
            <RedactedBar />
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: 'var(--color-text-tertiary)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Policy commitment
        </span>
        <CommitmentHash hash={POLICY_COMMITMENT} resetKey={resetKey} />
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: 'var(--color-text-tertiary)',
            fontSize: '11px',
            lineHeight: 1.5,
            marginTop: '4px',
          }}
        >
          Only the commitment is public. Raw policy values never leave the buyer.
        </span>
      </div>
    </div>
  );
}
