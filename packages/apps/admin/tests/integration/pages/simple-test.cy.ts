describe('Simple MSW Test', () => {
  const host = process.env.HOST ?? 'localhost';
  const adminApiPort = process.env.ADMIN_API_PORT ?? '3001';

  it('should work with users endpoint', () => {
    cy.visit('/');

    cy.window().then((win) =>
      win
        .fetch(`http://${host}:${adminApiPort}/api/users?publicIds=10&publicIds=20`)
        .then((response) => response.json())
        .then((data) => {
          expect(data).to.have.property('users');
          expect(data.users).to.have.length(2);
          expect(data.users[0]).to.have.property('name', 'Test User 1');
          expect(data.users[1]).to.have.property('name', 'Test User 2');
        }),
    );
  });

  it('should work with specific user endpoint', () => {
    cy.visit('/');

    cy.window().then((win) =>
      win
        .fetch(`http://${host}:${adminApiPort}/api/users/123`)
        .then((response) => response.json())
        .then((data) => {
          expect(data).to.have.property('publicId', '123');
          expect(data).to.have.property('name', 'Test User 123');
          expect(data).to.have.property('email', 'user123@example.com');
        }),
    );
  });
});
