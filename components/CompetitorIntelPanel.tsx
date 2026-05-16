'use client';

import RedactedField from './RedactedField';

const VENDORS = [
  { name: 'Axiom Logistics', category: 'Cloud Compute', rate: '$0.42/unit' },
  { name: 'Meridian AI', category: 'Cloud Compute', rate: '$0.31/unit' },
];

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
        gap: '24px',
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: 'var(--color-text-primary)',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        Competitor Intelligence
      </span>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Vendor', 'Category', 'Market Rate'].map((col) => (
              <th
                key={col}
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  textAlign: 'left',
                  padding: '0 0 12px 0',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {VENDORS.map((vendor, i) => (
            <tr
              key={vendor.name}
              style={{
                backgroundColor: i % 2 === 1
                  ? 'rgba(255,255,255,0.015)'
                  : 'transparent',
              }}
            >
              <td style={tdStyle}>{vendor.name}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: '11px',
                    color: 'var(--color-text-tertiary)',
                    border: '1px solid var(--color-border-accent)',
                    borderRadius: '9999px',
                    padding: '2px 8px',
                    display: 'inline-block',
                  }}
                >
                  {vendor.category}
                </span>
              </td>
              <td style={tdStyle}>{vendor.rate}</td>
            </tr>
          ))}
          <tr style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
            <td style={tdStyle}>
              <RedactedField label="" />
            </td>
            <td style={tdStyle}>
              <RedactedField label="" />
            </td>
            <td style={tdStyle}>
              <RedactedField label="" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  padding: '12px 0',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle',
};
