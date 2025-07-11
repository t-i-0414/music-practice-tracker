import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/prisma-repository-only-access';

describe('prisma-repository-only-access', () => {
  const ruleTester = new RuleTester();

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('prisma-repository-only-access', rule, {
    valid: [
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
      {
        code: `
        class RepositoryService {
          async findUser() {
            return this.repository.user.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/repository/repository.service.ts',
      },
      {
        code: `
        class RepositoryService {
          async findUser() {
            return this.repository.user.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/repository/repository.ts',
      },
      {
        code: `
        import { PrismaClient } from '@prisma/client';
        class UserRepository {
          constructor(private prisma: PrismaClient) {}
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.repository.ts',
      },
      {
        code: `
        import type { User } from '@prisma/client';
        export class UserDto implements User {}
      `,
        filename: '/project/src/modules/aggregate/user/user.dto.ts',
      },
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
      {
        code: `
        import { type User, type Prisma } from '@prisma/client';
        export class UserDto implements User {}
      `,
        filename: '/project/src/modules/aggregate/user/user.dto.ts',
      },
      {
        code: `
        import type * as Prisma from '@prisma/client';
        export class UserDto {}
      `,
        filename: '/project/src/modules/aggregate/user/user.dto.ts',
      },
    ],
    invalid: [
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
      {
        code: `
        import User from '@/generated/prisma';
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
      {
        code: `
        import { PrismaClient } from '@/generated/prisma';
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
      {
        code: `
        const service = {
          async connect() {
            return prisma.$connect();
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
      {
        code: `
        const service = {
          async disconnect() {
            return prismaClient.$disconnect();
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
      {
        code: `
        const service = {
          async getUser() {
            return repository.user.findUnique({ where: { id: 1 } });
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
      {
        code: `
        import * as Prisma from '@prisma/client';
        class UserService {
          constructor(private prisma: Prisma.PrismaClient) {}
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
          },
        ],
      },
      {
        code: `
        import { User } from '@custom/prisma-models';
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
});
