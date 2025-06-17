import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from '../src/prisma-create-naming-convention';
const ruleTester = new RuleTester();

ruleTester.run('prisma-create-naming-convention', rule, {
      valid: [
        // create method in correctly named function
        {
          code: `
            async function createUser() {
              return await prisma.user.create({
                data: { name: 'test' }
              });
            }
          `,
        },
        // createMany method in correctly named function
        {
          code: `
            async function createManyUsers() {
              return await prisma.user.createMany({
                data: [{ name: 'test1' }, { name: 'test2' }]
              });
            }
          `,
        },
        // createManyAndReturn method in correctly named function
        {
          code: `
            async function createManyAndReturnUsers() {
              return await prisma.user.createManyAndReturn({
                data: [{ name: 'test1' }, { name: 'test2' }]
              });
            }
          `,
        },
        // Repository pattern
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
        // Arrow function with correct name
        {
          code: `
            const createPost = async () => {
              return await prisma.post.create({
                data: { title: 'test' }
              });
            };
          `,
        },
        // Method in object literal
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
        // Case insensitive matching
        {
          code: `
            async function CreateUser() {
              return await prisma.user.create({
                data: { name: 'test' }
              });
            }
          `,
        },
        // Different prisma access patterns
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
        // Not a Prisma create call
        {
          code: `
            async function addUser() {
              return await someOtherService.create({
                data: { name: 'test' }
              });
            }
          `,
        },
        // Create call outside of function
        {
          code: `
            const user = await prisma.user.create({
              data: { name: 'test' }
            });
          `,
        },
      ],
      invalid: [
        // create method in incorrectly named function
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
        // createMany in function not starting with createMany
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
        // createManyAndReturn in function not starting with createManyAndReturn
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
        // Class method with wrong name
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
        // Arrow function with wrong name
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
        // Repository pattern with wrong method name
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
        // Multiple errors in the same code
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
