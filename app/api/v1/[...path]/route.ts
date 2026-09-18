import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SCHOOL = "https://school-website-peach-zeta-psi.vercel.app";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Requested-With",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

async function proxy(req: NextRequest, pathParts: string[]) {
  const path = pathParts.join("/");
  const search = req.nextUrl.search || "";
  const target = `${SCHOOL}/api/v1/${path}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") || "application/json",
  };
  const auth = req.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      init.body = await req.text();
    } catch {
      /* empty body */
    }
  }

  try {
    const res = await fetch(target, init);
    const text = await res.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = { success: false, error: "Non-JSON from school", raw: text.slice(0, 500) };
    }

    // Annotate proxy source when object
    if (body && typeof body === "object" && !Array.isArray(body)) {
      (body as Record<string, unknown>)._proxy = {
        via: "mggems-api-portal",
        school: target,
      };
    }

    return json(body, res.status);
  } catch (e) {
    return json(
      {
        success: false,
        error: "Proxy failed: " + String(e),
        school: target,
      },
      502
    );
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const params = await Promise.resolve(ctx.params);
  return proxy(req, params.path || []);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const params = await Promise.resolve(ctx.params);
  return proxy(req, params.path || []);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const params = await Promise.resolve(ctx.params);
  return proxy(req, params.path || []);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const params = await Promise.resolve(ctx.params);
  return proxy(req, params.path || []);
}
