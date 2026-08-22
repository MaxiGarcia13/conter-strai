---
description: Import style for src files — prefer the @/ alias, allow relative for locality
globs: src/**/*
alwaysApply: false
---

# Import Conventions

- **Default to `@/` aliases** for imports inside `src/` (maps to `./src/*`).
- **`./`** is fine for same-folder siblings (keeps local imports short).
- **`../`** (single level) is allowed when it reads naturally.
- **`../../` and deeper are banned** — enforced by `no-restricted-imports` in `eslint.config.js`.
- Prefer `import type` when only types are needed.
- **Barrel files (`index.ts`)**: add one when a folder is imported from many places, or when a single file pulls 2+ modules from the same folder, then import from the folder root instead of per-file paths.
- `.astro` frontmatter and React islands follow the same rules.
- Keep `scripts/*.mjs` on plain relative `../src/…` paths (run by node outside the alias resolver).
