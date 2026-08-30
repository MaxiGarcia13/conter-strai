import type { ScenarioFloorZone } from '@/modules/scenarios/types';
import { floorZone } from '@/modules/scenarios/pieces/floor-helpers';

/**
 * Street grid matching the ruined-village diagram (green rectangles).
 * Main street spans playable width (100) plus the open-perimeter vista (100
 * each side) so asphalt continues past the bounds. Vertical strips stay flush
 * with the main street (z=-6) and run north through the playable edge into
 * the vista (z=125). The bottom-left spur taps the vertical-left edge so
 * zones meet at edges, never overlap.
 */
export const arena01GroundFloors: ScenarioFloorZone[] = [
  floorZone('street-main', 'asphalt', 0, -9, 300, 6),
  floorZone('street-v-left', 'asphalt', -20, 59.5, 6, 131),
  floorZone('street-v-right', 'asphalt', 25, 59.5, 6, 131),
  floorZone('street-bl', 'asphalt', -35, 20, 24, 6),
];
