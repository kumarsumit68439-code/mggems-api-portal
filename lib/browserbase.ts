const BB = "https://api.browserbase.com/v1";

export function getBbKey(req?: Request) {
  const fromHeader = req?.headers.get("x-browserbase-key") || req?.headers.get("x-bb-api-key") || "";
  return (
    fromHeader.trim() ||
    process.env.BROWSERBASE_API_KEY ||
    process.env.NEXT_PUBLIC_BROWSERBASE_API_KEY ||
    ""
  ).trim();
}

export async function bbFetch(
  path: string,
  opts: { method?: string; key: string; body?: unknown; projectId?: string } 
) {
  const headers: Record<string, string> = {
    "x-bb-api-key": opts.key,
    "Content-Type": "application/json",
  };
  const res = await fetch(`${BB}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 800) };
  }
  return { ok: res.ok, status: res.status, data };
}
