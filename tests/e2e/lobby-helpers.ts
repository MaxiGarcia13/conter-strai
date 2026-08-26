import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';

export async function createMatchRoomViaApi(request: APIRequestContext): Promise<string> {
  const response = await request.post('/api/v1/room', {
    data: { scenario: 'arena-01' },
  });
  expect(response.status()).toBe(201);
  const body = await response.json() as { id: string };
  expect(body.id).toMatch(/^[A-Z0-9]{6}$/);
  return body.id;
}
