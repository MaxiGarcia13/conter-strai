import { eslintConfig } from '@maxigarcia/eslint-config';

export default eslintConfig(
  {
    react: true,
    typescript: true,
    jsx: true,
    astro: true,
    tailwind: true,
  },
  {
    ignores: [
      'node_modules',
      'dist',
    ],
  },
);
