import { LOCOMOTION_SOUND_URLS } from '../constants/locomotion-sounds';

const COMBAT_SOUND_URLS = {
  pistol: '/assets/characters/sounds/pistol.m4a',
  ouch: '/assets/characters/sounds/ouch.m4a',
} as const;

export const GAME_AUDIO_URLS = {
  ...COMBAT_SOUND_URLS,
  walk: LOCOMOTION_SOUND_URLS.walk,
  run: LOCOMOTION_SOUND_URLS.run,
} as const;

export type GameAudioId = keyof typeof GAME_AUDIO_URLS;

let audioContext: AudioContext | null = null;
const decodedBuffers = new Map<GameAudioId, AudioBuffer>();
let warmupPromise: Promise<void> | null = null;

export function getGameAudioContext(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}

export function getDecodedBuffer(id: GameAudioId): AudioBuffer | undefined {
  return decodedBuffers.get(id);
}

/**
 * Decode all game SFX into memory on the first user gesture.
 * Idempotent — safe to call on every interaction.
 */
export function warmupGameSounds(): Promise<void> {
  if (!warmupPromise) {
    warmupPromise = (async () => {
      const ctx = getGameAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      await Promise.all(
        (Object.entries(GAME_AUDIO_URLS) as [GameAudioId, string][]).map(async ([id, url]) => {
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

/** Test helper — clears decoded buffers and the shared audio context. */
export function resetGameAudioForTests(): void {
  decodedBuffers.clear();
  warmupPromise = null;
  if (audioContext) {
    void audioContext.close();
    audioContext = null;
  }
}
