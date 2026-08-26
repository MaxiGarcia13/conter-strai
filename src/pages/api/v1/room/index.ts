import type { APIRoute } from 'astro';
import { createRoom } from '@/modules/multiplayer/handlers/create-room';

export const POST: APIRoute = createRoom;
