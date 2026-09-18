export default function HomePage() {
  return (
    <div className="container">
      <section className="hero">
        <h1>MGGEMS API Developer Portal</h1>
        <p>
          Generate API keys, explore endpoints, and integrate school data
          (notices, admissions, attendance) into your apps using Bearer token auth.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/keys" className="btn">Generate API Key</a>
          <a href="/docs" className="btn btn-secondary">View API Docs</a>
          <a href="/client" className="btn btn-secondary">Try API Client</a>
        </div>
      </section>

      <div className="grid grid-2">
        <div className="card">
          <h2>🔑 API Keys</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Create JWT-style API keys. Keys are stored hashed (SHA-256) on the school backend
            (Supabase + Firebase). Raw key is shown only once.
          </p>
          <a href="/keys" className="btn" style={{ marginTop: '1rem' }}>Create Key →</a>
        </div>
        <div className="card">
          <h2>📘 Documentation</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Full endpoint list, cURL, JavaScript, Node.js, Python examples and server/client callback patterns.
          </p>
          <a href="/docs" className="btn" style={{ marginTop: '1rem' }}>Read Docs →</a>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>Base URL & Auth</h2>
        <pre>Base: https://school-website-peach-zeta-psi.vercel.app
Header: Authorization: Bearer YOUR_API_KEY</pre>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          All data endpoints require a valid Bearer token. Use <code>/api/v1/auth/verify</code> to validate a key.
        </p>
      </div>

      <div className="card">
        <h2>Quick Endpoints</h2>
        <div className="endpoint"><span className="method get">GET</span> <code>/api/v1/auth/verify</code> — validate key</div>
        <div className="endpoint"><span className="method get">GET</span> <code>/api/v1/notices</code> — list notices</div>
        <div className="endpoint"><span className="method post">POST</span> <code>/api/v1/notices</code> — create notice</div>
        <div className="endpoint"><span className="method get">GET</span> <code>/api/v1/admissions</code> — admissions</div>
        <div className="endpoint"><span className="method get">GET</span> <code>/api/v1/attendance</code> — attendance</div>
        <div className="endpoint"><span className="method post">POST</span> <code>/api/v1/keys/create</code> — create API key</div>
      </div>
    </div>
  );
}