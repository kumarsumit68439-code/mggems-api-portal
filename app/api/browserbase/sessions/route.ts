import { NextRequest } from "next/server";
import { getBbKey, bbFetch } from "@/lib/browserbase";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-browserbase-key, x-bb-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const key = getBbKey(req);
  if (!key) {
    return json({
      success: false,
      error: "Browserbase API key missing",
      hint: "Header x-browserbase-key or Vercel BROWSERBASE_API_KEY",
    });
  }
  const { ok, status, data } = await bbFetch("/sessions", { key });
  const list = Array.isArray(data) ? data : (data as any)?.sessions || (data as any)?.data || [];
  return json({ success: ok, sessions: list, raw: data }, ok ? 200 : status);
}

export async function POST(req: NextRequest) {
  const key = getBbKey(req);
  if (!key) {
    return json({ success: false, error: "Browserbase API key missing" });
  }
  const body = await req.json().catch(() => ({}));
  const projectId = body.projectId || process.env.BROWSERBASE_PROJECT_ID;

  // No userMetadata — avoids "not a valid metadata value" errors
  const payload: Record<string, unknown> = {
    timeout: body.timeout || 300,
  };
  if (projectId) payload.projectId = projectId;

  const { ok, status, data } = await bbFetch("/sessions", {
    method: "POST",
    key,
    body: payload,
  });

  if (!ok) {
    return json({ success: false, error: (data as any)?.message || data, status });
  }

  const session = data as any;
  let debug: any = null;
  try {
    const d = await bbFetch(`/sessions/${session.id}/debug`, { key });
    if (d.ok) debug = d.data;
  } catch {
    /* */
  }

  return json({
    success: true,
    session: {
      id: session.id,
      status: session.status,
      connectUrl: session.connectUrl,
      region: session.region,
      expiresAt: session.expiresAt,
      debuggerUrl: debug?.debuggerUrl,
      debuggerFullscreenUrl: debug?.debuggerFullscreenUrl,
      dashboard: `https://www.browserbase.com/sessions/${session.id}`,
    },
    callback: {
      type: "session_created",
      session_id: session.id,
      client_action: "open debuggerUrl or connect via Playwright CDP",
    },
  });
}
