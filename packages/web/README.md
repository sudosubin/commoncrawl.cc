# @commoncrawl.cc/web

Preact + Vite web app for commoncrawl.cc.

Provides a search-focused UI for exploring Common Crawl index data via [`@commoncrawl.cc/api`](../api/README.md).

## Routes

- `/`
- `/search`

## Local development (Web)

```bash
pnpm --filter @commoncrawl.cc/web dev
```

This runs the Vite dev server on port `3000`.

By default, the app expects the API package to be available at `http://localhost:8787`.

## Build check

```bash
pnpm --filter @commoncrawl.cc/web build
```

## Test

```bash
pnpm --filter @commoncrawl.cc/web test
```

## OpenAPI client generation

```bash
pnpm --filter @commoncrawl.cc/web openapi:pull
pnpm --filter @commoncrawl.cc/web openapi:generate
```

- `openapi:pull` exports the latest `packages/api/openapi.json`
- `openapi:generate` regenerates typed fetch clients and MSW handlers via Orval

## Environment variables

Use `.env` / `.env.example`:

- `VITE_API_BASE_URL` (default local value: `http://localhost:8787`)
- `VITE_USE_MSW` (`true` to enable MSW in development)

## Behavior

- Uses Preact + `preact-iso` for the app shell and client-side routing.
- Uses generated OpenAPI clients from `packages/api/openapi.json`.
- Supports MSW-based API mocking in local development.
- Includes a search workspace for snapshots, timeline, and capture/raw response inspection.
