---
description: Naming conventions for files, functions, variables, and global constants
alwaysApply: true
---

# Naming Conventions

- **Files/dirs:** kebab-case (`gallery-grid.tsx`, `use-lightbox.ts`)
- **Functions/vars:** camelCase (`loadGalleryItems`, `itemCount`)
- **React components:** PascalCase identifier; file stays kebab-case
- **Module constants:** SCREAMING_SNAKE_CASE (`MAX_UPLOAD_SIZE_MB`)
- Config files following ecosystem norms (`package.json`) are fine as-is

## Variable names

Use descriptive names — not single letters — except in these narrow cases:

- Loop indices: `i`, `j`, `k`
- Math / geometry locals in tight scope: `x`, `y`, `z` (e.g. destructuring, vector components)

```typescript
// ❌ BAD — opaque one-letter bindings
const o = enterOpts(0, 0);
applySeamlessRoomEnter(o);
expect(o.isLockedRef.current).toBe(false);

const a = roamPose();
const b = roamPose();

// ✅ GOOD — name the role
const enterContext = enterOpts(0, 0);
applySeamlessRoomEnter(enterContext);
expect(enterContext.isLockedRef.current).toBe(false);

const largeDeltaPose = roamPose();
const cappedDeltaPose = roamPose();
```

Applies to production code and tests (`src/`, `tests/`).
