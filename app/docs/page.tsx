'use client';

import { useState } from 'react';

const API_BASE = 'https://school-website-peach-zeta-psi.vercel.app';

export default function DocsPage() {
  const [tab, setTab] = useState('curl');

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
        📘 API Documentation
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Real backend · Supabase + Firebase · JWT-style API keys · Bearer token
      </p>

      <div className="card">
        <h2>Base URL & Auth</h2>
        <pre>{`Base: ${API_BASE}
Header: Authorization: Bearer YOUR_API_KEY`}</pre>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          Keys are hashed (SHA-256) in Supabase. Raw key is returned only once at create time.
        </p>
      </div>

      <div className="card">
        <h2>Endpoints</h2>
        <div className="endpoint"><span className="method get">GET</span> <code>/api/v1/auth/verify</code> — validate key</div>
        <div className="endpoint"><span className="method get">GET</span> <code>/api/v1/notices</code> — list notices</div>
        <div className="endpoint"><span className="method post">POST</span> <code>/api/v1/notices</code> — create notice (JSON body)</div>
        <div className="endpoint"><span className="method get">GET</span> <code>/api/v1/admissions</code> — admissions data</div>
        <div className="endpoint"><span className="method get">GET</span> <code>/api/v1/attendance</code> — attendance data</div>
        <div className="endpoint"><span className="method post">POST</span> <code>/api/v1/keys/create</code> — create API key (no auth required)</div>
      </div>

      <div className="card">
        <h2>Code examples</h2>
        <div className="tabs">
          {['curl', 'js', 'node', 'python'].map((t) => (
            <button
              key={t}
              type="button"
              className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'curl' ? 'cURL' : t === 'js' ? 'JavaScript' : t === 'node' ? 'Node.js' : 'Python'}
            </button>
          ))}
        </div>

        {tab === 'curl' && (
          <pre>{`# Verify key
curl -s ${API_BASE}/api/v1/auth/verify \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

# List notices
curl -s ${API_BASE}/api/v1/notices \\
  -H "Authorization: Bearer mggems_YOUR_KEY"

# Create notice
curl -s -X POST ${API_BASE}/api/v1/notices \\
  -H "Authorization: Bearer mggems_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Holiday","body":"School closed Monday"}'

# Create API key
curl -s -X POST ${API_BASE}/api/v1/keys/create \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My App","email":"you@gmail.com"}'`}</pre>
        )}

        {tab === 'js' && (
          <pre>{`const API = "${API_BASE}";
const KEY = "mggems_YOUR_KEY";

async function getNotices() {
  const res = await fetch(API + "/api/v1/notices", {
    headers: { Authorization: "Bearer " + KEY },
  });
  return res.json();
}

// React example
useEffect(() => {
  getNotices().then(console.log);
}, []);`}</pre>
        )}

        {tab === 'node' && (
          <pre>{`const API = "${API_BASE}";
const KEY = process.env.MGGEMS_API_KEY;

async function main() {
  const res = await fetch(API + "/api/v1/auth/verify", {
    headers: { Authorization: "Bearer " + KEY },
  });
  console.log(await res.json());
}
main();`}</pre>
        )}

        {tab === 'python' && (
          <pre>{`import requests

BASE = "${API_BASE}"
KEY = "mggems_YOUR_KEY"
headers = {"Authorization": f"Bearer {KEY}"}

r = requests.get(f"{BASE}/api/v1/notices", headers=headers)
print(r.json())

r = requests.post(
    f"{BASE}/api/v1/notices",
    headers={**headers, "Content-Type": "application/json"},
    json={"title": "Exam", "body": "Class 10 exam tomorrow"},
)
print(r.json())`}</pre>
        )}
      </div>

      <div className="card">
        <h2>Server callback / Client connect</h2>
        <ol style={{ paddingLeft: '1.25rem', fontSize: '0.95rem' }}>
          <li>Generate key on <a href="/keys">/keys</a> page (or POST /api/v1/keys/create).</li>
          <li>In your client, set header: <code>Authorization: Bearer KEY</code>.</li>
          <li>Call <code>/api/v1/auth/verify</code> to validate before other requests.</li>
          <li>Data is served from Supabase tables; Firebase RTDB syncs in background.</li>
        </ol>
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
          Pattern is similar to OpenAI / Slack style Bearer tokens.
        </p>
      </div>

      <div className="card">
        <h2>Example JSON response</h2>
        <pre>{`{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "n_123",
      "title": "Holiday",
      "body": "School closed",
      "created_by": "Principal"
    }
  ]
}`}</pre>
      </div>

      <p style={{ textAlign: 'center' }}>
        <a href="/keys" className="btn">Generate API Key</a>
      </p>
    </div>
  );
}