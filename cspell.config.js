import { defineConfig } from 'cspell';

export default defineConfig({
  version: '0.2',
  language: 'en',
  words: ['bunx', 'turbopack', 'evenodd', 'osx', 'svh', 'logomark', 'tsc', 'Pressable', 'vitest', 'commitlint'],
  flagWords: [],
  ignorePaths: ['**/node_modules/**'],
  maxNumberOfProblems: 0,
  minWordLength: 3,
});
