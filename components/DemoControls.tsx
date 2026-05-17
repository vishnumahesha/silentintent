'use client';

import { useEffect, useState } from 'react';

interface DemoControlsProps {
  onReset: () => void;
  onAnalyzeA: () => void;
  onAnalyzeB: () => void;
  onAuthorizeA: () => void;
  onAuthorizeB: () => void;
  vendorAStatus: 'idle' | 'analyzing' | 'approved' | 'rejected';
  vendorBStatus: 'idle' | 'analyzing' | 'approved' | 'rejected';
}

type ControlVariant = 'neutral' | 'reject' | 'approve' | 'gold';

function ControlButton({
  label,
  onClick,
  disabled,
  variant = 'neutral',
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: ControlVariant;
}) {
  const palette: Record<ControlVariant, { bg: string; border: string; color: string }> = {
    neutral: {
      bg: 'var(--color-surface-raised)',
      border: 'var(--color-border-accent)',
      color: 'var(--color-text-secondary)',
    },
    gold: {
      bg: 'rgba(201,168,76,0.10)',
      border: 'rgba(201,168,76,0.35)',
      color: 'var(--color-treasury-gold)',
    },
    reject: {
      bg: 'rgba(122,61,61,0.12)',
      border: 'rgba(122,61,61,0.40)',
      color: 'var(--color-reject)',
    },
    approve: {
      bg: 'rgba(61,122,92,0.12)',
      border: 'rgba(61,122,92,0.40)',
      color: 'var(--color-success)',
    },
  };
  const p = palette[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.04em',
        padding: '8px 12px',
        borderRadius: '7px',
        border: `1px solid ${disabled ? 'var(--color-border)' : p.border}`,
        backgroundColor: disabled ? 'rgba(30,37,48,0.4)' : p.bg,
        color: disabled ? 'var(--color-text-tertiary)' : p.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
        transition: 'opacity 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

// Run-Full-Demo is for local rehearsal only. Hidden in production builds
// so the recorded demo uses the manual narrated flow.
const SHOW_RUN_FULL_DEMO = process.env.NODE_ENV !== 'production';

export default function DemoControls({
  onReset,
  onAnalyzeA,
  onAnalyzeB,
  onAuthorizeA,
  onAuthorizeB,
  vendorAStatus,
  vendorBStatus,
}: DemoControlsProps) {
  const [running, setRunning] = useState(false);

  const aIdle = vendorAStatus === 'idle';
  const bIdle = vendorBStatus === 'idle';
  const aDone = vendorAStatus === 'approved' || vendorAStatus === 'rejected';
  const bDone = vendorBStatus === 'approved' || vendorBStatus === 'rejected';
  const aApproved = vendorAStatus === 'approved';
  const bApproved = vendorBStatus === 'approved';

  // Run Full Demo: reset, analyze A, authorize A (rejected logs via analyze
  // already), analyze B, authorize B.
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (delay: number, fn: () => void) => {
      timers.push(setTimeout(() => { if (!cancelled) fn(); }, delay));
    };

    onReset();
    schedule(400, () => onAnalyzeA());
    schedule(2200, () => onAnalyzeB());
    schedule(4000, () => onAuthorizeB());
    schedule(4400, () => setRunning(false));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [running, onReset, onAnalyzeA, onAnalyzeB, onAuthorizeB]);

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '14px 16px',
        maxWidth: 'min(640px, calc(100vw - 40px))',
        borderRadius: '12px',
        backgroundColor: 'rgba(11, 13, 17, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--color-border-accent)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.55), inset 0 1px 0 0 rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
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
          Demo controls
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
          }}
        >
          Mock proof — no real transaction broadcast.
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <ControlButton
          label="Analyze BrightReach"
          onClick={onAnalyzeA}
          disabled={!aIdle || running}
          variant="gold"
        />
        <ControlButton
          label="Attempt BrightReach Authorization"
          onClick={onAuthorizeA}
          disabled={!aApproved || running}
          variant="reject"
        />
        <ControlButton
          label="Analyze CleanList"
          onClick={onAnalyzeB}
          disabled={!bIdle || running}
          variant="gold"
        />
        <ControlButton
          label="Authorize CleanList"
          onClick={onAuthorizeB}
          disabled={!bApproved || running}
          variant="approve"
        />
        {SHOW_RUN_FULL_DEMO && (
          <ControlButton
            label={running ? 'Running…' : 'Run Full Demo'}
            onClick={() => setRunning(true)}
            disabled={running}
            variant="neutral"
          />
        )}
        <ControlButton
          label="Reset Demo"
          onClick={onReset}
          disabled={running || (aIdle && bIdle)}
          variant="neutral"
        />
      </div>

      {(aDone || bDone) && !running && (
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
          }}
        >
          {bApproved
            ? 'CleanList authorized. Treasury debited.'
            : aDone && !bDone
            ? 'BrightReach analyzed. Try CleanList next.'
            : 'Demo in progress.'}
        </span>
      )}
    </div>
  );
}
