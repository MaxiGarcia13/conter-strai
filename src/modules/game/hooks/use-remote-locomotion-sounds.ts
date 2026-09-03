import type { Scene } from 'three';
import type { LocomotionSoundLoops } from '../utils/locomotion-sound-loops';
import type { LocomotionSoundId } from '../utils/resolve-locomotion-sound';
import type { RemoteMotionSample } from '@/modules/multiplayer/utils/resolve-remote-locomotion';
import type { SyncableRemotePose } from '@/modules/multiplayer/utils/syncable-remote-pose';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import {
  resolveRemotePlayback,
  updateRemoteMotion,
} from '@/modules/multiplayer/utils/resolve-remote-locomotion';
import {
  LOCOMOTION_SOUND_GAIN,
  LOCOMOTION_SOUND_MAX_DISTANCE,
  LOCOMOTION_SOUND_MIN_VOLUME,
} from '../constants/locomotion-sounds';
import { computeSpatialVolume } from '../utils/compute-spatial-volume';
import { findEntityWorldPosition } from '../utils/find-entity-world-position';
import { createLocomotionSoundLoops } from '../utils/locomotion-sound-loops';
import { resolveLocomotionSound } from '../utils/resolve-locomotion-sound';

interface RemoteSoundTracker {
  motion: RemoteMotionSample | null;
  heldOneShot: SyncableRemotePose | null;
  consumedEpoch: number;
}

interface RemotePlayerLoops {
  loops: LocomotionSoundLoops;
}

function createRemoteLoops(): RemotePlayerLoops {
  return { loops: createLocomotionSoundLoops() };
}

function disposeRemoteLoops(remote: RemotePlayerLoops): void {
  remote.loops.dispose();
}

function setRemoteLoop(
  remote: RemotePlayerLoops,
  target: LocomotionSoundId | null,
  volume: number,
): void {
  remote.loops.setActive(target, volume);
}

/** Loops walk/run movement SFX per remote peer, attenuated by distance to the listener. */
export function useRemoteLocomotionSounds(): void {
  const scene = useThree((s) => s.scene);
  const listener = useThree((s) => s.camera);
  const connected = useMultiplayerStore((s) => s.connected);
  const sceneRef = useRef<Scene>(scene);
  const positionScratchRef = useRef(new Vector3());
  sceneRef.current = scene;

  const loopsBySessionRef = useRef(new Map<string, RemotePlayerLoops>());
  const trackersRef = useRef(new Map<string, RemoteSoundTracker>());

  useEffect(() => {
    if (!connected) {
      return;
    }
    return () => {
      for (const remote of loopsBySessionRef.current.values()) {
        disposeRemoteLoops(remote);
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

      // Prefer the sender's synced clip so 20 Hz position inference cannot
      // restart the same walk/run loop every packet.
      const sound = resolveLocomotionSound(playback.locomotion, playback.pose);

      let remote = loopsBySession.get(sessionId);
      if (!remote) {
        remote = createRemoteLoops();
        loopsBySession.set(sessionId, remote);
      }

      if (!sound) {
        setRemoteLoop(remote, null, 0);
        continue;
      }

      const worldPos = findEntityWorldPosition(sceneRef.current, sessionId, positionScratchRef.current)
        ?? positionScratchRef.current.set(x, y, z);
      const spatialVolume = computeSpatialVolume(
        worldPos,
        listenerPos,
        LOCOMOTION_SOUND_MAX_DISTANCE,
        LOCOMOTION_SOUND_MIN_VOLUME,
      );
      setRemoteLoop(remote, sound, spatialVolume * LOCOMOTION_SOUND_GAIN[sound]);
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
