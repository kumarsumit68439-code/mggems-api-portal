'use client';

import { useState, useEffect } from 'react';

const API_BASE = 'https://school-website-peach-zeta-psi.vercel.app';

const ENDPOINTS = [
  { id: 'verify', label: 'Verify Key', method: 'GET', path: '/api/v1/auth/verify' },
  { id: 'notices', label: 'Notices', method: 'GET', path: '/api/v1/notices' },
  { id: 'admissions', label: 'Admissions', method: 'GET', path: '/api/v1/admissions' },
  { id: 'attendance', label: 'Attendance', method: 'GET', path: '/api/v1/attendance' },
];

export default function ClientPage() {
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState('Results will appear here…');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mggems_api_keys');
      if (raw) {
        const list = JSON.parse(raw);
        if (list[0]?.key) setApiKey(list[0].key);
      }
    } catch {}
  }, []);

  async function call(path: string, method: string = 'GET') {
    if (!apiKey.trim()) {
      setResult('Please enter an API key first. Generate one on /keys');
      setStatus('error');
      return;
    }
    setLoading(true);
    setStatus('');
    setResult('Loading…');
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
      });
      const text = await res.text();
      let body: unknown;
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
      setResult(JSON.stringify(body, null, 2));
      setStatus(res.ok ? 'success' : 'error');
    } catch (err: any) {
      setResult(
        (err.message || 'Request failed') +
          '\n\nIf CORS error: school API must send Access-Control-Allow-Origin: *'
      );
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
        🔌 API Client
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Calls school API at <code>{API_BASE}</code> with Bearer token. No school login required.
      </p>

      <div className="card">
        <label htmlFor="key">API Key (Bearer)</label>
        <input
          id="key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="mggems_…"
          autoComplete="off"
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {ENDPOINTS.map((ep) => (
            <button
              key={ep.id}
              type="button"
              className="btn"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              disabled={loading}
              onClick={() => call(ep.path, ep.method)}
            >
              {ep.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          No key? <a href="/keys">Generate API Key</a> · <a href="/docs">Docs</a> ·{' '}
          <a href={`${API_BASE}/api-docs`} target="_blank" rel="noreferrer">
            School API Docs
          </a>
        </p>
      </div>

      <div className="card">
        <h2>
          Response{' '}
          {status === 'success' && <span className="badge">OK</span>}
          {status === 'error' && (
            <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
              Error
            </span>
          )}
        </h2>
        <div className="result-box">{result}</div>
      </div>
    </div>
  );
}
