// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import '@testing-library/cypress/add-commands';

import './commands';
import { setupMsw } from './msw';

let mswInitialized = false;

Cypress.Commands.overwrite('visit', (originalFn, ...args) =>
  originalFn(...args).then(() => {
    if (!mswInitialized) {
      cy.window().then(async () => {
        await setupMsw();
        mswInitialized = true;
      });
    }
  }),
);

beforeEach(() => {
  cy.window().then((win) => {
    if (win.msw) {
      win.msw.resetHandlers();
    }
  });
});
