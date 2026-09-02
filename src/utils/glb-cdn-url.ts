/** CDN object key, e.g. `characters/civilians/james.glb` (leading slash optional). */
export function glbCdnUrl(path: string): string {
  const key = path.startsWith('/') ? path.slice(1) : path;

  const url = resolveUrl();

  url.searchParams.set('q', key);
  return url.toString();
}

function resolveUrl(): URL {
  if (!import.meta.env.DEV && import.meta.env.PUBLIC_GLB_CDN_URL) {
    return new URL(import.meta.env.PUBLIC_GLB_CDN_URL);
  }

  return new URL('/api/mock/local-glb', import.meta.url);
}
