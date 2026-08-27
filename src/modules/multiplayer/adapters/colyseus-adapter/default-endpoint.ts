/** Client WebSocket endpoint. Unset env is a boot error, not a silent default. */
export function defaultEndpoint(): string {
  const url = import.meta.env.PUBLIC_COLYSEUS_URL;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('Missing PUBLIC_COLYSEUS_URL');
  }
  return url;
}
