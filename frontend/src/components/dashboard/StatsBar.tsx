import type { Client } from '@/types/client';

const StatIcon = ({ children, bg }: { children: React.ReactNode; bg: string }) => (
  <div className="dash-stat-icon" style={{ background: bg }}>
    {children}
  </div>
);

export default function StatsBar({ clients }: { clients: Client[] }) {
  const stats = [
    {
      num: clients.length,
      label: 'Total Clients',
      iconBg: '#FBF0E8',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0714F" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      num: clients.filter((c) => c.status === 'Match Sent').length,
      label: 'Matches Sent',
      iconBg: '#FBF7EC',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A6020" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      ),
    },
    {
      num: clients.filter((c) => c.journeyStage === 'active_search').length,
      label: 'Active Search',
      iconBg: '#F5EAED',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B2D3E" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
    },
    {
      num: clients.filter((c) => c.journeyStage === 'committed').length,
      label: 'Committed',
      iconBg: '#E8F4EC',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D6B40" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <path d="M22 4L12 14.01l-3-3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="dash-stats-grid">
      {stats.map(({ num, label, iconBg, icon }) => (
        <div key={label} className="dash-stat-card">
          <StatIcon bg={iconBg}>{icon}</StatIcon>
          <div className="serif dash-stat-num">{num}</div>
          <div className="dash-stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
}
