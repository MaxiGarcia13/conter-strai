import type { ScenarioFloorZone } from '@/modules/scenarios/types';
import { floorZone } from '@/modules/scenarios/pieces/floor-helpers';

/**
 * Street grid matching the ruined-village diagram (green rectangles).
 * Vertical strips stop at the main street edge (z=-5) and the bottom-left spur
 * taps the vertical-left edge (x=-25) so zones meet at edges, never overlap.
 */
export const arena01GroundFloors: ScenarioFloorZone[] = [
  floorZone('street-main', 'asphalt', 0, -8, 92, 6),
  floorZone('street-v-left', 'asphalt', -22, 7.5, 6, 25),
  floorZone('street-v-right', 'asphalt', 26, 7.5, 6, 25),
  floorZone('street-bl', 'asphalt', -37, 17, 24, 6),
  floorZone('street-r-spur', 'asphalt', 39, 14, 18, 6),
];
