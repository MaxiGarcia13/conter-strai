---
description: Spec-driven workflow — current/, changelog, open deltas, when to ship
globs: specs/**/*
alwaysApply: false
---

# Specs workflow

- **Truth:** `specs/current/{requirements,design}.md` — living product contract
- **Work queue:** `specs/current/tasks.md`, open `specs/us-<n>/tasks.md`, or `specs/tech-debt.md`
- **History:** `specs/CHANGELOG.md` — named ships only (see that file’s “How it works”)
- Spec **before** code for behavior changes; update `current/` (and any open delta) first
- Tick one task at a time; mark done only after acceptance criteria pass
- **Do not** add a changelog row per task — only when a phase / US **ships**
- On ship into `current/`: check US/NFR acceptance, clear Open row, one changelog bullet
- On ship of a delta folder: fold still-true rules into `current/`, changelog bullet, **delete** the folder
- Tech debt: usually no changelog unless user-visible product changed
- Do not revive deleted `specs/v1`…`v2.6` trees; amend `current/` instead
- **New deltas:** `specs/us-<n>/` only — see [spec-delta-us-ids.md](./spec-delta-us-ids.md) (`v2.7` is legacy until folded)
