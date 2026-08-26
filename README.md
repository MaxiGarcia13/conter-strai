# Conter Strai

Browser-based tactical shooter inspired by Counter-Strike. **Civilians** vs **Soldiers**, round-based team elimination, no install.

> The revolution starts here — choose your side and fight.

## Status

**Status:** US-1–US-4, US-6, and US-7 are shipped. Colyseus multiplayer (US-5) is open — see [CHANGELOG](./specs/CHANGELOG.md).

| Feature                                                           | State              |
| ----------------------------------------------------------------- | ------------------ |
| Landing (`/`) — hero, theme, Create/Join Room CTAs, GitHub footer | Done (US-1 + US-7) |
| 3D arena + FPS movement                                           | Done (US-2)        |
| Zone damage & difficulty                                          | Done (US-3)        |
| Shared skins + animation pack                                     | Done (US-6)        |
| Round-based PvP (pistol, teams, reload)                           | Done (US-4)        |
| Match lobby (`/room` create / join / wait / play)                 | Done (US-7)        |
| Online sync via Colyseus (Astro Node)                             | In progress (US-5) |

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
- [Colyseus](https://colyseus.io/framework/) — multiplayer rooms (US-5)
- [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) — unit & e2e tests

## Getting started

**Requirements:** Node.js 20+ (developed on 24).

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

### Scripts

| Command                             | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| `npm run dev`                       | Dev server                                       |
| `npm run build`                     | Production build                                 |
| `npm run preview`                   | Preview production build                         |
| `npm run lint` / `npm run lint:fix` | ESLint                                           |
| `npm run test`                      | Unit + e2e                                       |
| `npm run test:unit`                 | Vitest                                           |
| `npm run test:e2e`                  | Playwright                                       |
| `npm run phoenix`                   | Clean install (`node_modules`, `dist`, `.astro`) |

Optional env:

| Variable | Default                  | Purpose                            |
| -------- | ------------------------ | ---------------------------------- |
| `PORT`   | `4321`                   | Dev / preview port                 |
| `SITE`   | `http://localhost:$PORT` | Canonical site URL (sitemap, meta) |

## Project layout

```
src/
  components/       # Shared Astro UI (e.g. GithubIcon)
  layouts/          # Shared Astro shell (SEO, fonts, atmosphere)
  modules/          # Feature modules — one types.ts per module, registries at root
    game/           # GameCanvas, FPS controls, round types
    scenarios/      # Maps (arena-01), ScenarioConfig, spawn helpers
    soldiers/       # SoldierSkin registry, model, locomotion
    combat/         # Hitbox presets, zone damage, apply-damage
    weapons/        # Pistol config & weapon registry
    teams/          # Civilians / Soldiers
    textures/       # PBR map assets
    props/          # Scenario prop registry (stub)
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

**Agent / AI contributors:** start at [`AGENTS.md`](./AGENTS.md) (specs workflow, module layout, commands, do-nots). Cursor rules live in [`.cursor/rules/`](./.cursor/rules/).

Specs land before code for each user story. Read `specs/current/` and the open `specs/us-*/` delta you are implementing.

## Contributing

1. Read [`AGENTS.md`](./AGENTS.md), then [`specs/current/`](./specs/current/) and the open [`specs/us-*/`](./specs/) delta you are implementing.
2. Follow module conventions: one `types.ts` per module, data registries at module root — see [design.md](./specs/current/design.md#module-types).
3. Prefer small modules and pure domain services over render-coupled logic.
4. Unit-test domain logic; skip Three.js render internals.
5. Pre-commit runs `lint-staged` (ESLint fix on staged files).
6. The landing footer links to this repo — PRs welcome.

## License

[Apache License 2.0](./LICENSE)
