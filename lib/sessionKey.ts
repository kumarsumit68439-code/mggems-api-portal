import { createHmac, randomBytes, timingSafeEqual } from "crypto";

function secret() {
  return (
    process.env.BROWSERBASE_API_KEY ||
    process.env.SESSION_KEY_SECRET ||
    "mggems-session-secret"
  );
}

/** Create a browser-style API key bound to a Browserbase session id */
export function issueSessionApiKey(sessionId: string) {
  const nonce = randomBytes(12).toString("base64url");
  const payload = `${sessionId}.${nonce}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  const raw = `bbsess_${Buffer.from(payload).toString("base64url")}.${sig}`;
  return {
    api_key: raw,
    key: raw,
    prefix: raw.slice(0, 14),
    session_id: sessionId,
  };
}

/** Verify bbsess_ key → session id */
export function verifySessionApiKey(raw: string): { ok: true; sessionId: string } | { ok: false; error: string } {
  if (!raw || !raw.startsWith("bbsess_")) {
    return { ok: false, error: "Invalid key format (expect bbsess_…)" };
  }
  try {
    const body = raw.slice("bbsess_".length);
    const lastDot = body.lastIndexOf(".");
    if (lastDot < 0) return { ok: false, error: "Malformed key" };
    const payloadB64 = body.slice(0, lastDot);
    const sig = body.slice(lastDot + 1);
    const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
    const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: "Invalid signature" };
    }
    const sessionId = payload.split(".")[0];
    if (!sessionId) return { ok: false, error: "Missing session id" };
    return { ok: true, sessionId };
  } catch {
    return { ok: false, error: "Key parse failed" };
  }
}

export function getBearer(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}
