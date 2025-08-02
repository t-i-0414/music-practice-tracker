import { type components } from '../../../generated/types/api';

describe('Admin Users API Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  const host = process.env.HOST ?? 'localhost';
  const adminApiPort = process.env.ADMIN_API_PORT ?? '3001';

  it('should fetch users list', () => {
    cy.window().then((win) =>
      win
        .fetch(`http://${host}:${adminApiPort}/api/users?publicIds=1&publicIds=2`)
        .then((response) => {
          expect(response.status).to.equal(200);
          return response.json();
        })
        .then((data: components['schemas']['UsersResponseDto']) => {
          expect(data).to.have.property('users');
          expect(data.users).to.be.an('array').with.length(2);

          const [user1, user2] = data.users;
          expect(user1).to.include({
            publicId: '1',
            name: 'Test User 1',
            email: 'user1@example.com',
          });
          expect(user2).to.include({
            publicId: '2',
            name: 'Test User 2',
            email: 'user2@example.com',
          });
        }),
    );
  });

  it('should fetch specific user', () => {
    const userId = '123';

    cy.window().then((win) =>
      win
        .fetch(`http://${host}:${adminApiPort}/api/users/${userId}`)
        .then((response) => {
          expect(response.status).to.equal(200);
          return response.json();
        })
        .then((data: components['schemas']['UserResponseDto']) => {
          expect(data).to.include({
            publicId: userId,
            name: `Test User ${userId}`,
            email: `user${userId}@example.com`,
          });
          expect(data).to.have.property('createdAt');
          expect(data).to.have.property('updatedAt');
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
        .fetch(`http://${host}:${adminApiPort}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        })
        .then((response) => {
          expect(response.status).to.equal(201); // 201 Created
          return response.json();
        })
        .then((data: components['schemas']['UserResponseDto']) => {
          expect(data).to.have.property('publicId');
          expect(data.publicId).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu); // UUID format
          expect(data).to.include(newUser);
          expect(data).to.have.property('createdAt');
          expect(data).to.have.property('updatedAt');
        }),
    );
  });

  it('should create multiple users', () => {
    const newUsers = {
      users: [
        { name: 'Bulk User 1', email: 'bulk1@example.com' },
        { name: 'Bulk User 2', email: 'bulk2@example.com' },
      ],
    };

    cy.window().then((win) =>
      win
        .fetch(`http://${host}:${adminApiPort}/api/users/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUsers),
        })
        .then((response) => {
          expect(response.status).to.equal(201); // 201 Created
          return response.json();
        })
        .then((data: components['schemas']['UsersResponseDto']) => {
          expect(data).to.have.property('users');
          expect(data.users).to.have.length(2);

          data.users.forEach((user, index) => {
            expect(user).to.have.property('publicId');
            expect(user).to.include(newUsers.users[index]);
          });
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
        .fetch(`http://${host}:${adminApiPort}/api/users/${userId}`, {
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
        .then((data: components['schemas']['UserResponseDto']) => {
          expect(data).to.include({
            publicId: userId,
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
        .fetch(`http://${host}:${adminApiPort}/api/users/${userId}`, {
          method: 'DELETE',
        })
        .then((response) => {
          expect(response.status).to.equal(204);
        }),
    );
  });

  it('should bulk delete users', () => {
    const publicIds = ['201', '202', '203'];

    cy.window().then((win) =>
      win
        .fetch(`http://${host}:${adminApiPort}/api/users/bulk`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicIds }),
        })
        .then((response) => {
          expect(response.status).to.equal(204);
        }),
    );
  });
});
