# US-1 — Landing page

## Requirements

| ID | Requirement |
|----|-------------|
| US-1.1 | Page at `/` uses `app.astro` layout |
| US-1.2 | Hero displays title "Conter Strai", tagline, and `soldiers.png` |
| US-1.3 | Short game info bullets: online PvP, **Argentina vs England** teams, round-based elimination |
| US-1.4 | **Start Game** button links to `/play` |
| US-1.5 | **Shooter game theme** — see [Theme & visual identity](#theme--visual-identity) below |
| US-1.6 | No Three.js bundle on landing |
| US-1.7 | SEO meta: title, description, OG image |

## Theme & visual identity

Landing must feel like a **tactical FPS title screen** (Counter-Strike / Rainbow Six Siege mood), not a gallery or marketing site.

| ID | Requirement |
|----|-------------|
| US-1-T1 | **Dark base** — near-black background (`~hsl(220 15% 6%)`); no warm/gallery palette |
| US-1-T2 | **Accent** — tactical green for primary CTA and highlights (`~hsl(145 60% 45%)`); danger red for optional warnings (`~hsl(0 70% 55%)`) |
| US-1-T3 | **Typography** — bold display font for title; clean sans-serif for body and UI (keep Outfit + Cormorant or swap display to a sharper military feel if needed) |
| US-1-T4 | **Atmosphere** — subtle full-page overlay: dark vignette + faint green/teal radial glow behind hero (CSS only, no WebGL) |
| US-1-T5 | **Soldiers art** — `soldiers.png` on black background; no white/light frame around the image; optional soft drop shadow so figures pop |
| US-1-T6 | **Start Game CTA** — high-contrast pill/button: solid accent fill, dark text, hover darkens; reads as "deploy" / "play now" |
| US-1-T7 | **Copy hierarchy** — small uppercase label ("Tactical shooter") → large title → muted tagline → bullet list with accent dots |
| US-1-T8 | **Replace legacy tokens** — remove gallery naming (`frame-wood`, `gallery-atmosphere`, etc.) from `global.css` and layout |
| US-1-T9 | **`theme-color` meta** — dark (`#0d0f14` or equivalent) for mobile browser chrome |
| US-1-T10 | **`prefers-reduced-motion`** — disable or simplify any CSS transitions on the hero if added |

## Acceptance

User opens `/`, sees a **dark tactical shooter** landing with soldiers art + info, clicks **Start Game**, lands on `/play`. Page must not look like the old gallery theme.
