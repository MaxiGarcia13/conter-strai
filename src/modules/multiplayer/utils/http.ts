import { MatchMakerState } from '@colyseus/core/MatchMaker';
import { matchMaker } from 'colyseus';

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** `503` when Colyseus has not finished booting; otherwise `null`. */
export function requireMatchMaker(): Response | null {
  if (matchMaker.state !== MatchMakerState.READY) {
    return jsonResponse(503, { error: 'Matchmaker is not ready' });
  }
  return null;
}

export async function readJsonBody(
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      return { ok: true, value: await request.json() };
    }
    return { ok: true, value: {} };
  } catch {
    return { ok: false, response: jsonResponse(400, { error: 'Invalid JSON body' }) };
  }
}
