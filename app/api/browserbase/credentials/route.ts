import { NextRequest } from "next/server";
import { issueSessionApiKey } from "@/lib/sessionKey";

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

export async function GET() {
  const key = serverBbKey();
  const projectId = (process.env.BROWSERBASE_PROJECT_ID || "").trim();

  if (!key) {
    return json({
      success: false,
      connected: false,
      error: "BROWSERBASE_API_KEY not set on Vercel",
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
        error: data?.message || data?.error || "Browserbase rejected key",
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
      message: "Connected — POST to generate session + API key",
      endpoints: {
        create: "POST /api/browserbase/credentials",
        verify_key: "GET /api/browserbase/credentials/verify",
        use_session: "GET /api/browserbase/credentials/session",
      },
    });
  } catch (e) {
    return json({ success: false, connected: false, error: String(e) });
  }
}

/** Create Browserbase session + issue browser-style API key (shown once) */
export async function POST(req: NextRequest) {
  const master = serverBbKey();
  if (!master) {
    return json({
      success: false,
      error: "BROWSERBASE_API_KEY missing on Vercel",
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

  const tryBodies: Record<string, unknown>[] = [];
  const base: Record<string, unknown> = {
    timeout: Math.min(Math.max(Number(body.timeout) || 300, 60), 21600),
  };
  if (projectId) base.projectId = projectId;
  tryBodies.push(base);
  tryBodies.push(projectId ? { projectId, timeout: 300 } : { timeout: 300 });

  let session: any = null;
  let lastErr: any = null;

  for (const payload of tryBodies) {
    const createRes = await fetch(`${BB}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bb-api-key": master,
      },
      body: JSON.stringify(payload),
    });
    const data = await createRes.json().catch(() => ({}));
    if (createRes.ok && data?.id) {
      session = data;
      break;
    }
    lastErr = data;
  }

  if (!session?.id) {
    return json({
      success: false,
      error: lastErr?.message || lastErr?.error || "Session create failed",
      details: lastErr,
    });
  }

  let debuggerUrl = "";
  let debuggerFullscreenUrl = "";
  try {
    const debugRes = await fetch(`${BB}/sessions/${session.id}/debug`, {
      headers: { "x-bb-api-key": master },
    });
    if (debugRes.ok) {
      const debug = await debugRes.json();
      debuggerUrl = debug.debuggerUrl || "";
      debuggerFullscreenUrl = debug.debuggerFullscreenUrl || debug.debuggerUrl || "";
    }
  } catch {
    /* */
  }

  // Browser-style API key bound to this session
  const issued = issueSessionApiKey(session.id);

  const credential = {
    type: "browserbase_session_api_key",
    api_key: issued.api_key,
    key: issued.api_key,
    prefix: issued.prefix,
    session_id: session.id,
    status: session.status,
    connectUrl: session.connectUrl || null,
    region: session.region,
    expiresAt: session.expiresAt,
    debuggerUrl:
      debuggerUrl || `https://www.browserbase.com/sessions/${session.id}`,
    debuggerFullscreenUrl:
      debuggerFullscreenUrl || `https://www.browserbase.com/sessions/${session.id}`,
    dashboard: `https://www.browserbase.com/sessions/${session.id}`,
    name: displayName,
    usage: {
      header: `Authorization: Bearer ${issued.api_key}`,
      verify: "GET /api/browserbase/credentials/verify",
      session: "GET /api/browserbase/credentials/session",
    },
  };

  return json({
    success: true,
    message: "Session + API key created — copy api_key now (server callback)",
    // top-level for easy client parse
    api_key: issued.api_key,
    key: issued.api_key,
    session_id: session.id,
    credential,
    callback: {
      type: "browserbase_api_key_issued",
      status: "ok",
      session_id: session.id,
      api_key_prefix: issued.prefix,
      client_should: "Store Bearer api_key; call verify & session endpoints",
      endpoints: {
        verify: "https://mggems-api-portal.vercel.app/api/browserbase/credentials/verify",
        session: "https://mggems-api-portal.vercel.app/api/browserbase/credentials/session",
      },
    },
  });
}
