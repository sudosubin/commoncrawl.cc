# @commoncrawl.cc/api

Cloudflare Worker API proxy for [index.commoncrawl.org](https://index.commoncrawl.org/).

## Prefix

All proxied routes are exposed under:

- `/api/v1/index/*`

## Local development (Worker)

```bash
pnpm --filter @commoncrawl.cc/api dev
```

This runs `wrangler dev src/index.ts`.

## Build check

```bash
pnpm --filter @commoncrawl.cc/api build
```

This runs a dry-run deploy build via Wrangler.

## OpenAPI endpoint

Generated spec endpoint:

- `/openapi.json`

## Environment variables (wrangler vars)

Defined in `wrangler.toml`:

- `CORS_ALLOW_ORIGIN` (default: `https://commoncrawl.cc`)
- `INDEX_UPSTREAM_BASE_URL` (default: `https://index.commoncrawl.org`)
- `INDEX_UPSTREAM_TIMEOUT_MS` (default: `20000`)

## Behavior

- Supports `GET` + `OPTIONS`.
- Adds CORS headers for browser fetch/XHR.
- Forwards safe request headers (`Accept`, `Accept-Datetime`, cache/range headers).
- Uses Valibot + `@hono/standard-validator` for route-level input validation.
- Includes CORS + CSRF protections at the proxy layer.
