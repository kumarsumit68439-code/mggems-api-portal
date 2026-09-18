import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Requested-With",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const SCHOOL = "https://school-website-peach-zeta-psi.vercel.app";
const PORTAL = "https://mggems-api-portal.vercel.app";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/** GET /api/v1 — index (no more 404) */
export async function GET(_req: NextRequest) {
  return json({
    success: true,
    message: "MGGEMS API Portal proxy index",
    service: "mggems-api-portal",
    school_backend: SCHOOL,
    portal_base: `${PORTAL}/api/v1`,
    auth: "Authorization: Bearer mggems_YOUR_KEY",
    endpoints: [
      { method: "POST", path: "/api/v1/keys/create", auth: false, desc: "Create school API key" },
      { method: "GET", path: "/api/v1/auth/verify", auth: true, desc: "Validate key" },
      { method: "GET", path: "/api/v1/data?resource=all", auth: true, desc: "Full live school data" },
      { method: "GET", path: "/api/v1/notices", auth: true, desc: "Notices" },
      { method: "POST", path: "/api/v1/notices", auth: true, desc: "Create notice" },
      { method: "GET", path: "/api/v1/admissions", auth: true, desc: "Admissions" },
      { method: "GET", path: "/api/v1/attendance", auth: true, desc: "Attendance" },
    ],
    browserbase: {
      hub: `${PORTAL}/browserbase`,
      sessions: `${PORTAL}/api/browserbase/sessions`,
      key_status: `${PORTAL}/api/browserbase/key`,
    },
    docs: `${PORTAL}/docs`,
    keys_ui: `${PORTAL}/keys`,
    live_ui: `${PORTAL}/client`,
    curl_examples: {
      index: `curl -s ${PORTAL}/api/v1`,
      verify: `curl -s ${PORTAL}/api/v1/auth/verify -H "Authorization: Bearer mggems_KEY"`,
      notices: `curl -s ${PORTAL}/api/v1/notices -H "Authorization: Bearer mggems_KEY"`,
    },
  });
}
