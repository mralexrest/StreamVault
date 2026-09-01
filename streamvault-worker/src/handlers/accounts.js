// /accounts handler — secure relay to the Xtream account database on Vercel.
// The API key stays server-side: the browser only ever talks to this Worker.
import { jsonResponse, errorResponse } from "../utils/cors.js";

const DEFAULT_ACCOUNTS_URL = "https://x-stream-checker.vercel.app/api/sv/accounts";

// GET /accounts
export async function handleAccounts(env) {
  const apiKey = env.SV_API_KEY;
  if (!apiKey) return errorResponse("not configured", 503);

  const upstreamUrl = env.SV_ACCOUNTS_URL || DEFAULT_ACCOUNTS_URL;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "X-SV-Key": apiKey,
        "User-Agent": "StreamVault/1.0",
        Accept: "application/json",
      },
    });

    // Any non-200 (401, 404, 5xx…) is reported generically — never leak
    // upstream error details to the browser.
    if (!upstream.ok) return errorResponse("account fetch failed", 502);

    const data = await upstream.json();
    return jsonResponse(data);
  } catch {
    return errorResponse("account fetch failed", 502);
  }
}
