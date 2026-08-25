import { useThree } from '@react-three/fiber';
import { useShooting } from '../hooks/use-shooting';
import { useSpatialCombatSounds } from '../hooks/use-spatial-combat-sounds';

/** Mounts the shooting raycast handler and combat SFX; renders nothing. */
export function ShootingController() {
  const domElement = useThree((s) => s.gl.domElement);
  useShooting(domElement);
  useSpatialCombatSounds();
  return null;
}
