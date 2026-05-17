'use client';

import { useEffect, useState } from 'react';
import type { MidnightConnectionState } from '@/lib/midnight/silentIntentMidnightClient';
import { getMidnightStatus, checkProofServer, connectWallet } from '@/lib/midnight/silentIntentMidnightClient';

export default function MidnightStatusPanel() {
  const [status, setStatus] = useState<MidnightConnectionState | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      setIsChecking(true);
      await checkProofServer();
      await connectWallet();
      setStatus(getMidnightStatus());
      setIsChecking(false);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const items = [
    { label: 'Mode', value: status.mode === 'live-midnight' ? 'Live' : 'Fallback', color: status.mode === 'live-midnight' ? 'var(--color-success)' : 'var(--color-treasury-gold)' },
    { label: 'Wallet', value: status.walletConnected ? '✓ Connected' : '— Not connected', color: status.walletConnected ? 'var(--color-success)' : 'var(--color-text-tertiary)' },
    { label: 'Proof Server', value: status.proofServerReady ? '✓ Ready' : '— Not available', color: status.proofServerReady ? 'var(--color-success)' : 'var(--color-text-tertiary)' },
    { label: 'Contract', value: status.contractReady ? '✓ Ready' : '— Not ready', color: status.contractReady ? 'var(--color-success)' : 'var(--color-text-tertiary)' },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 1px 2px rgba(0,0,0,0.2)',
        fontSize: '11px',
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        Midnight Status
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
            <span style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </div>
      {isChecking && (
        <span style={{ color: 'var(--color-text-tertiary)', marginTop: '4px' }}>Checking...</span>
      )}
    </div>
  );
}
