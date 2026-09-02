import type { RefObject } from 'react';
import type { Camera } from 'three';
import type { BoxBlocker, CircleBlocker } from '@/modules/game/utils/resolve-player-collision';
import type { ScenarioConfig } from '@/modules/scenarios';
import { useFrame } from '@react-three/fiber';

import { useRef } from 'react';
import {
  MAX_FRAME_DELTA_SECONDS,
} from '@/modules/game/constants/player';
import { getPlayerFrameIntent } from '@/modules/game/input/player-input-intent';
import {
  getBodyAnchorY,
  getCameraMode,
  getPlayerTransform,
  setPlayerLocomotion,
  setPlayerPose,
} from '@/modules/game/stores/player-state';
import { useRoundStore } from '@/modules/game/stores/round-store';
import { advancePlayerTransform } from '@/modules/game/utils/advance-player-transform';
import { applyCameraMode } from '@/modules/game/utils/apply-camera-mode';
import { remoteBlockersFromPlayers } from '@/modules/game/utils/remote-blockers-from-players';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';

interface UsePlayerMovementFrameOptions {
  camera: Camera;
  bounds: ScenarioConfig['bounds'];
  collisionSegments: NonNullable<ScenarioConfig['collisionSegments']>;
  wallThickness: number;
  propCircleBlockers: CircleBlocker[];
  boxBlockers: BoxBlocker[];
  pressedCodesRef: RefObject<Set<string>>;
  eliminatedRef: RefObject<boolean>;
  isPausedRef: RefObject<boolean>;
  externalControlsRef: RefObject<unknown>;
}

/** Per-frame move, collide, clamp, and apply the active camera mode. */
export function usePlayerMovementFrame({
  camera,
  bounds,
  collisionSegments,
  wallThickness,
  propCircleBlockers,
  boxBlockers,
  pressedCodesRef,
  eliminatedRef,
  isPausedRef,
  externalControlsRef,
}: UsePlayerMovementFrameOptions): void {
  const wasEliminatedRef = useRef(false);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_FRAME_DELTA_SECONDS);
    const pressed = pressedCodesRef.current;
    if (!pressed) {
      return;
    }

    if (eliminatedRef.current) {
      if (!wasEliminatedRef.current) {
        wasEliminatedRef.current = true;
        setPlayerPose('dying');
      }
      setPlayerLocomotion('idle');
      return;
    }

    if (wasEliminatedRef.current) {
      wasEliminatedRef.current = false;
      setPlayerPose(null);
      setPlayerLocomotion('idle');
    }

    const matchConnected = useMultiplayerStore.getState().connected;
    const phase = matchConnected
      ? useMultiplayerStore.getState().phase
      : useRoundStore.getState().phase;
    if (phase === 'loading' || phase === 'countdown' || phase === 'round-end' || isPausedRef.current) {
      setPlayerLocomotion('idle');
      applyCameraMode(camera, getCameraMode(), getPlayerTransform(), getBodyAnchorY());
      return;
    }

    // External controls (DEV free-cam) own the camera; freeze the soldier.
    if (externalControlsRef.current) {
      pressed.clear();
      setPlayerLocomotion('idle');
      return;
    }

    const { strafe, forward, running } = getPlayerFrameIntent(pressed);
    const transform = getPlayerTransform();

    const remotes = useMultiplayerStore.getState().remotePlayers;
    const remoteBlockers = remoteBlockersFromPlayers(
      Object.values(remotes).map((player) => ({
        x: player.transform.x,
        z: player.transform.z,
        entityId: player.sessionId,
        isEliminated: player.health.isEliminated,
      })),
    );
    const circleBlockers = [...remoteBlockers, ...propCircleBlockers];
    const solidNpcFlags = circleBlockers.map(() => true);

    const result = advancePlayerTransform({
      transform,
      strafe,
      forward,
      running,
      delta,
      collisionSegments,
      wallThickness,
      npcBlockers: circleBlockers,
      solidNpcFlags,
      boxBlockers,
      bounds,
    });

    transform.x = result.x;
    transform.z = result.z;
    setPlayerLocomotion(result.locomotion);

    applyCameraMode(camera, getCameraMode(), transform, getBodyAnchorY());
  });
}
