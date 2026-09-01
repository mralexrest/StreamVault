# StreamVault Worker

Cloudflare Worker that replaces `stalker-proxy` with additional features: D1 persistent storage, KV session caching, usage analytics, and daily cleanup.

## Setup

```bash
# Create Cloudflare resources
wrangler kv namespace create SV_CACHE
wrangler d1 create streamvault-db

# Add the returned IDs to wrangler.toml
# Run database migrations
wrangler d1 migrations apply streamvault-db

# API key for the upstream account database used by GET /accounts
# (the URL itself is the SV_ACCOUNTS_URL var in wrangler.toml)
wrangler secret put SV_API_KEY

# Local dev
npm run dev

# Deploy
npm run deploy
```

## Routes

All routes from `stalker-proxy` plus:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/stalker/play` | GET | Resolve + stream in one request (same IP) |
| `/accounts` | GET | Xtream account list, relayed from the account database |
| `/api/catalog/connections` | PUT/GET/DELETE | Persistent connection storage |
| `/api/catalog/content` | PUT/GET/DELETE | Content item storage |
| `/api/catalog/categories` | PUT/GET | Category storage |
| `/api/catalog/favorites` | PUT/GET | Favorites sync |
| `/api/catalog/history` | PUT/GET/PATCH | Watch history sync |
| `/api/catalog/preferences` | PUT/GET | User preferences |
| `/api/analytics` | GET | Usage stats |
| `/analytics` | GET | Dashboard HTML |

### `GET /accounts`

Relays your Xtream account database. The Worker fetches `SV_ACCOUNTS_URL` with an
`X-SV-Key: $SV_API_KEY` header, so the key stays server-side and never reaches
the browser.

> **The frontend no longer calls this route.** It uses the same-origin Pages
> Function at `/api/accounts` (`streamvault/functions/api/accounts.js`) instead,
> which sits behind the site's Cloudflare Access login. This route is kept for
> compatibility and is unauthenticated — see the note below.

| Condition | Response |
|-----------|----------|
| Upstream 200 | The upstream JSON array, verbatim |
| `SV_API_KEY` unset | `503 {"error":"not configured"}` — the picker hides itself |
| Upstream 401/error, or unreachable | `502 {"error":"account fetch failed"}` |

Upstream error details are never passed through. Configure with:

```bash
wrangler secret put SV_API_KEY     # secret — not in wrangler.toml
# SV_ACCOUNTS_URL is a [vars] entry in wrangler.toml
```

Note: the route itself is unauthenticated — anyone who can reach the Worker URL
can read the list. Add a guard (e.g. the `X-Guest-Id` check the catalog routes
use) if that matters to you.

## D1 Schema

Migrations in `migrations/`:
- `0001_schema.sql` — users, connections, content, favorites, history, preferences
- `0002_last_active.sql` — guest activity tracking
- `0003_usage_log.sql` — daily request/bandwidth counters

## Key differences from stalker-proxy

| Feature | stalker-proxy | CF Worker |
|---------|--------------|-----------|
| Runtime | Node.js / Express | Cloudflare Workers |
| Session cache | In-memory Map | KV (6hr TTL) |
| Path cache | In-memory Map | KV (6hr TTL) |
| Content storage | None | D1 (SQLite) |
| Stream proxy | Body pipe | ReadableStream |
| Cost | Depends on host | Free tier (100K req/day) |
| Cleanup | None | Daily cron (7-day inactive) |
