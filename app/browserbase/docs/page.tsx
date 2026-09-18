'use client';

const SCHOOL = 'https://school-website-peach-zeta-psi.vercel.app';
const PORTAL = 'https://mggems-api-portal.vercel.app';

export default function BbDocsPage() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ color: 'var(--primary)' }}>Setup for agents · Docs</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
        Bearer · JWT-style school keys · Browserbase x-bb-api-key · curl / React / Python / FastAPI / Flask
      </p>

      <div className="card">
        <h2>Auth plugs</h2>
        <pre>{`# School data API
Authorization: Bearer mggems_YOUR_KEY

# Browserbase cloud browser
x-bb-api-key: YOUR_BROWSERBASE_KEY
# or header on portal:
x-browserbase-key: YOUR_BROWSERBASE_KEY`}</pre>
      </div>

      <div className="card">
        <h2>bash / curl</h2>
        <pre>{`# School live data
curl -s "${SCHOOL}/api/v1/data?resource=all" \\
  -H "Authorization: Bearer mggems_KEY"

# Portal proxy
curl -s "${PORTAL}/api/v1/notices" \\
  -H "Authorization: Bearer mggems_KEY"

# Browserbase sessions (direct)
curl -s https://api.browserbase.com/v1/sessions \\
  -H "x-bb-api-key: $BROWSERBASE_API_KEY"

# Portal sessions proxy
curl -s ${PORTAL}/api/browserbase/sessions \\
  -H "x-browserbase-key: $BROWSERBASE_API_KEY"`}</pre>
      </div>

      <div className="card">
        <h2>React / Next.js</h2>
        <pre>{`const res = await fetch("${SCHOOL}/api/v1/notices", {
  headers: { Authorization: "Bearer " + process.env.NEXT_PUBLIC_MGGEMS_KEY },
});`}</pre>
      </div>

      <div className="card">
        <h2>Python FastAPI</h2>
        <pre>{`import httpx
from fastapi import FastAPI
app = FastAPI()

@app.get("/school/notices")
async def notices():
    async with httpx.AsyncClient() as c:
        r = await c.get(
            "${SCHOOL}/api/v1/notices",
            headers={"Authorization": "Bearer mggems_KEY"},
        )
        return r.json()`}</pre>
      </div>

      <div className="card">
        <h2>Flask SaaS / BaaS style</h2>
        <pre>{`import requests
from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/proxy/attendance")
def attendance():
    r = requests.get(
        "${SCHOOL}/api/v1/attendance",
        headers={"Authorization": "Bearer mggems_KEY"},
    )
    return jsonify(r.json())`}</pre>
      </div>

      <div className="card">
        <h2>Slack-style Bearer</h2>
        <pre>{`# Same pattern as Slack bot tokens / OpenAI
curl ${SCHOOL}/api/v1/auth/verify \\
  -H "Authorization: Bearer mggems_KEY"`}</pre>
      </div>

      <div className="card">
        <h2>MCP / agent note</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          Agents can call school <code>/api/v1/*</code> with Bearer and Browserbase with{' '}
          <code>x-bb-api-key</code>. Portal exposes both for testing.
        </p>
      </div>
    </div>
  );
}
