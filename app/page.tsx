export default function HomePage() {
  return (
    <div className="container">
      <section className="hero">
        <h1>MGGEMS API Developer Portal</h1>
        <p>
          Generate API keys and view <strong>live school data</strong> — notices, admissions,
          attendance, users & logins — connected to the school website backend in real time.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/keys" className="btn">
            Generate API Key
          </a>
          <a href="/client" className="btn btn-secondary">
            Live School Data
          </a>
          <a href="/docs" className="btn btn-secondary">
            API Docs
          </a>
        </div>
      </section>

      <div className="grid grid-2">
        <div className="card">
          <h2>🔑 API Keys</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Keys sirf is portal pe banengi. School Supabase me SHA-256 hash save hota hai.
          </p>
          <a href="/keys" className="btn" style={{ marginTop: '1rem' }}>
            Create Key →
          </a>
        </div>
        <div className="card">
          <h2>📡 Live Data</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            API key se school ka real data: admissions, attendance, notices, logged-in users.
            Auto-refresh supported.
          </p>
          <a href="/client" className="btn" style={{ marginTop: '1rem' }}>
            Open Live Dashboard →
          </a>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>Base URL & Auth</h2>
        <pre>
          {`Base: https://school-website-peach-zeta-psi.vercel.app
Header: Authorization: Bearer YOUR_API_KEY
Live: GET /api/v1/data?resource=all`}
        </pre>
      </div>

      <div className="card">
        <h2>Quick Endpoints</h2>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/data?resource=all</code> — full live
          dump
        </div>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/auth/verify</code> — validate key
        </div>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/notices</code> — notices
        </div>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/admissions</code> — admissions
        </div>
        <div className="endpoint">
          <span className="method get">GET</span> <code>/api/v1/attendance</code> — attendance
        </div>
      </div>
    </div>
  );
}
