import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';

const specs = defineCollection({
  loader: glob({
    base: './specs',
    pattern: 'current/tasks.md',
  }),
});

export const collections = { specs };
