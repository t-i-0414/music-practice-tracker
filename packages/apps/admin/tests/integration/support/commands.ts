/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { http, HttpResponse, type RequestHandler } from 'msw';

// Example custom command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// MSW custom commands
Cypress.Commands.add('mockRequest', (method: string, url: string, response: any, status = 200) => {
  cy.window().then((win) => {
    if (!win.msw) {
      throw new Error('MSW is not initialized. Make sure MSW is setup in the support file.');
    }

    const handler = http[method.toLowerCase() as keyof typeof http](url, () => HttpResponse.json(response, { status }));

    win.msw.use(handler as RequestHandler);
  });
});

Cypress.Commands.add('resetMocks', () => {
  cy.window().then((win) => {
    if (win.msw) {
      win.msw.resetHandlers();
    }
  });
});

// Declare custom commands in TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      mockRequest(method: string, url: string, response: any, status?: number): Chainable<void>;
      resetMocks(): Chainable<void>;
    }
  }
}
