# US-4 — Design

## useShooting hook

- Raycast from camera on mousedown (with cooldown)
- Filter hits by `userData.hitZone` and `userData.entityId`
- Call `applyDamage` via combat service
- Update health store

## Dummy target

Second soldier entity at fixed position, id `dummy-1`.

## Elimination

When `isEliminated`, disable FpsPlayer controls.
After 3 s, reset HP and teleport to random spawn.

## Vitest

Test `resolveHitDamage` helper if extracted from hook.
