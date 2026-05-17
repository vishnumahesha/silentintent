'use client';

const REPO_BASE = 'https://github.com/vishnumahesha/silentintent-sandbox/blob/main';

const ARTIFACTS = [
  { label: 'Midnight status', href: `${REPO_BASE}/docs/MIDNIGHT_STATUS.md` },
  { label: 'Circuit spec', href: `${REPO_BASE}/contracts/SilentIntentAuthorization.pseudo.compact.md` },
  { label: 'Compact source', href: `${REPO_BASE}/contracts/SilentIntent.compact` },
  { label: 'Demo model verification', href: `${REPO_BASE}/scripts/verify-demo-model.mjs` },
  { label: 'README', href: `${REPO_BASE}/README.md` },
];

function ArtifactLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
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
      {label}
    </a>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 9px',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface-raised)',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px',
        color: 'var(--color-text-tertiary)',
        letterSpacing: '0.04em',
      }}
    >
      <span style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span>{value}</span>
    </span>
  );
}

export default function AppFooter() {
  return (
    <footer
      style={{
        marginTop: '8px',
        paddingTop: '20px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <Badge label="Mode" value="Cached AI + mock proof" />
        <Badge label="Network" value="Midnight local · mock proof layer" />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Technical artifacts
        </span>
        {ARTIFACTS.map((a, i) => (
          <span key={a.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            <ArtifactLink label={a.label} href={a.href} />
            {i < ARTIFACTS.length - 1 && (
              <span style={{ color: 'var(--color-border-accent)' }}>·</span>
            )}
          </span>
        ))}
      </div>
    </footer>
  );
}
