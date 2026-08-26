import process from 'node:process';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import colyseus from './src/modules/multiplayer/integration';

const port = Number(process.env.PORT ?? 4321);
const site = process.env.SITE ?? `http://localhost:${port}`;

export default defineConfig({
  output: 'server',
  site,

  server: {
    host: '0.0.0.0',
    port,
  },

  vite: {
    plugins: [tailwindcss()],
    // Avoid a Vite dep-optimizer race (Astro #16766) that can drop react/jsx-dev-runtime
    // from the client pre-bundle and cause intermittent "jsxDEV is not a function".
    // treeshake:false — Vite 8/Rolldown DCE strips R3F AsyncDispatcher.getOwner (only
    // reached via React.createElement across the package boundary), which throws
    // "dispatcher.getOwner is not a function" under React 19.2 owner stacks.
    environments: {
      client: {
        optimizeDeps: {
          noDiscovery: true,
          include: [
            'react',
            'react-dom',
            'react-dom/client',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            '@react-three/fiber',
            '@react-three/drei',
            'three',
            'react-qr-code',
          ],
          rolldownOptions: {
            treeshake: false,
          },
        },
      },
    },
    resolve: {
      dedupe: ['react', 'react-dom', 'three'],
    },
  },

  integrations: [
    sitemap(),
    react(),
    colyseus(),
  ],

  adapter: node({
    mode: 'standalone',
  }),
});
