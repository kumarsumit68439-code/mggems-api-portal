'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BrowserbaseApiKeyPage() {
  const [connected, setConnected] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Checking Vercel connection…');
  const [masked, setMasked] = useState('');
  const [name, setName] = useState('My Browser Session');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [credential, setCredential] = useState<Record<string, unknown> | null>(null);
  const [callback, setCallback] = useState('');
  const [verifyOut, setVerifyOut] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/browserbase/credentials')
      .then((r) => r.json())
      .then((d) => {
        setConnected(Boolean(d.connected));
        setStatusMsg(d.message || d.error || '');
        setMasked(d.key_masked || '');
      })
      .catch((e) => setStatusMsg(String(e)));
  }, []);

  async function generateCredential() {
    setLoading(true);
    setError('');
    setApiKey('');
    setSessionId('');
    setCredential(null);
    setCallback('');
    try {
      const res = await fetch('/api/browserbase/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'portal-session' }),
      });
      const data = await res.json();
      setCallback(JSON.stringify(data.callback || data, null, 2));
      if (!data.success) {
        setError(data.error || data.hint || 'Failed');
        return;
      }
      const k = data.api_key || data.key || data.credential?.api_key || '';
      setApiKey(k);
      setSessionId(data.session_id || data.credential?.session_id || '');
      setCredential(data.credential || data);
      setConnected(true);
      if (k) localStorage.setItem('bbsess_api_key', k);
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  async function verifyKey() {
    const k = apiKey || localStorage.getItem('bbsess_api_key') || '';
    if (!k) {
      setVerifyOut('No api key');
      return;
    }
    const res = await fetch('/api/browserbase/credentials/verify', {
      headers: { Authorization: `Bearer ${k}` },
    });
    setVerifyOut(JSON.stringify(await res.json(), null, 2));
  }

  async function loadSession() {
    const k = apiKey || localStorage.getItem('bbsess_api_key') || '';
    if (!k) {
      setVerifyOut('No api key');
      return;
    }
    const res = await fetch('/api/browserbase/credentials/session', {
      headers: { Authorization: `Bearer ${k}` },
    });
    setVerifyOut(JSON.stringify(await res.json(), null, 2));
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
        <Link href="/browserbase">Browserbase</Link> / API Key
      </div>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>API Keys</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: 640 }}>
        Generate <strong>session id + browser-style API key</strong> (<code>bbsess_…</code>). Master key stays on
        Vercel. Client gets key once via server callback.
      </p>

      <div
        className="card"
        style={{
          borderColor: connected ? '#bbf7d0' : '#fde68a',
          background: connected ? '#f0fdf4' : '#fffbeb',
        }}
      >
        <h2>{connected ? '✓ Browserbase connected' : '○ Vercel key'}</h2>
        <p style={{ fontSize: '0.9rem' }}>{statusMsg}</p>
        {masked && (
          <p style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>Master (masked): {masked}</p>
        )}
      </div>

      <div className="card">
        <h2>Generate session + API key</h2>
        <label>Name (label only)</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" className="btn" disabled={loading} onClick={generateCredential}>
          {loading ? 'Creating…' : 'Generate session + API key'}
        </button>
        {error && (
          <div className="alert alert-error" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {apiKey && (
          <div style={{ marginTop: '1.25rem' }}>
            <div className="alert alert-success">
              Copy API key now — use as Bearer token with verify / session endpoints
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Session ID</p>
            <div className="key-display" style={{ fontSize: '0.85rem' }}>
              {sessionId}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>API Key (bbsess_…)</p>
            <div className="key-display">{apiKey}</div>
            <button type="button" className="btn" onClick={() => navigator.clipboard.writeText(apiKey)}>
              Copy API key
            </button>{' '}
            <button type="button" className="btn btn-secondary" onClick={verifyKey}>
              Verify key
            </button>{' '}
            <button type="button" className="btn btn-secondary" onClick={loadSession}>
              Load session
            </button>
            {credential?.debuggerUrl ? (
              <p style={{ marginTop: '0.75rem' }}>
                <a href={String(credential.debuggerUrl)} target="_blank" rel="noreferrer">
                  Open live browser →
                </a>
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Server callback</h2>
        <div className="result-box">{callback || '…'}</div>
      </div>

      <div className="card">
        <h2>Verify / session response</h2>
        <div className="result-box">{verifyOut || 'Verify or Load session dabao…'}</div>
      </div>

      <div className="card">
        <h2>Endpoints</h2>
        <pre>{`# Create session + API key
curl -s -X POST https://mggems-api-portal.vercel.app/api/browserbase/credentials \\
  -H "Content-Type: application/json" -d '{"name":"agent"}'

# Verify API key
curl -s https://mggems-api-portal.vercel.app/api/browserbase/credentials/verify \\
  -H "Authorization: Bearer bbsess_YOUR_KEY"

# Resolve session (debugger etc.)
curl -s https://mggems-api-portal.vercel.app/api/browserbase/credentials/session \\
  -H "Authorization: Bearer bbsess_YOUR_KEY"`}</pre>
      </div>
    </div>
  );
}
