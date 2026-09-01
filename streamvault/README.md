# StreamVault Frontend

React SPA built with Vite. The entire app lives in a single file (`src/App.jsx`).

## Setup

```bash
cp .env.example .env
npm install
npm run dev
# Opens at http://localhost:5173
```

## Build

```bash
npm run build
# Output: dist/
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_PROXY_URL` | `http://localhost:3001` | Backend proxy URL |
| `VITE_CATALOG_URL` | same as PROXY | CF Worker catalog API (optional) |
| `VITE_STREAM_PROXY_URL` | same as PROXY | Stream proxy URL (optional) |

## Server-side functions

`functions/api/` holds the same-origin endpoints, and `functions/worker.js` is
the entrypoint that routes to them — **a new file in `functions/api/` is not
reachable until it is imported and dispatched there.** Everything unmatched
falls through to the static assets.

| Route | Handler | Purpose |
|-------|---------|---------|
| `/api/health` | `api/health.js` | Health check |
| `/api/session` | `api/session.js` | Guest session storage (KV) |
| `/api/accounts` | `api/accounts.js` | Relays your Xtream account database |

`/api/accounts` reads two server-side variables, set in the Pages project rather
than `.env`. They must **not** be `VITE_`-prefixed, or Vite would inline them
into the browser bundle:

| Variable | Description |
|----------|-------------|
| `SV_API_KEY` | Secret — API key sent upstream as `X-SV-Key`. Without it the route returns 503 |
| `SV_ACCOUNTS_URL` | Upstream URL (optional — defaults to the Vercel endpoint) |

## Saved account picker

The Xtream Codes tab shows a **My Accounts** section backed by `/api/accounts`
above. Being same-origin, it needs no CORS and inherits whatever protects the
site — behind Cloudflare Access, so is the account list. Expanding it loads your
saved accounts; search filters by host, username or status, and clicking one
fills in Server URL, Username and Password.

Rendering is capped at 50 rows per result set, so very large lists stay
responsive — narrow them with the search box. If the endpoint returns 503 the
section hides itself, and any other failure falls back to a notice; the manual
credential fields are never blocked.

## Deploy to Cloudflare Pages

1. Connect your GitHub repo
2. Root directory: `streamvault`
3. Build command: `npm run build`
4. Build output: `dist`
5. Add env vars as needed
