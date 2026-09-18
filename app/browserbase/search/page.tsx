'use client';

import { useState } from 'react';

const SCHOOL = 'https://school-website-peach-zeta-psi.vercel.app';

export default function SearchPage() {
  const [q, setQ] = useState('RBSE result');
  const [out, setOut] = useState('');

  async function search() {
    const res = await fetch(`${SCHOOL}/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setOut(JSON.stringify(data, null, 2));
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ color: 'var(--primary)' }}>Search</h1>
      <p style={{ color: 'var(--muted)' }}>School website search API (in-site, no new tab)</p>
      <div className="card">
        <input value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="btn" onClick={search}>
          Search
        </button>
        <div className="result-box" style={{ marginTop: '1rem' }}>
          {out || '…'}
        </div>
      </div>
    </div>
  );
}
