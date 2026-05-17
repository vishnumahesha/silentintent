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

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 8px',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface-raised)',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '10px',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
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
              letterSpacing: '0.04em',
            }}
          >
            Treasury Proof Console
          </span>
        </div>
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
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
          <Badge label="Mode" value="Cached AI + mock proof" />
          <Badge label="Network" value="Midnight local · mock proof layer" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: 'var(--color-text-tertiary)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          USDC Treasury
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--color-treasury-gold)',
            fontSize: '28px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          <AnimatedBalance balanceCents={balanceCents} />
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
