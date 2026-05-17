'use client';

const IF_LEAKED = [
  'Max budget',
  'Required credential',
  'Forbidden reuse rule',
  'Urgency',
];

const WITH_SILENTINTENT = [
  'Approved/rejected',
  'Price band',
  'Commitments',
  'Treasury action',
];

export default function CompetitorIntelPanel() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '16px 18px',
        border: '1px solid var(--color-border)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Why hidden policy matters
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            lineHeight: 1.5,
          }}
        >
          Vendors who know the exact budget and rules can tailor offers to barely pass, rather than competing on genuine merit.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              color: 'var(--color-reject)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            If Policy Leaks
          </span>
          {IF_LEAKED.map((item) => (
            <span
              key={item}
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
              }}
            >
              • {item}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              color: 'var(--color-success)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            With SilentIntent
          </span>
          {WITH_SILENTINTENT.map((item) => (
            <span
              key={item}
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
              }}
            >
              • {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
