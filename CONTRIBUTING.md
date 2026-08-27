# Contributing to Conter Strai

Thanks for your interest in contributing to Conter Strai. This project is an open-source browser-based tactical shooter built with Astro, React, React Three Fiber, and Colyseus. We welcome contributions from developers, designers, testers, and anyone who wants to help improve the game.

This guide explains how to set up the project, how to contribute safely, and how to follow the project’s structure and workflow.

## Project goals

Conter Strai is a browser tactical shooter where Civilians face Soldiers in round-based team elimination. The project is intentionally structured to keep the landing page lightweight while moving the 3D gameplay into a dedicated React/Three.js island.

The repo is organized around clear module boundaries, with gameplay logic kept as domain code instead of being tightly coupled to rendering.

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

Please read the project guidance before making changes:

1. [AGENTS.md](./AGENTS.md)
2. [specs/current/design.md](./specs/current/design.md)
3. The relevant open spec under [specs](./specs/)

The project follows a spec-first workflow. If you are changing behavior, features, or architecture, update the relevant spec before writing code.

## Local setup

### Requirements

- Node.js 20 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open http://localhost:4321 to view the app.

### Useful commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run test:unit
npm run test:e2e
npm run phoenix
```

A short summary of the most common commands:

- `npm run dev` — local development server
- `npm run build` — production build
- `npm run preview` — run the built production server
- `npm run lint` — lint the project
- `npm run test` — run unit and e2e tests
- `npm run test:unit` — Vitest unit suite
- `npm run test:e2e` — Playwright browser tests
- `npm run phoenix` — clean install by removing build artifacts and dependencies

## Repository conventions

The project uses a modular architecture under `src/modules/`.

### Important conventions

- One `types.ts` per module
- Registries live at the module root
- Keep domain logic separate from rendering concerns
- Do not mix Three.js or React rendering logic into pure gameplay services when it can be avoided
- Visual skins should reference hitbox presets by id; combat owns the actual hitbox configuration
- Landing pages should stay free of heavy Three.js loading

Core layout:

```text
src/
  components/
  layouts/
  modules/
    combat/
    game/
    lobby/
    multiplayer/
    props/
    scenarios/
    soldiers/
    teams/
    textures/
    weapons/
  pages/
  styles/
```

This structure is intentionally designed to keep the codebase understandable and modular as the game grows.

## Workflow for contributors

### 1. Pick an issue or task

Before writing code, find a task that matches your skill level and the project’s current roadmap.

Look at:

- [specs/current/tasks.md](./specs/current/tasks.md)
- [specs/CHANGELOG.md](./specs/CHANGELOG.md)
- The open story folders in [specs](./specs/)

If your change introduces new behavior, check whether there is an open spec for it. The project prefers spec-first work.

### 2. Create a branch

Use a clear branch name that describes the work:

```bash
git checkout -b fix/arena-collision
git checkout -b feature/round-summary-ui
git checkout -b docs/contributing-guide
```

### 3. Make the smallest useful change

Keep pull requests focused. Avoid mixing unrelated refactors into the same change set. This makes review easier and reduces regressions.

A strong pull request usually does one of these well:

- Fixes one bug
- Implements one feature from a spec
- Adds test coverage for a behavior change
- Improves clarity or developer experience without changing behavior

### 4. Test your work

Run the relevant validation before opening a PR:

```bash
npm run lint
npm run test:unit
npm run test:e2e
```

If your change affects a specific area, run the most relevant test suite instead of broad suites whenever possible.

### 5. Open a pull request

When you open a PR, include:

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

## Spec workflow

This repo expects specification updates for meaningful behavior changes.

When implementing or changing a feature:

1. Review the related design and task files
2. Update the relevant spec as needed
3. Implement the code change
4. Validate the result
5. Keep the spec and code aligned

This helps maintain a clear product contract as the project evolves.

## Documentation

Docs matter as much as code in open source projects. If you notice:

- unclear setup steps
- missing project context
- stale commands
- confusing module boundaries

please fix or improve the docs. A small documentation update often helps more contributors than a large feature patch.

## Bug reports

When reporting a bug, include:

- a short description of the issue
- reproduction steps
- expected behavior
- actual behavior
- browser and OS details if relevant
- screenshots or logs when helpful

The more precise the report, the easier it is to fix.

## Feature requests

Feature requests are welcome, but they should align with the project direction and current specs. Before proposing a large feature, check whether it fits the existing design and roadmap.

If it does not yet exist in the design docs, open a discussion or add a note in the relevant spec before building large scope.

## Contribution etiquette

We expect contributors to be respectful, constructive, and collaborative.

Please:

- be kind in discussions and reviews
- assume good faith when reviewing code
- explain decisions clearly
- keep communication professional and factual

This project is best advanced by a healthy, welcoming community.

## Pull request checklist

Before opening or submitting a PR, check the following:

- [ ] I read [AGENTS.md](./AGENTS.md)
- [ ] I checked the relevant spec and task files
- [ ] The change is scoped and focused
- [ ] I ran relevant tests and lint checks
- [ ] I updated documentation if needed
- [ ] I described the purpose and validation clearly in the PR

## Thank you

Thank you for helping build Conter Strai. Whether you are fixing a small bug, improving the docs, or contributing a new gameplay mechanic, your work helps make the project stronger.

Open source grows through collaboration, and every useful contribution matters.
