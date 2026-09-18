import { NextRequest } from "next/server";

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

/** Status: is Browserbase key available on server env? */
export async function GET() {
  const key = (process.env.BROWSERBASE_API_KEY || process.env.NEXT_PUBLIC_BROWSERBASE_API_KEY || "").trim();
  return json({
    success: true,
    hasKey: Boolean(key),
    source: key ? "vercel_env" : "none",
    message: key
      ? "BROWSERBASE_API_KEY found on server"
      : "Set BROWSERBASE_API_KEY on Vercel or paste key in portal UI",
    projectId: process.env.BROWSERBASE_PROJECT_ID || null,
    school: "https://school-website-peach-zeta-psi.vercel.app",
  });
}

/** Validate a Browserbase key with a real list-sessions call */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = String(body.apiKey || body.key || "").trim();
    if (!key) return json({ success: false, error: "apiKey required" }, 400);

    const res = await fetch("https://api.browserbase.com/v1/sessions", {
      headers: { "x-bb-api-key": key },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json({
        success: false,
        error: data?.message || data?.error || "Invalid Browserbase API key",
        status: res.status,
      });
    }
    const list = Array.isArray(data) ? data : data.sessions || data.data || [];
    return json({
      success: true,
      message: "Browserbase API key valid",
      sessions_sample: list.slice(0, 3),
      callback: {
        type: "api_key_validated",
        client_can_use: key.slice(0, 6) + "…",
        next: "/browserbase/sessions",
      },
    });
  } catch (e) {
    return json({ success: false, error: String(e) }, 500);
  }
}
