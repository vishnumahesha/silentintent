'use client';

interface DemoControlsProps {
  onReset: () => void;
}

export default function DemoControls({ onReset }: DemoControlsProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderTop: '1px solid var(--color-border)',
        marginTop: '8px',
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
        }}
      >
        Simulated ZK proof — no real transaction broadcast.
      </span>

      <button
        onClick={onReset}
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.04em',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid var(--color-border-accent)',
          backgroundColor: 'var(--color-surface-raised)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
          transition: 'background-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
        }}
      >
        Reset Demo
      </button>
    </div>
  );
}
