import { useThree } from '@react-three/fiber';

import { useEffect } from 'react';

import { countActiveSoldierMixers as countLocomotionMixers } from '@/modules/soldiers/hooks/use-soldier-locomotion';
import { SOLDIER_ROOT_NAME } from '@/modules/soldiers/utils/clone-soldier-root';
import {
  cycleCameraMode,
  getCameraMode,
  getPlayerLocomotion,
  getPlayerPose,
  getPlayerTransform,
  setPlayerLocomotion,
  setPlayerPose,
} from '../state/player-state';

const POLL_INTERVAL_MS = 60;
const HOOK_VERSION = 'v4-manual-angle';

/** Diagnostic snapshot polled by Playwright when the build runs with E2E=true. */
export interface PlayTestSnapshot {
  version?: string;
  /** Soldier armature roots in the scene graph (includes hidden FPS body). */
  soldierCount: number;
  mixerReady: boolean;
  activeClip: string;
  debug?: {
    mode: string;
    pitch: number;
    headScale: number | null;
    headWorldY: number | null;
    spineAngle: number;
    spineQ?: number[] | null;
    cameraY: number | null;
  };
}

declare global {
  interface Window {
    __PLAY_TEST__?: PlayTestSnapshot;
    /** Headless probes cannot pointer-lock; they drive state through these instead. */
    __PLAY_TEST_API__?: {
      setPitch: (radians: number) => void;
      setPose: (pose: 'kneel' | null) => void;
      setLocomotion: (locomotion: 'idle' | 'walk' | 'run') => void;
      cycleMode: () => string;
    };
  }
}

interface DebugNode {
  scale: { x: number };
  quaternion: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  matrixWorld: { elements: number[] };
}

function angleFromIdentity(q: { x: number; y: number; z: number; w: number }): number {
  const dot = q.w;
  return 2 * Math.acos(Math.min(1, Math.abs(dot)));
}

function findLocalNode(localRoot: unknown, name: string): DebugNode | null {
  const root = localRoot as { getObjectByName: (n: string) => DebugNode | null } | null;
  return root?.getObjectByName(name) ?? root?.getObjectByName(name.replace(':', '')) ?? null;
}

export function PlayTestHook() {
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const update = () => {
      let soldierCount = 0;
      let localRoot: unknown = null;
      scene.traverse((object) => {
        if (object.name === SOLDIER_ROOT_NAME)
          soldierCount += 1;
        if (object.name === 'local-player')
          localRoot = object;
      });

      // Live clones carry sanitized colon-less bone names; try both spellings anyway.
      const head = findLocalNode(localRoot, 'mixamorig:Head');
      const spine = findLocalNode(localRoot, 'mixamorig:Spine');

      const headWorldY = head ? head.matrixWorld.elements[13] : null;

      window.__PLAY_TEST__ = {
        soldierCount,
        mixerReady: countLocomotionMixers() > 0,
        activeClip: getPlayerPose() ?? getPlayerLocomotion(),
        version: HOOK_VERSION,
        debug: {
          mode: getCameraMode(),
          pitch: Number(getPlayerTransform().pitch.toFixed(3)),
          headScale: head ? Number(head.scale.x.toFixed(4)) : null,
          headWorldY: headWorldY === null ? null : Number(headWorldY.toFixed(3)),
          spineAngle: spine ? Number(angleFromIdentity(spine.quaternion).toFixed(4)) : -1,
          spineQ: spine
            ? [spine.quaternion.x, spine.quaternion.y, spine.quaternion.z, spine.quaternion.w].map((v) =>
                Number(v.toFixed(4)),
              )
            : null,
          cameraY: camera ? Number(camera.position.y.toFixed(3)) : null,
        },
      };
    };

    update();
    window.__PLAY_TEST_API__ = {
      setPitch: (radians) => {
        getPlayerTransform().pitch = radians;
      },
      setPose: (pose) => setPlayerPose(pose),
      setLocomotion: (next) => setPlayerLocomotion(next),
      cycleMode: () => cycleCameraMode(),
    };
    const timer = window.setInterval(update, POLL_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
      delete window.__PLAY_TEST__;
      delete window.__PLAY_TEST_API__;
    };
  }, [scene, camera]);

  return null;
}
