describe('Music Practice Tracker API Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should fetch users list', () => {
    cy.window().then((win) =>
      win
        .fetch('http://localhost:3001/api/admin/users')
        .then((response) => {
          expect(response.status).to.equal(200);
          return response.json();
        })
        .then((data) => {
          expect(data).to.have.property('data');
          expect(data).to.have.property('total', 2);
          expect(data.data).to.be.an('array').with.length(2);

          const [user1, user2] = data.data;
          expect(user1).to.include({
            id: '1',
            name: 'Test User 1',
            email: 'user1@example.com',
          });
          expect(user2).to.include({
            id: '2',
            name: 'Test User 2',
            email: 'user2@example.com',
          });
        }),
    );
  });

  it('should fetch specific user', () => {
    const userId = '42';

    cy.window().then((win) =>
      win
        .fetch(`http://localhost:3001/api/admin/users/${userId}`)
        .then((response) => {
          expect(response.status).to.equal(200);
          return response.json();
        })
        .then((data) => {
          expect(data).to.include({
            id: userId,
            name: `Test User ${userId}`,
            email: `user${userId}@example.com`,
          });
          expect(data).to.have.property('createdAt');
        }),
    );
  });

  it('should create a new user', () => {
    const newUser = {
      name: 'New Test User',
      email: 'newuser@example.com',
    };

    cy.window().then((win) =>
      win
        .fetch('http://localhost:3001/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          return response.json();
        })
        .then((data) => {
          expect(data).to.include({
            id: 'new-user-id',
            ...newUser,
          });
          expect(data).to.have.property('createdAt');
        }),
    );
  });

  it('should update a user', () => {
    const userId = '123';
    const updates = {
      name: 'Updated User Name',
      email: 'updated@example.com',
    };

    cy.window().then((win) =>
      win
        .fetch(`http://localhost:3001/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          return response.json();
        })
        .then((data) => {
          expect(data).to.include({
            id: userId,
            ...updates,
          });
          expect(data).to.have.property('updatedAt');
        }),
    );
  });

  it('should delete a user', () => {
    const userId = '999';

    cy.window().then((win) =>
      win
        .fetch(`http://localhost:3001/api/admin/users/${userId}`, {
          method: 'DELETE',
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          return response.json();
        })
        .then((data) => {
          expect(data).to.include({
            id: userId,
          });
          expect(data).to.have.property('deletedAt');
        }),
    );
  });
});
