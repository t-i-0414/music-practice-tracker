import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/no-internal-id';

describe('no-internal-id', () => {
  const ruleTester = new RuleTester();

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('no-internal-id', rule, {
    valid: [
      // Valid usage with publicId
      {
        code: `const user = { publicId: '123' };`,
      },
      {
        code: `
          class UserResponseDto {
            @Expose()
            publicId: string;
          }
        `,
        filename: 'user.response.dto.ts',
      },
      // Repository files are allowed to use id
      {
        code: `
          async function findById(id: string) {
            return await prisma.user.findUnique({
              where: { id }
            });
          }
        `,
        filename: 'user.repository.service.ts',
      },
      {
        code: `
          const repository = {
            findById: (id: string) => prisma.user.findUnique({ where: { id } })
          };
        `,
        filename: 'user.repository.ts',
      },
      // Response DTOs with @Exclude decorator
      {
        code: `
          class UserResponseDto {
            @Exclude()
            id: string;
            
            @Expose()
            publicId: string;
          }
        `,
        filename: 'user.response.dto.ts',
      },
      // Non-Prisma context
      {
        code: `
          const config = {
            id: 'config-123',
            name: 'test'
          };
        `,
      },
      // Type assertions with <> are allowed
      {
        code: `
          const userId = <any>user.id;
        `,
      },
      // Type assertions with 'as' are allowed
      {
        code: `
          const userId = user.id as string;
        `,
      },
      // Test files are excluded
      {
        code: `
          describe('UserService', () => {
            it('should work', () => {
              const user = { id: '123' };
              expect(user.id).toBe('123');
            });
          });
        `,
        filename: 'src/modules/tests/user.service.test.ts',
      },
      // Spec files are excluded
      {
        code: `
          describe('UserController', () => {
            const testUser = { id: '123', publicId: 'pub-123' };
          });
        `,
        filename: 'src/modules/user.controller.spec.ts',
      },
      // Test files with .test. in path are excluded
      {
        code: `
          class UserResponseDto {
            id: string;
          }
        `,
        filename: 'src/modules/user.test.dto.ts',
      },
    ],
    invalid: [
      // Response DTOs should not expose id
      {
        code: `
          class UserResponseDto {
            id: string;
            publicId: string;
          }
        `,
        filename: 'user.response.dto.ts',
        errors: [
          {
            messageId: 'noIdInResponse',
            data: {},
          },
        ],
      },
      // TypeScript interface in response DTO
      {
        code: `
          interface UserResponse {
            id: string;
            publicId: string;
          }
        `,
        filename: 'user.response.dto.ts',
        errors: [
          {
            messageId: 'noIdInResponse',
            data: {},
          },
        ],
      },
      // Prisma queries should use publicId
      {
        code: `
          async function getUser() {
            return await prisma.user.findUnique({
              where: { id: '123' }
            });
          }
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      {
        code: `
          async function updateUser() {
            return await prisma.user.update({
              where: { id: '123' },
              data: { name: 'test' }
            });
          }
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      {
        code: `
          async function getUsers() {
            return await prisma.user.findMany({
              where: { id: { in: ['123', '456'] } }
            });
          }
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      // Select queries
      {
        code: `
          async function getUser() {
            return await prisma.user.findUnique({
              where: { publicId: '123' },
              select: { id: true, name: true }
            });
          }
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      // Data objects
      {
        code: `
          async function createUser() {
            return await prisma.user.create({
              data: { id: '123', name: 'test' }
            });
          }
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      // Direct property access
      {
        code: `
          function getUserId(user: User) {
            return user.id;
          }
        `,
        errors: [
          {
            messageId: 'noIdAccess',
            data: {},
          },
        ],
      },
      {
        code: `
          const userId = user.id;
        `,
        errors: [
          {
            messageId: 'noIdAccess',
            data: {},
          },
        ],
      },
      // Nested property structures
      {
        code: `
          const query = {
            where: {
              id: '123'
            }
          };
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      // Method calls
      {
        code: `
          prisma.user.findUnique({
            where: { id: '123' }
          });
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      // Direct method calls with id
      {
        code: `
          await prisma.user.where({ id: '123' });
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      {
        code: `
          await prisma.user.select({ id: true, name: true });
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      {
        code: `
          await prisma.user.data({ id: '123', name: 'test' });
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      // Deeply nested Prisma queries
      {
        code: `
          await prisma.user.update({
            where: { publicId: 'pub-123' },
            data: {
              profile: {
                update: {
                  where: { id: '456' }
                }
              }
            }
          });
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      // Top-level id inside argument object with method names (covers findUnique path)
      {
        code: `
          async function a() {
            return await prisma.user.findUnique({ id: '123' });
          }
        `,
        errors: [
          { messageId: 'noIdInQuery', data: {} },
        ],
      },
      // Top-level id with findMany
      {
        code: `
          async function b() {
            return await prisma.user.findMany({ id: '123' });
          }
        `,
        errors: [
          { messageId: 'noIdInQuery', data: {} },
        ],
      },
      // Top-level id with update
      {
        code: `
          async function c() {
            return await prisma.user.update({ id: '123' });
          }
        `,
        errors: [
          { messageId: 'noIdInQuery', data: {} },
        ],
      },
      // Top-level id with updateMany
      {
        code: `
          async function d() {
            return await prisma.user.updateMany({ id: '123' });
          }
        `,
        errors: [
          { messageId: 'noIdInQuery', data: {} },
        ],
      },
      // updateMany with id
      {
        code: `
          await prisma.user.updateMany({
            where: { id: { in: ['123', '456'] } }
          });
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },
      {
        code: `
          prisma.user.updateMany({
            where: { active: true },
            data: { id: '123' }
          });
        `,
        errors: [
          {
            messageId: 'noIdInQuery',
            data: {},
          },
        ],
      },

      // Type alias with id property in response DTO should be invalid
      {
        code: `
          type UserResponse = {
            id: string;
            publicId: string;
            name: string;
          };
        `,
        filename: 'user.response.dto.ts',
        errors: [
          {
            messageId: 'noIdInResponse',
            data: {},
          },
        ],
      },
      // Type assertions should still be invalid
      {
        code: `
          const userId = (user as any).id;
        `,
        errors: [
          {
            messageId: 'noIdAccess',
            data: {},
          },
        ],
      },
      {
        code: `
          const userId = user!.id;
        `,
        errors: [
          {
            messageId: 'noIdAccess',
            data: {},
          },
        ],
      },
    ],
  });
});
