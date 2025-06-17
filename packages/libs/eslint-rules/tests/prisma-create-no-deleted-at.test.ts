import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from '../src/prisma-create-no-deleted-at';

const ruleTester = new RuleTester();

// Note: This rule requires type information for full functionality.
// These tests cover the basic object literal cases without type checking.

ruleTester.run('prisma-create-no-deleted-at', rule, {
  valid: [
    // Basic create without deletedAt
    {
      code: `
        async function createUser() {
          return await prisma.user.create({
            data: {
              name: 'test',
              email: 'test@example.com'
            }
          });
        }
      `,
    },
    // createMany without deletedAt
    {
      code: `
        async function createManyUsers() {
          return await prisma.user.createMany({
            data: [
              { name: 'test1', email: 'test1@example.com' },
              { name: 'test2', email: 'test2@example.com' }
            ]
          });
        }
      `,
    },
    // createManyAndReturn without deletedAt
    {
      code: `
        async function createManyAndReturnUsers() {
          return await prisma.user.createManyAndReturn({
            data: [
              { name: 'test1', email: 'test1@example.com' },
              { name: 'test2', email: 'test2@example.com' }
            ]
          });
        }
      `,
    },
    // Repository pattern without deletedAt
    {
      code: `
        class UserRepository {
          async createUser() {
            return await this.repository.user.create({
              data: {
                name: 'test',
                active: true
              }
            });
          }
        }
      `,
    },
    // Non-Prisma create call
    {
      code: `
        async function createUser() {
          return await someOtherService.create({
            data: {
              deletedAt: new Date()
            }
          });
        }
      `,
    },
    // Create with include/select
    {
      code: `
        async function createPost() {
          return await prisma.post.create({
            data: {
              title: 'test',
              content: 'content'
            },
            include: {
              author: true
            }
          });
        }
      `,
    },
  ],
  invalid: [
    // Direct deletedAt in create
    {
      code: `
        async function createUser() {
          return await prisma.user.create({
            data: {
              name: 'test',
              deletedAt: new Date()
            }
          });
        }
      `,
      errors: [
        {
          messageId: 'createShouldNotHaveDeletedAt',
        },
      ],
    },
    // deletedAt in createMany with array
    {
      code: `
        async function createManyUsers() {
          return await prisma.user.createMany({
            data: [
              { name: 'test1', deletedAt: new Date() },
              { name: 'test2', email: 'test2@example.com' }
            ]
          });
        }
      `,
      errors: [
        {
          messageId: 'createShouldNotHaveDeletedAt',
        },
      ],
    },
    // deletedAt in createManyAndReturn
    {
      code: `
        async function createManyAndReturnUsers() {
          return await prisma.user.createManyAndReturn({
            data: [
              { name: 'test1' },
              { name: 'test2', deletedAt: new Date() }
            ]
          });
        }
      `,
      errors: [
        {
          messageId: 'createShouldNotHaveDeletedAt',
        },
      ],
    },
    // Repository pattern with deletedAt
    {
      code: `
        class UserRepository {
          async createUser() {
            return await this.repository.user.create({
              data: {
                name: 'test',
                deletedAt: null
              }
            });
          }
        }
      `,
      errors: [
        {
          messageId: 'createShouldNotHaveDeletedAt',
        },
      ],
    },
    // Arrow function with deletedAt
    {
      code: `
        const createPost = async () => {
          return await prisma.post.create({
            data: {
              title: 'test',
              deletedAt: new Date()
            }
          });
        };
      `,
      errors: [
        {
          messageId: 'createShouldNotHaveDeletedAt',
        },
      ],
    },
    // Method in object literal with deletedAt
    {
      code: `
        const userService = {
          async createUser() {
            return await prisma.user.create({
              data: {
                name: 'test',
                deletedAt: null
              }
            });
          }
        };
      `,
      errors: [
        {
          messageId: 'createShouldNotHaveDeletedAt',
        },
      ],
    },
    // Using this.prisma with deletedAt
    {
      code: `
        class UserService {
          async createUser() {
            return await this.prisma.user.create({
              data: {
                name: 'test',
                deletedAt: new Date()
              }
            });
          }
        }
      `,
      errors: [
        {
          messageId: 'createShouldNotHaveDeletedAt',
        },
      ],
    },
  ],
});
