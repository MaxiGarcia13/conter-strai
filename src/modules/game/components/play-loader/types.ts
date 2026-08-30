export interface PlayLoaderState {
  label: string;
  /** `null` = indeterminate pulse bar (engine boot). */
  progress: number | null;
}
