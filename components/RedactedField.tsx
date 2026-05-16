'use client';

interface RedactedFieldProps {
  label: string;
}

export default function RedactedField({ label }: RedactedFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: '80px',
          height: '16px',
          backgroundColor: 'var(--color-redact)',
          border: '1px solid var(--color-redact-border)',
          borderRadius: '4px',
          background: `linear-gradient(
            90deg,
            var(--color-redact) 0%,
            rgba(45, 30, 42, 0.6) 50%,
            var(--color-redact) 100%
          )`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }}
      />
    </div>
  );
}
