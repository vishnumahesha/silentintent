'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { VendorStatus } from './VendorCard';

interface DemoStepBannerProps {
  vendorAStatus: VendorStatus;
  vendorBStatus: VendorStatus;
}

type Step = {
  n: number;
  text: string;
  tone: 'idle' | 'gold' | 'red' | 'green';
};

function pickStep(a: VendorStatus, b: VendorStatus): Step {
  if (b === 'approved') {
    return {
      n: 5,
      text: 'Step 5: Proof authorized the spend. Treasury debited $2,250.',
      tone: 'green',
    };
  }
  if (b === 'analyzing') {
    return {
      n: 4,
      text: 'Step 4: AI is extracting structured facts from CleanList.',
      tone: 'gold',
    };
  }
  if (a === 'rejected') {
    return {
      n: 3,
      text: 'Step 3: Proof rejected the spend. Treasury stayed at $10,000.',
      tone: 'red',
    };
  }
  if (a === 'analyzing') {
    return {
      n: 2,
      text: 'Step 2: AI is extracting structured facts from BrightReach.',
      tone: 'gold',
    };
  }
  return {
    n: 1,
    text: 'Step 1: Choose a vendor offer for the AI agent to evaluate.',
    tone: 'idle',
  };
}

const TONE: Record<
  Step['tone'],
  { border: string; bg: string; chip: string; chipBorder: string }
> = {
  idle: {
    border: 'var(--color-border-accent)',
    bg: 'var(--color-surface)',
    chip: 'var(--color-text-secondary)',
    chipBorder: 'var(--color-border-accent)',
  },
  gold: {
    border: 'rgba(201,168,76,0.45)',
    bg: 'rgba(201,168,76,0.06)',
    chip: 'var(--color-treasury-gold)',
    chipBorder: 'rgba(201,168,76,0.55)',
  },
  red: {
    border: 'rgba(122,61,61,0.5)',
    bg: 'rgba(122,61,61,0.07)',
    chip: 'var(--color-reject)',
    chipBorder: 'rgba(122,61,61,0.6)',
  },
  green: {
    border: 'rgba(61,122,92,0.5)',
    bg: 'rgba(61,122,92,0.07)',
    chip: 'var(--color-success)',
    chipBorder: 'rgba(61,122,92,0.6)',
  },
};

export default function DemoStepBanner({
  vendorAStatus,
  vendorBStatus,
}: DemoStepBannerProps) {
  const step = pickStep(vendorAStatus, vendorBStatus);
  const tone = TONE[step.tone];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '12px 16px',
        borderRadius: '10px',
        border: `1px solid ${tone.border}`,
        backgroundColor: tone.bg,
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03)',
        transition: 'border-color 220ms ease-out, background-color 220ms ease-out',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '36px',
          height: '24px',
          padding: '0 10px',
          borderRadius: '999px',
          border: `1px solid ${tone.chipBorder}`,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          fontWeight: 600,
          color: tone.chip,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {`Step ${step.n}`}
      </span>

      <AnimatePresence mode="wait">
        <motion.span
          key={step.n}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '15px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.4,
            letterSpacing: '-0.005em',
          }}
        >
          {step.text.replace(/^Step \d+:\s*/, '')}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
