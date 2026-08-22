# Conter Strai

Browser-based tactical shooter inspired by Counter-Strike. **Puma** vs **Lion**, round-based team elimination, no install.

> Lock in, squad up, and hold the line.

## Status

**US-1 (landing)** is shipped. Arena FPS, combat, rounds, and multiplayer are in progress — see [`specs/`](./specs/).

| Feature                                                               | State              |
| --------------------------------------------------------------------- | ------------------ |
| Landing (`/`) — hero, theme, Start Game CTA, GitHub contribute footer | Done               |
| 3D arena + FPS movement (`/play`)                                     | In progress (US-2) |
| Zone damage & difficulty                                              | In progress (US-3) |
| Round-based PvP (pistol, teams)                                       | In progress (US-4) |
| Online sync via Colyseus (Astro Node)                                 | In progress (US-5) |

## Game rules (MVP)

- **Teams:** Puma vs Lion (Argentina / England national animals)
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
  modules/          # Feature modules (game, combat, …) — added with US-2+
  pages/            # Routes (`/` landing, `/play`, …)
  styles/           # Global CSS / design tokens
specs/
  current/          # Living product contract
  us-*/             # Open user-story deltas
  CHANGELOG.md      # Shipped vs open US
public/             # Static assets (brand art, models, …)
tests/              # E2E specs
```

Landing lives in `src/pages/index.astro` (no Three.js). Domain logic for the game will live in `services/` / `utils/` without Three.js. Specs land before code for each user story.

## Contributing

1. Read `specs/current/` and the open `specs/us-*/` delta you are implementing.
2. Prefer small modules and pure domain services over render-coupled logic.
3. Unit-test domain logic; skip Three.js render internals.
4. Pre-commit runs `lint-staged` (ESLint fix on staged files).
5. The landing footer links to this repo — PRs welcome.

## License

[Apache License 2.0](./LICENSE)
