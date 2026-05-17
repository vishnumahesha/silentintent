'use client';

import { InfoIcon } from '@phosphor-icons/react';

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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '20px',
        padding: '14px 16px',
        borderRadius: '10px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03)',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <InfoIcon size={14} weight="regular" color="var(--color-text-tertiary)" />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Implementation mode
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {MODE_LINES.map((line) => (
            <span
              key={line}
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
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
            <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  borderBottom: '1px dotted var(--color-border-accent)',
                  paddingBottom: '1px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-treasury-gold)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-secondary)';
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
    </div>
  );
}
