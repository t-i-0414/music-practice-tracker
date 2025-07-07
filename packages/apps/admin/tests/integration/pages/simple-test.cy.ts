describe('Simple MSW Test', () => {
  it('should use default MSW handlers', () => {
    cy.visit('/');

    cy.window().then((win) =>
      win
        .fetch('https://api.example.com/user')
        .then((response) => response.json())
        .then((data) => {
          expect(data).to.deep.equal({
            id: 'abc-123',
            firstName: 'John',
            lastName: 'Maverick',
          });
        }),
    );
  });

  it('should work with Music Practice Tracker API mocks', () => {
    cy.visit('/');

    cy.window().then((win) =>
      win
        .fetch('http://localhost:3001/api/admin/users')
        .then((response) => response.json())
        .then((data) => {
          expect(data).to.have.property('data');
          expect(data.data).to.have.length(2);
          expect(data.data[0]).to.have.property('name', 'Test User 1');
          expect(data.data[1]).to.have.property('name', 'Test User 2');
        }),
    );
  });

  it('should work with specific user endpoint', () => {
    cy.visit('/');

    cy.window().then((win) =>
      win
        .fetch('http://localhost:3001/api/admin/users/123')
        .then((response) => response.json())
        .then((data) => {
          expect(data).to.have.property('id', '123');
          expect(data).to.have.property('name', 'Test User 123');
          expect(data).to.have.property('email', 'user123@example.com');
        }),
    );
  });
});
