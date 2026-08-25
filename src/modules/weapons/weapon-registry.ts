import type { PistolWeaponConfig } from './types';
import { useGLTF } from '@react-three/drei';
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
    fireCooldownSeconds: 0.35,
    damageByZone: { head: 0.4, body: 0.2, limb: 0.15 },
    modelUrl: '/assets/weapons/pistol_a.glb',
    // Precomputed for swat idle + neutral aim — barrel +X → camera / crosshair forward.
    gripRotation: DEFAULT_PISTOL_GRIP_ROTATION,
    gripPosition: DEFAULT_PISTOL_GRIP_POSITION,
  },
};

for (const { modelUrl } of Object.values(weapons)) {
  useGLTF.preload(modelUrl);
}
