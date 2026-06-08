'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Client } from '@/types/client';

export const useClientDetail = (id: string) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);
    api
      .get<Client>(`/clients/${id}`)
      .then((res) => setClient(res.data))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to fetch client';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    await api.patch(`/clients/${id}/status`, { status });
    setClient((prev) => (prev ? { ...prev, status: status as Client['status'] } : prev));
  };

  const addNote = async (text: string) => {
    const res = await api.post<{ note: { text: string; timestamp: string } }>(`/notes/${id}`, {
      text,
    });

    setClient((prev) =>
      prev
        ? {
            ...prev,
            notes: [...prev.notes, res.data.note],
          }
        : prev,
    );
  };

  return { client, loading, error, updateStatus, addNote, setClient };
};
