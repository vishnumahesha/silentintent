'use client';

import { useEffect, useRef, useState } from 'react';

interface CommitmentHashProps {
  hash: string;
  resetKey?: number;
}

const HEX_CHARS = '0123456789abcdef';

function randomHexChar(): string {
  return HEX_CHARS[Math.floor(Math.random() * 16)];
}

function scrambleHash(target: string): string {
  return target
    .split('')
    .map((ch) => (ch === 'x' || ch === '.' || ch === '0' ? ch : randomHexChar()))
    .join('');
}

function truncateHash(hash: string): string {
  if (hash.length <= 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export default function CommitmentHash({ hash, resetKey }: CommitmentHashProps) {
  const truncated = truncateHash(hash);
  const [displayed, setDisplayed] = useState(truncated);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayed(scrambleHash(truncated));

    intervalRef.current = setInterval(() => {
      setDisplayed(scrambleHash(truncated));
    }, 40);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayed(truncated);
    }, 600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [hash, resetKey]);

  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        color: 'var(--color-treasury-gold)',
        fontSize: '12px',
        letterSpacing: '0.08em',
      }}
    >
      {displayed}
    </span>
  );
}
