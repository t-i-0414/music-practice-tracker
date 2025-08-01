import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/prisma-repository-only-access';

describe('prisma-repository-only-access', () => {
  const ruleTester = new RuleTester();

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('prisma-repository-only-access', rule, {
    valid: [
      // Repository files can access Prisma
      {
        code: `
          import { PrismaClient } from '@prisma/client';
          const prisma = new PrismaClient();
        `,
        filename: 'user.repository.ts',
      },
      {
        code: `
          import { PrismaClient } from '@/generated/prisma';
          
          class UserRepository {
            async findUser(id: string) {
              return await this.repository.user.findUnique({
                where: { id }
              });
            }
          }
        `,
        filename: 'user.repository.service.ts',
      },
      // Type-only imports are allowed outside repositories
      {
        code: `
          import type { User } from '@prisma/client';
        `,
        filename: 'user.service.ts',
      },
      {
        code: `
          import { type User, type Post } from '@prisma/client';
        `,
        filename: 'user.service.ts',
      },
      // Non-Prisma imports
      {
        code: `
          import { Injectable } from '@nestjs/common';
        `,
        filename: 'user.service.ts',
      },
      // Non-Prisma member expressions
      {
        code: `
          const user = await userService.findUnique({ id: '123' });
        `,
        filename: 'user.controller.ts',
      },
      // Repository file patterns
      {
        code: `
          const user = await this.repository.user.findUnique({
            where: { id }
          });
        `,
        filename: 'some-repository.ts',
      },
      {
        code: `
          const users = await repository.user.findMany();
        `,
        filename: 'some-repository.service.ts',
      },
      // Prisma client methods in repository
      {
        code: `
          await prisma.$connect();
          await prisma.$disconnect();
        `,
        filename: 'database.repository.ts',
      },
    ],
    invalid: [
      // Direct Prisma imports outside repository
      {
        code: `
          import { PrismaClient } from '@prisma/client';
        `,
        filename: 'user.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
          },
        ],
      },
      {
        code: `
          import prisma from '@/generated/prisma';
        `,
        filename: 'user.controller.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
          },
        ],
      },
      // Named imports that aren't type-only
      {
        code: `
          import { PrismaClient, User } from '@prisma/client';
        `,
        filename: 'user.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
          },
        ],
      },
      // Namespace imports
      {
        code: `
          import * as Prisma from '@prisma/client';
        `,
        filename: 'user.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
          },
        ],
      },
      // Prisma model access outside repository
      {
        code: `
          const user = await repository.user.findUnique({
            where: { id: '123' }
          });
        `,
        filename: 'user.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaAccess',
          },
        ],
      },
      {
        code: `
          const users = await this.repository.user.findMany({
            where: { active: true }
          });
        `,
        filename: 'user.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaAccess',
          },
        ],
      },
      // Prisma client methods
      {
        code: `
          await prisma.$connect();
        `,
        filename: 'app.module.ts',
        errors: [
          {
            messageId: 'invalidPrismaAccess',
          },
        ],
      },
      {
        code: `
          await this.repository.$disconnect();
        `,
        filename: 'user.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaAccess',
          },
        ],
      },
      {
        code: `
          await prismaClient.$transaction([
            prismaClient.user.create({ data: { name: 'test' } })
          ]);
        `,
        filename: 'user.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaAccess',
          },
        ],
      },
      // Various Prisma method calls
      {
        code: `
          await repository.post.create({
            data: { title: 'test' }
          });
        `,
        filename: 'post.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaAccess',
          },
        ],
      },
      {
        code: `
          const count = await repository.user.count({
            where: { active: true }
          });
        `,
        filename: 'stats.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaAccess',
          },
        ],
      },
      {
        code: `
          const result = await repository.user.aggregate({
            _count: true
          });
        `,
        filename: 'analytics.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaAccess',
          },
        ],
      },
      {
        code: `
          const groups = await repository.user.groupBy({
            by: ['role'],
            _count: true
          });
        `,
        filename: 'report.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaAccess',
          },
        ],
      },
    ],
  });
});