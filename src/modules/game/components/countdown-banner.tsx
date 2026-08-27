import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import { useRoundStore } from '../state/round-store';

/** Full-screen 3–2–1 overlay before combat — visible above loaders and HUD. */
export function CountdownBanner() {
  const connected = useMultiplayerStore((state) => state.connected);
  const mpPhase = useMultiplayerStore((state) => state.phase);
  const mpCountdown = useMultiplayerStore((state) => state.countdown);
  const roundPhase = useRoundStore((state) => state.phase);
  const roundCountdown = useRoundStore((state) => state.countdown);

  const phase = connected ? mpPhase : roundPhase;
  const countdown = connected ? mpCountdown : (phase === 'countdown' ? roundCountdown : null);

  if (phase !== 'countdown' || countdown == null || countdown < 1) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      aria-label={`Starting in ${countdown}`}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background-deep/70"
    >
      <div className="border border-surface-border bg-background-deep/95 px-12 py-10 text-center font-mono tracking-widest uppercase">
        <p className="mb-3 text-sm text-foreground/60">Get Ready</p>
        <p
          key={countdown}
          className="text-8xl font-bold text-accent tabular-nums sm:text-9xl"
        >
          {countdown}
        </p>
      </div>
    </div>
  );
}
