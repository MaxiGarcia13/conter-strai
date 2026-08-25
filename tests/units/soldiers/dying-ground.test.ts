import { describe, expect, it } from 'vitest';
import { DYING_GROUND_OFFSET_Y, dyingGroundOffsetY } from '@/modules/soldiers/constants/dying';

describe('dyingGroundOffsetY', () => {
  it('starts at standing height', () => {
    expect(dyingGroundOffsetY(0)).toBe(0);
  });

  it('reaches the full ground drop at progress 1', () => {
    expect(dyingGroundOffsetY(1)).toBe(DYING_GROUND_OFFSET_Y);
  });

  it('eases out (midpoint deeper than linear half)', () => {
    expect(dyingGroundOffsetY(0.5)).toBeLessThan(DYING_GROUND_OFFSET_Y / 2);
  });
});
