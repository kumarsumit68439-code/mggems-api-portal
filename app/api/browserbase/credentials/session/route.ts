import { NextRequest } from "next/server";
import { getBearer, verifySessionApiKey } from "@/lib/sessionKey";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

function masterKey() {
  return (
    process.env.BROWSERBASE_API_KEY ||
    process.env.NEXT_PUBLIC_BROWSERBASE_API_KEY ||
    ""
  ).trim();
}

/** Use session API key → return session details + debugger (server uses master key) */
export async function GET(req: NextRequest) {
  const raw = getBearer(req);
  if (!raw) {
    return json({ success: false, error: "Missing Authorization: Bearer bbsess_…" }, 401);
  }

  const checked = verifySessionApiKey(raw);
  if (!checked.ok) {
    return json({ success: false, error: checked.error }, 401);
  }

  const mk = masterKey();
  if (!mk) {
    return json({ success: false, error: "Server BROWSERBASE_API_KEY missing" }, 500);
  }

  const res = await fetch(`https://api.browserbase.com/v1/sessions/${checked.sessionId}`, {
    headers: { "x-bb-api-key": mk },
    cache: "no-store",
  });
  const session = await res.json().catch(() => ({}));
  if (!res.ok) {
    return json({
      success: false,
      error: session?.message || "Session not found or expired",
      session_id: checked.sessionId,
    }, res.status);
  }

  let debug: any = null;
  try {
    const d = await fetch(`https://api.browserbase.com/v1/sessions/${checked.sessionId}/debug`, {
      headers: { "x-bb-api-key": mk },
    });
    if (d.ok) debug = await d.json();
  } catch {
    /* */
  }

  return json({
    success: true,
    session_id: checked.sessionId,
    session,
    debuggerUrl: debug?.debuggerUrl,
    debuggerFullscreenUrl: debug?.debuggerFullscreenUrl,
    dashboard: `https://www.browserbase.com/sessions/${checked.sessionId}`,
    callback: {
      type: "session_resolved",
      session_id: checked.sessionId,
      status: session?.status,
    },
  });
}
