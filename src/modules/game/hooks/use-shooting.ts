import type { ShotPayload } from '@/modules/multiplayer/adapters/colyseus-adapter';
import type { BulletHitResult } from '@/modules/weapons/types';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Raycaster, Vector2 } from 'three';
import { useHealthStore } from '@/modules/combat';
import { DEFAULT_LOCAL_TEAM, LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import { useRoundStore } from '@/modules/game/state/round-store';
import {
  getActiveMatch,
  sendShot,
} from '@/modules/multiplayer/adapters/colyseus-adapter';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import { DEFAULT_WEAPON_ID, weapons } from '@/modules/weapons/weapon-registry';
import { resolveHitDamage } from '../services/resolve-hit-damage';
import { getPlayerPose } from '../state/player-state';
import { pickBulletHit } from '../utils/pick-bullet-hit';
import { playGameSound } from '../utils/play-game-sound';

const SCREEN_CENTER = new Vector2(0, 0);
const PISTOL_RANGE_METERS = 100;

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
      const match = getActiveMatch();
      if (match ? useMultiplayerStore.getState().phase !== 'live' : useRoundStore.getState().phase !== 'live') {
        return;
      }

      const pose = getPlayerPose();
      if (pose === 'reloading' || pose === 'reloadingKneel' || pose === 'dying') {
        return;
      }

      const now = performance.now();
      const cooldownMs = weapons[DEFAULT_WEAPON_ID].fireCooldownSeconds * 1000;
      if (now - lastFireRef.current < cooldownMs) {
        return;
      }
      lastFireRef.current = now;
      // FPS: local gunshot originates at the camera (always full volume for self).
      playGameSound('pistol', {
        source: camera.position,
        listener: camera.position,
      });

      camera.updateMatrixWorld();
      const raycaster = raycasterRef.current;
      raycaster.far = PISTOL_RANGE_METERS;
      raycaster.setFromCamera(SCREEN_CENTER, camera);

      const hit: BulletHitResult | null = pickBulletHit(
        raycaster.intersectObject(scene, true),
        LOCAL_PLAYER_ENTITY_ID,
      );
      if (!hit || !hit.entityId || !hit.hitZone) {
        return;
      }

      // Multiplayer: hit detection stays client-side (raycast against peer
      // hitboxes) but damage is server-authoritative — the server resolves HP,
      // elimination, and round end from the shot message.
      if (match) {
        const target = useMultiplayerStore.getState().remotePlayers[hit.entityId];
        const self = match.players.find((player) => player.sessionId === match.sessionId);
        if (!target || !self || self.team === target.team) {
          return;
        }
        sendShot({ targetId: target.sessionId, zone: hit.hitZone as ShotPayload['zone'] });
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
