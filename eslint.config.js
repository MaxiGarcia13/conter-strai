import { eslintConfig } from '@maxigarcia/eslint-config';

export default eslintConfig(
  {
    react: true,
    typescript: true,
    jsx: true,
    astro: true,
  },
  {
    ignores: [
      'node_modules',
      'dist',
    ],
  },
  {
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['../../**'],
          message: 'Avoid deep parent-relative imports (../../ and deeper). Use the @/ alias instead.',
        }],
      }],
    },
  },
);
