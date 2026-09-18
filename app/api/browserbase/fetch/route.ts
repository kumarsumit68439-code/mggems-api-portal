import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/** Server-side fetch test (school or public URL) — for playground */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = String(body.url || "").trim();
    const method = String(body.method || "GET").toUpperCase();
    const headers: Record<string, string> = body.headers || {};
    if (body.bearer) headers["Authorization"] = `Bearer ${body.bearer}`;

    if (!url.startsWith("http")) {
      return json({ success: false, error: "url must start with http" }, 400);
    }

    const res = await fetch(url, {
      method,
      headers,
      body: method !== "GET" && body.body ? JSON.stringify(body.body) : undefined,
      cache: "no-store",
    });
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text.slice(0, 4000);
    }

    return json({
      success: true,
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body: parsed,
      callback: { type: "fetch_complete", url, status: res.status },
    });
  } catch (e) {
    return json({ success: false, error: String(e) }, 500);
  }
}
