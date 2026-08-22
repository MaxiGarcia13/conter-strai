---
description: Place module-level constants and domain types in constants/ and types/
globs: src/modules/**/*
alwaysApply: false
---

# Module Constants & Types

Within `src/modules/<domain>/`:

- `constants/` — shared `SCREAMING_SNAKE_CASE` values used by 2+ files
- `types/` — domain interfaces/aliases shared across the module
- File names kebab-case; no `-constants` / `-types` suffix
- Scene colors go in palette constants, not scattered `#…` in components
- One-off locals stay private in the file; single-component prop types stay next to the component
- Prefer `import type` when only types are needed
