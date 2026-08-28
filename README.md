# Conter Strai

Browser-based tactical shooter inspired by Counter-Strike. **Civilians** vs **Soldiers**, round-based team elimination, no install.

> The revolution starts here — choose your side and fight.

## Status

**Status:** US-1–US-8 shipped (including Colyseus multiplayer US-5 and server security US-8). Open: US-9, US-10 — see [CHANGELOG](./specs/CHANGELOG.md).

| Feature                                                           | State              |
| ----------------------------------------------------------------- | ------------------ |
| Landing (`/`) — hero, theme, Create/Join Room CTAs, GitHub footer | Done (US-1 + US-7) |
| 3D arena + FPS movement                                           | Done (US-2)        |
| Zone damage & difficulty                                          | Done (US-3)        |
| Shared skins + animation pack                                     | Done (US-6)        |
| Round-based PvP (pistol, teams, reload)                           | Done (US-4)        |
| Match lobby (`/room` create / join / wait / play)                 | Done (US-7)        |
| Online sync via Colyseus (Astro Node)                             | Done (US-5)        |

## Game rules (MVP)

- **Teams:** Civilians vs Soldiers
- **Mode:** Team deathmatch — eliminate the other side
- **Rounds:** No mid-round respawn; full reset between rounds
- **Loadout:** Pistol only at round start
- **Damage:** Zone-based (head / body / limbs), scaled by difficulty
- **Map:** One scenario (`arena-01`) for MVP

## Stack

- [Astro](https://astro.build) — pages & landing (no Three.js on `/`); Node adapter for multiplayer
- [React](https://react.dev) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Three.js](https://threejs.org) — game island
- [Tailwind CSS](https://tailwindcss.com) — styling
- [Zustand](https://zustand-demo.pmnd.rs) — client state
- [Colyseus](https://colyseus.io/framework/) — multiplayer rooms
- [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) — unit & e2e tests

## Getting started

**Requirements:** Node.js 20+ (developed on 24).

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

### Scripts

| Command                             | Description                                                        |
| ----------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                       | Dev server                                                         |
| `npm run build`                     | Production build (+ custom Astro/Colyseus entry)                   |
| `npm run preview`                   | Run production entry (`dist/server/custom-entry.mjs`; build first) |
| `npm run lint` / `npm run lint:fix` | ESLint                                                             |
| `npm run test`                      | Unit + e2e                                                         |
| `npm run test:unit`                 | Vitest                                                             |
| `npm run test:e2e`                  | Playwright                                                         |
| `npm run phoenix`                   | Clean install (`node_modules`, `dist`, `.astro`)                   |

**Render:** Build Command `npm run build`, Start Command `npm run preview`. One Web Service — Astro + Colyseus share `$PORT`.

Optional env:

| Variable              | Default                        | Purpose                                                                      |
| --------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| `PORT`                | `4321`                         | HTTP listen port (`npm run preview` / Render `$PORT`)                        |
| `SITE`                | `http://localhost:$PORT`       | Canonical site URL (sitemap, meta)                                           |
| `PUBLIC_COLYSEUS_URL` | — (required for `npm run dev`) | Dev WebSocket URL, e.g. `ws://localhost:2567`. Prod client uses same-origin. |
| `COLYSEUS_PORT`       | `2567`                         | Dev-only Colyseus listen port (`npm run dev`)                                |

`PUBLIC_COLYSEUS_URL` examples:

- Dev (`npm run dev`): `ws://localhost:2567` (must match `COLYSEUS_PORT`) — **required**
- Prod (`npm run preview` / Render): client uses **same-origin** `ws:` / `wss:` automatically (ignores a baked `localhost:2567`). Optional override is unused in the browser when `import.meta.env.PROD`.

## Project layout

```
src/
  components/       # Shared Astro UI (e.g. GithubIcon)
  layouts/          # Shared Astro shell (SEO, fonts, atmosphere)
  modules/          # Feature modules — one types.ts per module, registries at root
    combat/         # Hitbox presets, zone damage, apply-damage
    game/           # GameCanvas, FPS controls, round types
    lobby/          # Room create / join UI and session helpers
    multiplayer/    # Colyseus adapter, match sync
    props/          # Scenario prop registry (stub)
    scenarios/      # Maps (arena-01), ScenarioConfig, spawn helpers
    soldiers/       # SoldierSkin registry, model, locomotion
    teams/          # Civilians / Soldiers
    textures/       # PBR map assets
    weapons/        # Pistol config & weapon registry
  pages/            # Routes (`/` landing, `/room/...`, …)
  styles/           # Global CSS / design tokens
specs/
  current/          # Living product contract (design, tasks)
  us-*/             # Open user-story deltas
  CHANGELOG.md      # Shipped US + cross-cutting refactors
public/             # Static assets (brand art, GLB models, textures, …)
tests/              # E2E specs
```

Landing lives in `src/pages/index.astro` (no Three.js). Game logic lives in `src/modules/` — domain services (e.g. `combat/apply-damage.ts`) stay free of Three.js where possible. Visual skins reference hitbox presets by id; combat owns collider layout.

**Module types & conventions:** [`specs/current/design.md`](./specs/current/design.md#module-types) — `ScenarioConfig`, `SoldierSkin`, `HitboxPreset`, registries.

**Agent / AI contributors:** start at [`AGENTS.md`](./AGENTS.md). Cursor rules live in [`.cursor/rules/`](./.cursor/rules/).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request or submitting an issue — workflow, PR expectations, spec-first changes, and contributor etiquette. Setup and architecture live in this README and [`specs/current/design.md`](./specs/current/design.md).

## License

[Apache License 2.0](./LICENSE)
