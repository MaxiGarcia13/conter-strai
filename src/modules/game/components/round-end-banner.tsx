import { TEAM_DISPLAY_NAME } from '@/modules/teams';
import { useRoundStore } from '../state/round-store';

/** Full-screen overlay shown when a round ends. */
export function RoundEndBanner() {
  const phase = useRoundStore((s) => s.phase);
  const winner = useRoundStore((s) => s.winner);

  if (phase !== 'round-end' || !winner) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-label={`${TEAM_DISPLAY_NAME[winner]} win the round`}
      className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center"
    >
      <div className="border border-surface-border bg-background-deep/90 px-8 py-5 text-center font-mono tracking-widest uppercase">
        <p className="mb-1 text-sm text-foreground/60">Round Over</p>
        <p className="text-2xl font-bold text-accent">
          {TEAM_DISPLAY_NAME[winner]}
          {' '}
          Win
        </p>
      </div>
    </div>
  );
}
