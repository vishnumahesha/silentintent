'use client';

const REPO_BASE = 'https://github.com/vishnumahesha/silentintent-sandbox/blob/main';

export default function CompactCircuitPanel() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px 18px',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-treasury-gold)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Authored Compact circuit
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '10px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Compiled with
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
            {[
              { label: 'Compact compiler', value: '0.31.0' },
              { label: 'Language', value: '0.23.0' },
              { label: 'Runtime', value: '0.16.0' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  gap: '8px',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span style={{ color: 'var(--color-text-tertiary)', minWidth: '120px' }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--color-treasury-gold)' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '10px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Circuits
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
            {['registerIntent', 'evaluateOffer'].map((circuit) => (
              <div
                key={circuit}
                style={{
                  display: 'flex',
                  gap: '8px',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span style={{ minWidth: '140px' }}>• {circuit}</span>
                <span style={{ color: 'var(--color-success)' }}>proof: true</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '10px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Core checks
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
            {[
              'price ≤ hidden max budget',
              'credential membership',
              'forbidden-term non-membership',
              'commitment consistency',
            ].map((check) => (
              <div
                key={check}
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                • {check}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
          <a
            href={`${REPO_BASE}/contracts/intent-evaluation/SilentIntent.compact`}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: 'var(--color-treasury-gold)',
              textDecoration: 'none',
              borderBottom: '1px dotted var(--color-treasury-gold)',
              paddingBottom: '1px',
              transition: 'opacity 0.15s',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
            }}
          >
            View Compact source
          </a>
        </div>
      </div>
    </div>
  );
}
