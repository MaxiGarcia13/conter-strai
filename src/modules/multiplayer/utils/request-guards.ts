import process from 'node:process';
import { jsonResponse } from './http';

function originFromUrl(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Same-site origins: `SITE` env (canonical) plus this request's own origin. */
function allowedOrigins(requestUrl: string): Set<string> {
  const origins = new Set<string>();
  if (process.env.SITE) {
    const siteOrigin = originFromUrl(process.env.SITE);
    if (siteOrigin) {
      origins.add(siteOrigin);
    }
  }
  const selfOrigin = originFromUrl(requestUrl);
  if (selfOrigin) {
    origins.add(selfOrigin);
  }
  return origins;
}

/**
 * Cheap same-site guard for mutating REST routes: rejects a present
 * `Origin`/`Referer` that does not match `SITE` or the request host with `403`.
 * Applies to POST/PUT/DELETE only — GET invite snapshots stay open.
 * Missing headers are allowed (browsers may omit them on some same-origin
 * navigations); this is a CSRF-ish guard, not a substitute for `hostToken`.
 */
export function requireSameSiteOrigin(request: Request): Response | null {
  const allowed = allowedOrigins(request.url);

  const origin = request.headers.get('origin');
  if (origin) {
    const parsed = originFromUrl(origin);
    return parsed !== null && allowed.has(parsed)
      ? null
      : jsonResponse(403, { error: 'Cross-origin request rejected' });
  }

  const referer = request.headers.get('referer');
  if (referer) {
    const parsed = originFromUrl(referer);
    return parsed !== null && allowed.has(parsed)
      ? null
      : jsonResponse(403, { error: 'Cross-origin request rejected' });
  }

  return null;
}
