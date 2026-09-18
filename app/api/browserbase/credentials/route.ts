import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BB = "https://api.browserbase.com/v1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-browserbase-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

function serverBbKey() {
  return (
    process.env.BROWSERBASE_API_KEY ||
    process.env.NEXT_PUBLIC_BROWSERBASE_API_KEY ||
    ""
  ).trim();
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/** Status of Vercel-connected Browserbase key (never returns raw secret) */
export async function GET() {
  const key = serverBbKey();
  const projectId = (process.env.BROWSERBASE_PROJECT_ID || "").trim();

  if (!key) {
    return json({
      success: false,
      connected: false,
      error: "BROWSERBASE_API_KEY not set on Vercel",
      hint: "Vercel → Project Settings → Environment Variables → BROWSERBASE_API_KEY → Redeploy",
    });
  }

  // Live validate against Browserbase
  try {
    const res = await fetch(`${BB}/sessions`, {
      headers: { "x-bb-api-key": key },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json({
        success: false,
        connected: false,
        error: data?.message || data?.error || "Browserbase rejected server key",
        status: res.status,
      });
    }
    const list = Array.isArray(data) ? data : data.sessions || data.data || [];
    return json({
      success: true,
      connected: true,
      source: "vercel_env",
      projectId: projectId || null,
      key_masked: key.slice(0, 4) + "••••" + key.slice(-4),
      sessions_count: list.length,
      message: "Vercel BROWSERBASE_API_KEY connected to Browserbase",
      endpoints: {
        create_credential: "POST /api/browserbase/credentials",
        sessions: "GET|POST /api/browserbase/sessions",
        browserbase_api: "https://api.browserbase.com/v1/sessions",
      },
    });
  } catch (e) {
    return json({ success: false, connected: false, error: String(e) });
  }
}

/**
 * Create a working Browserbase session credential using Vercel env key.
 * Client receives session id + debugger URLs (callback) — not the master API key.
 */
export async function POST(req: NextRequest) {
  const key = serverBbKey();
  if (!key) {
    return json({
      success: false,
      error: "BROWSERBASE_API_KEY missing on Vercel",
      hint: "Add env var and Redeploy, then try again",
    });
  }

  let body: { name?: string; timeout?: number; projectId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* */
  }

  const projectId =
    body.projectId || process.env.BROWSERBASE_PROJECT_ID || undefined;

  try {
    const createRes = await fetch(`${BB}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bb-api-key": key,
      },
      body: JSON.stringify({
        ...(projectId ? { projectId } : {}),
        timeout: body.timeout || 300,
        browserSettings: {
          blockAds: true,
          solveCaptchas: true,
          recordSession: true,
          logSession: true,
        },
        userMetadata: {
          name: body.name || "portal-credential",
          via: "mggems-api-portal",
        },
      }),
    });

    const session = await createRes.json().catch(() => ({}));
    if (!createRes.ok) {
      return json({
        success: false,
        error: session?.message || session?.error || "Session create failed",
        details: session,
      });
    }

    let debuggerUrl = "";
    let debuggerFullscreenUrl = "";
    try {
      const debugRes = await fetch(`${BB}/sessions/${session.id}/debug`, {
        headers: { "x-bb-api-key": key },
      });
      if (debugRes.ok) {
        const debug = await debugRes.json();
        debuggerUrl = debug.debuggerUrl || "";
        debuggerFullscreenUrl = debug.debuggerFullscreenUrl || debug.debuggerUrl || "";
      }
    } catch {
      /* */
    }

    // Client-facing credential (session-scoped — master BB key stays on server)
    const credential = {
      type: "browserbase_session",
      session_id: session.id,
      status: session.status,
      connectUrl: session.connectUrl || null,
      region: session.region,
      expiresAt: session.expiresAt,
      debuggerUrl:
        debuggerUrl || `https://www.browserbase.com/sessions/${session.id}`,
      debuggerFullscreenUrl:
        debuggerFullscreenUrl ||
        `https://www.browserbase.com/sessions/${session.id}`,
      dashboard: `https://www.browserbase.com/sessions/${session.id}`,
      created_via: "vercel_BROWSERBASE_API_KEY",
      name: body.name || "portal-credential",
    };

    return json({
      success: true,
      message: "Working Browserbase session credential created",
      credential,
      // Explicit server → client callback payload
      callback: {
        type: "browserbase_credential",
        status: "ok",
        session_id: session.id,
        client_should: "open debuggerUrl or use connectUrl with Playwright/Puppeteer",
        note: "Master API key remains on Vercel only — never sent to browser",
      },
      curl: {
        list: `curl -s https://api.browserbase.com/v1/sessions -H "x-bb-api-key: $BROWSERBASE_API_KEY"`,
        get: `curl -s https://api.browserbase.com/v1/sessions/${session.id} -H "x-bb-api-key: $BROWSERBASE_API_KEY"`,
      },
    });
  } catch (e) {
    return json({ success: false, error: String(e) });
  }
}
