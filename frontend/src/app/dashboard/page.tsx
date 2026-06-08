'use client';

import './dashboard.css';
import { useRouter } from 'next/navigation';
import StatsBar from '@/components/dashboard/StatsBar';
import Spinner from '@/components/ui/Spinner';
import { useClients } from '@/hooks/useClients';

export default function OverviewPage() {
  const router = useRouter();
  const { clients, loading, error } = useClients();

  const followUpCount = clients.filter((c) =>
    ['active_search', 'intro_sent', 'date_scheduled', 'profiling'].includes(c.journeyStage),
  ).length;

  const pendingCount = clients.filter((c) =>
    c.matchesSent.some((m) => m.outcome === 'pending'),
  ).length;

  const activeSearch = clients.filter((c) => c.journeyStage === 'active_search').length;

  if (loading) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card dash-error" style={{ padding: 16 }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <header style={{ marginBottom: 20 }}>
        <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, margin: 0 }}>
          Overview
        </h1>
        <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
          Your matchmaker desk at a glance
        </p>
      </header>

      <div className="overview-welcome">
        <p className="overview-greeting">Good morning, Priya</p>
        <h2 className="serif overview-headline">
          {followUpCount > 0
            ? `You have ${followUpCount} client${followUpCount === 1 ? '' : 's'} needing follow-up today.`
            : 'Your desk is clear — great work staying on top of things.'}
        </h2>
        <p className="overview-body">
          {pendingCount > 0
            ? `${pendingCount} intro${pendingCount === 1 ? '' : 's'} awaiting a client response. ${activeSearch} profile${activeSearch === 1 ? '' : 's'} in active search.`
            : `${clients.length} clients on your roster · ${activeSearch} in active search.`}
        </p>
        <div className="overview-actions">
          <button type="button" className="btn-primary" onClick={() => router.push('/dashboard/follow-ups')}>
            View Follow-ups
          </button>
          <button
            type="button"
            className="overview-secondary-btn"
            onClick={() => router.push('/dashboard/clients')}
          >
            Browse All Clients
          </button>
        </div>
      </div>

      <StatsBar clients={clients} />
    </div>
  );
}
