'use client';

import RedactedField from './RedactedField';
import CommitmentHash from './CommitmentHash';

const POLICY_COMMITMENT = '0x4a2f8e1c3b9d7f2a';

interface HiddenPolicyPanelProps {
  resetKey: number;
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
        gap: '24px',
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
        Hidden Policy
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <RedactedField label="Max Unit Price" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              color: 'var(--color-text-tertiary)',
              fontSize: '11px',
              letterSpacing: '0.04em',
            }}
          >
            Policy hash committed on-chain
          </span>
          <CommitmentHash hash={POLICY_COMMITMENT} resetKey={resetKey} />
        </div>

        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: 'var(--color-text-tertiary)',
            fontSize: '11px',
            lineHeight: '1.6',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '12px',
          }}
        >
          Witnesses are never broadcast
        </p>
      </div>
    </div>
  );
}
