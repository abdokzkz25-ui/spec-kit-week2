import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', '.specify/', '.claude/', 'specs/'] },
  js.configs.recommended,
  {
    rules: {
      eqeqeq: 'error',
      'prefer-const': 'error',
      'max-depth': ['error', 3],
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
    rules: {
      'max-lines-per-function': ['warn', { max: 30, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['tests/**/*.js', 'scripts/**/*.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
];
