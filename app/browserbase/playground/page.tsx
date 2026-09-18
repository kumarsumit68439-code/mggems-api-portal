'use client';

import { useState } from 'react';

const SCHOOL = 'https://school-website-peach-zeta-psi.vercel.app';
const PORTAL = 'https://mggems-api-portal.vercel.app';

export default function PlaygroundPage() {
  const [schoolKey, setSchoolKey] = useState('');
  const [base, setBase] = useState<'school' | 'portal'>('school');
  const [out, setOut] = useState('');

  async function call(path: string) {
    const API = base === 'school' ? SCHOOL : PORTAL;
    const res = await fetch(`${API}${path}`, {
      headers: schoolKey ? { Authorization: `Bearer ${schoolKey}` } : {},
    });
    setOut(JSON.stringify(await res.json(), null, 2));
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ color: 'var(--primary)' }}>Playground</h1>
      <p style={{ color: 'var(--muted)' }}>School Bearer token · school or portal proxy base</p>
      <div className="card">
        <label>School API key (mggems_…)</label>
        <input value={schoolKey} onChange={(e) => setSchoolKey(e.target.value)} />
        <label>Base</label>
        <select value={base} onChange={(e) => setBase(e.target.value as any)}>
          <option value="school">School</option>
          <option value="portal">Portal proxy</option>
        </select>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={() => call('/api/v1/auth/verify')}>
            Verify
          </button>
          <button type="button" className="btn" onClick={() => call('/api/v1/notices')}>
            Notices
          </button>
          <button type="button" className="btn" onClick={() => call('/api/v1/data?resource=all')}>
            All data
          </button>
        </div>
        <div className="result-box" style={{ marginTop: '1rem' }}>
          {out || '…'}
        </div>
      </div>
    </div>
  );
}
