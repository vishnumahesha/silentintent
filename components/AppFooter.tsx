'use client';

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
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.04em',
        }}
      >
        SilentIntent — Midnight Hackathon 2026
      </span>
    </footer>
  );
}
