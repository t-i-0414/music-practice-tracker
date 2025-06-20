import rule from '@/plugin-backend/prisma-repository-only-access';
import { RuleTester } from '@typescript-eslint/rule-tester';
const ruleTester = new RuleTester();

ruleTester.run('prisma-repository-only-access', rule, {
  valid: [
    // Valid: Repository file accessing Prisma models
    {
      code: `
        class UserRepository {
          async findUser() {
            return this.repository.user.findUnique();
          }
        }
      `,
      filename: '/project/src/modules/aggregate/user/user.repository.ts',
    },
    // Valid:  Repository file accessing Prisma models
    {
      code: `
        class RepositoryService {
          async findUser() {
            return this.repository.user.findUnique();
          }
        }
      `,
      filename: '/project/src/modules/aggregate/user/user.repository.service.ts',
    },
    // Valid: Repository file importing PrismaClient
    {
      code: `
        import { PrismaClient } from '@prisma/client';
        class UserRepository {
          constructor(private prisma: PrismaClient) {}
        }
      `,
      filename: '/project/src/modules/aggregate/user/user.repository.ts',
    },
    // Valid: DTO importing Prisma types only
    {
      code: `
        import type { User } from '@prisma/client';
        export class UserDto implements User {}
      `,
      filename: '/project/src/modules/aggregate/user/user.dto.ts',
    },
    // Valid: Service using repository (not direct Prisma access)
    {
      code: `
        class UserService {
          async getUser() {
            return this.userRepository.findUser();
          }
        }
      `,
      filename: '/project/src/modules/aggregate/user/user.service.ts',
    },
    // Valid: Type-only import with specific type specifier
    {
      code: `
        import { type User, type Prisma } from '@prisma/client';
        export class UserDto implements User {}
      `,
      filename: '/project/src/modules/aggregate/user/user.dto.ts',
    },
  ],
  invalid: [
    // Invalid: Service accessing Prisma directly
    {
      code: `
        class UserService {
          async getUser() {
            return this.repository.user.findUnique();
          }
        }
      `,
      filename: '/project/src/modules/aggregate/user/user.service.ts',
      errors: [
        {
          messageId: 'invalidPrismaAccess',
        },
      ],
    },
    // Invalid: Controller accessing Prisma
    {
      code: `
        class UserController {
          async getUser() {
            return this.repository.user.findFirst();
          }
        }
      `,
      filename: '/project/src/modules/aggregate/user/user.controller.ts',
      errors: [
        {
          messageId: 'invalidPrismaAccess',
        },
      ],
    },
    // Invalid: Service importing PrismaClient
    {
      code: `
        import { PrismaClient } from '@prisma/client';
        class UserService {
          constructor(private prisma: PrismaClient) {}
        }
      `,
      filename: '/project/src/modules/aggregate/user/user.service.ts',
      errors: [
        {
          messageId: 'invalidPrismaImport',
        },
      ],
    },
    // Invalid: Service using PrismaClient methods
    {
      code: `
        class UserService {
          async connect() {
            return this.repository.$connect();
          }
        }
      `,
      filename: '/project/src/modules/aggregate/user/user.service.ts',
      errors: [
        {
          messageId: 'invalidPrismaAccess',
        },
      ],
    },
    // Invalid: Importing from generated prisma
    {
      code: `
        import { User } from '@/generated/prisma';
        class UserService {
          private user: User;
        }
      `,
      filename: '/project/src/modules/aggregate/user/user.service.ts',
      errors: [
        {
          messageId: 'invalidPrismaImport',
        },
      ],
    },
  ],
});
