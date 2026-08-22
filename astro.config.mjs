import process from 'node:process';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const port = Number(process.env.PORT ?? 4321);

export default defineConfig({
  server: {
    port,
  },
  vite: { plugins: [tailwindcss()] },
  integrations: [sitemap(), react()],
});
