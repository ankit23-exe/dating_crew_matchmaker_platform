import type { MatchResult } from '@/hooks/useMatches';
import { ProfileRing } from '@/components/ui/ProfileRing';
import { calcAge, formatLPA } from '@/lib/utils';

const LABEL_STYLES = {
  'High Potential': { bg: '#E8F4EC', color: '#2D6B40', dot: '#4CAF72' },
  'Good Match': { bg: '#FBF4E8', color: '#8A6020', dot: '#C4A96D' },
  Possible: { bg: '#F0F0EE', color: '#5A5A55', dot: '#999' },
};

interface Props {
  match: MatchResult;
  rank: number;
  onSend: (candidateId: string, candidateName: string, emailDraft: string) => void;
}

export default function MatchCard({ match, rank, onSend }: Props) {
  const { candidate, score, aiLabel, aiReason, emailDraft } = match;
  const style = LABEL_STYLES[aiLabel];
  const age = candidate.age ?? calcAge(candidate.dateOfBirth);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ height: 3, background: 'var(--cream-dark)', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${score}%`,
            background:
              score >= 75
                ? 'linear-gradient(90deg,#4CAF72,#2D6B40)'
                : score >= 50
                  ? 'linear-gradient(90deg,#C4A96D,#A0714F)'
                  : 'linear-gradient(90deg,#C9956A,#6B2D3E)',
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <ProfileRing
              firstName={candidate.firstName}
              lastName={candidate.lastName}
              seed={candidate.id}
              variant={candidate.gender === 'female' ? 'gold' : 'rose'}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--sidebar-bg)',
                color: 'var(--sidebar-text)',
                fontSize: 9,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid var(--warm-white)',
              }}
            >
              #{rank}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="serif" style={{ fontSize: 17, fontWeight: 500 }}>
                {candidate.firstName} {candidate.lastName}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 500,
                  background: style.bg,
                  color: style.color,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: style.dot,
                    display: 'inline-block',
                  }}
                />
                {aiLabel}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
              {age} · {candidate.currentCity}
              {candidate.isNRI && <span style={{ color: 'var(--gold)' }}> · NRI</span>}
              {' · '}
              {candidate.designation}
            </div>
          </div>

          <div
            className="serif"
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: score >= 75 ? '#2D6B40' : score >= 50 ? '#8A6020' : 'var(--rose-deep)',
              minWidth: 40,
              textAlign: 'right',
            }}
          >
            {score}
          </div>
        </div>

        <div
          style={{
            background: 'var(--cream)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            fontStyle: 'italic',
            marginBottom: 12,
          }}
        >
          "{aiReason}"
        </div>

        <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
          {[
            { label: 'Kids', value: candidate.wantKids },
            { label: 'Relocate', value: candidate.openToRelocate },
            { label: 'Income', value: formatLPA(candidate.annualIncomeLPA) },
            { label: 'Religion', value: candidate.religion },
          ].map(({ label, value }) => (
            <div key={label}>
              <div
                style={{
                  fontSize: 9,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>
                {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onSend(candidate.id, `${candidate.firstName} ${candidate.lastName}`, emailDraft)}
          className="btn-primary"
          style={{ width: '100%', borderRadius: 8, letterSpacing: '.02em' }}
        >
          Send Match →
        </button>
      </div>
    </div>
  );
}
