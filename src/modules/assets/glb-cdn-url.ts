export const GLB_CDN_ORIGIN = 'https://conter-strai.maxig8.workers.dev';

/** CDN object key, e.g. `characters/civilians/james.glb` (leading slash optional). */
export function glbCdnUrl(path: string): string {
  const key = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(GLB_CDN_ORIGIN);
  url.searchParams.set('q', key);
  return url.toString();
}
