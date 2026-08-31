import { LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import { isTouchPrimaryDevice } from '@/modules/game/input/utils/is-touch-primary-device';
import { useHealthStore } from '../health-store';

/** DOM overlay showing the local player's HP as a percentage bar. */
export function HealthBar() {
  const state = useHealthStore((s) => s.healthById[LOCAL_PLAYER_ENTITY_ID]);
  const hp = state?.currentHp ?? 100;
  const maxHp = state?.maxHp ?? 100;
  const pct = Math.round((hp / maxHp) * 100);

  const isTouchPrimary = isTouchPrimaryDevice();
  const positionClass = isTouchPrimary
    ? 'top-4 right-4'
    : 'bottom-4 left-4';

  return (
    <div
      role="status"
      aria-label={`Health ${pct}%`}
      className={`pointer-events-none fixed ${positionClass} z-10 flex items-center gap-3 border border-surface-border bg-background-deep/80 px-3 py-2 font-mono text-xs tracking-widest text-foreground uppercase mt-[env(safe-area-inset-top)] mr-[env(safe-area-inset-right)]`}
    >
      <span className="text-accent">HP</span>
      <div className="relative h-2 w-32 overflow-hidden rounded-sm bg-white/10">
        <div
          className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="tabular-nums">
        {pct}
        %
      </span>
    </div>
  );
}
