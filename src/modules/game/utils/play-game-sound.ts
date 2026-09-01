import type { Scene } from 'three';
import type { Vec3 } from './compute-spatial-volume';
import { Vector3 } from 'three';
import { COMBAT_SOUND_MAX_DISTANCE, COMBAT_SOUND_MIN_VOLUME, GAME_SOUND_GAIN } from '../constants/combat-sounds';
import { computeSpatialVolume } from './compute-spatial-volume';
import { findEntityWorldPosition } from './find-entity-world-position';

const GAME_SOUND_URLS = {
  pistol: '/assets/characters/sounds/pistol.m4a',
  ouch: '/assets/characters/sounds/ouch.m4a',
} as const;

export type GameSoundId = keyof typeof GAME_SOUND_URLS;

export interface SpatialSoundOptions {
  source: Vec3;
  listener: Vec3;
  maxDistance?: number;
  minVolume?: number;
}

const templates = new Map<GameSoundId, HTMLAudioElement>();
const decodedBuffers = new Map<GameSoundId, AudioBuffer>();
const entityPositionScratch = new Vector3();

let audioContext: AudioContext | null = null;
let warmupPromise: Promise<void> | null = null;

function getAudioContext(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}

function getSoundTemplate(id: GameSoundId): HTMLAudioElement {
  let template = templates.get(id);
  if (!template) {
    template = new Audio(GAME_SOUND_URLS[id]);
    template.preload = 'auto';
    templates.set(id, template);
  }
  return template;
}

function spawnSoundInstance(id: GameSoundId): HTMLAudioElement {
  const template = getSoundTemplate(id);
  const instance = template.cloneNode(true) as HTMLAudioElement;
  if (!instance.src) {
    instance.src = GAME_SOUND_URLS[id];
  }
  return instance;
}

function playViaWebAudio(id: GameSoundId, gain: number): boolean {
  const buffer = decodedBuffers.get(id);
  if (!buffer) {
    return false;
  }

  const ctx = getAudioContext();
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

/**
 * Decode combat SFX into memory on the first user gesture (touch).
 * Idempotent — safe to call on every mobile interaction.
 */
export function warmupGameSounds(): Promise<void> {
  if (!warmupPromise) {
    warmupPromise = (async () => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      await Promise.all(
        (Object.entries(GAME_SOUND_URLS) as [GameSoundId, string][]).map(async ([id, url]) => {
          if (decodedBuffers.has(id)) {
            return;
          }
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const decoded = await ctx.decodeAudioData(arrayBuffer);
          decodedBuffers.set(id, decoded);
        }),
      );
    })().catch(() => {
      warmupPromise = null;
    });
  }

  return warmupPromise;
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
  decodedBuffers.clear();
  warmupPromise = null;
  if (audioContext) {
    void audioContext.close();
    audioContext = null;
  }
}
