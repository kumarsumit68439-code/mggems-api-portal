'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BrowserbaseApiKeyPage() {
  const [connected, setConnected] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Checking Vercel connection…');
  const [masked, setMasked] = useState('');
  const [name, setName] = useState('My Browser Session');
  const [loading, setLoading] = useState(false);
  const [credential, setCredential] = useState<Record<string, unknown> | null>(null);
  const [callback, setCallback] = useState('');
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
      setCredential(data.credential);
      setConnected(true);
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
        <Link href="/browserbase">Browserbase</Link> / API Key
      </div>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
        API Keys
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: 640 }}>
        Browserbase-style credentials. Master key lives in{' '}
        <strong>Vercel Environment Variables</strong> (<code>BROWSERBASE_API_KEY</code>). Server calls
        real Browserbase endpoints and returns a <strong>session credential</strong> to the client
        (callback) — master key never leaves the server.
      </p>

      {/* Connection status */}
      <div
        className="card"
        style={{
          borderColor: connected ? '#bbf7d0' : '#fde68a',
          background: connected ? '#f0fdf4' : '#fffbeb',
        }}
      >
        <h2 style={{ marginBottom: '0.5rem' }}>
          {connected ? '✓ Connected to Browserbase' : '○ Vercel key status'}
        </h2>
        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{statusMsg}</p>
        {masked && (
          <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.9rem' }}>
            Key: {masked}
          </p>
        )}
        {!connected && (
          <ol style={{ fontSize: '0.85rem', marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>Vercel → mggems-api-portal → Settings → Environment Variables</li>
            <li>
              Name: <code>BROWSERBASE_API_KEY</code> · Value: key from{' '}
              <a href="https://www.browserbase.com/settings" target="_blank" rel="noreferrer">
                browserbase.com/settings
              </a>
            </li>
            <li>Optional: <code>BROWSERBASE_PROJECT_ID</code></li>
            <li>Production + Preview → Save → <strong>Redeploy</strong></li>
          </ol>
        )}
      </div>

      {/* Generate */}
      <div className="card">
        <h2>Generate session credential</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          Server uses Vercel key → <code>POST https://api.browserbase.com/v1/sessions</code> → client
          gets session id + live debugger URLs (working access).
        </p>
        <label>Credential name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Browser Session" />
        <button type="button" className="btn" disabled={loading} onClick={generateCredential}>
          {loading ? 'Creating on Browserbase…' : 'Generate working credential'}
        </button>
        {error && (
          <div className="alert alert-error" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {credential && (
          <div style={{ marginTop: '1.25rem' }}>
            <div className="alert alert-success">Credential created — copy session id / open debugger</div>
            <div className="key-display">{String(credential.session_id)}</div>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Status: {String(credential.status)} · Region: {String(credential.region)}
            </p>
            {credential.debuggerUrl ? (
              <p>
                <a href={String(credential.debuggerUrl)} target="_blank" rel="noreferrer" className="btn">
                  Open live browser
                </a>{' '}
                <a
                  href={String(credential.dashboard)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                >
                  Dashboard
                </a>
              </p>
            ) : null}
            <pre style={{ marginTop: '1rem', fontSize: '0.75rem' }}>
              {JSON.stringify(credential, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Server callback */}
      <div className="card">
        <h2>Server → client callback</h2>
        <div className="result-box">{callback || 'Generate ke baad callback JSON yahan…'}</div>
      </div>

      {/* Endpoints & curl */}
      <div className="card">
        <h2>Browserbase endpoints & commands</h2>
        <pre>{`# Status (portal — uses Vercel key)
curl -s https://mggems-api-portal.vercel.app/api/browserbase/credentials

# Generate session credential (server callback)
curl -s -X POST https://mggems-api-portal.vercel.app/api/browserbase/credentials \\
  -H "Content-Type: application/json" \\
  -d '{"name":"agent-session"}'

# Direct Browserbase (key only on server / your shell)
curl -s https://api.browserbase.com/v1/sessions \\
  -H "x-bb-api-key: $BROWSERBASE_API_KEY"

curl -s -X POST https://api.browserbase.com/v1/sessions \\
  -H "Content-Type: application/json" \\
  -H "x-bb-api-key: $BROWSERBASE_API_KEY" \\
  -d '{}'

# School data (separate mggems key from /keys)
curl -s https://school-website-peach-zeta-psi.vercel.app/api/v1/auth/verify \\
  -H "Authorization: Bearer mggems_YOUR_KEY"`}</pre>
      </div>

      <p style={{ fontSize: '0.9rem' }}>
        <Link href="/browserbase/sessions">Sessions</Link> ·{' '}
        <Link href="/browserbase/docs">Agent setup docs</Link> ·{' '}
        <Link href="/keys">School API key (mggems)</Link>
      </p>
    </div>
  );
}
