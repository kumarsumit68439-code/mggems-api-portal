'use client';

import { useState } from 'react';

export default function SessionsPage() {
  const [key, setKey] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('bb_api_key') || '' : ''
  );
  const [list, setList] = useState<any[]>([]);
  const [created, setCreated] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      if (key) localStorage.setItem('bb_api_key', key);
      const res = await fetch('/api/browserbase/sessions', {
        headers: key ? { 'x-browserbase-key': key } : {},
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');
      setList(data.sessions || []);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    setLoading(true);
    setErr('');
    setCreated('');
    try {
      const res = await fetch('/api/browserbase/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { 'x-browserbase-key': key } : {}),
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setCreated(JSON.stringify(data, null, 2));
      if (!data.success) setErr(data.error || 'Create failed');
      else load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ color: 'var(--primary)' }}>Sessions</h1>
      <p style={{ color: 'var(--muted)' }}>Real Browserbase sessions API · list + create</p>

      <div className="card">
        <label>Browserbase API Key (optional if server env set)</label>
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="bb_…" type="password" />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn" disabled={loading} onClick={load}>
            List sessions
          </button>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={create}>
            Create session
          </button>
        </div>
        {err && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{err}</div>}
      </div>

      <div className="card">
        <h2>Sessions ({list.length})</h2>
        {list.length === 0 && <p style={{ color: 'var(--muted)' }}>No sessions loaded yet.</p>}
        <ul style={{ fontSize: '0.85rem' }}>
          {list.slice(0, 20).map((s: any) => (
            <li key={s.id} style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <strong>{s.id}</strong> · {s.status} · {s.region}
              {s.id && (
                <>
                  {' '}
                  <a href={`https://www.browserbase.com/sessions/${s.id}`} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {created && (
        <div className="card">
          <h2>Create callback</h2>
          <div className="result-box">{created}</div>
        </div>
      )}
    </div>
  );
}
