# Conter Strai

Browser-based tactical shooter inspired by Counter-Strike. **Argentina** vs **England**, round-based team elimination, no install.

> Lock in, squad up, and hold the line.

## Status

**US-1 (landing)** is shipped. Arena FPS, combat, rounds, and multiplayer are in progress — see [`specs/`](./specs/).

| Feature | State |
| --- | --- |
| Landing (`/`) — hero, theme, Start Game CTA | Done |
| 3D arena + FPS movement (`/play`) | In progress (US-2) |
| Zone damage & difficulty | In progress (US-3) |
| Round-based PvP (pistol, teams) | In progress (US-4) |
| Online sync via Playroom Kit | In progress (US-5) |

## Game rules (MVP)

- **Teams:** Argentina vs England
- **Mode:** Team deathmatch — eliminate the other side
- **Rounds:** No mid-round respawn; full reset between rounds
- **Loadout:** Pistol only at round start
- **Damage:** Zone-based (head / body / limbs), scaled by difficulty
- **Map:** One scenario (`arena-01`) for MVP

## Stack

- [Astro](https://astro.build) — pages & landing (no Three.js on `/`)
- [React](https://react.dev) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Three.js](https://threejs.org) — game island
- [Tailwind CSS](https://tailwindcss.com) — styling
- [Zustand](https://zustand-demo.pmnd.rs) — client state
- [Playroom Kit](https://joinplayroom.com) — multiplayer (US-5)
- [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) — unit & e2e tests

## Getting started

**Requirements:** Node.js 20+ (developed on 24).

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run test` | Unit + e2e |
| `npm run test:unit` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run phoenix` | Clean install (`node_modules`, `dist`, `.astro`) |

Optional env:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4321` | Dev / preview port |
| `SITE` | `http://localhost:$PORT` | Canonical site URL (sitemap, meta) |

## Project layout

```
src/
  layouts/          # Shared Astro shell (SEO, fonts, atmosphere)
  modules/          # Feature modules (landing, game, combat, …)
  pages/            # Routes (`/`, `/play`, …)
  styles/           # Global CSS / design tokens
specs/
  current/          # Living product contract
  us-*/             # Open user-story deltas
  CHANGELOG.md      # Shipped vs open US
public/             # Static assets (brand art, models, …)
tests/              # E2E specs
```

Domain logic lives in `services/` / `utils/` without Three.js. Specs land before code for each user story.

## Contributing

1. Read `specs/current/` and the open `specs/us-*/` delta you are implementing.
2. Prefer small modules and pure domain services over render-coupled logic.
3. Unit-test domain logic; skip Three.js render internals.
4. Pre-commit runs `lint-staged` (ESLint fix on staged files).

## License

[Apache License 2.0](./LICENSE)
