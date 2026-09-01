import {
  isTouchPrimaryDevice,
} from '@/modules/game/input/utils/is-touch-primary-device';
import { useWeaponAmmoStore } from '@/modules/game/stores/weapon-ammo-store';
import { getRoundsRemaining } from '@/modules/game/utils/get-rounds-remaining';
import { PISTOL_MAGAZINE_SIZE } from '@/modules/weapons/constants/pistol';

/** DOM overlay showing rounds left in the local player's magazine. */
export function AmmoHud() {
  // Subscribes to the ammo store; getRoundsRemaining reads the latest snapshot.
  const remaining = useWeaponAmmoStore(getRoundsRemaining);
  const empty = remaining === 0;

  const isTouchPrimary = isTouchPrimaryDevice();
  const positionClass = isTouchPrimary
    ? 'top-4 left-1/2 mt-[env(safe-area-inset-top)] -translate-x-1/2'
    : 'bottom-4 right-4';

  return (
    <div
      role="status"
      aria-label={`Ammo ${remaining} of ${PISTOL_MAGAZINE_SIZE} rounds remaining`}
      className={`pointer-events-none fixed ${positionClass} z-10 border border-surface-border bg-background-deep/80 px-3 py-1.5 font-mono text-xs tracking-widest uppercase ${empty ? 'text-accent' : 'text-foreground'}`}
    >
      <span className="mr-2 text-accent">AMMO</span>
      <span className="tabular-nums">
        {remaining}
        {' '}
        /
        {' '}
        {PISTOL_MAGAZINE_SIZE}
      </span>
    </div>
  );
}
