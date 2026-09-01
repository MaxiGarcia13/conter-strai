import { useCallback, useRef, useState } from 'react';
import { InviteQr } from './invite-qr';

interface InviteShareProps {
  roomId: string;
}

export function InviteShare({ roomId }: InviteShareProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/room/${roomId}/join`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      if (timerRef.current)
        clearTimeout(timerRef.current);
      timerRef.current = setTimeout(setCopied, 2000, false);
    } catch {
      // Clipboard API unavailable — fall back to selecting the input
    }
  }, [inviteUrl]);

  return (
    <div className="border-surface-border border p-4">
      <p className="site-eyebrow site-eyebrow--muted">{`//` + ' Invite'}</p>
      <div className="mt-3 flex items-center gap-2">
        <input
          readOnly
          value={inviteUrl}
          className="bg-surface border-surface-border text-foreground flex-1 border px-3 py-2 font-mono text-xs tracking-widest"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          type="button"
          onClick={handleCopy}
          className="cs-button cs-button--secondary shrink-0"
        >
          <span className="cs-button__label">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>
      <div className="mt-4 flex justify-center">
        <InviteQr url={inviteUrl} />
      </div>
    </div>
  );
}
