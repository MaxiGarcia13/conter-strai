import type { Scene } from 'three';
import type { Vec3 } from './compute-spatial-volume';
import { Vector3 } from 'three';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import { LOCOMOTION_SOUND_MAX_DISTANCE } from '../constants/locomotion-sounds';
import { LOCAL_PLAYER_ENTITY_ID } from '../constants/player';
import { computeSpatialVolume } from './compute-spatial-volume';
import { findEntityWorldPosition } from './find-entity-world-position';
import { playGameSound } from './play-game-sound';

const positionScratch = new Vector3();

/**
 * Local hits are full volume. Remote hits use the same 40 m falloff as
 * footsteps, silent beyond that range (no floor whisper).
 */
export function resolveInjurySpatialVolume(
  entityId: string,
  source: Vec3 | null,
  listener: Vec3,
): number {
  if (entityId === LOCAL_PLAYER_ENTITY_ID) {
    return 1;
  }
  if (!source) {
    return 0;
  }
  return computeSpatialVolume(source, listener, LOCOMOTION_SOUND_MAX_DISTANCE, 0);
}

function resolveInjurySource(
  entityId: string,
  scene: Scene,
  target: Vector3,
): Vector3 | null {
  const fromScene = findEntityWorldPosition(scene, entityId, target);
  if (fromScene) {
    return fromScene;
  }
  const remote = useMultiplayerStore.getState().remotePlayers[entityId];
  if (!remote) {
    return null;
  }
  return target.set(remote.transform.x, remote.transform.y, remote.transform.z);
}

/** Plays `ouch` at full volume for the local player; peers follow footstep range. */
export function playInjurySound(
  entityId: string,
  scene: Scene,
  listener: Vector3,
): void {
  if (entityId === LOCAL_PLAYER_ENTITY_ID) {
    playGameSound('ouch', { source: listener, listener });
    return;
  }

  const source = resolveInjurySource(entityId, scene, positionScratch);
  const spatial = resolveInjurySpatialVolume(entityId, source, listener);
  if (!source || spatial <= 0) {
    return;
  }

  playGameSound('ouch', {
    source,
    listener,
    maxDistance: LOCOMOTION_SOUND_MAX_DISTANCE,
    minVolume: 0,
  });
}
