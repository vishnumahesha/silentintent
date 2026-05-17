'use client';

const PROOF_CYAN = '#4DB8B8';

export default function WhyNotPromptBox() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        position: 'relative',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
      }}
    >
      <div
        aria-hidden
        style={{
          width: '3px',
          alignSelf: 'stretch',
          borderRadius: '999px',
          backgroundImage: `linear-gradient(180deg, var(--color-treasury-gold), ${PROOF_CYAN})`,
          flexShrink: 0,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-treasury-gold)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          Why not just prompt the AI?
        </span>
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          Prompting tells an agent what to do. SilentIntent proves whether a
          proposed spend is allowed. The company keeps its exact policy
          private, but the public can still verify the authorization result.
        </p>
      </div>
    </div>
  );
}
