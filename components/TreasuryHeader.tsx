'use client';

import { useEffect, useState } from 'react';
import { useSpring, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion';

interface LastDebit {
  amountCents: number;
  commitmentHash: string;
}

interface TreasuryHeaderProps {
  balanceCents: number;
  lastDebit?: LastDebit | null;
}

function formatDollars(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDebitAmount(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatCommitmentHash(hash: string): string {
  const hex = hash.startsWith('0x') ? hash.slice(2) : hash;
  return `0x${hex.slice(0, 4)}⋯${hex.slice(-4)}`;
}

function AnimatedBalance({ balanceCents }: { balanceCents: number }) {
  const spring = useSpring(balanceCents, { stiffness: 60, damping: 20 });
  const [displayed, setDisplayed] = useState(() => formatDollars(balanceCents));

  useEffect(() => {
    spring.set(balanceCents);
  }, [balanceCents, spring]);

  useMotionValueEvent(spring, 'change', (val) => {
    setDisplayed(formatDollars(Math.round(val)));
  });

  return <span>{displayed}</span>;
}

export default function TreasuryHeader({ balanceCents, lastDebit }: TreasuryHeaderProps) {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--color-treasury-gold)',
            fontSize: '20px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          SilentIntent
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: 'var(--color-text-secondary)',
            fontSize: '12px',
          }}
        >
          Treasury Proof Console
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: 'var(--color-text-tertiary)',
            fontSize: '11px',
            maxWidth: '380px',
            lineHeight: '1.5',
          }}
        >
          An AI agent can spend company money only if a private proof says the purchase follows policy.
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--color-text-primary)',
            fontSize: '18px',
            fontWeight: 500,
          }}
        >
          <AnimatedBalance balanceCents={balanceCents} />
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: 'var(--color-text-tertiary)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          USDC TREASURY
        </span>
        <AnimatePresence>
          {lastDebit && (
            <motion.span
              key={lastDebit.commitmentHash}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.4 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.02em',
                marginTop: '4px',
              }}
            >
              {`−${formatDebitAmount(lastDebit.amountCents)} to commitment ${formatCommitmentHash(lastDebit.commitmentHash)}`}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
