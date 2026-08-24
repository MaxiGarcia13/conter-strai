import type { Group } from 'three';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { SoldierAimRig } from '@/modules/soldiers/utils/aim-body-rig';
import { Clone, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { getSoldierSkinById } from '@/modules/soldiers';
import { useSoldierLocomotion } from '@/modules/soldiers/hooks/use-soldier-locomotion';
import { applySoldierAimPose, resolveSoldierAimRig } from '@/modules/soldiers/utils/aim-body-rig';
import { disableSkinnedMeshCulling, getSoldierArmature, soldierScaleVector } from '@/modules/soldiers/utils/clone-soldier-root';
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
 * transform. Look pitch bends the spine in every camera mode so the arms
 * follow the mouse; in first person the camera rides the head bone and the
 * head itself is hidden, while shoulder/third person leave the camera to
 * `applyCameraMode`.
 */
export function LocalPlayer({ skinId = 'swat-guy' }: LocalPlayerProps) {
  const rigRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const aimRigRef = useRef<SoldierAimRig | null>(null);
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
    aimRigRef.current = model ? resolveSoldierAimRig(model) : null;
    if (model) {
      // Aim-marker raycasts run pre-matrix-update and would cache a degenerate bound.
      disableSkinnedMeshCulling(model);
    }
    return () => {
      aimRigRef.current = null;
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

    const aimRig = aimRigRef.current;
    if (!aimRig) {
      return;
    }

    const fpsActive = getCameraMode() === 'fps';
    applySoldierAimPose(aimRig, transform.pitch, fpsActive);
    if (fpsActive) {
      placeCameraAtHead(camera, aimRig.head, transform);
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
