'use client';

import type { ProofResult } from '@/lib/mockProof';

type CompactPublicReceiptProps = {
  latestProof: ProofResult | null;
  isLatestAuthorized: boolean;
  analyzing: boolean;
};

export default function CompactPublicReceipt({
  latestProof,
  isLatestAuthorized,
  analyzing,
}: CompactPublicReceiptProps) {
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
        gap: '10px',
        position: 'relative',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '2px',
          width: '36px',
          backgroundColor: accent,
          borderTopLeftRadius: '12px',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
        <span style={titleStyle}>Current public receipt</span>
        <span style={subTitleStyle}>— compact view</span>
      </div>

      {analyzing ? (
        <Body lines={['Proof in flight. Receipt will update when the proof settles.']} muted />
      ) : !latestProof ? (
        <Body
          lines={['No authorization yet. Select a vendor and run the proof.']}
          muted
        />
      ) : isLatestAuthorized ? (
        <ReceiptBlock
          status="AUTHORIZED"
          accent="var(--color-success)"
          publicLines={[
            `Treasury debit: −$${(latestProof.debitCents! / 100).toLocaleString('en-US')}`,
            `Price band: ${latestProof.priceBand ?? '—'}`,
            'Public saw: status + price band + commitments',
          ]}
          privateLine="Private: exact policy, raw witnesses, full vendor terms"
        />
      ) : (
        <ReceiptBlock
          status="REJECTED"
          accent="var(--color-reject)"
          publicLines={[
            'Treasury: unchanged',
            'Public saw: status + commitments',
          ]}
          privateLine="Private: exact budget, forbidden rule, full vendor terms"
        />
      )}
    </div>
  );
}

function ReceiptBlock({
  status,
  accent,
  publicLines,
  privateLine,
}: {
  status: 'AUTHORIZED' | 'REJECTED';
  accent: string;
  publicLines: string[];
  privateLine: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '22px',
            fontWeight: 700,
            color: accent,
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}
        >
          {status}
        </span>
        <span style={subTitleStyle}>latest result</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 18px',
        }}
      >
        {publicLines.map((line) => (
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
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.02em',
          lineHeight: 1.6,
          marginTop: '2px',
          paddingTop: '6px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {privateLine} — never disclosed publicly.
      </span>
    </div>
  );
}

function Body({ lines, muted }: { lines: string[]; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {lines.map((line) => (
        <span
          key={line}
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12px',
            color: muted
              ? 'var(--color-text-tertiary)'
              : 'var(--color-text-secondary)',
            lineHeight: 1.55,
          }}
        >
          {line}
        </span>
      ))}
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-treasury-gold)',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
};

const subTitleStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '11px',
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};
