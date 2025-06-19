import rule from '@/plugin-backend/prisma-delete-naming-convention';
import { RuleTester } from '@typescript-eslint/rule-tester';

const ruleTester = new RuleTester();

ruleTester.run('prisma-delete-naming-convention', rule, {
  valid: [
    // delete method in correctly named function
    {
      code: `
        async function hardDeleteUser() {
          return await prisma.user.delete({
            where: { id: 1 }
          });
        }
      `,
    },
    // deleteMany method in correctly named function
    {
      code: `
        async function hardDeleteManyUsers() {
          return await prisma.user.deleteMany({
            where: { active: false }
          });
        }
      `,
    },
    // Repository pattern with correct naming
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
    // Arrow function with correct name
    {
      code: `
        const hardDeletePost = async (id: number) => {
          return await prisma.post.delete({
            where: { id }
          });
        };
      `,
    },
    // Method in object literal
    {
      code: `
        const userService = {
          async hardDeleteUser(id: number) {
            return await prisma.user.delete({
              where: { id }
            });
          }
        };
      `,
    },
    // Case insensitive matching
    {
      code: `
        async function HardDeleteUser() {
          return await prisma.user.delete({
            where: { id: 1 }
          });
        }
      `,
    },
    // Different prisma access patterns
    {
      code: `
        async function hardDeleteUser() {
          return await this.prisma.user.delete({
            where: { id: 1 }
          });
        }
      `,
    },
    {
      code: `
        async function hardDeleteComment() {
          return await repository.comment.delete({
            where: { id: 1 }
          });
        }
      `,
    },
    // deleteMany with correct prefix
    {
      code: `
        async function hardDeleteManyPosts() {
          return await prisma.post.deleteMany({
            where: { published: false }
          });
        }
      `,
    },
    // Not a Prisma delete call
    {
      code: `
        async function removeUser() {
          return await someOtherService.delete({
            where: { id: 1 }
          });
        }
      `,
    },
    // Delete call outside of function
    {
      code: `
        const result = await prisma.user.delete({
          where: { id: 1 }
        });
      `,
    },
    // hardDelete with additional suffix
    {
      code: `
        async function hardDeleteUserById(id: number) {
          return await prisma.user.delete({
            where: { id }
          });
        }
      `,
    },
    // hardDeleteMany with additional suffix
    {
      code: `
        async function hardDeleteManyInactiveUsers() {
          return await prisma.user.deleteMany({
            where: { active: false }
          });
        }
      `,
    },
  ],
  invalid: [
    // delete method in incorrectly named function
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
    // deleteMany in function not starting with hardDeleteMany
    {
      code: `
        async function removeManyUsers() {
          return await prisma.user.deleteMany({
            where: { active: false }
          });
        }
      `,
      errors: [
        {
          messageId: 'invalidDeleteMethodName',
          data: {
            functionName: 'removeManyUsers',
            method: 'deleteMany',
            expectedPrefix: 'hardDeleteMany',
          },
        },
      ],
    },
    // Class method with wrong name
    {
      code: `
        class UserService {
          async removeUser(id: number) {
            return await this.prisma.user.delete({
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
    // Arrow function with wrong name
    {
      code: `
        const deletePost = async (id: number) => {
          return await prisma.post.delete({
            where: { id }
          });
        };
      `,
      errors: [
        {
          messageId: 'invalidDeleteMethodName',
          data: {
            functionName: 'deletePost',
            method: 'delete',
            expectedPrefix: 'hardDelete',
          },
        },
      ],
    },
    // Repository pattern with wrong method name
    {
      code: `
        class UserRepository {
          async destroyUser(id: number) {
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
            functionName: 'destroyUser',
            method: 'delete',
            expectedPrefix: 'hardDelete',
          },
        },
      ],
    },
    // deleteMany with wrong prefix
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
    // Multiple errors in the same code
    {
      code: `
        async function removeUser() {
          return await prisma.user.delete({
            where: { id: 1 }
          });
        }

        async function clearManyPosts() {
          return await prisma.post.deleteMany({
            where: { published: false }
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
        {
          messageId: 'invalidDeleteMethodName',
          data: {
            functionName: 'clearManyPosts',
            method: 'deleteMany',
            expectedPrefix: 'hardDeleteMany',
          },
        },
      ],
    },
    // Soft delete naming should not be used for Prisma delete
    {
      code: `
        async function softDeleteUser() {
          return await prisma.user.delete({
            where: { id: 1 }
          });
        }
      `,
      errors: [
        {
          messageId: 'invalidDeleteMethodName',
          data: {
            functionName: 'softDeleteUser',
            method: 'delete',
            expectedPrefix: 'hardDelete',
          },
        },
      ],
    },
  ],
});
