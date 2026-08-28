import type { LocomotionSoundId } from '../utils/resolve-locomotion-sound';
import type { RemoteMotionSample } from '@/modules/multiplayer/utils/resolve-remote-locomotion';
import type { SyncableRemotePose } from '@/modules/multiplayer/utils/syncable-remote-pose';
import type { Scene } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import {
  resolveRemoteLocomotionForAnimation,
  resolveRemotePlayback,
  updateRemoteMotion,
} from '@/modules/multiplayer/utils/resolve-remote-locomotion';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import {
  LOCOMOTION_SOUND_GAIN,
  LOCOMOTION_SOUND_MAX_DISTANCE,
  LOCOMOTION_SOUND_MIN_VOLUME,
  LOCOMOTION_SOUND_URLS,
} from '../constants/locomotion-sounds';
import { computeSpatialVolume } from '../utils/compute-spatial-volume';
import { findEntityWorldPosition } from '../utils/find-entity-world-position';
import { resolveLocomotionSound } from '../utils/resolve-locomotion-sound';

interface RemoteSoundTracker {
  motion: RemoteMotionSample | null;
  heldOneShot: SyncableRemotePose | null;
  consumedEpoch: number;
}

interface RemotePlayerLoops {
  walk: HTMLAudioElement;
  run: HTMLAudioElement;
  active: LocomotionSoundId | null;
}

function createLoop(url: string): HTMLAudioElement {
  const audio = new Audio(url);
  audio.loop = true;
  audio.preload = 'auto';
  return audio;
}

function createRemoteLoops(): RemotePlayerLoops {
  return {
    walk: createLoop(LOCOMOTION_SOUND_URLS.walk),
    run: createLoop(LOCOMOTION_SOUND_URLS.run),
    active: null,
  };
}

function disposeRemoteLoops(loops: RemotePlayerLoops): void {
  loops.walk.pause();
  loops.run.pause();
}

function setRemoteLoop(
  loops: RemotePlayerLoops,
  target: LocomotionSoundId | null,
  volume: number,
): void {
  if (target === loops.active) {
    if (target) {
      const audio = loops[target];
      audio.volume = volume;
      if (audio.paused) {
        void audio.play().catch(() => {});
      }
    }
    return;
  }

  if (loops.active) {
    const previous = loops[loops.active];
    previous.pause();
    previous.currentTime = 0;
  }
  loops.active = target;

  if (target) {
    const audio = loops[target];
    audio.volume = volume;
    void audio.play().catch(() => {});
  }
}

/** Loops walk/run movement SFX per remote peer, attenuated by distance to the listener. */
export function useRemoteLocomotionSounds(): void {
  const scene = useThree((s) => s.scene);
  const listener = useThree((s) => s.camera);
  const connected = useMultiplayerStore((s) => s.connected);
  const sceneRef = useRef<Scene>(scene);
  const positionScratch = useRef(new Vector3());
  sceneRef.current = scene;

  const loopsBySessionRef = useRef(new Map<string, RemotePlayerLoops>());
  const trackersRef = useRef(new Map<string, RemoteSoundTracker>());

  useEffect(() => {
    if (!connected) {
      return;
    }
    return () => {
      for (const loops of loopsBySessionRef.current.values()) {
        disposeRemoteLoops(loops);
      }
      loopsBySessionRef.current.clear();
      trackersRef.current.clear();
    };
  }, [connected]);

  useFrame(() => {
    if (!connected) {
      return;
    }

    const remotePlayers = useMultiplayerStore.getState().remotePlayers;
    const now = performance.now();
    const trackers = trackersRef.current;
    const loopsBySession = loopsBySessionRef.current;
    const activeSessions = new Set<string>();
    const listenerPos = listener.position;

    for (const [sessionId, entry] of Object.entries(remotePlayers)) {
      if (entry.health.isEliminated) {
        continue;
      }
      activeSessions.add(sessionId);

      const tracker = trackers.get(sessionId) ?? {
        motion: null,
        heldOneShot: null,
        consumedEpoch: 0,
      };

      const { x, y, z, rotY } = entry.transform;
      tracker.motion = updateRemoteMotion(tracker.motion, { x, z, rotY }, now);

      const playback = resolveRemotePlayback({
        synced: entry.pose,
        poseEpoch: entry.poseEpoch ?? 0,
        inferredLocomotion: tracker.motion.locomotion,
        heldOneShot: tracker.heldOneShot,
        consumedEpoch: tracker.consumedEpoch,
      });
      tracker.heldOneShot = playback.heldOneShot;
      trackers.set(sessionId, tracker);

      const locomotion = resolveRemoteLocomotionForAnimation(tracker.motion, entry.pose, now);
      const sound = resolveLocomotionSound(locomotion, playback.pose);

      let loops = loopsBySession.get(sessionId);
      if (!loops) {
        loops = createRemoteLoops();
        loopsBySession.set(sessionId, loops);
      }

      if (!sound) {
        setRemoteLoop(loops, null, 0);
        continue;
      }

      const worldPos = findEntityWorldPosition(sceneRef.current, sessionId, positionScratch.current)
        ?? positionScratch.current.set(x, y, z);
      const spatialVolume = computeSpatialVolume(
        worldPos,
        listenerPos,
        LOCOMOTION_SOUND_MAX_DISTANCE,
        LOCOMOTION_SOUND_MIN_VOLUME,
      );
      setRemoteLoop(loops, sound, spatialVolume * LOCOMOTION_SOUND_GAIN[sound]);
    }

    for (const sessionId of loopsBySession.keys()) {
      if (!activeSessions.has(sessionId)) {
        disposeRemoteLoops(loopsBySession.get(sessionId)!);
        loopsBySession.delete(sessionId);
        trackers.delete(sessionId);
      }
    }
  });
}
