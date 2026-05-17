'use client';

import { CaretDownIcon, InfoIcon } from '@phosphor-icons/react';

const REPO_BASE = 'https://github.com/vishnumahesha/silentintent-sandbox/blob/main';

const MODE_LINES = [
  'Cached AI extraction',
  'Deterministic mock proof',
  'Compact circuit spec included',
];

const LINKS = [
  { label: 'docs/MIDNIGHT_STATUS.md', href: `${REPO_BASE}/docs/MIDNIGHT_STATUS.md` },
  { label: 'contracts/SilentIntent.compact', href: `${REPO_BASE}/contracts/SilentIntent.compact` },
  {
    label: 'contracts/SilentIntentAuthorization.pseudo.compact.md',
    href: `${REPO_BASE}/contracts/SilentIntentAuthorization.pseudo.compact.md`,
  },
];

export default function ImplementationStatusStrip() {
  return (
    <details
      style={{
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'transparent',
        opacity: 0.78,
      }}
    >
      <summary
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          cursor: 'pointer',
          listStyle: 'none',
          userSelect: 'none',
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.02em',
        }}
      >
        <InfoIcon size={12} weight="regular" color="var(--color-text-tertiary)" />
        <span style={{ flex: 1 }}>
          Prototype mode: deterministic proof for demonstration purposes.
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Details
          <CaretDownIcon size={10} weight="regular" />
        </span>
      </summary>

      <div
        style={{
          padding: '0 14px 12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderTop: '1px solid var(--color-border)',
          marginTop: '4px',
          paddingTop: '12px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {MODE_LINES.map((line) => (
            <span
              key={line}
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
                padding: '3px 8px',
                borderRadius: '999px',
                border: '1px solid var(--color-border-accent)',
                backgroundColor: 'var(--color-surface-raised)',
                letterSpacing: '0.02em',
              }}
            >
              {line}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.04em',
            }}
          >
            See
          </span>
          {LINKS.map((l, i) => (
            <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  borderBottom: '1px dotted var(--color-border-accent)',
                  paddingBottom: '1px',
                }}
              >
                {l.label}
              </a>
              {i < LINKS.length - 1 && (
                <span style={{ color: 'var(--color-border-accent)' }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </details>
  );
}
