import type { ScenarioProp } from '@/modules/scenarios/types';

/**
 * Greenery for arena-01 (US-11.2).
 * Jacaranda are collidable trees at map corners / open pockets inside the
 * 100×50 playable bounds, clear of spawn lanes and the main street centerline.
 */

export const arena01Greenery: ScenarioProp[] = [
  { id: 'jacaranda', position: [12, 0, 0] },
  { id: 'jacaranda', position: [18, 0, 0] },
  { id: 'jacaranda', position: [12, 0, 6] },
  { id: 'jacaranda', position: [18, 0, 4] },
  { id: 'jacaranda', position: [13, 0, 13] },
  { id: 'jacaranda', position: [20, 0, 14] },

  { id: 'jacaranda', position: [30, 0, -25] },
  { id: 'jacaranda', position: [28, 0, -20] },
  { id: 'jacaranda', position: [31, 0, -15] },
  { id: 'jacaranda', position: [35, 0, -20] },

  ...([
    [-74, -48],
    [74, -48],
    [-74, 48],
    [74, 48],
    [-66, 30],
    [66, 30],
    [-66, -30],
    [66, -30],
    [-66, 0],
    [66, 0],
    [-30, 66],
    [30, 66],
    [-30, -66],
    [30, -66],
  ] as [number, number][]).map(
    ([x, z]): ScenarioProp => ({ id: 'jacaranda', position: [x, 0, z], collidable: false }),
  ),
];
