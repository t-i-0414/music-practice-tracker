import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'tests/unit/setup.ts',
    include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{js,ts,jsx,tsx}',
        'src/app/**/*.d.ts',
        'src/app/**/layout.{js,jsx,ts,tsx}',
        'src/app/**/page.{js,jsx,ts,tsx}',
        'src/app/**/loading.{js,jsx,ts,tsx}',
        'src/app/**/error.{js,jsx,ts,tsx}',
        'src/app/**/not-found.{js,jsx,ts,tsx}',
        'src/app/**/global-error.{js,jsx,ts,tsx}',
        'src/app/**/*.stories.{js,jsx,ts,tsx}',
        'src/app/**/types/**',
      ],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../src'),
    },
  },
});
