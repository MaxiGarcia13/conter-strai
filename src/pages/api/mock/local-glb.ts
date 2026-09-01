import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';

export const GET: APIRoute = async (request) => {
  const url = new URL(request.url);
  const path = url.searchParams.get('q');

  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing query parameter' }), { status: 400 });
  }

  const file = await readFile(`./assets/glb/${path}`);

  return new Response(file, { headers: { 'Content-Type': 'application/glb' } });
};
