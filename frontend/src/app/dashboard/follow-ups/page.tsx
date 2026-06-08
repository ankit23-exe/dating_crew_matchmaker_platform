'use client';

import '../dashboard.css';
import { useMemo } from 'react';
import ClientList from '@/components/dashboard/ClientList';
import Spinner from '@/components/ui/Spinner';
import { useClients } from '@/hooks/useClients';

const FOLLOW_UP_STAGES = ['active_search', 'intro_sent', 'date_scheduled', 'profiling'];

export default function FollowUpsPage() {
  const { clients, loading, error } = useClients();

  const followUps = useMemo(
    () => clients.filter((c) => FOLLOW_UP_STAGES.includes(c.journeyStage)),
    [clients],
  );

  return (
    <div>
      <header style={{ marginBottom: 20 }}>
        <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, margin: 0 }}>
          Today&apos;s Follow-ups
        </h1>
        <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
          Clients in active search, profiling, or awaiting next steps
        </p>
      </header>

      {loading ? (
        <div className="card dash-loading">
          <Spinner />
        </div>
      ) : null}

      {error ? <div className="card dash-error">{error}</div> : null}

      {!loading && !error ? (
        followUps.length > 0 ? (
          <ClientList clients={followUps} />
        ) : (
          <div className="card overview-empty">No follow-ups scheduled for today.</div>
        )
      ) : null}
    </div>
  );
}
