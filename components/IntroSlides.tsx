'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type IntroSlidesProps = {
  onExitToHome: () => void;
  onOpenDemo: () => void;
};

const INTRO_SLIDES = [
  {
    src: '/intro/slide-01-agent-spend.png',
    alt: 'AI agents are starting to spend company money. AI Agent Treasury with $10,000 connected to APIs, data vendors, SaaS tools, cloud compute, and payments.',
  },
  {
    src: '/intro/slide-02-intent-leak.png',
    alt: 'The payment leaks intent. A public transaction trail leaks max budget, urgency, required terms, deal-breakers, and vendor preference.',
  },
  {
    src: '/intro/slide-03-cheaper-offer.png',
    alt: 'The cheaper offer is not always safer. BrightReach Data appears cheaper but has partner enrichment and metadata reuse, while CleanList Pro is safer.',
  },
  {
    src: '/intro/slide-04-private-policy-proof.png',
    alt: 'Private policy in, public authorization out. Hidden policy flows to AI extraction and then Midnight proof.',
  },
  {
    src: '/intro/slide-05-proof-moment.png',
    alt: 'The proof moment. BrightReach is rejected with treasury unchanged, CleanList is authorized with treasury debited.',
  },
];

const DWELL_MS = 1200;
const PROOF_CYAN = '#4DB8B8';
const SWIPE_MIN_PX = 50;
const TOTAL_SLIDES = INTRO_SLIDES.length;

