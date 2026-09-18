import Link from 'next/link';

const links = [
  {
    href: '/browserbase/api-key',
    title: 'API Key',
    desc: 'Session + bbsess_ API key · server callback',
  },
  {
    href: '/browserbase/playground',
    title: 'Playground',
    desc: 'Endpoints · server call · client callback',
  },
  { href: '/browserbase/sessions', title: 'Sessions', desc: 'List & create cloud sessions' },
  { href: '/browserbase/fetch', title: 'Fetch', desc: 'Server-side URL / school API test' },
  { href: '/browserbase/search', title: 'Search', desc: 'School search proxy' },
  { href: '/browserbase/docs', title: 'Setup / Docs', desc: 'curl · React · Python · FastAPI' },
];

export default function BrowserbaseHub() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Browserbase · Portal Hub</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Vercel env key · real sessions · school data · playground with callbacks
      </p>

      <div className="card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
        <h2>Quick</h2>
        <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <Link href="/browserbase/api-key">API Key</Link> → generate · then{' '}
          <Link href="/browserbase/playground">Playground</Link> → test endpoints
        </p>
        <Link href="/browserbase/playground" className="btn">
          Open Playground →
        </Link>
      </div>

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
    </div>
  );
}
