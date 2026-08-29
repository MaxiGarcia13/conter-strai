import type { ScenarioProp } from '@/modules/scenarios/types';

/**
 * Greenery for arena-01 (US-11.2).
 * Jacaranda are collidable trees at map corners / open pockets inside the
 * 100×50 playable bounds, clear of spawn lanes and the main street centerline.
 */

export const arena01Greenery: ScenarioProp[] = [
  { id: 'jacaranda', position: [12, 0, 0] },
  { id: 'jacaranda', position: [18, 0, 0] },
  { id: 'jacaranda', position: [12, 0, 5] },
  { id: 'jacaranda', position: [18, 0, 5] },
  { id: 'jacaranda', position: [12, 0, 10] },
  { id: 'jacaranda', position: [18, 0, 10] },
];
