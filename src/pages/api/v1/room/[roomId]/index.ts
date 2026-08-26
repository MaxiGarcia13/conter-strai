import type { APIRoute } from 'astro';
import { disposeRoom } from '@/modules/multiplayer/handlers/dispose-room';
import { getRoom } from '@/modules/multiplayer/handlers/get-room';
import { claimSeat } from '@/modules/multiplayer/utils/claim-seat';

export const GET: APIRoute = getRoom;
export const PUT: APIRoute = claimSeat;
export const DELETE: APIRoute = disposeRoom;
