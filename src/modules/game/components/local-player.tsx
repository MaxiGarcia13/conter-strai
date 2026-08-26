import type { Group } from 'three';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { SoldierAimRig } from '@/modules/soldiers/utils/aim-body-rig';
import { Clone, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import { HitboxMesh } from '@/modules/combat';
import { getSoldierSkinById } from '@/modules/soldiers';
import { useSoldierAnimationClips } from '@/modules/soldiers/hooks/use-soldier-animation-clips';
import { useSoldierLocomotion } from '@/modules/soldiers/hooks/use-soldier-locomotion';
import { applySoldierAimPose, resolveSoldierAimRig } from '@/modules/soldiers/utils/aim-body-rig';
import { disableSkinnedMeshCulling, getSoldierArmature, soldierScaleVector } from '@/modules/soldiers/utils/clone-soldier-root';
import { resolveLocalPlayerPose } from '@/modules/soldiers/utils/resolve-soldier-pose';
import { WeaponAttach } from '@/modules/weapons/components/weapon-attach';
import {
  DEFAULT_PLAY_SKIN_ID,
  LOCAL_PLAYER_ENTITY_ID,
  LOCAL_PLAYER_ROOT_NAME,
  MODEL_FORWARD_YAW_OFFSET,
} from '../constants/player';
import { clearPlayerPoseIf, getCameraMode, getPlayerLocomotion, getPlayerPose, getPlayerTransform, setBodyAnchorY, setPlayerPose } from '../state/player-state';
import { placeCameraAtHead } from '../utils/fps-head-camera';

interface LocalPlayerProps {
  skinId?: SoldierSkinId;
}

// Stable identity: the locomotion mixer captures it once in its mount effect.
const clearJumpPose = () => clearPlayerPoseIf('jump');
function clearReloadingPose() {
  const pose = getPlayerPose();
  clearPlayerPoseIf('reloading');
  if (pose === 'reloadingKneel') {
    setPlayerPose('kneel');
  }
}
const clearShootingPose = () => clearPlayerPoseIf('shooting');
function clearInterruptedPoses() {
  clearPlayerPoseIf('shooting');
  clearPlayerPoseIf('kneel');
}

const headWorldPosition = new Vector3();

/**
 * The single local soldier: one clone, one mixer, driven by the shared player
 * transform. Look pitch bends the spine in every camera mode so the arms
 * follow the mouse; in first person the camera rides the head bone and the
 * head itself is hidden, while shoulder/third person leave the camera to
 * `applyCameraMode`.
 */
export function LocalPlayer({ skinId = DEFAULT_PLAY_SKIN_ID }: LocalPlayerProps) {
  const rigRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const aimRigRef = useRef<SoldierAimRig | null>(null);
  const camera = useThree((state) => state.camera);
  const skin = useMemo(() => getSoldierSkinById(skinId), [skinId]);
  const gltf = useGLTF(skin.meshData.modelUrl);
  const animations = useSoldierAnimationClips(skin.meshData, gltf.animations);

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
      entityId: LOCAL_PLAYER_ENTITY_ID,
      getLocomotionState: getPlayerLocomotion,
      getPose: () => resolveLocalPlayerPose(getPlayerPose(), LOCAL_PLAYER_ENTITY_ID),
      onJumpFinished: clearJumpPose,
      onReloadingFinished: clearReloadingPose,
      onShootingFinished: clearShootingPose,
      onHitReactionStarted: clearInterruptedPoses,
    },
  );

  // Declared after useSoldierLocomotion so placement runs after its mixer update.
  useFrame((state) => {
    const rigGroup = rigRef.current;
    if (!rigGroup) {
      return;
    }

    const transform = getPlayerTransform();
    const dying = getPlayerPose() === 'dying';

    rigGroup.position.set(transform.x, 0, transform.z);
    rigGroup.rotation.y = transform.yaw + MODEL_FORWARD_YAW_OFFSET;

    const aimRig = aimRigRef.current;
    if (!aimRig) {
      return;
    }

    // When DEV free-cam (or any makeDefault controls) is active, leave the camera alone.
    const fpsActive = getCameraMode() === 'fps' && !state.controls;
    // Dying owns the full skeleton — aim pitch / FPS head-hide would fight the clip.
    if (dying) {
      for (const { bone, restScale } of aimRig.hiddenBones) {
        bone.scale.copy(restScale);
      }
    } else {
      applySoldierAimPose(aimRig, transform.pitch, fpsActive);
    }
    // Shoulder booms pivot on this; getWorldPosition refreshes the bone chain post-mixer.
    setBodyAnchorY(aimRig.head.getWorldPosition(headWorldPosition).y);
    if (fpsActive && !dying) {
      placeCameraAtHead(camera, aimRig.head, transform, skin.meshData.fpsView?.eyeOffsetY ?? 0);
    }
  });

  return (
    <>
      <group
        ref={rigRef}
        name={LOCAL_PLAYER_ROOT_NAME}
        userData={{ entityId: LOCAL_PLAYER_ENTITY_ID }}
      >
        <Clone ref={modelRef} object={source} scale={scale} />
        <WeaponAttach attachKey={source.uuid} modelRef={modelRef} />
        <HitboxMesh hitboxPresetId={skin.hitboxPresetId} entityId={LOCAL_PLAYER_ENTITY_ID} />
      </group>
    </>
  );
}
