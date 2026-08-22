# US-1 — Tasks

## Theme & layout

- [x] Replace gallery tokens in `global.css` with shooter theme (see `design.md` tokens)
- [x] Add `@theme inline` mappings for `accent`, `surface`, `danger`, etc.
- [x] Add `body` base styles (dark bg, antialiased)
- [x] Add `.game-atmosphere` overlay; rename in `app.astro` (remove `gallery-atmosphere`)
- [x] Set dark `theme-color` meta in `app.astro`

## Page & components

- [x] Fix layout CSS import in `app.astro` (`@/styles/global.css`)
- [x] Add `site` to `astro.config.mjs`
- [x] Build `LandingHero.astro` with shooter typography + CTA styling
- [x] Wire `index.astro` with layout + SEO meta (title, description, OG image)
- [ ] Point favicon to `/conter-strai.png`

## Verification

- [ ] Visual check: landing reads as tactical shooter (dark, green CTA, soldiers art)
- [ ] No gallery-named CSS tokens left in `global.css` / layout
- [ ] Playwright smoke (optional): landing renders, CTA navigates to `/play`
