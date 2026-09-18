import Link from 'next/link';

const links = [
  {
    href: '/browserbase/api-key',
    title: 'API Key',
    desc: 'Vercel BROWSERBASE_API_KEY · generate session credential · server callback',
  },
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
        Connect with Vercel env key · real{' '}
        <a href="https://www.browserbase.com" target="_blank" rel="noreferrer">
          Browserbase
        </a>{' '}
        sessions · school data via MGGEMS Bearer.
      </p>

      <div className="card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
        <h2>Start here</h2>
        <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          1. Vercel pe <code>BROWSERBASE_API_KEY</code> add karo → Redeploy
          <br />
          2.{' '}
          <Link href="/browserbase/api-key">API Key page</Link> pe connection check + Generate credential
        </p>
        <Link href="/browserbase/api-key" className="btn">
          Open API Key page →
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
