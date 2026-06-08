'use client';

import '../dashboard.css';
import { useMemo, useState } from 'react';
import ClientList from '@/components/dashboard/ClientList';
import ClientSearchBar from '@/components/dashboard/ClientSearchBar';
import Spinner from '@/components/ui/Spinner';
import { useClients } from '@/hooks/useClients';
import { applyClientFilters, defaultFilters, type ClientFilters } from '@/lib/clientFilters';

export default function ClientsPage() {
  const { clients, loading, error } = useClients();
  const [filters, setFilters] = useState<ClientFilters>(defaultFilters);

  const filtered = useMemo(() => applyClientFilters(clients, filters), [clients, filters]);

  const exportList = () => {
    const rows = filtered.map((c) =>
      [
        c.id,
        `${c.firstName} ${c.lastName}`,
        c.currentCity,
        c.status,
        c.journeyStage,
        c.annualIncomeLPA,
      ].join(','),
    );
    const csv = ['ID,Name,City,Status,Stage,Income', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-clients.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <header style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, margin: 0 }}>
            My Clients
          </h1>
          <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            {clients.length} curated profiles assigned to your matchmaker desk
          </p>
        </div>
        <button type="button" className="dash-export-btn" onClick={exportList} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export Client List
        </button>
      </header>

      <ClientSearchBar
        clients={clients}
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      {loading ? (
        <div className="card dash-loading">
          <Spinner />
        </div>
      ) : null}

      {error ? <div className="card dash-error">{error}</div> : null}

      {!loading && !error ? <ClientList clients={filtered} /> : null}
    </div>
  );
}
