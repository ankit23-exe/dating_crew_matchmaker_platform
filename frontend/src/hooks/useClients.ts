'use client';

import { useEffect, useState } from 'react';
import type { Client } from '@/types/client';
import api from '@/lib/api';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Client[]>('/clients')
      .then((res) => setClients(res.data))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to fetch clients';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { clients, loading, error };
};
