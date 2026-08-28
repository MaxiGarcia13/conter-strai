import type { Group } from 'three';
import type { RemoteMotionSample } from '../utils/resolve-remote-locomotion';
import type { RemoteRenderTransform } from '../utils/step-remote-render-transform';
import type { SyncableRemotePose } from '../utils/syncable-remote-pose';
import type { EntityId, LocomotionState, SoldierSkinId } from '@/modules/soldiers';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import {
  MODEL_FORWARD_YAW_OFFSET,
  RUN_BACKWARD_SPEED,
  RUN_SPEED,
  WALK_BACKWARD_SPEED,
  WALK_SPEED,
} from '@/modules/game/constants/player';
import { SoldierMeshBody } from '@/modules/soldiers/components/soldier-mesh-body';
import { useSoldierLocomotion } from '@/modules/soldiers/hooks/use-soldier-locomotion';
import { REMOTE_LOCOMOTION_CROSSFADE_SECONDS } from '@/modules/soldiers/hooks/use-soldier-locomotion/apply-clip-transition';
import { useSoldierMesh } from '@/modules/soldiers/hooks/use-soldier-mesh';
import { resolveNpcPose } from '@/modules/soldiers/utils/resolve-soldier-pose';
import { useMultiplayerStore } from '../stores/multiplayer-store';
import {
  resolveRemotePlayback,
  updateRemoteMotion,
} from '../utils/resolve-remote-locomotion';
import { stepRemoteRenderTransform } from '../utils/step-remote-render-transform';

interface RemotePlayerProps {
  /** Colyseus session id — also the hitbox entity id on the server. */
  sessionId: EntityId;
  skinId: SoldierSkinId;
}

function expectedLocomotionSpeed(locomotion: LocomotionState): number | null {
  switch (locomotion) {
    case 'walk':
    case 'crouchWalking':
      return WALK_SPEED;
    case 'run':
      return RUN_SPEED;
    case 'walkBackward':
      return WALK_BACKWARD_SPEED;
    case 'runBackward':
      return RUN_BACKWARD_SPEED;
    default:
      return null;
  }
}

/**
 * A networked soldier driven by the multiplayer store. Skin is owned by the
 * parent (stable for the session); per-frame reads use `getState()` so the
 * 20 Hz transform sync never needs a React re-render to move the rig.
 * Visual pose eases toward the latest sync; the sender's resolved clip is
 * preferred over inferred gaits. Locomotion playback is time-scaled to the
 * eased world velocity so feet do not outrun the interpolated position.
 */
export function RemotePlayer({ sessionId, skinId }: RemotePlayerProps) {
  const rigRef = useRef<Group>(null);
  const motionRef = useRef<RemoteMotionSample | null>(null);
  const renderRef = useRef<RemoteRenderTransform | null>(null);
  const heldOneShotRef = useRef<SyncableRemotePose | null>(null);
  const consumedEpochRef = useRef(0);
  const playbackRef = useRef<ReturnType<typeof resolveRemotePlayback>>({
    pose: null,
    locomotion: 'idle',
    heldOneShot: null,
  });
  const renderedSpeedRef = useRef(0);
  const { modelRef, source, scale, skin, animations } = useSoldierMesh(skinId);

  const consumeHeldOneShot = () => {
    const entry = useMultiplayerStore.getState().remotePlayers[sessionId];
    consumedEpochRef.current = entry?.poseEpoch ?? consumedEpochRef.current;
    heldOneShotRef.current = null;
  };

  const refreshPlayback = () => {
    const entry = useMultiplayerStore.getState().remotePlayers[sessionId];
    const playback = resolveRemotePlayback({
      synced: entry?.pose,
      poseEpoch: entry?.poseEpoch ?? 0,
      inferredLocomotion: motionRef.current?.locomotion ?? 'idle',
      heldOneShot: heldOneShotRef.current,
      consumedEpoch: consumedEpochRef.current,
    });
    heldOneShotRef.current = playback.heldOneShot;
    playbackRef.current = playback;
    return playback;
  };

  // Run before the locomotion mixer so motion + playback are current this frame.
  useFrame((_, delta) => {
    const rig = rigRef.current;
    const entry = useMultiplayerStore.getState().remotePlayers[sessionId];
    if (!rig || !entry) {
      return;
    }

    const { x, z, rotY } = entry.transform;
    motionRef.current = updateRemoteMotion(
      motionRef.current,
      { x, z, rotY },
      performance.now(),
    );

    const prev = renderRef.current;
    const rendered = stepRemoteRenderTransform(
      prev,
      { x, z, rotY },
      delta,
    );
    renderedSpeedRef.current = prev && delta > 0
      ? Math.hypot(rendered.x - prev.x, rendered.z - prev.z) / delta
      : 0;
    renderRef.current = rendered;

    rig.position.set(rendered.x, 0, rendered.z);
    rig.rotation.y = rendered.rotY + MODEL_FORWARD_YAW_OFFSET;

    refreshPlayback();
  }, -1);

  useSoldierLocomotion(modelRef, animations, skin.meshData.animations, {
    entityId: sessionId,
    locomotionCrossfadeSeconds: REMOTE_LOCOMOTION_CROSSFADE_SECONDS,
    getLocomotionState: () => playbackRef.current.locomotion,
    getPose: () => {
      const entry = useMultiplayerStore.getState().remotePlayers[sessionId];
      if (!entry) {
        return null;
      }
      const npcPose = resolveNpcPose(sessionId, entry.health.isEliminated);
      if (npcPose) {
        heldOneShotRef.current = null;
        return npcPose;
      }
      return playbackRef.current.pose;
    },
    getPoseEpoch: () => (
      useMultiplayerStore.getState().remotePlayers[sessionId]?.poseEpoch ?? 0
    ),
    getLocomotionTimeScale: () => {
      const { pose, locomotion } = playbackRef.current;
      if (pose) {
        return 1;
      }
      const expected = expectedLocomotionSpeed(locomotion);
      if (!expected) {
        return 1;
      }
      return Math.min(1.35, Math.max(0.2, renderedSpeedRef.current / expected));
    },
    onJumpFinished: consumeHeldOneShot,
    onReloadingFinished: consumeHeldOneShot,
    onShootingFinished: consumeHeldOneShot,
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
