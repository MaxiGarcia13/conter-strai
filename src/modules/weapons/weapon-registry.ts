import type { PistolWeaponConfig } from './types';
import { useGLTF } from '@react-three/drei';
import { glbCdnUrl } from '@/utils/glb-cdn-url';
import {
  PISTOL_DAMAGE_BY_ZONE,
  PISTOL_FIRE_COOLDOWN_MS,
} from './constants/pistol';
import {
  DEFAULT_PISTOL_GRIP_POSITION,
  DEFAULT_PISTOL_GRIP_ROTATION,
} from './utils/pistol-grip-alignment';

export const DEFAULT_WEAPON_ID = 'pistol';

/**
 * Per-zone fractions of max HP; combat multiplies by difficulty.
 */
export const weapons: Record<string, PistolWeaponConfig> = {
  [DEFAULT_WEAPON_ID]: {
    id: 'pistol',
    name: 'Pistol',
    fireCooldownSeconds: PISTOL_FIRE_COOLDOWN_MS / 1000,
    damageByZone: PISTOL_DAMAGE_BY_ZONE,
    modelUrl: glbCdnUrl('/weapons/pistol_a.glb'),
    // Precomputed for swat idle + neutral aim — barrel +X → camera / crosshair forward.
    gripRotation: DEFAULT_PISTOL_GRIP_ROTATION,
    gripPosition: DEFAULT_PISTOL_GRIP_POSITION,
  },
};

for (const { modelUrl } of Object.values(weapons)) {
  useGLTF.preload(modelUrl);
}
