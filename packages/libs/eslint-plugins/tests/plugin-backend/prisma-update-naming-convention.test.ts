import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/prisma-update-naming-convention';

describe('prisma-update-naming-convention', () => {
  const ruleTester = new RuleTester({
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.ts*'],
        },
      },
    },
  });

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('prisma-update-naming-convention', rule, {
    valid: [
      {
        code: `
        async function updateUser() {
          return await prisma.user.update({
            where: { id: 1 },
            data: { name: 'John' }
          });
        }
      `,
      },
      {
        code: `
        async function updateMany() {
          return await prisma.user.updateMany({
            where: { active: true },
            data: { lastSeen: new Date() }
          });
        }
      `,
      },
      {
        code: `
        async function deleteUser() {
          return await prisma.user.update({
            where: { id: 1 },
            data: { deletedAt: new Date() }
          });
        }
      `,
      },
      {
        code: `
        async function restoreUser() {
          return await prisma.user.update({
            where: { id: 1 },
            data: { deletedAt: null }
          });
        }
      `,
      },
      {
        code: `
        async function suspendUser() {
          return await prisma.user.update({
            where: { id: 1 },
            data: { suspendedAt: new Date() }
          });
        }
      `,
      },
      {
        code: `
        async function suspendUser(params: Prisma.UserWhereUniqueInput) {
          return await this.repository.user.update({
            where: {
              ...params,
              suspendedAt: null,
            },
            data: {
              suspendedAt: new Date(),
            },
          });
        }
      `,
      },
      {
        code: `
        class UserRepository {
          async updateUserStatus(id: number) {
            return await this.prisma.user.update({
              where: { id },
              data: { status: 'active' }
            });
          }
        }
      `,
      },
      {
        code: `
        const updateUserName = async (id: number, name: string) => {
          return await prisma.user.update({
            where: { id },
            data: { name }
          });
        };
      `,
      },
    ],
    invalid: [
      {
        code: `
        async function updateUser() {
          return await prisma.user.update({
            where: { id: 1 },
            data: { deletedAt: new Date() }
          });
        }
      `,
        errors: [
          {
            messageId: 'invalidUpdateMethodName',
            data: {
              functionName: 'updateUser',
              method: 'update',
              operation: 'with deletedAt: Date',
              expectedPrefix: 'delete',
            },
          },
          {
            messageId: 'updateShouldNotHaveDeletedAt',
            data: {
              functionName: 'updateUser',
            },
          },
        ],
      },
      {
        code: `
        async function suspendUser() {
          return await prisma.user.update({
            where: { id: 1 },
            data: { name: 'Suspended' }
          });
        }
      `,
        errors: [
          {
            messageId: 'invalidUpdateMethodName',
            data: {
              functionName: 'suspendUser',
              method: 'update',
              operation: 'without deletedAt',
              expectedPrefix: 'update',
            },
          },
          {
            messageId: 'suspendShouldHaveSuspendedAt',
            data: {
              functionName: 'suspendUser',
            },
          },
        ],
      },
      {
        code: `
        async function deleteUser() {
          return await prisma.user.update({
            where: { id: 1 },
            data: { status: 'deleted' }
          });
        }
      `,
        errors: [
          {
            messageId: 'invalidUpdateMethodName',
            data: {
              functionName: 'deleteUser',
              method: 'update',
              operation: 'without deletedAt',
              expectedPrefix: 'update',
            },
          },
          {
            messageId: 'deleteShouldHaveDeletedAt',
            data: {
              functionName: 'deleteUser',
            },
          },
        ],
      },
      {
        code: `
        async function restoreUser() {
          return await prisma.user.update({
            where: { id: 1 },
            data: { status: 'active' }
          });
        }
      `,
        errors: [
          {
            messageId: 'invalidUpdateMethodName',
            data: {
              functionName: 'restoreUser',
              method: 'update',
              operation: 'without deletedAt',
              expectedPrefix: 'update',
            },
          },
          {
            messageId: 'restoreShouldHaveDeletedAtNull',
            data: {
              functionName: 'restoreUser',
            },
          },
        ],
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
        errors: [
          {
            messageId: 'invalidUpdateMethodName',
            data: {
              functionName: 'updateUser',
              method: 'update',
              operation: 'with suspendedAt: Date',
              expectedPrefix: 'suspend',
            },
          },
        ],
      },
    ],
  });
});
