'use client';

import { useState } from 'react';

const SCHOOL = 'https://school-website-peach-zeta-psi.vercel.app';
const PORTAL = 'https://mggems-api-portal.vercel.app';

export default function DocsPage() {
  const [tab, setTab] = useState('curl-school');
  const [base, setBase] = useState<'school' | 'portal'>('school');

  const API = base === 'school' ? SCHOOL : PORTAL;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
        📘 API Documentation
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        School + Portal both endpoints · same Bearer key · real Supabase data
      </p>

      <div className="card">
        <h2>Two base URLs (both work)</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button
            type="button"
            className={`btn ${base === 'school' ? '' : 'btn-secondary'}`}
            onClick={() => setBase('school')}
          >
            School API
          </button>
          <button
            type="button"
            className={`btn ${base === 'portal' ? '' : 'btn-secondary'}`}
            onClick={() => setBase('portal')}
          >
            Portal proxy API
          </button>
        </div>
        <pre>{`School:  ${SCHOOL}/api/v1/...
Portal:  ${PORTAL}/api/v1/...   (proxies to school)
Header:  Authorization: Bearer YOUR_API_KEY`}</pre>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          Portal <code>/api/v1/*</code> school backend ko forward karta hai — curl dono bases pe same.
        </p>
      </div>

      <div className="card">
        <h2>Endpoints (identical paths)</h2>
        <div className="endpoint">
          <span className="method post">POST</span> <code>/api/v1/keys/create</code> — create key (no auth)
        </div>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/auth/verify</code> — validate key
        </div>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/data?resource=all</code> — full live dump
        </div>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/notices</code> — notices
        </div>
        <div className="endpoint">
          <span className="method post">POST</span> <code>/api/v1/notices</code> — create notice
        </div>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/admissions</code> — admissions
        </div>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/attendance</code> — attendance
        </div>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/students</code> — users (via data?resource=students)
        </div>
      </div>

      <div className="card">
        <h2>cURL — School base</h2>
        <pre>{`# 1) Create key
curl -s -X POST ${SCHOOL}/api/v1/keys/create \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My App","email":"you@gmail.com"}'

# 2) Verify
curl -s ${SCHOOL}/api/v1/auth/verify \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

# 3) Live all data
curl -s "${SCHOOL}/api/v1/data?resource=all" \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

# 4) Notices
curl -s ${SCHOOL}/api/v1/notices \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

# 5) Admissions
curl -s ${SCHOOL}/api/v1/admissions \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

# 6) Attendance
curl -s ${SCHOOL}/api/v1/attendance \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

# 7) Create notice
curl -s -X POST ${SCHOOL}/api/v1/notices \\
  -H "Authorization: Bearer mggems_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Holiday","body":"School closed"}'`}</pre>
      </div>

      <div className="card">
        <h2>cURL — Portal base (proxy)</h2>
        <pre>{`# Same paths on portal — proxies to school
curl -s -X POST ${PORTAL}/api/v1/keys/create \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Via Portal","email":"you@gmail.com"}'

curl -s ${PORTAL}/api/v1/auth/verify \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

curl -s "${PORTAL}/api/v1/data?resource=all" \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

curl -s ${PORTAL}/api/v1/notices \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

curl -s ${PORTAL}/api/v1/admissions \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

curl -s ${PORTAL}/api/v1/attendance \\
  -H "Authorization: Bearer mggems_YOUR_KEY"`}</pre>
      </div>

      <div className="card">
        <h2>Code examples (selected base: {base})</h2>
        <div className="tabs">
          {['curl-school', 'curl-portal', 'js', 'python'].map((t) => (
            <button
              key={t}
              type="button"
              className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'curl-school' && (
          <pre>{`curl -s ${SCHOOL}/api/v1/notices -H "Authorization: Bearer mggems_YOUR_KEY"`}</pre>
        )}
        {tab === 'curl-portal' && (
          <pre>{`curl -s ${PORTAL}/api/v1/notices -H "Authorization: Bearer mggems_YOUR_KEY"`}</pre>
        )}
        {tab === 'js' && (
          <pre>{`const API = "${API}";
const KEY = "mggems_YOUR_KEY";

const res = await fetch(API + "/api/v1/data?resource=all", {
  headers: { Authorization: "Bearer " + KEY },
});
console.log(await res.json());`}</pre>
        )}
        {tab === 'python' && (
          <pre>{`import requests
BASE = "${API}"
KEY = "mggems_YOUR_KEY"
h = {"Authorization": f"Bearer {KEY}"}
print(requests.get(f"{BASE}/api/v1/notices", headers=h).json())`}</pre>
        )}
      </div>

      <p style={{ textAlign: 'center' }}>
        <a href="/keys" className="btn">
          Generate API Key
        </a>{' '}
        <a href="/client" className="btn btn-secondary">
          Live Data
        </a>
      </p>
    </div>
  );
}
