'use client';

import { useState } from 'react';
import api from '@/lib/api';
import type { Client } from '@/types/client';

export interface MatchResult {
  candidate: Client;
  score: number;
  aiLabel: 'High Potential' | 'Good Match' | 'Possible';
  aiReason: string;
  emailDraft: string;
}

interface BackendMatchResult {
  candidate: Client;
  score: number;
  label: 'High Potential' | 'Good Match' | 'Possible';
  aiInsight?: {
    label: 'High Potential' | 'Good Match' | 'Possible';
    reason: string;
    emailDraft: string;
  };
}

export const useMatches = (clientId: string) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<{ matches: BackendMatchResult[] }>(`/matches/${clientId}`);
      const normalized = res.data.matches.map((match) => ({
        candidate: match.candidate,
        score: match.score,
        aiLabel: match.aiInsight?.label || match.label,
        aiReason: match.aiInsight?.reason || 'Potential compatibility based on profile alignment.',
        emailDraft:
          match.aiInsight?.emailDraft ||
          `Dear client, we found a potential match for you with ${match.candidate.firstName} ${match.candidate.lastName}.`,
      }));

      setMatches(normalized);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch matches';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const sendMatch = async (candidateId: string, emailDraft: string) => {
    await api.post('/matches/send', { clientId, candidateId, emailDraft });
  };

  return { matches, loading, error, findMatches, sendMatch };
};
