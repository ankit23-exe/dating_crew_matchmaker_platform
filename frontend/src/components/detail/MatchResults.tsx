'use client';

import { useState } from 'react';
import type { MatchResult } from '@/hooks/useMatches';
import MatchCard from './MatchCard';
import SendMatchModal from './SendMatchModal';

interface Props {
  matches: MatchResult[];
  onSendMatch: (candidateId: string, emailDraft: string) => Promise<void>;
}

interface ModalState {
  candidateId: string;
  candidateName: string;
  emailDraft: string;
}

export default function MatchResults({ matches, onSendMatch }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null);

  return (
    <section style={{ display: 'grid', gap: 10 }}>
      {matches.map((match, index) => (
        <MatchCard
          key={match.candidate.id}
          match={match}
          rank={index + 1}
          onSend={(candidateId, candidateName, emailDraft) =>
            setModal({ candidateId, candidateName, emailDraft })
          }
        />
      ))}

      {modal ? (
        <SendMatchModal
          candidateId={modal.candidateId}
          candidateName={modal.candidateName}
          emailDraft={modal.emailDraft}
          onConfirm={onSendMatch}
          onClose={() => setModal(null)}
        />
      ) : null}
    </section>
  );
}
