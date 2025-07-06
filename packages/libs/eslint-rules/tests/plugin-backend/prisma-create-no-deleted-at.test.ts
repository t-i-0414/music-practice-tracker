import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/prisma-create-no-deleted-at';

const ruleTester = new RuleTester();

ruleTester.run('prisma-create-no-deleted-at', rule, {
  valid: [
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
