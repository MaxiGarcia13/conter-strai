---
name: react-islands
description: >-
  Astro + React island performance for My Gallery. Use when writing or
  reviewing React islands, R3F/Three canvas work, GSAP entrance motion, or
  client bundle size — not Next.js/RSC/SWR patterns.
---

# React islands (My Gallery)

This project is **Astro SSG + React islands**, with **R3F/Three** for the corridor and **GSAP** for entrance/threshold motion. Do not apply Next.js App Router, RSC serialization, Server Actions, or SWR guidance here.

For deeper stack help, read the matching project skill: `astro`, `react-three-fiber`, `gsap-react`, `gsap-performance`, `threejs-*`, `web-perf`.

## When to apply

- New or refactored React components under `src/`
- Gallery island / canvas performance
- First-viewport vs deferred client work

## Prefer Astro for the shell

- Keep static layout, SEO, and non-interactive UI in `.astro` files.
- Hydrate React only where interactivity needs it (gallery walk, entrance choreography).
- One job per island; avoid a single mega-island that hydrates the whole page.

## Bundle and load

- Dynamic-import heavy Three/R3F/GSAP paths that are not required for first paint when the architecture allows.
- Prefer direct imports over barrel files for large libraries when tree-shaking is weak.
- Keep the first viewport an entrance composition — do not dump all photos into the initial client bundle.

## React runtime (islands)

- Do not define components inside components (remount / lost state).
- Derive values during render; do not mirror props into state + effects.
- Put user-driven side effects in event handlers, not `useEffect` chains.
- Use functional `setState` when updating from previous state.
- Prefer `useRef` for high-frequency transient values (pointer trackers) that should not re-render.
- Use transitions / deferred values only when UI jank is real — not by default.

## Motion and a11y

- Respect `prefers-reduced-motion` for GSAP and camera motion.
- Prefer transforms/opacity over layout thrash for animation.
- Keep motion intentional and few (entrance, threshold, walk feel).

## What not to do

- Do not introduce Next.js APIs (`next/dynamic`, `after()`, RSC cache patterns).
- Do not add SWR/React Query unless the product needs client fetch caches.
- Do not paste large third-party rule dumps into `.cursor/skills/` or nested `AGENTS.md`.
