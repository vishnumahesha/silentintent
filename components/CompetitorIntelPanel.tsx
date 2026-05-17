'use client';

import { WarningIcon, ShieldCheckIcon } from '@phosphor-icons/react';

const LEAKED_POLICY = [
  { k: 'Max budget', v: '$2,500' },
  { k: 'Required', v: 'freshness verified' },
  { k: 'Forbidden', v: 'campaign metadata reuse' },
  { k: 'Urgency', v: '72 hours' },
  { k: 'Priority', v: 'quality > volume' },
];

const EXPLOIT_MOVES = [
  'Undercut on price to look like the obvious winner',
  'Advertise freshness prominently in the headline',
  'Bury reuse clause inside "partner enrichment"',
];

const PUBLIC_OUTPUTS = [
  { k: 'Status', v: 'AUTHORIZED / REJECTED' },
  { k: 'Price band', v: '$2k-$2.5k (only if authorized)' },
  { k: 'Deal ID', v: '0x⋯' },
  { k: 'Intent commitment', v: '0x⋯' },
  { k: 'Offer commitment', v: '0x⋯' },
];

const STAYS_PRIVATE = [
  'Exact budget',
  'Hidden constraints',
  'Vendor full terms',
  'Agent reasoning trace',
];

function SectionHeader({
  icon,
  title,
  subtitle,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: 'danger' | 'safe';
}) {
  const color = tone === 'danger' ? 'var(--color-reject)' : 'var(--color-success)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color, display: 'inline-flex' }}>{icon}</span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            color: 'var(--color-text-primary)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
      </div>
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.02em',
        }}
      >
        {subtitle}
      </span>
    </div>
  );
}

function KVRow({ k, v, tone }: { k: string; v: string; tone: 'danger' | 'safe' }) {
  const valueColor =
    tone === 'danger' ? 'var(--color-reject)' : 'var(--color-success)';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: '6px',
        backgroundColor:
          tone === 'danger' ? 'rgba(122,61,61,0.08)' : 'rgba(61,122,92,0.06)',
        border: `1px solid ${
          tone === 'danger' ? 'rgba(122,61,61,0.25)' : 'rgba(61,122,92,0.2)'
        }`,
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.04em',
        }}
      >
        {k}
      </span>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
          color: valueColor,
          letterSpacing: '0.02em',
        }}
      >
        {v}
      </span>
    </div>
  );
}

function BulletList({ items, tone }: { items: string[]; tone: 'danger' | 'safe' }) {
  const color = tone === 'danger' ? 'var(--color-reject)' : 'var(--color-success)';
  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none' }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            display: 'flex',
            gap: '8px',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          <span style={{ color, flexShrink: 0 }}>—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CompetitorIntelPanel() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '14px',
        padding: '24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.035), 0 1px 3px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--color-text-primary)',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          What vendors learn if intent leaks
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '10px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          The privacy beat
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SectionHeader
            tone="danger"
            icon={<WarningIcon size={14} weight="fill" />}
            title="If the policy leaks"
            subtitle="Every vendor that scrapes the chain learns:"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {LEAKED_POLICY.map((row) => (
              <KVRow key={row.k} k={row.k} v={row.v} tone="danger" />
            ))}
          </div>
          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              How BrightReach exploits this
            </span>
            <BulletList items={EXPLOIT_MOVES} tone="danger" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SectionHeader
            tone="safe"
            icon={<ShieldCheckIcon size={14} weight="fill" />}
            title="What SilentIntent discloses"
            subtitle="The only public outputs after a proof:"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {PUBLIC_OUTPUTS.map((row) => (
              <KVRow key={row.k} k={row.k} v={row.v} tone="safe" />
            ))}
          </div>
          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              What stays private
            </span>
            <BulletList items={STAYS_PRIVATE} tone="safe" />
          </div>
        </div>
      </div>
    </div>
  );
}
