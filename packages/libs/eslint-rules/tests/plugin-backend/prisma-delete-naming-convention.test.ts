import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/prisma-delete-naming-convention';

const ruleTester = new RuleTester();

ruleTester.run('prisma-delete-naming-convention', rule, {
  valid: [
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
        class UserRepository {
          async hardDeleteUser(id: number) {
            return await this.repository.user.delete({
              where: { id }
            });
          }
        }
      `,
    },
    {
      code: `
        const hardDeletePost = async (id: number) => {
          return await prisma.post.delete({
            where: { id }
          });
        };
      `,
    },
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
    {
      code: `
        async function HardDeleteUser() {
          return await prisma.user.delete({
            where: { id: 1 }
          });
        }
      `,
    },
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
    {
      code: `
        async function hardDeleteManyPosts() {
          return await prisma.post.deleteMany({
            where: { published: false }
          });
        }
      `,
    },
    {
      code: `
        async function removeUser() {
          return await someOtherService.delete({
            where: { id: 1 }
          });
        }
      `,
    },
    {
      code: `
        const result = await prisma.user.delete({
          where: { id: 1 }
        });
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
        async function hardDeleteManyInactiveUsers() {
          return await prisma.user.deleteMany({
            where: { active: false }
          });
        }
      `,
    },
    {
      code: `
        export default function () {
          return prisma.user.delete({
            where: { id: 1 }
          });
        }
      `,
    },
    {
      code: `
        (() => {
          return prisma.user.deleteMany({
            where: { active: false }
          });
        })();
      `,
    },
  ],
  invalid: [
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
