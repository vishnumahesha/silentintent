'use client';

const STEPS = [
  { n: '01', label: 'Hidden policy committed' },
  { n: '02', label: 'AI extracts vendor facts' },
  { n: '03', label: 'Proof checks constraints' },
  { n: '04', label: 'Public sees only result' },
];

export default function NarrativeStepper() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'stretch',
      }}
    >
      {STEPS.map((step, i) => {
        const isFirst = i === 0;
        return (
          <div
            key={step.n}
            style={{
              flex: 1,
              minWidth: '180px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: isFirst
                ? '1px solid rgba(201,168,76,0.35)'
                : '1px solid var(--color-border)',
              backgroundColor: isFirst
                ? 'rgba(201,168,76,0.06)'
                : 'var(--color-surface)',
              boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: isFirst
                  ? 'var(--color-treasury-gold)'
                  : 'var(--color-text-tertiary)',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              {step.n}
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '13px',
                color: isFirst
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)',
                letterSpacing: '0.01em',
                lineHeight: 1.3,
              }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
