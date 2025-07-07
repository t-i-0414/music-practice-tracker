import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    supportFile: 'tests/integration/support/setup.ts',
    specPattern: 'tests/integration/pages/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: 'tests/integration/fixtures',
    screenshotsFolder: 'tests/integration/screenshots',
    videosFolder: 'tests/integration/videos',
    downloadsFolder: 'tests/integration/downloads',
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
