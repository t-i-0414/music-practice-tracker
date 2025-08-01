import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/prisma-naming-convention';

describe('prisma-naming-convention', () => {
  const ruleTester = new RuleTester();

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('prisma-naming-convention', rule, {
    valid: [
      // CREATE method tests
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
      // FIND method tests
      {
        code: `
          async function findUniqueActiveUser() {
            return await prisma.user.findUnique({
              where: {
                id: 1,
                deletedAt: null
              }
            });
          }
        `,
      },
      {
        code: `
          async function findFirstActiveComment() {
            return await prisma.comment.findFirst({
              where: {
                userId: 1,
                deletedAt: null
              }
            });
          }
        `,
      },
      {
        code: `
          async function findManyActiveUsers() {
            return await prisma.user.findMany({
              where: {
                active: true,
                deletedAt: null
              }
            });
          }
        `,
      },
      {
        code: `
          const findFirstActiveProduct = async (name: string) => {
            return await prisma.product.findFirst({
              where: {
                name,
                deletedAt: null
              }
            });
          };
        `,
      },
      // UPDATE method tests
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { name: 'test' }
            });
          }
        `,
      },
      {
        code: `
          async function updateManyUsers() {
            return await prisma.user.updateMany({
              where: { active: true },
              data: { status: 'inactive' }
            });
          }
        `,
      },
      {
        code: `
          async function updateManyAndReturnUsers() {
            return await prisma.user.updateManyAndReturn({
              where: { active: true },
              data: params.data
            });
          }
        `,
      },
      // DELETE method tests
      {
        code: `
          async function hardDeleteUser() {
            return await prisma.user.delete({
              where: { id: 1 }
            });
          }
        `,
      },
      {
        code: `
          async function hardDeleteManyUsers() {
            return await prisma.user.deleteMany({
              where: { active: false }
            });
          }
        `,
      },
      {
        code: `
          async function hardDeleteUserById(id: number) {
            return await prisma.user.delete({
              where: { id }
            });
          }
        `,
      },
      {
        code: `
          class UserRepository {
            async hardDeleteUser(id: number) {
              return await this.repository.user.delete({
                where: { id }
              });
            }
          }
        `,
      },
      // Case insensitive tests
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
          async function FindUniqueActiveUser() {
            return await prisma.user.findUnique({
              where: {
                id: 1,
                deletedAt: null
              }
            });
          }
        `,
      },
      {
        code: `
          async function HardDeleteUser() {
            return await prisma.user.delete({
              where: { id: 1 }
            });
          }
        `,
      },
      // Non-Prisma calls (should not trigger the rule)
      {
        code: `
          async function getUser() {
            return await someOtherService.findUnique({
              where: { id: 1 }
            });
          }
        `,
      },
      {
        code: `
          const user = await prisma.user.findUnique({
            where: { id: 1 }
          });
        `,
      },
    ],
    invalid: [
      // CREATE method errors
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
      // FIND method errors
      {
        code: `
          async function getUser() {
            return await prisma.user.findUnique({
              where: { id: 1 }
            });
          }
        `,
        errors: [
          {
            messageId: 'invalidFindMethodName',
            data: {
              method: 'findUnique',
              functionName: 'getUser',
              expectedPrefix: 'findUnique',
            },
          },
        ],
      },
      {
        code: `
          async function getAllUsers() {
            return await prisma.user.findMany({
              where: { active: true }
            });
          }
        `,
        errors: [
          {
            messageId: 'invalidFindMethodName',
            data: {
              method: 'findMany',
              functionName: 'getAllUsers',
              expectedPrefix: 'findMany',
            },
          },
        ],
      },
      // UPDATE method errors
      {
        code: `
          async function modifyUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { name: 'test' }
            });
          }
        `,
        errors: [
          {
            messageId: 'invalidUpdateMethodName',
            data: {
              functionName: 'modifyUser',
              method: 'update',
              expectedPrefix: 'update',
            },
          },
        ],
      },
      {
        code: `
          async function changeManyUsers() {
            return await prisma.user.updateMany({
              where: { active: true },
              data: { status: 'inactive' }
            });
          }
        `,
        errors: [
          {
            messageId: 'invalidUpdateMethodName',
            data: {
              functionName: 'changeManyUsers',
              method: 'updateMany',
              expectedPrefix: 'updateMany',
            },
          },
        ],
      },
      // DELETE method errors
      {
        code: `
          async function deleteUser() {
            return await prisma.user.delete({
              where: { id: 1 }
            });
          }
        `,
        errors: [
          {
            messageId: 'invalidDeleteMethodName',
            data: {
              functionName: 'deleteUser',
              method: 'delete',
              expectedPrefix: 'hardDelete',
            },
          },
        ],
      },
      {
        code: `
          async function removeUser() {
            return await prisma.user.delete({
              where: { id: 1 }
            });
          }
        `,
        errors: [
          {
            messageId: 'invalidDeleteMethodName',
            data: {
              functionName: 'removeUser',
              method: 'delete',
              expectedPrefix: 'hardDelete',
            },
          },
        ],
      },
      {
        code: `
          async function deleteManyUsers() {
            return await prisma.user.deleteMany({
              where: { active: false }
            });
          }
        `,
        errors: [
          {
            messageId: 'invalidDeleteMethodName',
            data: {
              functionName: 'deleteManyUsers',
              method: 'deleteMany',
              expectedPrefix: 'hardDeleteMany',
            },
          },
        ],
      },
      // Multiple errors in one test
      {
        code: `
          async function getUser() {
            return await prisma.user.findUnique({
              where: { id: 1 }
            });
          }

          async function addPost() {
            return await prisma.post.create({
              data: { title: 'test' }
            });
          }

          async function deleteComment() {
            return await prisma.comment.delete({
              where: { id: 1 }
            });
          }
        `,
        errors: [
          {
            messageId: 'invalidFindMethodName',
            data: {
              method: 'findUnique',
              functionName: 'getUser',
              expectedPrefix: 'findUnique',
            },
          },
          {
            messageId: 'invalidCreateMethodName',
            data: {
              functionName: 'addPost',
              method: 'create',
              expectedPrefix: 'create',
            },
          },
          {
            messageId: 'invalidDeleteMethodName',
            data: {
              functionName: 'deleteComment',
              method: 'delete',
              expectedPrefix: 'hardDelete',
            },
          },
        ],
      },
      // Class method tests
      {
        code: `
          class UserService {
            async getUser(id: number) {
              return await this.prisma.user.findUnique({
                where: { id }
              });
            }
          }
        `,
        errors: [
          {
            messageId: 'invalidFindMethodName',
            data: {
              method: 'findUnique',
              functionName: 'getUser',
              expectedPrefix: 'findUnique',
            },
          },
        ],
      },
      {
        code: `
          class UserRepository {
            async removeUser(id: number) {
              return await this.repository.user.delete({
                where: { id }
              });
            }
          }
        `,
        errors: [
          {
            messageId: 'invalidDeleteMethodName',
            data: {
              functionName: 'removeUser',
              method: 'delete',
              expectedPrefix: 'hardDelete',
            },
          },
        ],
      },
    ],
  });

  // Additional tests for edge cases to improve coverage
  ruleTester.run('prisma-naming-convention (additional coverage)', rule, {
    valid: [
      // Top-level code (no function context)
      {
        code: `prisma.user.findUnique({ where: { id: 1 } });`,
      },
      // Non-MemberExpression calls
      {
        code: `
          async function test() {
            const fn = getSomeFunction();
            fn({ where: { id: 1 } });
          }
        `,
      },
      // Update without TypeScript services (basic patterns)
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { deletedAt: new Date() }
            });
          }
        `,
      },
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { deletedAt: null }
            });
          }
        `,
      },
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { suspendedAt: new Date() }
            });
          }
        `,
      },
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { suspendedAt: null }
            });
          }
        `,
      },
      // Update with identifiers and member expressions
      {
        code: `
          async function updateUser() {
            const date = new Date();
            return await prisma.user.update({
              where: { id: 1 },
              data: { deletedAt: date }
            });
          }
        `,
      },
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { deletedAt: params.deletedAt }
            });
          }
        `,
      },
      // Update with spread operators
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { ...params }
            });
          }
        `,
      },
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { 
                ...baseData,
                ...overrides,
                name: 'Test'
              }
            });
          }
        `,
      },
      // UpdateMany with second argument pattern
      {
        code: `
          async function updateManyUsers() {
            return await prisma.user.updateMany(
              { where: { active: true } },
              { name: 'Updated' }
            );
          }
        `,
      },
      // Update edge cases
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 }
              // No data parameter
            });
          }
        `,
      },
      {
        code: `
          async function updateUser() {
            return await prisma.user.update();
          }
        `,
      },
      // MemberExpression and Identifier as data parameter
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: params.data
            });
          }
        `,
      },
      {
        code: `
          async function updateUser() {
            const data = getData();
            return await prisma.user.update({
              where: { id: 1 },
              data: data
            });
          }
        `,
      },
      // Pattern 3: data property references a variable  
      {
        code: `
          async function updateManyAndReturnUsers() {
            return await prisma.user.updateManyAndReturn({
              where: params.where,
              data: params.data
            });
          }
        `,
      },
      // Different object types as data
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: null
            });
          }
        `,
      },
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: []
            });
          }
        `,
      },
      // Null functions in the stack
      {
        code: `
          const createUser = function() {
            return prisma.user.create({ data: { name: 'test' } });
          };
        `,
      },
      // Different prisma object patterns (to test isPrismaMethodCall)
      {
        code: `
          async function findUniqueUser() {
            return await this.prisma.user.findUnique({
              where: { id: 1 }
            });
          }
        `,
      },
      {
        code: `
          async function createUser() {
            return await db.user.create({
              data: { name: 'test' }
            });
          }
        `,
      },
    ],
    invalid: [
      // No errors expected for these edge cases
    ],
  });

  // Tests for specific code paths to improve coverage
  ruleTester.run('prisma-naming-convention (coverage improvement)', rule, {
    valid: [
      // analyzeDataObject with non-Date values for deletedAt
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { deletedAt: { not: null } }
            });
          }
        `,
      },
      // suspendedAt with non-Date, non-identifier values
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: { suspendedAt: { not: null } }
            });
          }
        `,
      },
      // Update method without data object to trigger early returns
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: 42
            });
          }
        `,
      },
      // analyzeDataObject returning null
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: 1 },
              data: "string"
            });
          }
        `,
      },
      // findDataParameter returning null (empty arguments)
      {
        code: `
          async function updateUser() {
            const result = await prisma.user.update();
            return result;
          }
        `,
      },
      // Different node types that won't match isPrismaMethodCall
      {
        code: `
          async function test() {
            const call = someFunction();
            return call;
          }
        `,
      },
      // Functions with no name in different positions
      {
        code: `
          export default function() {
            return null;
          }
        `,
      },
      {
        code: `
          const anonymous = function() {
            return null;
          };
        `,
      },
      {
        code: `
          const arrow = () => {
            return null;
          };
        `,
      },
      // Test getFunctionNameExtended edge cases
      {
        code: `
          const obj = {
            findUnique() {
              return prisma.user.findUnique({ where: { id: 1 } });
            }
          };
        `,
      },
      {
        code: `
          class Test {
            findUnique() {
              return prisma.user.findUnique({ where: { id: 1 } });
            }
          }
        `,
      },
      // Test for functions that getFunctionName returns null
      {
        code: `
          (() => {
            return prisma.user.findUnique({ where: { id: 1 } });
          })();
        `,
      },
      // Property that is not an identifier
      {
        code: `
          async function test() {
            const method = 'findUnique';
            return await prisma.user[method]({ where: { id: 1 } });
          }
        `,
      },
    ],
    invalid: [],
  });
});
