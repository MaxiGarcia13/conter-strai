# GLB source assets (Cloudflare R2)

Runtime `.glb` files are **not** served from `public/`. They are hosted on Cloudflare R2 and delivered through the **`conter-strai-assets`** worker:

**https://conter-strai.maxig8.workers.dev/**

## Why Cloudflare (not the deployed app server)

GLB files are large (characters, props, weapons). Serving them from the Astro / Node app on Render would:

- Use **deployed-server egress bandwidth** on every download and cache miss
- Add load to the same process that runs Colyseus and SSR

Instead, production loads GLBs **directly from Cloudflare** via `glbCdnUrl()` — the browser fetches from `workers.dev`, and bytes stay on Cloudflare’s edge. The deployed app server only ships HTML/JS; it never proxies or streams `.glb` files.

Locally (`astro dev`, including Playwright), `glbCdnUrl()` points at **`/api/mock/local-glb`**, which reads this tree from disk. That keeps `npm run dev` and e2e independent of R2 and worker CORS.

## Path mapping

| Local source                                | Local (`astro dev` / e2e)                              | Production CDN                                                              |
| ------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `assets/glb/characters/civilians/james.glb` | `/api/mock/local-glb?q=characters/civilians/james.glb` | `https://conter-strai.maxig8.workers.dev/?q=characters/civilians/james.glb` |
| `assets/glb/<key>`                          | `/api/mock/local-glb?q=<key>`                          | `https://conter-strai.maxig8.workers.dev/?q=<key>`                          |

The `q` query value is the path under `assets/glb/` (no `/assets` prefix). Registries pass keys like `/characters/civilians/james.glb`; `glbCdnUrl()` strips the leading slash and builds the URL.

## Workflow

1. Edit GLBs in this tree (Git LFS tracks `*.glb`).
2. Run asset scripts as needed — see **[docs/asset-pipeline.md](../../docs/asset-pipeline.md)** for when and how (`assets:compress`, `assets:normalize-characters`, `assets:snap-animation-floor`, …).
3. **Upload updated objects to R2** so the worker serves the new files (see below).
4. Registries in `src/modules/` reference CDN URLs via `glbCdnUrl()` — no copy in `public/`.

## Updating GLBs on Cloudflare

Manage the production worker and its R2 bindings in the Cloudflare dashboard:

**[conter-strai-assets (production)](https://dash.cloudflare.com/7f78c6fc0099e40d2489473f3087d695/workers/services/view/conter-strai-assets/production)**

After local edits and script runs, upload changed keys to the bound R2 bucket using the same object key as in the table above (e.g. `characters/civilians/james.glb`). The worker resolves `?q=<key>` to that object.

Verify in the browser or with a GET:

`https://conter-strai.maxig8.workers.dev/?q=characters/civilians/james.glb`

## CORS

The worker must return `Access-Control-Allow-Origin` for browser `useGLTF` fetches from the game origin (e.g. `http://localhost:4321`, production `SITE`). Without CORS headers on the worker, cross-origin GLB loads will fail in the browser.

## What stays in `public/assets/`

- Character sounds (`.m4a`)
- Extracted PBR texture maps (`.jpg` / `.png` under `textures/maps/`)
- Scenario preview images

Texture source GLBs in `assets/glb/textures/` are build-time inputs for `npm run assets:extract-maps` only; runtime uses the extracted maps in `public/`.

## E2E tests

Playwright’s webServer is `npm run dev`, so the client already requests `/api/mock/local-glb?q=<key>` (`src/pages/api/mock/local-glb.ts`). CI does not hit Cloudflare and does not intercept `workers.dev`.
