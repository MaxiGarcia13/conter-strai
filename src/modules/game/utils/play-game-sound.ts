import type { Scene } from 'three';
import type { Vec3 } from './compute-spatial-volume';
import { Vector3 } from 'three';
import { COMBAT_SOUND_MAX_DISTANCE, COMBAT_SOUND_MIN_VOLUME, GAME_SOUND_GAIN } from '../constants/combat-sounds';
import { computeSpatialVolume } from './compute-spatial-volume';
import { findEntityWorldPosition } from './find-entity-world-position';
import {
  GAME_AUDIO_URLS,
  getDecodedBuffer,
  getGameAudioContext,
  resetGameAudioForTests,
} from './game-audio-context';

export type GameSoundId = 'pistol' | 'ouch' | 'emptyGun' | 'reloadingGun';

export interface SpatialSoundOptions {
  source: Vec3;
  listener: Vec3;
  maxDistance?: number;
  minVolume?: number;
}

const templates = new Map<GameSoundId, HTMLAudioElement>();
const entityPositionScratch = new Vector3();

function getSoundTemplate(id: GameSoundId): HTMLAudioElement {
  let template = templates.get(id);
  if (!template) {
    template = new Audio(GAME_AUDIO_URLS[id]);
    template.preload = 'auto';
    templates.set(id, template);
  }
  return template;
}

function spawnSoundInstance(id: GameSoundId): HTMLAudioElement {
  const template = getSoundTemplate(id);
  const instance = template.cloneNode(true) as HTMLAudioElement;
  if (!instance.src) {
    instance.src = GAME_AUDIO_URLS[id];
  }
  return instance;
}

function playViaWebAudio(id: GameSoundId, gain: number): boolean {
  const buffer = getDecodedBuffer(id);
  if (!buffer) {
    return false;
  }

  const ctx = getGameAudioContext();
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();
  source.buffer = buffer;
  gainNode.gain.value = gain;
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start();
  return true;
}

function playViaHtmlAudio(id: GameSoundId, gain: number): void {
  const instance = spawnSoundInstance(id);
  instance.currentTime = 0;
  instance.volume = gain;
  void instance.play().catch(() => {
    // Missing asset or autoplay policy — non-fatal for gameplay.
  });
}

/** Plays a one-shot game SFX; clones the cached element so rapid fire can overlap. */
export function playGameSound(id: GameSoundId, spatial?: SpatialSoundOptions): void {
  const spatialVolume = spatial
    ? computeSpatialVolume(
        spatial.source,
        spatial.listener,
        spatial.maxDistance,
        spatial.minVolume,
      )
    : 1;
  const gain = spatialVolume * GAME_SOUND_GAIN[id];

  if (!playViaWebAudio(id, gain)) {
    playViaHtmlAudio(id, gain);
  }
}

/** Plays a combat SFX at a soldier's world position, attenuated for the listener. */
export function playEntityGameSound(
  id: GameSoundId,
  entityId: string,
  scene: Scene,
  listener: Vector3,
  target = entityPositionScratch,
): void {
  const source = findEntityWorldPosition(scene, entityId, target);
  if (!source) {
    playGameSound(id);
    return;
  }
  playGameSound(id, {
    source,
    listener,
    maxDistance: COMBAT_SOUND_MAX_DISTANCE,
    minVolume: COMBAT_SOUND_MIN_VOLUME,
  });
}

/** Test helper — clears decoded buffers and the shared audio context. */
export function resetGameSoundsForTests(): void {
  resetGameAudioForTests();
}
