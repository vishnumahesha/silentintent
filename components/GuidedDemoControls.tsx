'use client';

type VendorStatus = 'idle' | 'analyzing' | 'approved' | 'rejected';

type DerivedState = {
  stateIdx: 0 | 1 | 2 | 3 | 4;
  primaryLabel: string;
  helper: string;
  onClick: () => void;
  disabled: boolean;
};

type GuidedDemoControlsProps = {
  vendorAStatus: VendorStatus;
  vendorBStatus: VendorStatus;
  isVendorBAuthorized: boolean;
  onAnalyzeA: () => void;
  onAnalyzeB: () => void;
  onAuthorizeB: () => void;
  onReset: () => void;
};

const STATE_LABEL: Record<number, string> = {
  0: 'Step 1 of 4 · Analyze BrightReach',
  1: 'Step 2 of 4 · Run BrightReach proof',
  2: 'Step 3 of 4 · Analyze CleanList',
  3: 'Step 4 of 4 · Authorize CleanList',
  4: 'Demo complete',
};

export default function GuidedDemoControls(props: GuidedDemoControlsProps) {
  const derived = deriveState(props);
  const stateLabel = STATE_LABEL[derived.stateIdx];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border-accent)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={chipLabelStyle}>{stateLabel}</span>
        <ProgressDots stateIdx={derived.stateIdx} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={derived.onClick}
          disabled={derived.disabled}
          aria-label={derived.primaryLabel}
          style={{
            ...primaryButtonStyle,
            opacity: derived.disabled ? 0.55 : 1,
            cursor: derived.disabled ? 'wait' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!derived.disabled) {
              const el = e.currentTarget;
              el.style.backgroundColor = 'var(--color-treasury-gold)';
              el.style.color = 'var(--color-bg)';
            }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.backgroundColor = 'transparent';
            el.style.color = 'var(--color-treasury-gold)';
          }}
        >
          {derived.primaryLabel}
        </button>

        <span style={helperTextStyle}>{derived.helper}</span>

        <button
          type="button"
          onClick={props.onReset}
          aria-label="Reset guided demo to step 1"
          style={{
            ...resetButtonStyle,
            marginLeft: 'auto',
            opacity: derived.stateIdx === 0 ? 0.5 : 1,
            cursor: derived.stateIdx === 0 ? 'not-allowed' : 'pointer',
          }}
          disabled={derived.stateIdx === 0}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function ProgressDots({ stateIdx }: { stateIdx: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px' }} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const active = i === stateIdx;
        const passed = i < stateIdx;
        return (
          <span
            key={i}
            style={{
              width: active ? '18px' : '6px',
              height: '6px',
              borderRadius: '999px',
              backgroundColor: active
                ? 'var(--color-treasury-gold)'
                : passed
                ? '#4DB8B8'
                : 'var(--color-border-accent)',
              transition: 'width 0.25s, background-color 0.25s',
            }}
          />
        );
      })}
    </div>
  );
}

function deriveState(props: GuidedDemoControlsProps): DerivedState {
  const a = props.vendorAStatus;
  const b = props.vendorBStatus;

  // State 0 — nothing analyzed yet
  if (a === 'idle' && b === 'idle') {
    return {
      stateIdx: 0,
      primaryLabel: 'Analyze BrightReach',
      helper: 'Next: extract the cheaper offer’s structured facts.',
      onClick: props.onAnalyzeA,
      disabled: false,
    };
  }

  // State 1 — BrightReach in flight (analyzing); proof is running
  if (a === 'analyzing') {
    return {
      stateIdx: 1,
      primaryLabel: 'Attempt BrightReach spend',
      helper: 'Next: run the authorization proof and check the hidden policy.',
      onClick: () => {},
      disabled: true,
    };
  }

  // State 2 — BrightReach settled (rejected/approved); CleanList not started
  if ((a === 'rejected' || a === 'approved') && b === 'idle') {
    return {
      stateIdx: 2,
      primaryLabel: 'Analyze CleanList',
      helper: 'Next: inspect the safer offer.',
      onClick: props.onAnalyzeB,
      disabled: false,
    };
  }

  // CleanList in flight
  if (b === 'analyzing') {
    return {
      stateIdx: 2,
      primaryLabel: 'Running CleanList proof…',
      helper: 'Next: inspect the safer offer.',
      onClick: () => {},
      disabled: true,
    };
  }

  // State 3 — CleanList approved but not yet authorized (logged)
  if (b === 'approved' && !props.isVendorBAuthorized) {
    return {
      stateIdx: 3,
      primaryLabel: 'Authorize CleanList',
      helper:
        'Next: authorize the compliant offer and reveal only the public receipt.',
      onClick: props.onAuthorizeB,
      disabled: false,
    };
  }

  // State 4 — done
  return {
    stateIdx: 4,
    primaryLabel: 'Start over',
    helper:
      'Demo complete: BrightReach was rejected, CleanList was authorized.',
    onClick: props.onReset,
    disabled: false,
  };
}

const primaryButtonStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '13px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '12px 22px',
  backgroundColor: 'transparent',
  color: 'var(--color-treasury-gold)',
  border: '1px solid var(--color-treasury-gold)',
  borderRadius: '8px',
  fontWeight: 600,
  transition: 'background-color 0.15s, color 0.15s',
  minWidth: '240px',
  textAlign: 'center',
};

const resetButtonStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '8px 14px',
  backgroundColor: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border-accent)',
  borderRadius: '7px',
};

const chipLabelStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '11px',
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const helperTextStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.55,
  flex: '1 1 240px',
  minWidth: '240px',
};
