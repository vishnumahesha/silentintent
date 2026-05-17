'use client';

type HomeScreenProps = {
  onViewIntro: () => void;
  onOpenDemo: () => void;
};

const PROOF_CYAN = '#4DB8B8';

export default function HomeScreen({ onViewIntro, onOpenDemo }: HomeScreenProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(201,168,76,0.10), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 90%, rgba(77,184,184,0.06), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <header
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          SilentIntent
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Midnight Hackathon · May 2026
        </span>
      </header>

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative',
          zIndex: 1,
          gap: '36px',
          textAlign: 'center',
          maxWidth: '880px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(56px, 9vw, 112px)',
              fontWeight: 700,
              color: 'var(--color-treasury-gold)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              margin: 0,
            }}
          >
            SilentIntent
          </h1>

          <div
            aria-hidden
            style={{
              width: '64px',
              height: '2px',
              backgroundImage: `linear-gradient(90deg, transparent, var(--color-treasury-gold), ${PROOF_CYAN}, transparent)`,
            }}
          />

          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(20px, 2.6vw, 28px)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
              maxWidth: '640px',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Proof-backed spend authorization for AI agents.
          </p>

          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Private policy in. Public authorization out.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            onClick={onViewIntro}
            aria-label="View the five-slide intro"
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-treasury-gold)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-bg)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-treasury-gold)';
            }}
          >
            View intro
          </button>
          <button
            type="button"
            onClick={onOpenDemo}
            aria-label="Open the live demo"
            style={secondaryButtonStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = PROOF_CYAN;
              (e.currentTarget as HTMLButtonElement).style.color = PROOF_CYAN;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--color-border-accent)';
              (e.currentTarget as HTMLButtonElement).style.color =
                'var(--color-text-primary)';
            }}
          >
            Open live demo
          </button>
        </div>

        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.65,
            maxWidth: '560px',
            margin: 0,
          }}
        >
          An AI agent has company money. SilentIntent proves whether it can
          spend without revealing the company policy.
        </p>
      </main>

      <footer
        style={{
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span style={footerBadgeStyle}>
          <span style={{ color: 'var(--color-treasury-gold)' }}>●</span> Hidden policy
        </span>
        <span style={footerBadgeStyle}>
          <span style={{ color: PROOF_CYAN }}>●</span> Midnight proof
        </span>
        <span style={footerBadgeStyle}>
          <span style={{ color: 'var(--color-reject)' }}>●</span> Leak risk
        </span>
      </footer>
    </div>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '13px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '14px 28px',
  backgroundColor: 'transparent',
  color: 'var(--color-treasury-gold)',
  border: '1px solid var(--color-treasury-gold)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'background-color 0.15s, color 0.15s',
  minWidth: '180px',
};

const secondaryButtonStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '13px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '14px 28px',
  backgroundColor: 'transparent',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border-accent)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'border-color 0.15s, color 0.15s',
  minWidth: '180px',
};

const footerBadgeStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '11px',
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};
