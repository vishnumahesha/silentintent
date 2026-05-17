'use client';

import type { ProofResult } from '@/lib/mockProof';

type PublicReceiptProps = {
  latestProof: ProofResult | null;
  isLatestAuthorized: boolean;
  analyzing: boolean;
};

export default function PublicReceipt({
  latestProof,
  isLatestAuthorized,
  analyzing,
}: PublicReceiptProps) {
  const accent = isLatestAuthorized
    ? 'var(--color-success)'
    : latestProof
    ? 'var(--color-reject)'
    : 'var(--color-border-accent)';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '2px',
          width: '36px',
          backgroundColor: accent,
          borderTopLeftRadius: '12px',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-treasury-gold)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          Public Receipt
        </span>
      </div>

      {analyzing ? (
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12px',
            color: 'var(--color-text-tertiary)',
            lineHeight: 1.5,
          }}
        >
          Proof in flight. Receipt will update when the proof settles.
        </span>
      ) : !latestProof ? (
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12px',
            color: 'var(--color-text-tertiary)',
            lineHeight: 1.5,
          }}
        >
          Run an authorization check to generate a public receipt.
        </span>
      ) : isLatestAuthorized ? (
        <ReceiptBlock
          status="AUTHORIZED"
          reason="Offer passed all hidden policy checks."
          accent={accent}
          lines={[
            `Treasury debit authorized: −$${(latestProof.debitCents! / 100).toLocaleString('en-US')}`,
            `Price band: ${latestProof.priceBand ?? '—'}`,
            'Public sees: authorization result + price band + commitments',
            'Stays hidden: exact budget, required credential, forbidden term.',
          ]}
        />
      ) : (
        <ReceiptBlock
          status="REJECTED"
          reason="Offer violates a hidden company policy."
          accent={accent}
          lines={[
            'Treasury: unchanged',
            'Public sees: rejection result + commitments',
            'Stays hidden: exact budget, required credential, forbidden term.',
          ]}
        />
      )}

      {latestProof && (
        <ProofChecklist latestProof={latestProof} />
      )}
    </div>
  );
}

function ReceiptBlock({
  status,
  reason,
  accent,
  lines,
}: {
  status: 'AUTHORIZED' | 'REJECTED';
  reason: string;
  accent: string;
  lines: string[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: accent,
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}
        >
          {status}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {reason}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {lines.map((line) => (
          <span
            key={line}
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProofChecklist({ latestProof }: { latestProof: ProofResult }) {
  const checkMap = new Map<string, string>();
  for (const c of latestProof.checks) checkMap.set(c.id, c.status);

  const checks = [
    { key: 'price', label: 'Price within hidden budget' },
    { key: 'category', label: 'Category matched' },
    { key: 'credential', label: 'Required credential present' },
    { key: 'forbidden', label: 'Forbidden term absent' },
    { key: 'disclose', label: 'Only selected outputs disclosed' },
  ];

  return (
    <div
      style={{
        paddingTop: '12px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          color: 'var(--color-text-primary)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        What the proof checked
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {checks.map((check) => {
          const status = checkMap.get(check.key) || 'pass';
          const isFail = status === 'fail';
          const isPass = status === 'pass';
          const marker = isFail ? '✕' : isPass ? '✓' : '·';
          const markerColor = isFail
            ? 'var(--color-reject)'
            : isPass
            ? 'var(--color-success)'
            : 'var(--color-text-tertiary)';

          return (
            <div
              key={check.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '13px',
                  color: markerColor,
                  fontWeight: isPass || isFail ? 600 : 400,
                }}
              >
                {marker}
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {check.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
