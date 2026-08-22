# US-1 — Tasks

## Theme & layout

- [x] Replace gallery tokens in `global.css` with shooter theme (see `design.md` tokens)
- [ ] Add `@theme inline` mappings for `accent`, `surface`, `danger`, etc.
- [ ] Add `body` base styles (dark bg, antialiased)
- [ ] Add `.game-atmosphere` overlay; rename in `app.astro` (remove `gallery-atmosphere`)
- [ ] Set dark `theme-color` meta in `app.astro`

## Page & components

- [ ] Fix layout CSS import in `app.astro` (`@/styles/global.css`)
- [ ] Add `site` to `astro.config.mjs`
- [ ] Build `LandingHero.astro` with shooter typography + CTA styling
- [ ] Wire `index.astro` with layout + SEO meta (title, description, OG image)
- [ ] Point favicon to `/conter-strai.png`

## Verification

- [ ] Visual check: landing reads as tactical shooter (dark, green CTA, soldiers art)
- [ ] No gallery-named CSS tokens left in `global.css` / layout
- [ ] Playwright smoke (optional): landing renders, CTA navigates to `/play`
