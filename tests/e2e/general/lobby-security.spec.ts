import { expect, test } from '../fixtures';

const ORIGIN = 'http://localhost:4326';

interface CreateRoomBody {
  id: string;
  hostToken?: string;
}

async function createRoom(request: import('@playwright/test').APIRequestContext): Promise<string> {
  const response = await request.post('/api/v1/room', {
    headers: { origin: ORIGIN },
    data: { scenario: 'arena-01' },
  });
  expect(response.status()).toBe(201);
  const body = await response.json() as CreateRoomBody;
  expect(body.id).toMatch(/^[A-Z0-9]{6}$/);
  return body.id;
}

test('POST rejects a cross-origin create with 403', async ({ request }) => {
  const response = await request.post('/api/v1/room', {
    headers: { origin: 'https://evil.example' },
    data: { scenario: 'arena-01' },
  });
  expect(response.status()).toBe(403);
});

test('DELETE without a host token fails; with the token it disposes the room', async ({ request }) => {
  const roomId = await createRoom(request);

  const denied = await request.delete(`/api/v1/room/${roomId}`, { headers: { origin: ORIGIN } });
  expect(denied.status()).toBe(401);

  const created = await request.post('/api/v1/room', { data: { scenario: 'arena-01' } });
  const body = await created.json() as CreateRoomBody;
  expect(typeof body.hostToken).toBe('string');
  expect(body.hostToken?.length).toBeGreaterThan(0);

  const disposed = await request.delete(`/api/v1/room/${body.id}`, {
    headers: { origin: ORIGIN, authorization: `Bearer ${body.hostToken}` },
  });
  expect(disposed.status()).toBe(204);

  const snapshot = await request.get(`/api/v1/room/${body.id}`);
  expect(snapshot.status()).toBe(404);
});

test('GET snapshot exposes expiresAt and rejects a wrong host token with 403', async ({ request }) => {
  const roomId = await createRoom(request);

  const snapshot = await request.get(`/api/v1/room/${roomId}`);
  expect(snapshot.status()).toBe(200);
  const body = await snapshot.json() as { expiresAt?: string };
  expect(typeof body.expiresAt).toBe('string');
  expect(Number.isNaN(Date.parse(body.expiresAt as string))).toBe(false);

  const denied = await request.delete(`/api/v1/room/${roomId}`, {
    headers: { origin: ORIGIN, authorization: 'Bearer wrong-token' },
  });
  expect(denied.status()).toBe(403);
});

test('PUT claim seat rejects a cross-origin request with 403', async ({ request }) => {
  const roomId = await createRoom(request);

  const response = await request.put(`/api/v1/room/${roomId}`, {
    headers: { 'origin': 'https://evil.example', 'content-type': 'application/json' },
    data: { team: 'civilian', skin: 'remy' },
  });
  expect(response.status()).toBe(403);
});

test('expired room returns 410 on GET and PUT, and DELETE with a valid host token', async ({ request }) => {
  const created = await request.post('/api/v1/room', {
    headers: { origin: ORIGIN },
    data: { scenario: 'arena-01', ttlMs: 800 },
  });
  expect(created.status()).toBe(201);
  const body = await created.json() as CreateRoomBody & { expiresAt: string };
  expect(body.id).toMatch(/^[A-Z0-9]{6}$/);
  expect(typeof body.hostToken).toBe('string');
  const remainingMs = Date.parse(body.expiresAt) - Date.now();
  expect(remainingMs).toBeGreaterThan(0);
  expect(remainingMs).toBeLessThan(2_000);

  const live = await request.get(`/api/v1/room/${body.id}`);
  expect(live.status()).toBe(200);
  const snapshot = await live.json() as { expiresAt?: string };
  expect(Date.parse(snapshot.expiresAt as string) - Date.now()).toBeLessThan(2_000);

  await expect.poll(async () => Date.now() >= Date.parse(body.expiresAt)).toBe(true);

  const expiredGet = await request.get(`/api/v1/room/${body.id}`);
  expect(expiredGet.status()).toBe(410);
  expect(await expiredGet.json()).toMatchObject({ error: 'Room expired' });

  const [claimed, disposed] = await Promise.all([
    request.put(`/api/v1/room/${body.id}`, {
      headers: { 'origin': ORIGIN, 'content-type': 'application/json' },
      data: { team: 'civilian', skin: 'remy' },
    }),
    request.delete(`/api/v1/room/${body.id}`, {
      headers: { origin: ORIGIN, authorization: `Bearer ${body.hostToken}` },
    }),
  ]);
  expect(claimed.status()).toBe(410);
  expect(await claimed.json()).toMatchObject({ error: 'Room expired' });
  expect(disposed.status()).toBe(410);
  expect(await disposed.json()).toMatchObject({ error: 'Room expired' });
});
