import type { Group } from 'three';
import type { RemoteMotionSample } from '../utils/resolve-remote-locomotion';
import type { RemoteRenderTransform } from '../utils/step-remote-render-transform';
import type { EntityId, SoldierSkinId } from '@/modules/soldiers';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MODEL_FORWARD_YAW_OFFSET } from '@/modules/game/constants/player';
import { SoldierMeshBody } from '@/modules/soldiers/components/soldier-mesh-body';
import { useSoldierLocomotion } from '@/modules/soldiers/hooks/use-soldier-locomotion';
import { useSoldierMesh } from '@/modules/soldiers/hooks/use-soldier-mesh';
import { resolveNpcPose } from '@/modules/soldiers/utils/resolve-soldier-pose';
import { useMultiplayerStore } from '../stores/multiplayer-store';
import {
  resolveRemoteLocomotionForAnimation,
  updateRemoteMotion,
} from '../utils/resolve-remote-locomotion';
import { stepRemoteRenderTransform } from '../utils/step-remote-render-transform';

interface RemotePlayerProps {
  /** Colyseus session id — also the hitbox entity id on the server. */
  sessionId: EntityId;
  skinId: SoldierSkinId;
}

/**
 * A networked soldier driven by the multiplayer store. Skin is owned by the
 * parent (stable for the session); per-frame reads use `getState()` so the
 * 20 Hz transform sync never needs a React re-render to move the rig.
 * Visual pose eases toward the latest sync; locomotion is inferred from the
 * raw network samples (with idle hold + walk/run hysteresis), then kneel-aware
 * filtering keeps crouch-walk stable instead of flickering to run or kneel enter.
 */
export function RemotePlayer({ sessionId, skinId }: RemotePlayerProps) {
  const rigRef = useRef<Group>(null);
  const motionRef = useRef<RemoteMotionSample | null>(null);
  const renderRef = useRef<RemoteRenderTransform | null>(null);
  const { modelRef, source, scale, skin, animations } = useSoldierMesh(skinId);

  const clearRemotePose = () => {
    useMultiplayerStore.getState().applyRemotePose(sessionId, 'clear');
  };

  useSoldierLocomotion(modelRef, animations, skin.meshData.animations, {
    entityId: sessionId,
    getLocomotionState: () => {
      const entry = useMultiplayerStore.getState().remotePlayers[sessionId];
      return resolveRemoteLocomotionForAnimation(
        motionRef.current,
        entry?.pose,
        performance.now(),
      );
    },
    getPose: () => {
      const entry = useMultiplayerStore.getState().remotePlayers[sessionId];
      if (!entry) {
        return null;
      }
      const npcPose = resolveNpcPose(sessionId, entry.health.isEliminated);
      if (npcPose) {
        return npcPose;
      }
      return entry.pose ?? null;
    },
    onJumpFinished: clearRemotePose,
    onReloadingFinished: clearRemotePose,
    onShootingFinished: clearRemotePose,
  });

  useFrame((_, delta) => {
    const rig = rigRef.current;
    const entry = useMultiplayerStore.getState().remotePlayers[sessionId];
    if (!rig || !entry) {
      return;
    }

    const { x, z, rotY } = entry.transform;
    motionRef.current = updateRemoteMotion(
      motionRef.current,
      { x, z },
      performance.now(),
    );

    const rendered = stepRemoteRenderTransform(
      renderRef.current,
      { x, z, rotY },
      delta,
    );
    renderRef.current = rendered;

    rig.position.set(rendered.x, 0, rendered.z);
    rig.rotation.y = rendered.rotY + MODEL_FORWARD_YAW_OFFSET;
  });

  return (
    <group ref={rigRef} name={`remote-${sessionId}`} userData={{ entityId: sessionId }}>
      <SoldierMeshBody
        modelRef={modelRef}
        source={source}
        scale={scale}
        hitboxPresetId={skin.hitboxPresetId}
        entityId={sessionId}
      />
    </group>
  );
}
