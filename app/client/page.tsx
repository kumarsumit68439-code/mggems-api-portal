'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://school-website-peach-zeta-psi.vercel.app';

type Counts = Record<string, number>;
type Dashboard = {
  success?: boolean;
  error?: string;
  counts?: Counts;
  data?: Record<string, unknown[]>;
  server_time?: string;
  key?: { name?: string; prefix?: string };
};

const TABS = [
  { id: 'notices', label: 'Notices' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'students', label: 'Users' },
  { id: 'sessions', label: 'Logins' },
  { id: 'festivals', label: 'Festivals' },
  { id: 'mistakes', label: 'Mistakes' },
  { id: 'locations', label: 'Locations' },
];

function rowPreview(row: unknown): string {
  if (!row || typeof row !== 'object') return String(row);
  const r = row as Record<string, unknown>;
  const pick =
    r.title ||
    r.student_name ||
    r.name ||
    r.email ||
    r.body ||
    r.class_name ||
    r.id;
  return String(pick ?? JSON.stringify(r).slice(0, 80));
}

export default function ClientPage() {
  const [apiKey, setApiKey] = useState('');
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [tab, setTab] = useState('notices');
  const [auto, setAuto] = useState(true);
  const [lastOk, setLastOk] = useState('');

  useEffect(() => {
    try {
      const rawLs = localStorage.getItem('mggems_api_keys');
      if (rawLs) {
        const list = JSON.parse(rawLs);
        if (list[0]?.key) setApiKey(list[0].key);
      }
      const saved = localStorage.getItem('mggems_client_key');
      if (saved) setApiKey(saved);
    } catch {}
  }, []);

  const loadAll = useCallback(async () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setRaw('Pehle API key paste karo (Generate Key page se).');
      setDash(null);
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      localStorage.setItem('mggems_client_key', apiKey.trim());
      const res = await fetch(`${API_BASE}/api/v1/data?resource=all`, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      const body = await res.json();
      setRaw(JSON.stringify(body, null, 2));
      if (!res.ok || body.success === false) {
        setStatus('error');
        setDash(body);
        return;
      }
      setDash(body);
      setStatus('success');
      setLastOk(new Date().toLocaleTimeString());
    } catch (err: any) {
      setStatus('error');
      setRaw(err.message || 'Request failed');
      setDash(null);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (!auto || !apiKey.trim()) return;
    loadAll();
    const t = setInterval(loadAll, 15000);
    return () => clearInterval(t);
  }, [auto, apiKey, loadAll]);

  const counts = dash?.counts || {};
  const list = (dash?.data?.[tab] as unknown[]) || [];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
        📡 Live School Data
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.25rem' }}>
        School website se real Supabase data — admissions, attendance, notices, users, logins.
        Auto-refresh every 15s when enabled.
      </p>

      <div className="card">
        <label htmlFor="key">API Key (from Generate Key)</label>
        <input
          id="key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="mggems_…"
          autoComplete="off"
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <button type="button" className="btn" disabled={loading} onClick={loadAll}>
            {loading ? 'Loading…' : '🔄 Load live data'}
          </button>
          <label style={{ fontSize: '0.85rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
            Auto refresh (15s)
          </label>
          {lastOk && (
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Last OK: {lastOk}</span>
          )}
          {status === 'success' && <span className="badge">Connected</span>}
          {status === 'error' && (
            <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
              Error
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
          No key? <a href="/keys">Generate API Key</a> ·{' '}
          <a href={`${API_BASE}/api-docs`} target="_blank" rel="noreferrer">
            School API Docs
          </a>
        </p>
      </div>

      {/* Stats */}
      {dash?.counts && (
        <div
          className="grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          {[
            ['notices', 'Notices'],
            ['admissions', 'Admissions'],
            ['attendance', 'Attendance'],
            ['students', 'Users'],
            ['logged_in_24h', 'Logins 24h'],
            ['sessions', 'Sessions'],
            ['festivals', 'Festivals'],
            ['mistakes', 'Mistakes'],
            ['locations', 'Locations'],
            ['api_keys', 'API Keys'],
          ].map(([k, label]) => (
            <div key={k} className="card" style={{ textAlign: 'center', padding: '0.85rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                {counts[k] ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {dash?.server_time && (
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
          Server time: {dash.server_time}
          {dash.key?.name ? ` · Key: ${dash.key.name} (${dash.key.prefix}…)` : ''}
        </p>
      )}

      {/* Tabs */}
      {dash?.data && (
        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="btn"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  opacity: tab === t.id ? 1 : 0.7,
                  background: tab === t.id ? 'var(--primary)' : undefined,
                  color: tab === t.id ? '#fff' : undefined,
                }}
                onClick={() => setTab(t.id)}
              >
                {t.label} ({(dash.data?.[t.id] as unknown[])?.length ?? counts[t.id] ?? 0})
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Is section me abhi koi row nahi (school DB empty / 0).</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '0.5rem' }}>#</th>
                    <th style={{ padding: '0.5rem' }}>Summary</th>
                    <th style={{ padding: '0.5rem' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {list.slice(0, 50).map((row, i) => {
                    const r = row as Record<string, unknown>;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.5rem', verticalAlign: 'top' }}>{i + 1}</td>
                        <td style={{ padding: '0.5rem', verticalAlign: 'top', fontWeight: 600 }}>
                          {rowPreview(row)}
                        </td>
                        <td style={{ padding: '0.5rem', verticalAlign: 'top' }}>
                          <code style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>
                            {JSON.stringify(r).slice(0, 180)}
                            {JSON.stringify(r).length > 180 ? '…' : ''}
                          </code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>
          Raw JSON{' '}
          {status === 'success' && <span className="badge">OK</span>}
          {status === 'error' && (
            <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
              Error
            </span>
          )}
        </h2>
        <div className="result-box">{raw || 'Load live data to see response…'}</div>
      </div>
    </div>
  );
}
