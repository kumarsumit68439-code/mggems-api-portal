'use client';

import { useState, useEffect } from 'react';

export default function BbApiKeyPage() {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');
  const [serverHas, setServerHas] = useState(false);

  useEffect(() => {
    fetch('/api/browserbase/key')
      .then((r) => r.json())
      .then((d) => {
        setServerHas(Boolean(d.hasKey));
        setStatus(d.message || '');
      })
      .catch(() => {});
    const saved = localStorage.getItem('bb_api_key');
    if (saved) setKey(saved);
  }, []);

  async function validate() {
    setResult('Validating with Browserbase servers…');
    try {
      localStorage.setItem('bb_api_key', key.trim());
      const res = await fetch('/api/browserbase/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key.trim() }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      if (data.success) setStatus('Key valid · callback OK');
      else setStatus(data.error || 'Invalid');
    } catch (e: any) {
      setResult(e.message);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ color: 'var(--primary)' }}>API Key</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
        Browserbase production key · server validates with real <code>GET /v1/sessions</code> · callback JSON
        to client
      </p>

      <div className="card">
        <p className="alert alert-info">{status || 'Checking server…'}</p>
        <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          Server env key: {serverHas ? '✓ set' : 'not set'} · You can still paste key below for client-side
          header calls.
        </p>
        <label>Browserbase API Key</label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="bb_… or from browserbase.com settings"
        />
        <button type="button" className="btn" onClick={validate}>
          Validate · Server callback
        </button>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
          Prefer Vercel env <code>BROWSERBASE_API_KEY</code> for production sessions without pasting.
        </p>
      </div>

      <div className="card">
        <h2>Callback response</h2>
        <div className="result-box">{result || '…'}</div>
      </div>

      <p>
        <a href="/browserbase/sessions">→ Sessions</a> · <a href="/browserbase/docs">Docs</a>
      </p>
    </div>
  );
}
