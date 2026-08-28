import type { APIRequestContext, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface HostRoom {
  roomId: string;
  hostToken: string;
}

export async function createHostRoom(request: APIRequestContext): Promise<HostRoom> {
  const response = await request.post('/api/v1/room', {
    data: { scenario: 'arena-01' },
  });
  expect(response.status()).toBe(201);
  const body = await response.json() as { id: string; hostToken: string };
  expect(body.id).toMatch(/^[A-Z0-9]{6}$/);
  expect(typeof body.hostToken).toBe('string');
  return { roomId: body.id, hostToken: body.hostToken };
}

export async function createMatchRoomViaApi(request: APIRequestContext): Promise<string> {
  const { roomId } = await createHostRoom(request);
  return roomId;
}

export async function seedHostSession(
  page: Page,
  { roomId, hostToken }: HostRoom,
): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ id, token }) => {
      sessionStorage.setItem(
        `cs:room:${id}`,
        JSON.stringify({
          team: 'civilian',
          skin: 'remy',
          scenario: 'arena-01',
          role: 'host',
          hostToken: token,
        }),
      );
    },
    { id: roomId, token: hostToken },
  );
}

export async function seedGuestSession(page: Page, roomId: string): Promise<void> {
  const claimResponse = await page.request.put(`/api/v1/room/${roomId}`, {
    data: { team: 'soldier', skin: 'swat-1' },
  });
  expect(claimResponse.status()).toBe(200);
  const claimed = await claimResponse.json() as { reservation: Record<string, unknown> };

  await page.goto('/');
  await page.evaluate(
    ({ id, reservation }) => {
      sessionStorage.setItem(
        `cs:room:${id}`,
        JSON.stringify({
          team: 'soldier',
          skin: 'swat-1',
          scenario: 'arena-01',
          role: 'guest',
          reservation,
        }),
      );
    },
    { id: roomId, reservation: claimed.reservation },
  );
}

export async function waitForMatchSession(page: Page, roomId: string): Promise<void> {
  await expect.poll(async () =>
    page.evaluate((id) => {
      const raw = sessionStorage.getItem(`cs:room:${id}`);
      if (!raw) {
        return false;
      }
      const session = JSON.parse(raw) as { reconnectionToken?: string };
      return typeof session.reconnectionToken === 'string';
    }, roomId),
  { timeout: 20_000 }).toBe(true);
}
