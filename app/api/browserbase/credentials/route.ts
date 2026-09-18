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

/** Browserbase metadata values must be simple strings without issues — sanitize */
function safeMetaValue(v: string) {
  return String(v || "portal")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 64) || "portal";
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  const key = serverBbKey();
  const projectId = (process.env.BROWSERBASE_PROJECT_ID || "").trim();

  if (!key) {
    return json({
      success: false,
      connected: false,
      error: "BROWSERBASE_API_KEY not set on Vercel",
      hint: "Vercel → Environment Variables → BROWSERBASE_API_KEY → Redeploy",
    });
  }

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
    (body.projectId || process.env.BROWSERBASE_PROJECT_ID || "").trim() || undefined;

  const displayName = String(body.name || "portal-session").trim().slice(0, 80);

  // Minimal valid body — avoid invalid userMetadata (Browserbase is strict)
  const payload: Record<string, unknown> = {
    timeout: Math.min(Math.max(Number(body.timeout) || 300, 60), 21600),
  };
  if (projectId) payload.projectId = projectId;

  // Optional: only safe alphanumeric metadata if supported
  payload.userMetadata = {
    source: "mggems_portal",
    label: safeMetaValue(displayName),
  };

  try {
    let createRes = await fetch(`${BB}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bb-api-key": key,
      },
      body: JSON.stringify(payload),
    });

    let session = await createRes.json().catch(() => ({}));

    // Retry without userMetadata if metadata rejected
    if (
      !createRes.ok &&
      String(session?.message || session?.error || "").toLowerCase().includes("metadata")
    ) {
      const { userMetadata: _drop, ...clean } = payload;
      createRes = await fetch(`${BB}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bb-api-key": key,
        },
        body: JSON.stringify(clean),
      });
      session = await createRes.json().catch(() => ({}));
    }

    // Retry bare minimum
    if (!createRes.ok) {
      const minimal: Record<string, unknown> = { timeout: 300 };
      if (projectId) minimal.projectId = projectId;
      createRes = await fetch(`${BB}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bb-api-key": key,
        },
        body: JSON.stringify(minimal),
      });
      session = await createRes.json().catch(() => ({}));
    }

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
      name: displayName,
    };

    return json({
      success: true,
      message: "Working Browserbase session credential created",
      credential,
      callback: {
        type: "browserbase_credential",
        status: "ok",
        session_id: session.id,
        client_should: "open debuggerUrl or use connectUrl with Playwright",
        note: "Master API key stays on Vercel only",
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
