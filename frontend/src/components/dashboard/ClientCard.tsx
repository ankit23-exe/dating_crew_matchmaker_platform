'use client';

import { useRouter } from 'next/navigation';
import type { Client } from '@/types/client';
import { ProfileRing } from '@/components/ui/ProfileRing';
import { calcAge, formatLPA, getStageLabel, getStatusColor, getStatusTextColor } from '@/lib/utils';

const formatMarital = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatDiet = (diet: string) => {
  if (diet === 'non-veg') return 'Non-veg';
  return diet.charAt(0).toUpperCase() + diet.slice(1);
};

const SignalChip = ({ label, verified }: { label: string; verified: boolean }) => (
  <div className={`dash-signal-chip${verified ? ' verified' : ''}`}>
    {verified ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <span className="dash-signal-dot" />
    )}
    {label}
  </div>
);

export default function ClientCard({ client }: { client: Client }) {
  const router = useRouter();
  const age = client.age ?? calcAge(client.dateOfBirth);
  const variant = client.gender === 'female' ? 'gold' : 'rose';

  const signals = [
    { label: 'Income', verified: client.annualIncomeLPA > 0 },
    { label: 'Education', verified: Boolean(client.highestDegree) },
    { label: 'Family', verified: Boolean(client.familyType) },
    { label: 'Notes', verified: client.notes.length > 0 },
  ];

  return (
    <article className="dash-client-card">
      <div className="dash-card-header">
        <div className="dash-card-identity">
          <ProfileRing
            firstName={client.firstName}
            lastName={client.lastName}
            seed={client.id}
            variant={variant}
            size={48}
          />
          <div>
            <h3 className="serif dash-card-name">
              {client.firstName} {client.lastName}, {age}
            </h3>
            <p className="dash-card-meta">
              {client.currentCity}
              {client.isNRI ? ` · ${client.currentCountry}` : ''}
              {' · '}
              {formatMarital(client.maritalStatus)}
            </p>
          </div>
        </div>
        <span
          className="dash-status-badge"
          style={{
            background: getStatusColor(client.status),
            color: getStatusTextColor(client.status),
          }}
        >
          {getStageLabel(client.journeyStage)}
        </span>
      </div>

      <div className="dash-card-section">
        <p className="dash-section-label">Key Signals</p>
        <div className="dash-signal-row">
          {signals.map((s) => (
            <SignalChip key={s.label} label={s.label} verified={s.verified} />
          ))}
        </div>
      </div>

      <div className="dash-card-section">
        <p className="dash-section-label">Match Preferences</p>
        <p className="dash-prefs-line">
          Kids: <strong>{client.wantKids.charAt(0).toUpperCase() + client.wantKids.slice(1)}</strong>
          {' · '}
          Relocate: <strong>{client.openToRelocate.charAt(0).toUpperCase() + client.openToRelocate.slice(1)}</strong>
          {' · '}
          Pets: <strong>{client.openToPets ? 'Yes' : 'No'}</strong>
          {' · '}
          Diet: <strong>{formatDiet(client.diet)}</strong>
        </p>
        <p className="dash-prefs-sub">
          {formatLPA(client.annualIncomeLPA)} · {client.highestDegree} · {client.currentCompany}
        </p>
      </div>

      <button
        type="button"
        className="dash-view-btn"
        onClick={() => router.push(`/client/${client.id}`)}
      >
        View Full Profile
      </button>
    </article>
  );
}
