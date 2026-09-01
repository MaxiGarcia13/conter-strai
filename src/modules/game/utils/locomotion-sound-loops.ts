import type { LocomotionSoundId } from './resolve-locomotion-sound';
import { LOCOMOTION_SOUND_URLS } from '../constants/locomotion-sounds';
import { getDecodedBuffer, getGameAudioContext } from './game-audio-context';

interface LoopChannel {
  webGain: GainNode;
  webSource: AudioBufferSourceNode | null;
  htmlAudio: HTMLAudioElement | null;
}

export interface LocomotionSoundLoops {
  setActive: (target: LocomotionSoundId | null, gain: number) => void;
  dispose: () => void;
}

function createHtmlLoop(id: LocomotionSoundId): HTMLAudioElement {
  const audio = new Audio(LOCOMOTION_SOUND_URLS[id]);
  audio.loop = true;
  audio.preload = 'auto';
  return audio;
}

function createLoopChannel(): LoopChannel {
  const ctx = getGameAudioContext();
  const webGain = ctx.createGain();
  webGain.connect(ctx.destination);
  return {
    webGain,
    webSource: null,
    htmlAudio: null,
  };
}

/** Looping walk/run SFX via Web Audio, with HTML Audio fallback before warmup finishes. */
export function createLocomotionSoundLoops(): LocomotionSoundLoops {
  const channels: Record<LocomotionSoundId, LoopChannel> = {
    walk: createLoopChannel(),
    run: createLoopChannel(),
  };
  let active: LocomotionSoundId | null = null;

  const stopWebChannel = (channel: LoopChannel): void => {
    if (!channel.webSource) {
      return;
    }
    try {
      channel.webSource.stop();
    } catch {
      // Already stopped.
    }
    channel.webSource.disconnect();
    channel.webSource = null;
  };

  const stopHtmlChannel = (channel: LoopChannel): void => {
    if (!channel.htmlAudio) {
      return;
    }
    channel.htmlAudio.pause();
    channel.htmlAudio.currentTime = 0;
  };

  const stopChannel = (id: LocomotionSoundId): void => {
    const channel = channels[id];
    stopWebChannel(channel);
    stopHtmlChannel(channel);
  };

  const startWebChannel = (id: LocomotionSoundId, gain: number): void => {
    const buffer = getDecodedBuffer(id);
    if (!buffer) {
      return;
    }

    const ctx = getGameAudioContext();
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const channel = channels[id];
    stopHtmlChannel(channel);
    channel.webGain.gain.value = gain;

    if (channel.webSource) {
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(channel.webGain);
    source.start();
    channel.webSource = source;
  };

  const startHtmlChannel = (id: LocomotionSoundId, gain: number): void => {
    const channel = channels[id];
    stopWebChannel(channel);

    channel.htmlAudio ??= createHtmlLoop(id);
    channel.htmlAudio.volume = gain;
    void channel.htmlAudio.play().catch(() => {
      // Autoplay policy — non-fatal for gameplay.
    });
  };

  const startChannel = (id: LocomotionSoundId, gain: number): void => {
    if (getDecodedBuffer(id)) {
      startWebChannel(id, gain);
      return;
    }
    startHtmlChannel(id, gain);
  };

  const setChannelGain = (id: LocomotionSoundId, gain: number): void => {
    const channel = channels[id];
    if (channel.webSource) {
      channel.webGain.gain.value = gain;
      return;
    }
    if (channel.htmlAudio) {
      channel.htmlAudio.volume = gain;
      if (channel.htmlAudio.paused) {
        void channel.htmlAudio.play().catch(() => {});
      }
    }
  };

  return {
    setActive(target, gain) {
      if (target === active) {
        if (target) {
          setChannelGain(target, gain);
        }
        return;
      }

      if (active) {
        stopChannel(active);
      }
      active = target;

      if (target) {
        startChannel(target, gain);
      }
    },

    dispose() {
      for (const id of ['walk', 'run'] as const) {
        stopChannel(id);
        channels[id].webGain.disconnect();
      }
      active = null;
    },
  };
}
