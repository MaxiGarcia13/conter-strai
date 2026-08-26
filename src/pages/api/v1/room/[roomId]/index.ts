import type { APIRoute } from 'astro';
import { claimSeat } from '@/modules/multiplayer/handlers/claim-seat';
import { disposeRoom } from '@/modules/multiplayer/handlers/dispose-room';
import { getRoom } from '@/modules/multiplayer/handlers/get-room';

export const GET: APIRoute = getRoom;
export const PUT: APIRoute = claimSeat;
export const DELETE: APIRoute = disposeRoom;
