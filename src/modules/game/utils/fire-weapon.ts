import type { Camera, Scene } from 'three';
import type { ShotPayload } from '@/modules/multiplayer/adapters/colyseus-adapter';
import type { SoldierActionId } from '@/modules/soldiers';
import type { BulletHitResult } from '@/modules/weapons/types';
import { Raycaster, Vector2 } from 'three';
import { useHealthStore } from '@/modules/combat';
import { DEFAULT_LOCAL_TEAM, LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import { useGamePauseStore } from '@/modules/game/stores/game-pause-store';
import { useRoundStore } from '@/modules/game/stores/round-store';
import { useWeaponAmmoStore } from '@/modules/game/stores/weapon-ammo-store';
import {
  getActiveMatch,
  sendFire,
  sendShot,
} from '@/modules/multiplayer/adapters/colyseus-adapter';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import { PISTOL_MAX_RANGE_METERS } from '@/modules/weapons/constants/pistol';
import { DEFAULT_WEAPON_ID, weapons } from '@/modules/weapons/weapon-registry';
import { getPlayerPose } from '../stores/player-state';
import { pickBulletHit } from './pick-bullet-hit';
import { playGameSound } from './play-game-sound';
import { resolveHitDamage } from './resolve-hit-damage';

const SCREEN_CENTER = new Vector2(0, 0);
const raycaster = new Raycaster();
const FIRE_BLOCKED_POSES = new Set<SoldierActionId>(['reloading', 'reloadingKneel', 'dying']);

export interface FireWeaponView {
  camera: Camera;
  scene: Scene;
}

let view: FireWeaponView | null = null;
let lastFireMs = Number.NEGATIVE_INFINITY;

/** Bind the live camera/scene so fire can be invoked without R3F (touch fire button). */
export function setFireWeaponView(next: FireWeaponView | null): void {
  view = next;
}

/** Test helper — clears the shared fire cooldown clock. */
export function resetFireWeaponCooldown(): void {
  lastFireMs = Number.NEGATIVE_INFINITY;
}

/** Test helper — refills the shared magazine to a full load. */
export function resetWeaponAmmo(): void {
  useWeaponAmmoStore.getState().reset();
}

/**
 * Shared hitscan fire. Returns true when a shot is taken (cooldown stamped),
 * even if the ray misses. Pointer-lock is a caller concern.
 */
export function fireWeapon(now = performance.now()): boolean {
  if (useGamePauseStore.getState().isPaused) {
    return false;
  }

  const match = getActiveMatch();
  if (match ? useMultiplayerStore.getState().phase !== 'live' : useRoundStore.getState().phase !== 'live') {
    return false;
  }

  const pose = getPlayerPose();
  if (pose !== null && FIRE_BLOCKED_POSES.has(pose)) {
    return false;
  }

  if (useWeaponAmmoStore.getState().needsReload()) {
    return false;
  }

  const cooldownMs = weapons[DEFAULT_WEAPON_ID].fireCooldownSeconds * 1000;
  if (now - lastFireMs < cooldownMs) {
    return false;
  }

  if (!view) {
    return false;
  }

  lastFireMs = now;
  useWeaponAmmoStore.getState().recordShot();
  const { camera, scene } = view;
  // FPS: local gunshot originates at the camera (always full volume for self).
  playGameSound('pistol', {
    source: camera.position,
    listener: camera.position,
  });
  if (match) {
    sendFire();
  }

  camera.updateMatrixWorld();
  raycaster.far = PISTOL_MAX_RANGE_METERS;
  raycaster.setFromCamera(SCREEN_CENTER, camera);

  const hit: BulletHitResult | null = pickBulletHit(
    raycaster.intersectObject(scene, true),
    LOCAL_PLAYER_ENTITY_ID,
  );
  if (!hit || !hit.entityId || !hit.hitZone) {
    return true;
  }

  // Multiplayer: hit detection stays client-side (raycast against peer
  // hitboxes) but damage is server-authoritative — the server resolves HP,
  // elimination, and round end from the shot message.
  if (match) {
    const target = useMultiplayerStore.getState().remotePlayers[hit.entityId];
    const self = match.players.find((player) => player.sessionId === match.sessionId);
    if (!target || !self || self.team === target.team) {
      return true;
    }
    sendShot({ targetId: target.sessionId, zone: hit.hitZone as ShotPayload['zone'] });
    return true;
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
    return true;
  }

  useHealthStore.getState().applyDamage(damage);
  useRoundStore.getState().checkAndEndRound();
  return true;
}
