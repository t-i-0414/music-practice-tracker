declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to log in by UI or API
     * @example cy.login('foo@example.com', 'pass123')
     */
    login(email: string, password: string): Chainable<Subject>;
  }
}
