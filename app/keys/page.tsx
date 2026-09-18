'use client';

import { useState, useEffect } from 'react';

const API_BASE = 'https://school-website-peach-zeta-psi.vercel.app';

interface StoredKey {
  name: string;
  key: string;
  email?: string;
  createdAt: string;
}

export default function KeysPage() {
  const [name, setName] = useState('My School App');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newKey, setNewKey] = useState('');
  const [keys, setKeys] = useState<StoredKey[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mggems_api_keys');
      if (raw) setKeys(JSON.parse(raw));
    } catch {}
  }, []);

  function saveKeys(list: StoredKey[]) {
    setKeys(list);
    localStorage.setItem('mggems_api_keys', JSON.stringify(list));
  }

  async function generateKey(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNewKey('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/keys/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      // Support common response shapes
      const keyValue =
        data.key ||
        data.api_key ||
        data.apiKey ||
        data.token ||
        data.data?.key ||
        data.data?.api_key ||
        '';

      if (!keyValue) {
        throw new Error('Key create succeeded but no key returned. Check school API response.');
      }

      setNewKey(keyValue);

      const entry: StoredKey = {
        name: name.trim(),
        key: keyValue,
        email: email.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      saveKeys([entry, ...keys]);
    } catch (err: any) {
      setError(err.message || 'Failed to create key. School API may be offline or require auth.');
    } finally {
      setLoading(false);
    }
  }

  function copyKey(k: string) {
    navigator.clipboard.writeText(k);
  }

  function removeKey(idx: number) {
    const next = keys.filter((_, i) => i !== idx);
    saveKeys(next);
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
        🔑 Generate API Key
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Create a Bearer token for the MGGEMS school API. Keys are created on the school backend
        (Supabase + Firebase). Raw key is shown only once — copy it now.
      </p>

      <div className="card">
        <h2>Create new key</h2>
        <form onSubmit={generateKey}>
          <label htmlFor="name">Key name *</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My School App"
            required
          />
          <label htmlFor="email">Your email (optional)</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
          />
          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? 'Generating…' : 'Generate API Key'}
          </button>
        </form>

        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

        {newKey && (
          <div style={{ marginTop: '1.25rem' }}>
            <div className="alert alert-success">
              Key created successfully. Copy it now — it will not be shown again in full on the server.
            </div>
            <div className="key-display">{newKey}</div>
            <button type="button" className="btn" onClick={() => copyKey(newKey)}>
              Copy Key
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Your keys (this browser)</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          Stored only in your browser localStorage. Not synced to any server from this portal.
        </p>
        {keys.length === 0 && <p style={{ color: 'var(--muted)' }}>No keys yet.</p>}
        {keys.map((k, i) => (
          <div
            key={i}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '0.85rem',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong>{k.name}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {new Date(k.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="key-display" style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>
              {k.key.slice(0, 12)}…{k.key.slice(-6)}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }} onClick={() => copyKey(k.key)}>
                Copy full key
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                onClick={() => removeKey(i)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center' }}>
        <a href="/docs">→ Full API Documentation</a>
      </p>
    </div>
  );
}