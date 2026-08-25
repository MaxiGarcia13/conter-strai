import type { BulletHitResult } from '@/modules/weapons/types';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Raycaster, Vector2 } from 'three';
import { useHealthStore } from '@/modules/combat';
import { DEFAULT_LOCAL_TEAM, LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import { useRoundStore } from '@/modules/game/state/round-store';
import { DEFAULT_WEAPON_ID, weapons } from '@/modules/weapons/weapon-registry';
import { resolveHitDamage } from '../services/resolve-hit-damage';
import { getPlayerPose, setPlayerPose } from '../state/player-state';
import { pickBulletHit } from '../utils/pick-bullet-hit';

const SCREEN_CENTER = new Vector2(0, 0);

export function useShooting(domElement: HTMLElement | null) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const raycasterRef = useRef(new Raycaster());
  const lastFireRef = useRef(0);

  useEffect(() => {
    if (!domElement) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }
      if (document.pointerLockElement !== domElement) {
        return;
      }
      if (useRoundStore.getState().phase !== 'live') {
        return;
      }

      const now = performance.now();
      const cooldownMs = weapons[DEFAULT_WEAPON_ID].fireCooldownSeconds * 1000;
      if (now - lastFireRef.current < cooldownMs) {
        return;
      }
      lastFireRef.current = now;

      const pose = getPlayerPose();
      if (pose === 'reloading' || pose === 'dying') {
        return;
      }

      camera.updateMatrixWorld();
      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(SCREEN_CENTER, camera);

      const hit: BulletHitResult | null = pickBulletHit(
        raycaster.intersectObject(scene, true),
        LOCAL_PLAYER_ENTITY_ID,
      );
      if (!hit) {
        return;
      }

      const roster = useRoundStore.getState().roster;
      const attackerTeam
        = roster.find((entry) => entry.entityId === LOCAL_PLAYER_ENTITY_ID)?.team ?? DEFAULT_LOCAL_TEAM;

      const damage = resolveHitDamage({
        hit,
        attackerId: LOCAL_PLAYER_ENTITY_ID,
        attackerTeam,
        weaponId: DEFAULT_WEAPON_ID,
        roster,
      });

      if (!damage) {
        return;
      }

      useHealthStore.getState().applyDamage(damage);
      useRoundStore.getState().checkAndEndRound();
    };

    domElement.addEventListener('mousedown', onMouseDown);
    return () => {
      domElement.removeEventListener('mousedown', onMouseDown);
    };
  }, [domElement, camera, scene]);
}
