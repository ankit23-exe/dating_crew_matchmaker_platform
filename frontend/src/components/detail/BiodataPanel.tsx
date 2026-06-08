import type { Client } from '@/types/client';
import { displayValue, formatHeight, formatLabel } from '@/lib/formatClient';
import { calcAge, formatLPA, getStageLabel } from '@/lib/utils';
import ProfileField from './ProfileField';

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="profile-section">
      <h3 className="serif profile-section-title">{title}</h3>
      <div className="profile-section-grid">{children}</div>
    </section>
  );
}

export default function BiodataPanel({ client }: { client: Client }) {
  const age = client.age ?? calcAge(client.dateOfBirth);

  return (
    <div className="profile-panel card">
      <ProfileSection title="Identity & Contact">
        <ProfileField label="Full Name" value={`${client.firstName} ${client.lastName}`} />
        <ProfileField label="Gender" value={formatLabel(client.gender)} />
        <ProfileField label="Age" value={`${age} years`} />
        <ProfileField
          label="Date of Birth"
          value={new Date(client.dateOfBirth).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        />
        <ProfileField label="Marital Status" value={formatLabel(client.maritalStatus)} />
        <ProfileField label="Email" value={client.email} />
        <ProfileField label="Phone" value={client.phone} />
      </ProfileSection>

      <ProfileSection title="Location & Mobility">
        <ProfileField label="Current City" value={client.currentCity} />
        <ProfileField label="Current Country" value={client.currentCountry} />
        <ProfileField label="Hometown" value={displayValue(client.hometown)} />
        <ProfileField label="NRI" value={client.isNRI ? 'Yes' : 'No'} />
        <ProfileField label="Visa Status" value={displayValue(client.visaStatus)} />
        <ProfileField label="Open to Relocate" value={formatLabel(client.openToRelocate)} />
      </ProfileSection>

      <ProfileSection title="Physical">
        <ProfileField label="Height" value={formatHeight(client.heightCm)} />
        <ProfileField label="Blood Group" value={displayValue(client.bloodGroup)} />
      </ProfileSection>

      <ProfileSection title="Education & Career">
        <ProfileField label="Undergrad College" value={client.undergradCollege} />
        <ProfileField label="Highest Degree" value={client.highestDegree} />
        <ProfileField label="Current Company" value={client.currentCompany} />
        <ProfileField label="Designation" value={client.designation} />
        <ProfileField label="Profession" value={formatLabel(client.professionCategory)} />
        <ProfileField label="Annual Income" value={formatLPA(client.annualIncomeLPA)} />
      </ProfileSection>

      <ProfileSection title="Family">
        <ProfileField label="Siblings" value={String(client.siblings)} />
        <ProfileField label="Family Type" value={displayValue(client.familyType && formatLabel(client.familyType))} />
        <ProfileField label="Father's Occupation" value={displayValue(client.fatherOccupation)} />
        <ProfileField label="Mother's Occupation" value={displayValue(client.motherOccupation)} />
      </ProfileSection>

      <ProfileSection title="Cultural Identity">
        <ProfileField label="Religion" value={client.religion} />
        <ProfileField label="Caste" value={displayValue(client.caste)} />
        <ProfileField label="Mother Tongue" value={displayValue(client.motherTongue)} />
        <ProfileField
          label="Languages Known"
          value={client.languagesKnown.length ? client.languagesKnown.join(', ') : 'Not provided'}
          fullWidth
        />
        <ProfileField label="Gotra" value={displayValue(client.gotra)} />
        <ProfileField label="Manglik Status" value={displayValue(client.manglikStatus && formatLabel(client.manglikStatus))} />
        <ProfileField label="Nakshatra" value={displayValue(client.nakshatra)} />
      </ProfileSection>

      <ProfileSection title="Values & Lifestyle">
        <ProfileField label="Wants Kids" value={formatLabel(client.wantKids)} />
        <ProfileField label="Open to Pets" value={client.openToPets ? 'Yes' : 'No'} />
        <ProfileField label="Diet" value={formatLabel(client.diet)} />
        <ProfileField label="Drinking" value={formatLabel(client.drinking)} />
        <ProfileField label="Smoking" value={formatLabel(client.smoking)} />
        <div className="profile-field full">
          <span className="profile-field-label">Personality Tags</span>
          <div className="profile-tags">
            {client.personalityTags.length ? (
              client.personalityTags.map((tag) => (
                <span key={tag} className="profile-tag">
                  {tag}
                </span>
              ))
            ) : (
              <span className="profile-field-value muted">Not provided</span>
            )}
          </div>
        </div>
      </ProfileSection>

      <ProfileSection title="Partner Preferences">
        <ProfileField label="Preferred Age Min" value={displayValue(client.partnerAgeMin)} />
        <ProfileField label="Preferred Age Max" value={displayValue(client.partnerAgeMax)} />
      </ProfileSection>

      <ProfileSection title="Matchmaker Desk">
        <ProfileField label="Client Type" value={formatLabel(client.clientType)} />
        <ProfileField label="Journey Stage" value={getStageLabel(client.journeyStage)} />
        <ProfileField label="CRM Status" value={client.status} />
        <ProfileField label="Notes on File" value={String(client.notes.length)} />
        <ProfileField label="Matches Sent" value={String(client.matchesSent.length)} />
      </ProfileSection>

      {client.matchesSent.length > 0 ? (
        <section className="profile-section">
          <h3 className="serif profile-section-title">Match History</h3>
          <div className="profile-match-history">
            {client.matchesSent.map((match) => (
              <div key={`${match.candidateId}-${match.sentDate}`} className="profile-match-row">
                <div>
                  <span className="profile-match-id">{match.candidateId}</span>
                  <span className="profile-match-date">
                    {new Date(match.sentDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <span className={`profile-match-outcome ${match.outcome}`}>
                  {formatLabel(match.outcome)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
