// Pages Function: /api/accounts
// Relays the Xtream account database. Runs same-origin (behind Cloudflare
// Access), so SV_API_KEY stays server-side and never enters the bundle.

const DEFAULT_ACCOUNTS_URL = "https://x-stream-checker.vercel.app/api/sv/accounts";

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.SV_API_KEY) {
    return Response.json({ error: "not configured" }, { status: 503 });
  }

  try {
    const upstream = await fetch(env.SV_ACCOUNTS_URL || DEFAULT_ACCOUNTS_URL, {
      headers: {
        "X-SV-Key": env.SV_API_KEY,
        "User-Agent": "StreamVault/1.0",
        Accept: "application/json",
      },
    });

    // Never pass upstream error detail back to the browser
    if (!upstream.ok) {
      return Response.json({ error: "account fetch failed" }, { status: 502 });
    }

    const data = await upstream.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "account fetch failed" }, { status: 502 });
  }
}
