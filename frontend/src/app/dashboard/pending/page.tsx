'use client';

import '../dashboard.css';
import { useMemo } from 'react';
import ClientList from '@/components/dashboard/ClientList';
import Spinner from '@/components/ui/Spinner';
import { useClients } from '@/hooks/useClients';

export default function PendingResponsesPage() {
  const { clients, loading, error } = useClients();

  const pending = useMemo(
    () => clients.filter((c) => c.matchesSent.some((m) => m.outcome === 'pending')),
    [clients],
  );

  return (
    <div>
      <header style={{ marginBottom: 20 }}>
        <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, margin: 0 }}>
          Pending Responses
        </h1>
        <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
          Intros sent — waiting on client feedback
        </p>
      </header>

      {loading ? (
        <div className="card dash-loading">
          <Spinner />
        </div>
      ) : null}

      {error ? <div className="card dash-error">{error}</div> : null}

      {!loading && !error ? (
        pending.length > 0 ? (
          <ClientList clients={pending} />
        ) : (
          <div className="card overview-empty">No pending match responses right now.</div>
        )
      ) : null}
    </div>
  );
}
