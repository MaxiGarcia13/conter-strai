import type { LocalSpawn } from '@/modules/game/utils/local-spawn';
import type { ScenarioConfig } from '@/modules/scenarios';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { useHealthStore } from '@/modules/combat';
import { LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import { useEffectiveRoundPhase } from '@/modules/game/hooks/use-effective-round-phase';
import { useGamePauseStore } from '@/modules/game/stores/game-pause-store';
import { resetPlayerTransform } from '@/modules/game/stores/player-state';
import { npcBlockersFromScenario } from '@/modules/game/utils/npc-blockers-from-scenario';
import { propBlockersFromScenario } from '@/modules/game/utils/prop-blockers-from-scenario';
import { useLocomotionSounds } from '../use-locomotion-sounds';
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
 * interior walls, NPC discs, and collidable prop boxes before clamping
 * against the scenario's outer bounds.
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
  const paused = useGamePauseStore((s) => s.isPaused);
  const { phase } = useEffectiveRoundPhase();
  const npcBlockers = useMemo(
    () => npcBlockersFromScenario(scenario, spawn.key),
    [scenario, spawn.key],
  );
  const propBlockers = useMemo(
    () => propBlockersFromScenario(scenario),
    [scenario],
  );
  const circleBlockers = useMemo(
    () => [...npcBlockers, ...propBlockers.circles],
    [npcBlockers, propBlockers],
  );

  const pressedCodesRef = usePressedKeyCodes();
  const eliminatedRef = useRef(eliminated);
  eliminatedRef.current = eliminated;
  const isPausedRef = useRef(paused);
  isPausedRef.current = paused;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
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
    isPausedRef,
    phaseRef,
    externalControlsRef,
  });

  usePlayerPointerLock({
    domElement,
    eliminated,
    eliminatedRef,
    paused,
    isPausedRef,
    phase,
    phaseRef,
    externalControlsRef,
  });

  usePlayerMovementFrame({
    camera,
    bounds,
    collisionSegments,
    wallThickness,
    npcBlockers: circleBlockers,
    boxBlockers: propBlockers.boxes,
    pressedCodesRef,
    eliminatedRef,
    isPausedRef,
    externalControlsRef,
  });

  useLocomotionSounds();
}
