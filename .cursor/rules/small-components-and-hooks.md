---
description: Prefer small React components and hooks with a single responsibility
globs: src/**/*.{tsx,jsx,ts}
alwaysApply: false
---

# Small Components & Hooks

- Aim for ~150 lines or less per component/hook file; split earlier if mixed concerns
- Orchestrators stay thin: compose children / sub-hooks
- Do not paper over hook call-order cycles with stub forward refs — see `handler-composition.mdc` (channels / ownership invert instead)
- New UI → new small component; new behavior → new focused hook
- Put pure helpers in `utils/` or `services/`; hooks own React state/effects only
