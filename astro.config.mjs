import process from 'node:process';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const port = Number(process.env.PORT ?? 4321);
const site = process.env.SITE ?? `http://localhost:${port}`;

export default defineConfig({
  site,
  server: {
    port,
  },
  vite: { plugins: [tailwindcss()] },
  integrations: [sitemap(), react()],
});
