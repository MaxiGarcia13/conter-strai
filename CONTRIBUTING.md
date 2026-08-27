# Contributing to Conter Strai

Thanks for your interest in contributing. This guide covers workflow, pull requests, and community expectations — not project setup or architecture (those live elsewhere).

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

1. [README.md](./README.md) — getting started, scripts, env vars, project layout
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

See [README — Getting started](./README.md#getting-started) for install, dev server, env vars, and the full scripts table.

Before opening a PR, run:

```bash
npm run lint
npm run test:unit
npm run test:e2e
```

Run the most relevant suite when your change is scoped to one area.

## Repository conventions

Module layout and domain conventions are documented in [specs/current/design.md](./specs/current/design.md#module-types). The [README project layout](./README.md#project-layout) shows the current tree under `src/modules/`.

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

If you notice unclear setup steps, stale commands, or confusing module boundaries, please fix or improve the docs. Prefer updating the canonical source ([README](./README.md) for setup, [design.md](./specs/current/design.md) for architecture) rather than duplicating content here.

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
