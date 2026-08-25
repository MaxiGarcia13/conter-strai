/** World-Y drop so a prone death pose sits on the floor (hips stay at standing height in-clip). */
export const DYING_GROUND_OFFSET_Y = -0.70;

/** Seconds to ease the corpse onto the ground after elimination. */
export const DYING_DROP_SECONDS = 0.85;

/** Ease-out progress 0..1 → world Y offset (0 standing → full drop). */
export function dyingGroundOffsetY(progress01: number): number {
  const t = Math.min(1, Math.max(0, progress01));
  if (t === 0) {
    return 0;
  }
  const eased = 1 - (1 - t) ** 2;
  return eased * DYING_GROUND_OFFSET_Y;
}