export default function IntroSlides({ onExitToHome, onOpenDemo }: IntroSlidesProps) {
  const [index, setIndex] = useState(0);
  const [dwellReady, setDwellReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressFrameRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const dwellReadyRef = useRef(false);
  const indexRef = useRef(0);

  useEffect(() => {
    dwellReadyRef.current = dwellReady;
  }, [dwellReady]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const isLast = index === TOTAL_SLIDES - 1;

  // Reset dwell + progress on every slide change.
  useEffect(() => {
    setDwellReady(false);
    setProgress(0);

    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / DWELL_MS);
      setProgress(ratio);
      if (ratio < 1) {
        progressFrameRef.current = requestAnimationFrame(tick);
      }
    }
    progressFrameRef.current = requestAnimationFrame(tick);

    dwellTimerRef.current = setTimeout(() => {
      setDwellReady(true);
    }, DWELL_MS);

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
      if (progressFrameRef.current) cancelAnimationFrame(progressFrameRef.current);
    };
  }, [index]);

  const advance = useCallback(() => {
    if (!dwellReadyRef.current) return;
    if (indexRef.current >= TOTAL_SLIDES - 1) {
      onOpenDemo();
      return;
    }
    setIndex((i) => i + 1);
  }, [onOpenDemo]);

  const back = useCallback(() => {
    if (indexRef.current <= 0) return;
    setIndex((i) => i - 1);
  }, []);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        back();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onOpenDemo();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, back, onOpenDemo]);

  // Wheel (hijack page scroll)
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (!dwellReadyRef.current) return;
      const dominant = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (dominant > 4) advance();
      else if (dominant < -4) back();
    }
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [advance, back]);

  // Touch
  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    }
    function onTouchEnd(e: TouchEvent) {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const horizontal = Math.abs(dx) >= Math.abs(dy);
      const delta = horizontal ? dx : dy;
      if (Math.abs(delta) < SWIPE_MIN_PX) return;
      // up or left advances; down or right goes back
      if (delta < 0) advance();
      else back();
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [advance, back]);

  const slide = INTRO_SLIDES[index];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#06080B',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 50,
      }}
      role="region"
      aria-label={`Intro slide ${index + 1} of ${TOTAL_SLIDES}`}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.04), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top bar */}
      <div style={topBarStyle}>
        <span style={brandLabelStyle}>SilentIntent</span>
        <SlideDots index={index} total={TOTAL_SLIDES} />
        <button
          type="button"
          onClick={onOpenDemo}
          aria-label="Skip to live demo"
          style={chipButtonStyle}
          onMouseEnter={chipHover}
          onMouseLeave={chipUnhover}
        >
          Skip to demo →
        </button>
      </div>

      {/* Image */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '72px 32px 84px',
          position: 'relative',
          zIndex: 1,
          minHeight: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.src}
          alt={slide.alt}
          draggable={false}
          style={{
            maxWidth: '92vw',
            maxHeight: '78vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            userSelect: 'none',
            boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
            borderRadius: '6px',
          }}
        />
      </div>

      {/* Bottom bar */}
      <div style={bottomBarStyle}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onExitToHome}
            aria-label="Return to home screen"
            style={chipButtonStyle}
            onMouseEnter={chipHover}
            onMouseLeave={chipUnhover}
          >
            ← Home
          </button>
          <button
            type="button"
            onClick={back}
            disabled={index === 0}
            aria-label="Previous slide"
            style={{
              ...chipButtonStyle,
              opacity: index === 0 ? 0.3 : 1,
              cursor: index === 0 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (index !== 0) chipHover(e);
            }}
            onMouseLeave={(e) => {
              if (index !== 0) chipUnhover(e);
            }}
          >
            Back
          </button>
        </div>

        <DwellIndicator dwellReady={dwellReady} progress={progress} />

        <button
          type="button"
          onClick={advance}
          disabled={!dwellReady}
          aria-label={isLast ? 'Open live demo' : 'Next slide'}
          style={{
            ...primaryChipStyle,
            opacity: dwellReady ? 1 : 0.45,
            cursor: dwellReady ? 'pointer' : 'wait',
          }}
          onMouseEnter={(e) => {
            if (dwellReady) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-treasury-gold)';
              (e.currentTarget as HTMLButtonElement).style.color = '#06080B';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--color-treasury-gold)';
          }}
        >
          {isLast ? 'Open live demo →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

function SlideDots({ index, total }: { index: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        Slide {index + 1} of {total}
      </span>
      <div style={{ display: 'flex', gap: '6px' }}>
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === index;
          const isPassed = i < index;
          return (
            <span
              key={i}
              aria-hidden
              style={{
                width: isActive ? '18px' : '6px',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: isActive
                  ? 'var(--color-treasury-gold)'
                  : isPassed
                  ? PROOF_CYAN
                  : 'var(--color-border-accent)',
                transition: 'width 0.25s, background-color 0.25s',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function DwellIndicator({
  dwellReady,
  progress,
}: {
  dwellReady: boolean;
  progress: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        minWidth: '180px',
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: dwellReady ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          transition: 'color 0.2s',
        }}
      >
        {dwellReady ? 'Scroll or press Next' : 'Hold to read'}
      </span>
      <div
        aria-hidden
        style={{
          width: '120px',
          height: '2px',
          borderRadius: '999px',
          backgroundColor: 'var(--color-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.round(progress * 100)}%`,
            height: '100%',
            backgroundColor: dwellReady ? PROOF_CYAN : 'var(--color-treasury-gold)',
            transition: 'background-color 0.2s',
          }}
        />
      </div>
    </div>
  );
}

const topBarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: '16px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  backgroundColor: 'rgba(6,8,11,0.45)',
  backdropFilter: 'blur(6px)',
  borderBottom: '1px solid rgba(30,37,48,0.5)',
  zIndex: 2,
};

const bottomBarStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '14px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  backgroundColor: 'rgba(6,8,11,0.45)',
  backdropFilter: 'blur(6px)',
  borderTop: '1px solid rgba(30,37,48,0.5)',
  zIndex: 2,
};

const brandLabelStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '12px',
  color: 'var(--color-treasury-gold)',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const chipButtonStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '8px 14px',
  backgroundColor: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border-accent)',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'color 0.15s, border-color 0.15s',
};

const primaryChipStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '12px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '10px 18px',
  backgroundColor: 'transparent',
  color: 'var(--color-treasury-gold)',
  border: '1px solid var(--color-treasury-gold)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'background-color 0.15s, color 0.15s',
};

function chipHover(e: React.MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.color = 'var(--color-text-primary)';
  el.style.borderColor = 'var(--color-text-secondary)';
}

function chipUnhover(e: React.MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.color = 'var(--color-text-secondary)';
  el.style.borderColor = 'var(--color-border-accent)';
}
