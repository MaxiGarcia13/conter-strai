import type { LocalSpawn } from '@/modules/game/utils/local-spawn';
import type { ScenarioConfig } from '@/modules/scenarios';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { useHealthStore } from '@/modules/combat';
import { LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import { resetPlayerTransform } from '@/modules/game/state/player-state';
import { npcBlockersFromScenario } from '@/modules/game/utils/npc-blockers-from-scenario';
import { usePressedKeyCodes } from '../use-pressed-key-codes';
import { usePlayerKeyboard } from './use-player-keyboard';
import { usePlayerMovementFrame } from './use-player-movement-frame';
import { usePlayerPointerLock } from './use-player-pointer-lock';

interface UsePlayerControlsOptions {
  bounds: ScenarioConfig['bounds'];
  collisionSegments: NonNullable<ScenarioConfig['collisionSegments']>;
  wallThickness: number;
  spawn: LocalSpawn;
  scenario: ScenarioConfig;
}

/**
 * Binds WASD + pointer-lock mouse look to the shared player transform and
 * positions the camera for the active mode each frame. Movement resolves
 * interior walls and NPC bodies before clamping against the scenario's outer bounds.
 */
export function usePlayerControls({
  bounds,
  collisionSegments,
  spawn,
  wallThickness,
  scenario,
}: UsePlayerControlsOptions) {
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const externalControls = useThree((state) => state.controls);
  const eliminated = useHealthStore(
    (s) => s.healthById[LOCAL_PLAYER_ENTITY_ID]?.isEliminated ?? false,
  );
  const npcBlockers = useMemo(
    () => npcBlockersFromScenario(scenario, spawn.key),
    [scenario, spawn.key],
  );

  const pressedCodesRef = usePressedKeyCodes();
  const eliminatedRef = useRef(eliminated);
  eliminatedRef.current = eliminated;
  const externalControlsRef = useRef(externalControls);
  externalControlsRef.current = externalControls;

  useEffect(() => {
    camera.rotation.order = 'YXZ';
    // Idempotent so a dev remount cannot strand the player away from spawn.
    resetPlayerTransform(spawn.position[0], spawn.position[2], spawn.yaw);
  }, [camera, spawn]);

  usePlayerKeyboard({
    pressedCodesRef,
    eliminatedRef,
    externalControlsRef,
  });

  usePlayerPointerLock({
    domElement,
    eliminated,
    eliminatedRef,
    externalControlsRef,
  });

  usePlayerMovementFrame({
    camera,
    bounds,
    collisionSegments,
    wallThickness,
    npcBlockers,
    pressedCodesRef,
    eliminatedRef,
    externalControlsRef,
  });

}
