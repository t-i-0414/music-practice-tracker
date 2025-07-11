import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/prisma-create-naming-convention';

describe('prisma-create-naming-convention', () => {
  const ruleTester = new RuleTester();

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('prisma-create-naming-convention', rule, {
    valid: [
      {
        code: `
            async function createUser() {
              return await prisma.user.create({
                data: { name: 'test' }
              });
            }
          `,
      },
      {
        code: `
            async function createManyUsers() {
              return await prisma.user.createMany({
                data: [{ name: 'test1' }, { name: 'test2' }]
              });
            }
          `,
      },
      {
        code: `
            async function createManyAndReturnUsers() {
              return await prisma.user.createManyAndReturn({
                data: [{ name: 'test1' }, { name: 'test2' }]
              });
            }
          `,
      },
      {
        code: `
            class UserRepository {
              async createUser() {
                return await this.repository.user.create({
                  data: { name: 'test' }
                });
              }
            }
          `,
      },
      {
        code: `
            const createPost = async () => {
              return await prisma.post.create({
                data: { title: 'test' }
              });
            };
          `,
      },
      {
        code: `
            const userService = {
              async createUser() {
                return await prisma.user.create({
                  data: { name: 'test' }
                });
              }
            };
          `,
      },
      {
        code: `
            async function CreateUser() {
              return await prisma.user.create({
                data: { name: 'test' }
              });
            }
          `,
      },
      {
        code: `
            async function createUser() {
              return await this.prisma.user.create({
                data: { name: 'test' }
              });
            }
          `,
      },
      {
        code: `
            async function createComment() {
              return await repository.comment.create({
                data: { content: 'test' }
              });
            }
          `,
      },
      {
        code: `
            async function addUser() {
              return await someOtherService.create({
                data: { name: 'test' }
              });
            }
          `,
      },
      {
        code: `
            const user = await prisma.user.create({
              data: { name: 'test' }
            });
          `,
      },
    ],
    invalid: [
      {
        code: `
            async function addUser() {
              return await prisma.user.create({
                data: { name: 'test' }
              });
            }
          `,
        errors: [
          {
            messageId: 'invalidCreateMethodName',
            data: {
              functionName: 'addUser',
              method: 'create',
              expectedPrefix: 'create',
            },
          },
        ],
      },
      {
        code: `
            async function insertManyUsers() {
              return await prisma.user.createMany({
                data: [{ name: 'test1' }, { name: 'test2' }]
              });
            }
          `,
        errors: [
          {
            messageId: 'invalidCreateMethodName',
            data: {
              functionName: 'insertManyUsers',
              method: 'createMany',
              expectedPrefix: 'createMany',
            },
          },
        ],
      },
      {
        code: `
            async function getManyUsers() {
              return await prisma.user.createManyAndReturn({
                data: [{ name: 'test1' }, { name: 'test2' }]
              });
            }
          `,
        errors: [
          {
            messageId: 'invalidCreateMethodName',
            data: {
              functionName: 'getManyUsers',
              method: 'createManyAndReturn',
              expectedPrefix: 'createManyAndReturn',
            },
          },
        ],
      },
      {
        code: `
            class UserService {
              async insertUser() {
                return await this.prisma.user.create({
                  data: { name: 'test' }
                });
              }
            }
          `,
        errors: [
          {
            messageId: 'invalidCreateMethodName',
            data: {
              functionName: 'insertUser',
              method: 'create',
              expectedPrefix: 'create',
            },
          },
        ],
      },
      {
        code: `
            const savePost = async () => {
              return await prisma.post.create({
                data: { title: 'test' }
              });
            };
          `,
        errors: [
          {
            messageId: 'invalidCreateMethodName',
            data: {
              functionName: 'savePost',
              method: 'create',
              expectedPrefix: 'create',
            },
          },
        ],
      },
      {
        code: `
            class UserRepository {
              async newUser() {
                return await this.repository.user.create({
                  data: { name: 'test' }
                });
              }
            }
          `,
        errors: [
          {
            messageId: 'invalidCreateMethodName',
            data: {
              functionName: 'newUser',
              method: 'create',
              expectedPrefix: 'create',
            },
          },
        ],
      },
      {
        code: `
            async function insertUser() {
              return await prisma.user.create({
                data: { name: 'test' }
              });
            }

            async function addManyPosts() {
              return await prisma.post.createMany({
                data: [{ title: 'test1' }, { title: 'test2' }]
              });
            }
          `,
        errors: [
          {
            messageId: 'invalidCreateMethodName',
            data: {
              functionName: 'insertUser',
              method: 'create',
              expectedPrefix: 'create',
            },
          },
          {
            messageId: 'invalidCreateMethodName',
            data: {
              functionName: 'addManyPosts',
              method: 'createMany',
              expectedPrefix: 'createMany',
            },
          },
        ],
      },
    ],
  });
});
