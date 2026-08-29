import type { Group } from 'three';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { SoldierAimRig } from '@/modules/soldiers/utils/aim-body-rig';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { flushLocalClipSync } from '@/modules/multiplayer/utils/sync-local-clip';
import { SoldierMeshBody } from '@/modules/soldiers/components/soldier-mesh-body';
import { useSoldierLocomotion } from '@/modules/soldiers/hooks/use-soldier-locomotion';
import { useSoldierMesh } from '@/modules/soldiers/hooks/use-soldier-mesh';
import { applySoldierAimPose, resolveSoldierAimRig } from '@/modules/soldiers/utils/aim-body-rig';
import { resolveLocalPlayerPose } from '@/modules/soldiers/utils/resolve-soldier-pose';
import {
  DEFAULT_PLAY_SKIN_ID,
  LOCAL_PLAYER_ENTITY_ID,
  LOCAL_PLAYER_ROOT_NAME,
  MODEL_FORWARD_YAW_OFFSET,
} from '../constants/player';
import { clearPlayerPoseIf, getCameraMode, getPlayerLocomotion, getPlayerPose, getPlayerPoseEpoch, getPlayerTransform, setBodyAnchorY, setPlayerPose } from '../state/player-state';
import { placeCameraAtHead } from '../utils/fps-head-camera';
import { resolveLocomotionTimeScale } from '../utils/resolve-locomotion-time-scale';

interface LocalPlayerProps {
  skinId?: SoldierSkinId;
}

function clearJumpPose() {
  const pose = getPlayerPose();
  if (pose === 'jump' || pose === 'jumpIdle') {
    setPlayerPose(null);
    flushLocalClipSync();
  }
}
function clearReloadingPose() {
  const pose = getPlayerPose();
  clearPlayerPoseIf('reloading');
  if (pose === 'reloadingKneel') {
    setPlayerPose('kneel');
  }
  if (pose === 'reloading' || pose === 'reloadingKneel') {
    flushLocalClipSync();
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
  const { modelRef, source, scale, skin, animations } = useSoldierMesh(skinId);
  const aimRigRef = useRef<SoldierAimRig | null>(null);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const model = modelRef.current;
    aimRigRef.current = model ? resolveSoldierAimRig(model) : null;
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
      getPoseEpoch: getPlayerPoseEpoch,
      onJumpFinished: clearJumpPose,
      onReloadingFinished: clearReloadingPose,
      onShootingFinished: clearShootingPose,
      onHitReactionStarted: clearInterruptedPoses,
      getLocomotionTimeScale: () => {
        const pose = getPlayerPose();
        if (pose && pose !== 'kneel') {
          return 1;
        }
        return resolveLocomotionTimeScale(getPlayerLocomotion());
      },
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
    <group
      ref={rigRef}
      name={LOCAL_PLAYER_ROOT_NAME}
      userData={{ entityId: LOCAL_PLAYER_ENTITY_ID }}
    >
      <SoldierMeshBody
        modelRef={modelRef}
        source={source}
        scale={scale}
        hitboxPresetId={skin.hitboxPresetId}
        entityId={LOCAL_PLAYER_ENTITY_ID}
      />
    </group>
  );
}
