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

/** Verify bbsess_ API key + optional live session status from Browserbase */
export async function GET(req: NextRequest) {
  const raw = getBearer(req);
  if (!raw) {
    return json({ success: false, error: "Missing Authorization: Bearer bbsess_…" }, 401);
  }

  const checked = verifySessionApiKey(raw);
  if (!checked.ok) {
    return json({ success: false, error: checked.error }, 401);
  }

  let live: unknown = null;
  const mk = masterKey();
  if (mk) {
    try {
      const res = await fetch(`https://api.browserbase.com/v1/sessions/${checked.sessionId}`, {
        headers: { "x-bb-api-key": mk },
        cache: "no-store",
      });
      live = await res.json().catch(() => null);
    } catch {
      /* */
    }
  }

  return json({
    success: true,
    message: "API key valid",
    session_id: checked.sessionId,
    live_session: live,
    callback: {
      type: "key_verified",
      session_id: checked.sessionId,
      next: "GET /api/browserbase/credentials/session",
    },
  });
}
