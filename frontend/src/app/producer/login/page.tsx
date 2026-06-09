'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export default function ProducerLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/producer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/producer');
        router.refresh();
      } else {
        setError('Incorrect password.');
      }
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          background: 'var(--glass)',
          border: '1px solid var(--glass-border)',
          borderRadius: 20,
          padding: 32,
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent-400)',
              marginBottom: 8,
              fontFamily: 'var(--font-mono)',
            }}
          >
            Producer access
          </div>
          <h1 style={{ fontSize: 22, color: 'var(--ink-50)', margin: 0, fontWeight: 600 }}>
            Sign in to Studio
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: 12, color: 'var(--ink-400)', marginBottom: 6 }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.28)',
                border: `1px solid ${error ? '#f87171' : 'var(--glass-border)'}`,
                borderRadius: 10,
                color: 'var(--ink-50)',
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && <div style={{ fontSize: 13, color: '#f87171' }}>{error}</div>}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              padding: '10px 20px',
              background:
                loading || !password ? 'rgba(255,255,255,0.07)' : 'var(--accent-500)',
              color:
                loading || !password ? 'var(--ink-500)' : 'var(--bg-950)',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
