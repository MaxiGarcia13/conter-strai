import { useEffect, useRef } from 'react';
import { TEAM_DISPLAY_NAME } from '@/modules/teams';
import { useRoundStore } from '../state/round-store';

const ROUND_END_DELAY_MS = 4000;

/** Full-screen overlay shown when a round ends; auto-restarts after a delay. */
export function RoundEndBanner() {
  const phase = useRoundStore((s) => s.phase);
  const winner = useRoundStore((s) => s.winner);
  const startRound = useRoundStore((s) => s.startRound);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase !== 'round-end') {
      return;
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      startRound();
    }, ROUND_END_DELAY_MS);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, startRound]);

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
