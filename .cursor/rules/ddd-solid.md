---
description: Prefer Domain-Driven Design and SOLID when structuring code
globs: src/modules/**/*
alwaysApply: false
---

# DDD & SOLID

- Domains live under `src/modules/<domain>/` (`adapters/`, `services/`, `utils/`, `hooks/`, `components/`, `constants/`, `types/` as needed)
- Large domains may split into subdomains (e.g. `gallery/walk`, `gallery/roam`, `gallery/floor-plan`, `gallery/portraits`, `gallery/corridor`, `gallery/surfaces`, `gallery/shared`) with the same layer folders inside each
- `gallery/corridor` nests surface subdomains (`roof`, `floor`, `wall`) with the same layers; shared shell sizes stay at `corridor/constants/corridor-shell.ts`
- `gallery/surfaces` owns reusable wood / paper textures and materials shared across corridor and portraits
- Pages stay thin; name modules after gallery domain language from specs
- Domain logic in `services/` / `utils/` / `types/`; side effects in `adapters/` / `hooks/`
- Do not use a flat `src/components/` or `src/domain/` for domain logic
- Avoid cross-domain deep imports; skip empty layers until needed; keep `shared/` thin
- No GSAP/Three/Tailwind inside pure `services/` / `utils/`
