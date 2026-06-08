'use client';

import '../client-detail.css';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BiodataPanel from '@/components/detail/BiodataPanel';
import MatchResults from '@/components/detail/MatchResults';
import NotesPanel from '@/components/detail/NotesPanel';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import { ProfileRing } from '@/components/ui/ProfileRing';
import StatusBadge from '@/components/ui/StatusBadge';
import { useClientDetail } from '@/hooks/useClientDetail';
import { useMatches } from '@/hooks/useMatches';
import { formatLabel } from '@/lib/formatClient';
import { calcAge, formatLPA, getStageLabel } from '@/lib/utils';

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { client, loading, error, addNote, updateStatus } = useClientDetail(id);
  const { matches, loading: matchLoading, error: matchError, findMatches, sendMatch } = useMatches(id);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timeout);
  }, [toast]);

  if (loading) {
    return (
      <div className="card" style={{ padding: 20 }}>
        <Spinner />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="card" style={{ padding: 16, color: '#842d2d', borderColor: '#efcece', background: '#fff7f7' }}>
        {error || 'Client not found'}
      </div>
    );
  }

  const age = client.age ?? calcAge(client.dateOfBirth);
  const variant = client.gender === 'female' ? 'gold' : 'rose';

  return (
    <div className="client-detail-page">
      <div className="client-hero">
        <div className="client-hero-left" >
          <ProfileRing
            firstName={client.firstName}
            lastName={client.lastName}
            seed={client.id}
            variant={variant}
            size={120}
          />
          <div className="client-hero-info" style={{ marginLeft: 20 }}>
            <p className="client-hero-id">{client.id}</p>
            <h1 className="serif">
              {client.firstName} {client.lastName}, {age}
            </h1>
            <p className="client-hero-meta">
              {client.currentCity}, {client.currentCountry}
              {client.hometown ? ` · Hometown: ${client.hometown}` : ''}
              <br />
              {client.designation} at {client.currentCompany} · {formatLPA(client.annualIncomeLPA)}
            </p>
            <div className="client-hero-chips">
              <span className="client-hero-chip">{formatLabel(client.maritalStatus)}</span>
              <span className="client-hero-chip">{formatLabel(client.diet)}</span>
              <span className="client-hero-chip">{getStageLabel(client.journeyStage)}</span>
              {client.isNRI ? <span className="client-hero-chip nri">NRI · {client.visaStatus || 'Abroad'}</span> : null}
            </div>
            <div style={{ marginTop: 6 }}>
              <StatusBadge status={client.status} stage={client.journeyStage} />
            </div>
          </div>
        </div>
        <div className="client-hero-actions">
          <button type="button" className="btn-primary" onClick={() => updateStatus('Active')}>
            Set Active
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => updateStatus('Paused')}
            style={{ background: 'var(--grad-gold)' }}
          >
            Pause
          </button>
        </div>
      </div>

      <div className="client-detail-grid">
        <div className="client-detail-left">
          <BiodataPanel client={client} />
          <NotesPanel
            notes={client.notes}
            onAddNote={async (text) => {
              await addNote(text);
              setToast('Note added successfully');
            }}
          />
        </div>

        <div className="client-detail-right">
          <div className="card matches-panel">
            <h3 className="serif">Suggested Matches</h3>
            <p className="matches-panel-desc">
              Run the matching algorithm against the pool. Pool profiles share the same biodata fields as assigned clients.
            </p>
            <button type="button" className="btn-primary" onClick={findMatches} style={{ width: '100%' }}>
              {matchLoading ? 'Finding matches...' : 'Find Matches'}
            </button>
            {matchLoading ? (
              <div style={{ marginTop: 12 }}>
                <Spinner />
              </div>
            ) : null}
            {matchError ? (
              <div style={{ marginTop: 10, fontSize: 12, color: '#842d2d' }}>{matchError}</div>
            ) : null}
          </div>

          {matches.length > 0 ? (
            <MatchResults
              matches={matches}
              onSendMatch={async (candidateId, emailDraft) => {
                await sendMatch(candidateId, emailDraft);
                setToast('Match sent successfully!');
              }}
            />
          ) : null}
        </div>
      </div>

      {toast ? <Toast message={toast} /> : null}
    </div>
  );
}
