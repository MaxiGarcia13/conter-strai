# US-1 — Design

## Files

- `src/pages/index.astro` — extends `app.astro`
- `src/modules/landing/components/LandingHero.astro`
- `src/styles/global.css` — shooter theme tokens + base styles
- `src/layouts/app.astro` — layout shell, `theme-color`, favicon

## Layout

Full-viewport hero: left column (title, copy, CTA), right column (`soldiers.png`).
Mobile: stack vertically (copy first, art below).

```
┌─────────────────────────────────────────────┐
│  [atmosphere overlay — vignette + glow]     │
│                                             │
│  TACTICAL SHOOTER          ┌──────────────┐ │
│  Conter Strai              │  soldiers    │ │
│  tagline…                  │  .png        │ │
│  • Argentina vs England    │              │ │
│  • Round-based elimination │              │ │
│  • Pistol loadout (MVP)    └──────────────┘ │
│  [ Start Game ]                             │
└─────────────────────────────────────────────┘
```

## Shooter theme — CSS tokens

Define in `src/styles/global.css` (replace gallery tokens):

```css
:root {
  /* Surfaces */
  --background: hsl(220 15% 6%);
  --background-deep: hsl(220 18% 4%);
  --surface: hsl(220 12% 12%);
  --surface-border: hsl(220 10% 20%);

  /* Text */
  --foreground: hsl(210 15% 92%);
  --foreground-muted: hsl(215 10% 60%);

  /* Accents — CS amber (matches soldiers rim light) */
  --accent: hsl(36 82% 52%); /* primary CTA, highlights */
  --accent-soft: hsl(36 78% 42%); /* hover */
  --accent-glow: hsl(36 90% 50% / 0.35);
  --danger: hsl(0 70% 55%); /* eliminated / warnings (future HUD) */

  /* Shadows */
  --shadow-soft: hsl(220 30% 5% / 0.6);

  /* Fonts — unchanged unless US-1 adds a sharper display face */
  --font-display-family: 'Cormorant Garamond', …;
  --font-body-family: 'Outfit', …;
}
```

Tailwind `@theme inline` maps these to utilities: `bg-background`, `text-accent`, `bg-surface`, etc.

## Atmosphere component

Rename layout wrapper from `gallery-atmosphere` → `game-atmosphere`:

```css
.game-atmosphere {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, hsl(36 80% 42% / 0.15), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%, hsl(220 30% 15% / 0.3), transparent);
  z-index: 0;
}
```

## LandingHero styling (Tailwind)

| Element      | Style                                                                               |
| ------------ | ----------------------------------------------------------------------------------- |
| Eyebrow      | `text-sm uppercase tracking-widest text-accent`                                     |
| Title        | `font-display text-5xl–7xl font-semibold text-foreground`                           |
| Tagline      | `text-lg text-foreground-muted`                                                     |
| Bullets      | muted text + small `bg-accent` dot markers                                          |
| CTA          | `bg-accent text-background font-semibold rounded-md px-8 py-3 hover:bg-accent-soft` |
| Soldiers img | `object-contain drop-shadow-2xl max-h-[60vh]` — no border/frame                     |

## Reference mood

- Dark, high-contrast, minimal chrome
- Amber accent (deviation from original green spec): matches the soldiers art rim light, CS2-style HUD warmth
- Soldiers PNG black background blends into page — no visible seam

## Fixes bundled

- `app.astro` CSS import → `@/styles/global.css`
- `app.astro` — `game-atmosphere` class, dark `theme-color`, favicon → `/conter-strai.png`
- `astro.config.mjs` → add `site` URL
- Remove unused gallery CSS variables from `global.css`

## Out of scope (US-1)

- Animated particle effects, video backgrounds, sound
- In-game HUD styling (US-2+)
