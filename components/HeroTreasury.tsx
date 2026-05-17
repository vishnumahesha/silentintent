'use client';

import { useEffect, useState } from 'react';
import { useSpring, useMotionValueEvent, AnimatePresence, motion } from 'framer-motion';

interface HeroTreasuryProps {
  balanceCents: number;
  hasDebit: boolean;
  debitCents?: number;
  hasAnyResult: boolean;
}

function formatDollars(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
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

export default function HeroTreasury({
  balanceCents,
  hasDebit,
  debitCents,
  hasAnyResult,
}: HeroTreasuryProps) {
  const status = hasDebit
    ? 'Spend authorized'
    : hasAnyResult
    ? 'Spend evaluated'
    : 'Awaiting authorization';
  const statusColor = hasDebit
    ? 'var(--color-success)'
    : 'var(--color-treasury-gold)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '24px 28px',
        borderRadius: '14px',
        border: '1px solid rgba(201,168,76,0.30)',
        background:
          'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.02) 100%), var(--color-surface)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05), 0 6px 24px rgba(201,168,76,0.06)',
        minWidth: '320px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: 'var(--color-text-tertiary)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Agent Treasury
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--color-text-tertiary)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          USDC
        </span>
      </div>

      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: 'var(--color-treasury-gold)',
          fontSize: '48px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        <AnimatedBalance balanceCents={balanceCents} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '4px',
          borderTop: '1px solid var(--color-border)',
          marginTop: '4px',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '9999px',
            backgroundColor: statusColor,
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: statusColor,
            fontSize: '12px',
            letterSpacing: '0.04em',
            paddingTop: '8px',
          }}
        >
          {status}
        </span>
      </div>

      <AnimatePresence>
        {hasDebit && debitCents && (
          <motion.div
            key="debit"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: 'var(--color-success)',
              fontSize: '12px',
              letterSpacing: '0.02em',
            }}
          >
            {`−$${(debitCents / 100).toLocaleString('en-US')} authorized to vendor commitment`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
