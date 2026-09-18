import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MGGEMS API Portal | Developer Keys & Live Data',
  description:
    'API Key generation, live school data (notices, admissions, attendance, users) for Mahatma Gandhi Government English Medium School',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-inner">
            <a href="/" className="logo">
              <span className="logo-icon">🏫</span>
              <div>
                <strong>MGGEMS API</strong>
                <small>Developer Portal</small>
              </div>
            </a>
            <nav className="nav">
              <a href="/">Home</a>
              <a href="/keys">Generate Key</a>
              <a href="/docs">API Docs</a>
              <a href="/client">Live Data</a>
              <a
                href="https://school-website-peach-zeta-psi.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                School Site
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="container">
            <p>© 2026 Mahatma Gandhi Government English Medium School, Lalchandpura, Jaipur</p>
            <p>Website by Sumit Jilowa · 7742936593 · sumitjilowa34@gmail.com</p>
            <p className="muted">API Base: https://school-website-peach-zeta-psi.vercel.app</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
