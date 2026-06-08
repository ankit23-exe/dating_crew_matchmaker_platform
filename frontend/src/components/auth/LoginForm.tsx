'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('matchmaker@thedatecrew.com');
  const [password, setPassword] = useState('tdc2024');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/login', {
        email: email.trim(),
        password,
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
      ) {
        setError((err as { response: { data: { error: string } } }).response.data.error);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card" style={{ width: '100%', maxWidth: 420, padding: 24 }}>
      <h2 className="serif" style={{ fontSize: 28, margin: 0 }}>Matchmaker Login</h2>
      <p style={{ marginTop: 6, marginBottom: 18, fontSize: 12, color: 'var(--text-muted)' }}>
        Sign in to access your assigned clients and matching workflow.
      </p>

      <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Email</label>
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label style={{ display: 'block', fontSize: 12, marginTop: 12, marginBottom: 6 }}>Password</label>
      <input
        className="input"
        value={password}
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      {error ? (
        <div
          style={{
            marginTop: 12,
            borderRadius: 8,
            background: '#f8eaea',
            border: '1px solid #efcece',
            color: '#842d2d',
            padding: '8px 10px',
            fontSize: 12,
          }}
        >
          {error}
        </div>
      ) : null}

      <button className="btn-primary" type="submit" style={{ width: '100%', marginTop: 16 }}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
