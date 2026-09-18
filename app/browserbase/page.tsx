import Link from 'next/link';

const links = [
  { href: '/browserbase/api-key', title: 'API Key', desc: 'Validate Browserbase key · server callback' },
  { href: '/browserbase/sessions', title: 'Sessions', desc: 'List & create cloud browser sessions' },
  { href: '/browserbase/fetch', title: 'Fetch', desc: 'Server-side URL / school API test' },
  { href: '/browserbase/search', title: 'Search', desc: 'School in-site search proxy' },
  { href: '/browserbase/playground', title: 'Playground', desc: 'Try Bearer + school data' },
  { href: '/browserbase/docs', title: 'Setup / Docs', desc: 'curl · React · Python · FastAPI · Flask' },
];

export default function BrowserbaseHub() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Browserbase · Portal Hub</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Production-style pages inspired by{' '}
        <a href="https://www.browserbase.com" target="_blank" rel="noreferrer">
          browserbase.com
        </a>
        . Real API calls when key is set. School data via MGGEMS Bearer token.
      </p>

      <div className="grid grid-2">
        {links.map((l) => (
          <div key={l.href} className="card">
            <h2>{l.title}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{l.desc}</p>
            <Link href={l.href} className="btn" style={{ marginTop: '0.75rem' }}>
              Open →
            </Link>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Quick access</h2>
        <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
          <li>Monitor / Overview → this hub</li>
          <li>Sessions / Contexts → Sessions page</li>
          <li>Fetch / Search / Playground → dedicated pages</li>
          <li>API key / Setup for agents → API Key + Docs</li>
        </ul>
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
          School site:{' '}
          <a href="https://school-website-peach-zeta-psi.vercel.app/browserbase" target="_blank" rel="noreferrer">
            /browserbase
          </a>
        </p>
      </div>
    </div>
  );
}
