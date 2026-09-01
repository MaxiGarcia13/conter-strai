import { HealthBar } from '@/modules/combat';
import { isTouchPrimaryDevice } from '@/modules/game/input/utils/is-touch-primary-device';
import { AmmoHud } from './ammo-hud';

/** Positioned HUD shell stacking health and ammo; top-right touch, bottom-left desktop (FR-19). */
export function PlayerHud() {
  const isTouchPrimary = isTouchPrimaryDevice();
  const positionClass = isTouchPrimary
    ? 'top-4 flex-col right-4 mt-[env(safe-area-inset-top)] mr-[env(safe-area-inset-right)]'
    : 'bottom-4 flex-col-reverse left-4';

  return (
    <div className={`pointer-events-none fixed z-10 flex gap-2 ${positionClass}`}>
      <HealthBar />
      <AmmoHud />
    </div>
  );
}
