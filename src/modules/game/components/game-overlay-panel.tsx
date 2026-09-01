import type { AriaRole, ReactNode } from 'react';

interface GameOverlayPanelProps {
  role: AriaRole;
  ariaLabel: string;
  /** Set for dialogs (pause) so the rest of the page is inert. */
  modal?: boolean;
  children: ReactNode;
}

/**
 * Shared full-screen HUD overlay frame: dimmed backdrop + bordered centered
 * panel. Callers supply the `role`/`aria` semantics and the panel body.
 */
export function GameOverlayPanel({
  role,
  ariaLabel,
  modal = false,
  children,
}: GameOverlayPanelProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-modal={modal}
      className="fixed inset-0 z-20 flex items-center justify-center bg-background-deep/50"
    >
      <div className="border border-surface-border bg-background-deep/90 px-8 py-6 text-center font-mono tracking-widest uppercase">
        {children}
      </div>
    </div>
  );
}
