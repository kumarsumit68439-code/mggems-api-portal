'use client';

import { useState } from 'react';

const SCHOOL = 'https://school-website-peach-zeta-psi.vercel.app';

export default function FetchPage() {
  const [url, setUrl] = useState(`${SCHOOL}/api/v1/auth/verify`);
  const [bearer, setBearer] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch('/api/browserbase/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, bearer: bearer || undefined, method: 'GET' }),
      });
      const data = await res.json();
      setOut(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setOut(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ color: 'var(--primary)' }}>Fetch</h1>
      <p style={{ color: 'var(--muted)' }}>Server-side fetch test · school API or any URL</p>
      <div className="card">
        <label>URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
        <label>Bearer (school mggems key, optional)</label>
        <input value={bearer} onChange={(e) => setBearer(e.target.value)} placeholder="mggems_…" />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setUrl(`${SCHOOL}/api/v1/notices`)}
          >
            Notices
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setUrl(`${SCHOOL}/api/v1/data?resource=all`)}
          >
            Live data
          </button>
          <button type="button" className="btn" disabled={loading} onClick={run}>
            {loading ? '…' : 'Fetch'}
          </button>
        </div>
        <div className="result-box">{out || 'Result…'}</div>
      </div>
    </div>
  );
}
