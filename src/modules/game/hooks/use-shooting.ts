import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { isTouchPrimaryDevice } from '@/modules/game/input/utils/is-touch-primary-device';
import { fireWeapon, setFireWeaponView } from '../utils/fire-weapon';

export function useShooting(domElement: HTMLElement | null) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    setFireWeaponView({ camera, scene });
    return () => setFireWeaponView(null);
  }, [camera, scene]);

  useEffect(() => {
    if (!domElement) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }
      if (!isTouchPrimaryDevice() && document.pointerLockElement !== domElement) {
        return;
      }
      fireWeapon();
    };

    domElement.addEventListener('mousedown', onMouseDown);
    return () => {
      domElement.removeEventListener('mousedown', onMouseDown);
    };
  }, [domElement]);
}
