# Contributing to Conter Strai

Thanks for your interest in contributing. This guide covers local developer setup, project layout, pull requests, and community expectations. Player-facing “how to run and play” lives in [README.md](./README.md).

## Ways to contribute

You can help in many ways:

- Report bugs and reproducible issues
- Suggest gameplay or UX improvements
- Improve docs and onboarding
- Add tests for core logic and bug fixes
- Build new features in the agreed design scope
- Refine performance, accessibility, or code quality

Not every contribution needs to be a large code change. Clear bug reports, thoughtful design feedback, and documentation improvements are valuable.

## Before you start

Read these before making changes:

1. [README.md](./README.md) — what the game is and how to run a playable server
2. [specs/current/design.md](./specs/current/design.md) — module types and conventions
3. [specs/current/tasks.md](./specs/current/tasks.md) and the relevant open spec under [specs/](./specs/)

**AI / agent contributors:** start at [AGENTS.md](./AGENTS.md).

### Spec-first workflow

Behavior, feature, and architecture changes need a spec update **before** code:

1. Review the related design and task files
2. Update the relevant spec (`specs/us-<n>/` or `specs/current/`) as needed
3. Implement the code change
4. Validate the result and keep spec and code aligned

Tick tasks in the spec only after acceptance passes.

## Local setup and commands

**Requirements:** Node.js 20+ (developed on 24).

```bash
npm install
PUBLIC_COLYSEUS_URL=ws://localhost:2567 npm run dev
```

Open [http://localhost:4321](http://localhost:4321). `PUBLIC_COLYSEUS_URL` is required for `npm run dev` (must match `COLYSEUS_PORT`, default `2567`).

For a production-like server (or a LAN party), use `npm run build` then `npm run preview` — see [README — Host a LAN party](./README.md#host-a-lan-party).

### Scripts

| Command                               | Description                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`                         | Dev server                                                                      |
| `npm run build`                       | Production build (+ custom Astro/Colyseus entry)                                |
| `npm run preview`                     | Run production entry (`dist/server/custom-entry.mjs`; build first)              |
| `npm run lint` / `npm run lint:fix`   | ESLint                                                                          |
| `npm run test`                        | Unit + e2e                                                                      |
| `npm run test:unit`                   | Vitest                                                                          |
| `npm run test:e2e`                    | Playwright                                                                      |
| `npm run phoenix`                     | Clean install (`node_modules`, `dist`, `.astro`)                                |
| `npm run assets:compress`             | Resize / optimize GLBs (see [docs/asset-pipeline.md](./docs/asset-pipeline.md)) |
| `npm run assets:normalize-characters` | Mixamo skeleton + material fixes on character GLBs                              |
| `npm run assets:snap-animation-floor` | Floor-snap hips Y on shared animation packs                                     |
| `npm run assets:extract-maps`         | Extract PBR maps from texture GLBs into `public/`                               |

**Asset pipeline:** when to run each script, recommended order, and CLI flags — [docs/asset-pipeline.md](./docs/asset-pipeline.md).

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

Before opening a PR, run:

```bash
npm run lint
npm run test:unit
npm run test:e2e
```

Run the most relevant suite when your change is scoped to one area.

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

## Repository conventions

Module layout and domain conventions are documented in [specs/current/design.md](./specs/current/design.md#module-types). The [project layout](#project-layout) above shows the current tree under `src/modules/`.

High-level rules to keep in mind:

- One `types.ts` per module; registries at the module root
- Keep domain logic separate from rendering (no Three.js in pure gameplay services)
- Visual skins reference hitbox presets by id; **combat** owns collider layout
- Landing (`/`) must not pull Three.js into the Astro bundle

## Workflow for contributors

### 1. Pick an issue or task

Find work that matches your skill level and the current roadmap:

- [specs/current/tasks.md](./specs/current/tasks.md)
- [specs/CHANGELOG.md](./specs/CHANGELOG.md)
- Open story folders in [specs/](./specs/)

If your change introduces new behavior, confirm there is an open spec for it.

### 2. Create a branch

Use a clear branch name:

```bash
git checkout -b fix/arena-collision
git checkout -b feature/round-summary-ui
git checkout -b docs/contributing-guide
```

### 3. Make the smallest useful change

Keep pull requests focused. Avoid mixing unrelated refactors into the same change set.

A strong pull request usually does one of these well:

- Fixes one bug
- Implements one feature from a spec
- Adds test coverage for a behavior change
- Improves clarity or developer experience without changing behavior

### 4. Open a pull request

Include:

- A clear title
- A short summary of the change
- What problem it solves
- What was tested
- Any risks or follow-up work

Good PR descriptions explain the intent behind the code, not just the code itself.

## Coding standards

### General expectation

- Prefer small, readable modules
- Keep logic domain-focused and reusable
- Avoid render-coupled code in shared gameplay layers
- Add comments only when they explain non-obvious intent
- Match the surrounding code style and naming conventions

### Files and structure

- Use kebab-case for filenames and folders
- Use PascalCase for exported components
- Keep one component per file when practical
- Use small hooks and helper modules rather than large monolithic files

### Testing

- Unit-test domain logic when possible
- Avoid UI-heavy tests for rendering internals that are not central to the behavior
- Prefer regression tests for bugs and gameplay logic

## Documentation

If you notice unclear setup steps, stale commands, or confusing module boundaries, please fix or improve the docs. Prefer updating the canonical source ([README](./README.md) for how to play and host, this file for contributor setup and layout, [design.md](./specs/current/design.md) for architecture) rather than duplicating content here.

## Bug reports

When reporting a bug, include:

- A short description of the issue
- Reproduction steps
- Expected behavior
- Actual behavior
- Browser and OS details if relevant
- Screenshots or logs when helpful

The more precise the report, the easier it is to fix.

## Feature requests

Feature requests are welcome, but they should align with the project direction and current specs. Before proposing a large feature, check whether it fits the existing design and roadmap.

If it does not yet exist in the design docs, open a discussion or add a note in the relevant spec before building large scope.

## Contribution etiquette

We expect contributors to be respectful, constructive, and collaborative.

Please:

- Be kind in discussions and reviews
- Assume good faith when reviewing code
- Explain decisions clearly
- Keep communication professional and factual

## Pull request checklist

Before opening or submitting a PR:

- [ ] I read [README.md](./README.md) and the relevant spec / task files
- [ ] I updated the spec first if the change affects behavior or architecture
- [ ] The change is scoped and focused
- [ ] I ran relevant tests and lint checks
- [ ] I updated documentation in the right place if needed
- [ ] I described the purpose and validation clearly in the PR

## Thank you

Thank you for helping build Conter Strai. Whether you are fixing a small bug, improving the docs, or contributing a new gameplay mechanic, your work helps make the project stronger.
