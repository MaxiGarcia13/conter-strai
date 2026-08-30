import type { PlayLoaderState } from './types';

interface PlayLoaderProps extends PlayLoaderState {
  className?: string;
}
/** Full-screen DOM overlay — works before WebGL mounts (unlike drei Html). */
export function PlayLoader({ label, progress, className = '' }: PlayLoaderProps) {
  return (
    <div
      className={`play-loader ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={progress === null ? label : `${label} ${progress} percent`}
    >
      <p className="play-loader-label">{label}</p>
      <div className="play-loader-track">
        {progress === null
          ? (
              <div className="play-loader-indeterminate" />
            )
          : (
              <div className="play-loader-fill" style={{ width: `${progress}%` }} />
            )}
      </div>
      {progress !== null && (
        <p className="play-loader-percent">
          {progress}
          %
        </p>
      )}
    </div>
  );
}
