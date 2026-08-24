import type { Group } from 'three';
import type { SoldierSkinId } from '@/modules/soldiers';
import { Clone, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { getSoldierSkinById } from '@/modules/soldiers';
import { useSoldierLocomotion } from '@/modules/soldiers/hooks/use-soldier-locomotion';
import { getSoldierArmature, soldierScaleVector } from '@/modules/soldiers/utils/clone-soldier-root';
import { MODEL_FORWARD_YAW_OFFSET } from '../constants/player';
import { clearPlayerPoseIf, getPlayerLocomotion, getPlayerPose, getPlayerTransform } from '../state/player-state';

interface LocalPlayerProps {
  skinId?: SoldierSkinId;
}

// Stable identity: the locomotion mixer captures it once in its mount effect.
const clearJumpPose = () => clearPlayerPoseIf('jump');

/**
 * The single local soldier: one clone, one mixer, driven by the shared player
 * transform. Body shows in shoulder/third-person rigs; first-person swaps to
 * the arms view model so the world-body mesh cannot clip the camera.
 */
export function LocalPlayer({ skinId = 'swat-guy' }: LocalPlayerProps) {
  const rigRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const skin = useMemo(() => getSoldierSkinById(skinId), [skinId]);
  const gltf = useGLTF(skin.meshData.modelUrl);
  const animations = useMemo(() => gltf.animations, [gltf]);

  const source = useMemo(() => getSoldierArmature(gltf.scene), [gltf]);
  const scale = useMemo(
    () => soldierScaleVector(source, skin.meshData.scale),
    [skin.meshData.scale, source],
  );

  useSoldierLocomotion(
    modelRef,
    animations,
    skin.meshData.animations,
    {
      getLocomotionState: getPlayerLocomotion,
      getPose: getPlayerPose,
      onJumpFinished: clearJumpPose,
    },
  );

  useFrame(() => {
    if (!rigRef.current) {
      return;
    }

    const transform = getPlayerTransform();

    rigRef.current.position.set(transform.x, 0, transform.z);
    rigRef.current.rotation.y = transform.yaw + MODEL_FORWARD_YAW_OFFSET;
  });

  return (
    <>
      <group ref={rigRef}>
        <Clone ref={modelRef} object={source} scale={scale} />
      </group>
    </>
  );
}
