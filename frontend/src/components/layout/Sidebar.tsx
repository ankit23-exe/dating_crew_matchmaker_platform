'use client';

import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { useClients } from '@/hooks/useClients';

const sectionLabel: React.CSSProperties = {
  color: 'var(--sidebar-muted)',
  fontSize: 10,
  letterSpacing: '0.12em',
  marginBottom: 8,
};

const badgeStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  background: 'rgba(201,149,106,0.18)',
  color: 'var(--sidebar-active)',
  borderRadius: 999,
  padding: '2px 7px',
  minWidth: 20,
  textAlign: 'center',
};

const FOLLOW_UP_STAGES = ['active_search', 'intro_sent', 'date_scheduled', 'profiling'];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { clients } = useClients();

  const followUpCount = clients.filter((c) => FOLLOW_UP_STAGES.includes(c.journeyStage)).length;
  const pendingCount = clients.filter((c) => c.matchesSent.some((m) => m.outcome === 'pending')).length;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const navItem = (href: string, label: string, badge?: number) => {
    const active = isActive(href);
    return (
      <button
        key={href}
        type="button"
        onClick={() => router.push(href)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          borderRadius: 10,
          padding: '10px 12px',
          color: 'var(--sidebar-text)',
          fontSize: 12,
          cursor: 'pointer',
          border: 'none',
          borderLeft: active ? '2px solid var(--sidebar-active)' : '2px solid transparent',
          background: active ? 'var(--sidebar-hover)' : 'transparent',
          fontFamily: "'DM Sans', sans-serif",
          textAlign: 'left',
        }}
      >
        <span>{label}</span>
        {badge !== undefined && badge > 0 ? <span style={badgeStyle}>{badge}</span> : null}
      </button>
    );
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 220,
        height: '100vh',
        overflow: 'hidden',
        borderRight: '1px solid var(--sidebar-border)',
        background: `var(--grad-sidebar), var(--sidebar-bg)`,
        color: 'var(--sidebar-text)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 16,
        zIndex: 50,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--grad-primary)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 16,
            }}
          >
            ❤
          </div>
          <div>
            <div className="serif" style={{ fontSize: 20, lineHeight: 1 }}>
              TDC Matchmaker
            </div>
            <div style={{ color: 'var(--sidebar-muted)', fontSize: 10, letterSpacing: '0.12em' }}>
              INTERNAL PORTAL
            </div>
          </div>
        </div>

        <div style={sectionLabel}>MAIN</div>
        <nav style={{ display: 'grid', gap: 2, marginBottom: 20 }}>
          {navItem('/dashboard', 'Overview')}
          {navItem('/dashboard/clients', 'My Clients', clients.length)}
        </nav>

        <div style={{ ...sectionLabel, marginTop: 4 }}>DESK</div>
        <nav style={{ display: 'grid', gap: 2 }}>
          {navItem('/dashboard/follow-ups', "Today's Follow-ups", followUpCount)}
          {navItem('/dashboard/pending', 'Pending Responses', pendingCount)}
        </nav>
      </div>

      <div>
        <div
          style={{
            border: '1px solid var(--sidebar-border)',
            borderRadius: 12,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--grad-gold)',
              display: 'grid',
              placeItems: 'center',
              color: '#2e2118',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            PK
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12 }}>Priya Kapoor</div>
            <div style={{ fontSize: 10, color: 'var(--sidebar-muted)' }}>Matchmaker</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF72' }} />
        </div>
        <button type="button" onClick={logout} className="sidebar-logout-btn">
          Logout
        </button>
      </div>
    </aside>
  );
}
