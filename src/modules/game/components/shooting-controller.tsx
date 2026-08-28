import { useThree } from '@react-three/fiber';
import { useRemoteLocomotionSounds } from '../hooks/use-remote-locomotion-sounds';
import { useShooting } from '../hooks/use-shooting';
import { useSpatialCombatSounds } from '../hooks/use-spatial-combat-sounds';

/** Mounts shooting, combat SFX, and remote locomotion audio; renders nothing. */
export function ShootingController() {
  const domElement = useThree((s) => s.gl.domElement);
  useShooting(domElement);
  useSpatialCombatSounds();
  useRemoteLocomotionSounds();
  return null;
}
