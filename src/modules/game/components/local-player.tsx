import type { Group } from 'three';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { SoldierFpsRig } from '@/modules/soldiers/utils/fps-body-rig';
import { Clone, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { getSoldierSkinById } from '@/modules/soldiers';
import { useSoldierLocomotion } from '@/modules/soldiers/hooks/use-soldier-locomotion';
import { disableSkinnedMeshCulling, getSoldierArmature, soldierScaleVector } from '@/modules/soldiers/utils/clone-soldier-root';
import { applyFpsBodyPose, resolveSoldierFpsRig } from '@/modules/soldiers/utils/fps-body-rig';
import { LOCAL_PLAYER_ROOT_NAME, MODEL_FORWARD_YAW_OFFSET } from '../constants/player';
import { clearPlayerPoseIf, getCameraMode, getPlayerLocomotion, getPlayerPose, getPlayerTransform } from '../state/player-state';
import { placeCameraAtHead } from '../utils/fps-head-camera';

interface LocalPlayerProps {
  skinId?: SoldierSkinId;
}

// Stable identity: the locomotion mixer captures it once in its mount effect.
const clearJumpPose = () => clearPlayerPoseIf('jump');

/**
 * The single local soldier: one clone, one mixer, driven by the shared player
 * transform. In first person the camera rides the head bone and look pitch
 * bends the spine so the world-body arms follow the mouse; shoulder/third
 * person leave the full body to `applyCameraMode`.
 */
export function LocalPlayer({ skinId = 'swat-guy' }: LocalPlayerProps) {
  const rigRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const fpsRigRef = useRef<SoldierFpsRig | null>(null);
  const camera = useThree((state) => state.camera);
  const skin = useMemo(() => getSoldierSkinById(skinId), [skinId]);
  const gltf = useGLTF(skin.meshData.modelUrl);
  const animations = useMemo(() => gltf.animations, [gltf]);

  const source = useMemo(() => getSoldierArmature(gltf.scene), [gltf]);
  const scale = useMemo(
    () => soldierScaleVector(source, skin.meshData.scale),
    [skin.meshData.scale, source],
  );

  useEffect(() => {
    const model = modelRef.current;
    fpsRigRef.current = model ? resolveSoldierFpsRig(model) : null;
    if (model) {
      // Aim-marker raycasts run pre-matrix-update and would cache a degenerate bound.
      disableSkinnedMeshCulling(model);
    }
    return () => {
      fpsRigRef.current = null;
    };
  }, [source]);

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

  // Declared after useSoldierLocomotion so placement runs after its mixer update.
  useFrame(() => {
    const rigGroup = rigRef.current;
    if (!rigGroup) {
      return;
    }

    const transform = getPlayerTransform();

    rigGroup.position.set(transform.x, 0, transform.z);
    rigGroup.rotation.y = transform.yaw + MODEL_FORWARD_YAW_OFFSET;

    const fpsRig = fpsRigRef.current;
    if (!fpsRig) {
      return;
    }

    const fpsActive = getCameraMode() === 'fps';
    applyFpsBodyPose(fpsRig, transform.pitch, fpsActive);
    if (fpsActive) {
      placeCameraAtHead(camera, fpsRig.head, transform);
    }
  });

  return (
    <>
      <group ref={rigRef} name={LOCAL_PLAYER_ROOT_NAME}>
        <Clone ref={modelRef} object={source} scale={scale} />
      </group>
    </>
  );
}
