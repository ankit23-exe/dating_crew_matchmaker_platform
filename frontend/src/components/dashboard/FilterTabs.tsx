'use client';

const tabs = ['All', 'Male', 'Female', 'Active', 'Paused'] as const;
export type ClientFilter = (typeof tabs)[number];

interface Props {
  active: ClientFilter;
  onChange: (tab: ClientFilter) => void;
}

export default function FilterTabs({ active, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            borderRadius: 999,
            border: `1px solid ${active === tab ? 'transparent' : 'var(--border)'}`,
            background: active === tab ? 'var(--grad-primary)' : 'var(--warm-white)',
            color: active === tab ? 'white' : 'var(--text-secondary)',
            padding: '7px 12px',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
