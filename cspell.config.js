import { defineConfig } from 'cspell';

export default defineConfig({
  version: '0.2',
  language: 'en',
  words: [
    'bunx',
    'commitlint',
    'evenodd',
    'lefthook',
    'logomark',
    'osx',
    'Pressable',
    'svh',
    'tsc',
    'turbopack',
    'typesync',
    'vitest',
  ],
  flagWords: [],
  ignorePaths: ['**/node_modules/**'],
  maxNumberOfProblems: 0,
  minWordLength: 3,
});
