import { useThree } from '@react-three/fiber';

import { useFreeCamera } from './use-free-camera';
import { useFreeCameraFly } from './use-free-camera-fly';
import { useFreeCameraLook } from './use-free-camera-look';
import { useFreeCameraToggle } from './use-free-camera-toggle';

/**
 * Ghost free-cam: WASD fly, click canvas then move mouse to look, Q/E vertical.
 * Registers R3F `controls` so player look/move yield without a free-cam import.
 */
export function DevFreeCamera() {
  const enabled = useFreeCamera();
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);

  useFreeCameraToggle();
  useFreeCameraLook({ enabled, camera, domElement, set, get });
  useFreeCameraFly({ enabled, camera });

  return null;
}
