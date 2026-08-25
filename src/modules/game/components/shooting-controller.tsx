import { useThree } from '@react-three/fiber';
import { useShooting } from '../hooks/use-shooting';

/** Mounts the shooting raycast handler; renders nothing. */
export function ShootingController() {
  const domElement = useThree((s) => s.gl.domElement);
  useShooting(domElement);
  return null;
}
