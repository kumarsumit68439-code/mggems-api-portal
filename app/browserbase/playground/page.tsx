'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const PORTAL = 'https://mggems-api-portal.vercel.app';
const SCHOOL = 'https://school-website-peach-zeta-psi.vercel.app';

type LogItem = {
  t: string;
  label: string;
  ok: boolean;
  data: unknown;
};

export default function PlaygroundPage() {
  const [bbKey, setBbKey] = useState('');
  const [schoolKey, setSchoolKey] = useState('');
  const [base, setBase] = useState<'portal' | 'school'>('portal');
  const [endpoint, setEndpoint] = useState('verify_bb');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [lastCallback, setLastCallback] = useState('');
  const [raw, setRaw] = useState('');

  useEffect(() => {
    try {
      const b = localStorage.getItem('bbsess_api_key');
      if (b) setBbKey(b);
      const s = localStorage.getItem('mggems_client_key');
      if (s) setSchoolKey(s);
      const rawLs = localStorage.getItem('mggems_api_keys');
      if (rawLs && !s) {
        const list = JSON.parse(rawLs);
        if (list[0]?.key) setSchoolKey(list[0].key);
      }
    } catch {}
  }, []);

  const pushLog = useCallback((label: string, ok: boolean, data: unknown) => {
    setLogs((prev) =>
      [{ t: new Date().toLocaleTimeString(), label, ok, data }, ...prev].slice(0, 20)
    );
  }, []);

  /** Client callback invoked after every server response */
  function onServerCallback(label: string, res: Response, body: any) {
    const cb = body?.callback || {
      type: 'response',
      status: res.status,
      ok: res.ok,
      endpoint: label,
    };
    setLastCallback(JSON.stringify(cb, null, 2));
    pushLog(label, res.ok && body?.success !== false, body);
    // Optional: custom client hook
    if (typeof window !== 'undefined') {
      (window as any).__mggems_last_callback = cb;
      window.dispatchEvent(new CustomEvent('mggems-callback', { detail: cb }));
    }
    return cb;
  }

  async function serverCall(
    label: string,
    url: string,
    opts: { method?: string; bearer?: string; body?: unknown } = {}
  ) {
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (opts.bearer) headers.Authorization = `Bearer ${opts.bearer}`;

      const res = await fetch(url, {
        method: opts.method || 'GET',
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        cache: 'no-store',
      });
      const body = await res.json().catch(() => ({ error: 'Non-JSON' }));
      setRaw(JSON.stringify(body, null, 2));
      onServerCallback(label, res, body);
      return body;
    } catch (e: any) {
      const err = { success: false, error: e.message };
      setRaw(JSON.stringify(err, null, 2));
      pushLog(label, false, err);
      setLastCallback(JSON.stringify({ type: 'network_error', error: e.message }, null, 2));
      return err;
    } finally {
      setLoading(false);
    }
  }

  const endpoints: Record<
    string,
    { label: string; run: () => Promise<unknown>; hint: string }
  > = {
    verify_bb: {
      label: 'BB Verify key',
      hint: 'GET /api/browserbase/credentials/verify · Bearer bbsess_',
      run: () =>
        serverCall(
          'bb_verify',
          `${PORTAL}/api/browserbase/credentials/verify`,
          { bearer: bbKey }
        ),
    },
    session_bb: {
      label: 'BB Session details',
      hint: 'GET /api/browserbase/credentials/session',
      run: () =>
        serverCall(
          'bb_session',
          `${PORTAL}/api/browserbase/credentials/session`,
          { bearer: bbKey }
        ),
    },
    create_bb: {
      label: 'BB Create session+key',
      hint: 'POST /api/browserbase/credentials',
      run: async () => {
        const body = await serverCall('bb_create', `${PORTAL}/api/browserbase/credentials`, {
          method: 'POST',
          body: { name: 'playground' },
        });
        if (body?.api_key || body?.key) {
          const k = body.api_key || body.key;
          setBbKey(k);
          localStorage.setItem('bbsess_api_key', k);
        }
        return body;
      },
    },
    status_bb: {
      label: 'BB Connection status',
      hint: 'GET /api/browserbase/credentials',
      run: () => serverCall('bb_status', `${PORTAL}/api/browserbase/credentials`),
    },
    list_sessions: {
      label: 'BB List sessions',
      hint: 'GET /api/browserbase/sessions',
      run: () => serverCall('bb_list', `${PORTAL}/api/browserbase/sessions`),
    },
    school_verify: {
      label: 'School Verify',
      hint: 'GET /api/v1/auth/verify',
      run: () => {
        const root = base === 'portal' ? PORTAL : SCHOOL;
        return serverCall('school_verify', `${root}/api/v1/auth/verify`, {
          bearer: schoolKey,
        });
      },
    },
    school_notices: {
      label: 'School Notices',
      hint: 'GET /api/v1/notices',
      run: () => {
        const root = base === 'portal' ? PORTAL : SCHOOL;
        return serverCall('school_notices', `${root}/api/v1/notices`, {
          bearer: schoolKey,
        });
      },
    },
    school_data: {
      label: 'School Live data',
      hint: 'GET /api/v1/data?resource=all',
      run: () => {
        const root = base === 'portal' ? PORTAL : SCHOOL;
        return serverCall('school_data', `${root}/api/v1/data?resource=all`, {
          bearer: schoolKey,
        });
      },
    },
    school_admissions: {
      label: 'School Admissions',
      hint: 'GET /api/v1/admissions',
      run: () => {
        const root = base === 'portal' ? PORTAL : SCHOOL;
        return serverCall('school_admissions', `${root}/api/v1/admissions`, {
          bearer: schoolKey,
        });
      },
    },
    school_attendance: {
      label: 'School Attendance',
      hint: 'GET /api/v1/attendance',
      run: () => {
        const root = base === 'portal' ? PORTAL : SCHOOL;
        return serverCall('school_attendance', `${root}/api/v1/attendance`, {
          bearer: schoolKey,
        });
      },
    },
    portal_index: {
      label: 'Portal /api/v1 index',
      hint: 'GET /api/v1',
      run: () => serverCall('portal_index', `${PORTAL}/api/v1`),
    },
  };

  async function runSelected() {
    const ep = endpoints[endpoint];
    if (!ep) return;
    if (endpoint.startsWith('school_') && !schoolKey.trim()) {
      setRaw(JSON.stringify({ error: 'School mggems_ key required' }, null, 2));
      return;
    }
    if ((endpoint === 'verify_bb' || endpoint === 'session_bb') && !bbKey.trim()) {
      setRaw(JSON.stringify({ error: 'bbsess_ key required — create or paste' }, null, 2));
      return;
    }
    await ep.run();
  }

  async function runAllBb() {
    await endpoints.status_bb.run();
    if (bbKey) {
      await endpoints.verify_bb.run();
      await endpoints.session_bb.run();
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2.5rem' }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>
        <Link href="/browserbase">Browserbase</Link> / Playground
      </div>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Playground</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.25rem' }}>
        Endpoints connect · server call · client callback — Browserbase <code>bbsess_</code> + School{' '}
        <code>mggems_</code>
      </p>

      <div className="card">
        <h2>Keys</h2>
        <label>Browser session API key (bbsess_…)</label>
        <input
          value={bbKey}
          onChange={(e) => {
            setBbKey(e.target.value);
            localStorage.setItem('bbsess_api_key', e.target.value);
          }}
          placeholder="bbsess_… from API Key page"
        />
        <label>School API key (mggems_…)</label>
        <input
          value={schoolKey}
          onChange={(e) => {
            setSchoolKey(e.target.value);
            localStorage.setItem('mggems_client_key', e.target.value);
          }}
          placeholder="mggems_… from /keys"
        />
        <label>School base for data calls</label>
        <select value={base} onChange={(e) => setBase(e.target.value as 'portal' | 'school')}>
          <option value="portal">Portal proxy</option>
          <option value="school">School direct</option>
        </select>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          No key?{' '}
          <Link href="/browserbase/api-key">Generate bbsess_</Link> · <Link href="/keys">Generate mggems_</Link>
        </p>
      </div>

      <div className="card">
        <h2>Endpoint</h2>
        <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)}>
          {Object.entries(endpoints).map(([id, ep]) => (
            <option key={id} value={id}>
              {ep.label}
            </option>
          ))}
        </select>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
          {endpoints[endpoint]?.hint}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button type="button" className="btn" disabled={loading} onClick={runSelected}>
            {loading ? 'Calling…' : 'Run server call'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={runAllBb}>
            Run BB chain
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => endpoints.create_bb.run()}
          >
            Create session+key
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Client callback</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
            <code>onServerCallback</code> · <code>window.__mggems_last_callback</code> · event{' '}
            <code>mggems-callback</code>
          </p>
          <div className="result-box">{lastCallback || 'Run ke baad callback…'}</div>
        </div>
        <div className="card">
          <h2>Raw response</h2>
          <div className="result-box">{raw || '…'}</div>
        </div>
      </div>

      <div className="card">
        <h2>Call log</h2>
        {logs.length === 0 && <p style={{ color: 'var(--muted)' }}>No calls yet</p>}
        <ul style={{ fontSize: '0.85rem', listStyle: 'none' }}>
          {logs.map((l, i) => (
            <li
              key={i}
              style={{
                padding: '0.4rem 0',
                borderBottom: '1px solid var(--border)',
                color: l.ok ? 'var(--success)' : 'var(--danger)',
              }}
            >
              [{l.t}] {l.ok ? '✓' : '✗'} {l.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Client callback example (copy)</h2>
        <pre>{`// Browser console / your app
window.addEventListener('mggems-callback', (e) => {
  console.log('server callback', e.detail);
});

async function callVerify(apiKey) {
  const res = await fetch('${PORTAL}/api/browserbase/credentials/verify', {
    headers: { Authorization: 'Bearer ' + apiKey },
  });
  const data = await res.json();
  // client callback
  if (data.callback) console.log(data.callback);
  return data;
}`}</pre>
      </div>
    </div>
  );
}
