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

## Saved account picker

The Xtream Codes tab shows a **My Accounts** section when the backend at
`VITE_CATALOG_URL` exposes `GET /accounts` (see `streamvault-worker/`). Expanding
it loads your saved accounts; search filters by host, username or status, and
clicking one fills in Server URL, Username and Password.

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
