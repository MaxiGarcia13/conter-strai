---
description: Prefer short usable comments — no ticket archaeology or narration
globs: '**/*.{ts,tsx,js,jsx,mjs,cjs}'
alwaysApply: false
---

# Usable Comments

Comments exist to unlock non-obvious intent for the next reader. Prefer none over noise. Specs (`specs/`) own ticket IDs, phase numbers, and long “why we built this” narrative.

## Forbid

- **Ticket archaeology** — `Phase 31`, `T137`, `TD78`, `US-26`, `NFR-32`, etc. in runtime code
- **Narrating the code** — restating what the next few lines already say
- **Duplicating specs** — long file headers that re-explain design.md / tasks.md
- **Meta / tooling chatter** — “listed for exhaustive-deps”, “satisfies eslint”, “React Compiler will…”
- **Changelog comments** — “formerly X”, “after the Y refactor”, “kept for backward compat” unless the hazard is still live and unnamed otherwise

## Prefer

- One short line when behavior would surprise a careful reader (ordering hazard, intentional no-op, Strict Mode quirk, hitch/flash guard)
- Name the **constraint**, not the ticket (`last-wins so face-swings cancel superseded warms`)
- JSDoc on exports only when the signature alone is ambiguous (units, invariants, side effects)

## Examples

```ts
// ❌ BAD
// Kit warm once per layout (NFR-29 / Phase 31). Debounced in useGalleryWalkLayout.
preloadWalkKit(collectWalkKitIds(layout.segments));

// ❌ BAD
/**
 * Sticky doorway look-ahead (US-26 / NFR-32).
 * - Warm commit is trailing last-wins…
 * - Clears on leave roam…
 */
export function useLookAheadRoomId() {}

// ❌ BAD
// Stable shared refs (listed for exhaustive-deps clarity):
(baseLookAtRef,
// ✅ GOOD
// Do not dismiss intro here — empty HUD between room→connector→room flashes twice.
(connectorEnterFromRef.current = fromRoomId));

// ✅ GOOD
/** Trailing last-wins delay (ms) before look-ahead `.sm` warm commits. */
export const LOOK_AHEAD_WARM_DEBOUNCE_MS = 32;
```

## Specs stay the ledger

Link behavior to `US-*` / `NFR-*` / tasks only in `specs/`. Code comments describe surviving hazards, not shipped tickets.
