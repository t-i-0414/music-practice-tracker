import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/repository-model-access-restriction';

describe('repository-model-access-restriction', () => {
  const ruleTester = new RuleTester();

  ruleTester.run('repository-model-access-restriction', rule, {
    valid: [
      // ===== Prisma Import Tests =====
      // Valid: Prisma import in command.service.ts
      {
        code: `
          import { User, Prisma } from '@prisma/client';
          class UserCommandService {
            async createUser() {}
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
      },
      // Valid: Prisma import in query.service.ts
      {
        code: `
          import { User } from '@/generated/prisma';
          class UserQueryService {
            async findUser() {}
          }
        `,
        filename: 'src/modules/aggregates/user/query.service.ts',
      },
      // Valid: No Prisma imports in other files
      {
        code: `
          import { Injectable } from '@nestjs/common';
          class UserFacadeService {
            async getUser() {}
          }
        `,
        filename: 'src/modules/aggregates/user/facade.service.ts',
      },

      // ===== Repository Access Scope Tests =====
      // Valid: Accessing user repository from user aggregate
      {
        code: `
          class UserCommandService {
            async createUser() {
              return await this.repository.user.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
      },
      // Valid: Type-only imports in constants.ts
      {
        code: `
          import { type User, type UserStatus } from '@prisma/client';
          export type UserType = User;
        `,
        filename: 'src/modules/aggregates/user/constants.ts',
      },
      // Valid: Type-only import statement in constants.ts
      {
        code: `
          import type { AdminRole, AdminStatus } from '@/generated/prisma';
          export type AdminRoleType = AdminRole;
        `,
        filename: 'src/modules/aggregates/admin-user/constants.ts',
      },
      // Valid: Accessing adminUser repository from admin-user folder (kebab-case)
      {
        code: `
          class AdminUserCommandService {
            async createAdmin() {
              return await this.repository.adminUser.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/admin-user/command.service.ts',
      },
      // Valid: Accessing userAuthToken repository from user-auth-token folder (kebab-case)
      {
        code: `
          class UserAuthTokenQueryService {
            async findToken() {
              return await this.repository.userAuthToken.findUnique({ where: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user-auth-token/query.service.ts',
      },
      // Valid: Test files are excluded
      {
        code: `
          import { User, Prisma } from '@prisma/client';
          describe('UserService', () => {
            it('should work', () => {
              this.repository.user.create({ data: {} });
            });
          });
        `,
        filename: 'src/modules/aggregates/user/tests/user.service.test.ts',
      },
      // Valid: Spec files are excluded
      {
        code: `
          import { User } from '@/generated/prisma';
          describe('UserController', () => {
            it('should work', () => {
              this.repository.post.findMany();
            });
          });
        `,
        filename: 'src/modules/aggregates/user/user.controller.spec.ts',
      },
      // Valid: Accessing setting repository from setting aggregate
      {
        code: `
          class SettingCommandService {
            async createSetting() {
              return await this.repository.setting.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/setting/command.service.ts',
      },
      // Valid: Accessing profile repository from profile aggregate
      {
        code: `
          class ProfileCommandService {
            async updateProfile() {
              return await this.repository.profile.update({ where: {}, data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/profile/command.service.ts',
      },
      // Valid: Bracket notation with valid access
      {
        code: `
          class UserCommandService {
            async createDynamic(modelName: string) {
              return await this.repository['user'].create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
      },

      // ===== Query/Command Method Tests =====
      // Valid: Query service using read methods
      {
        code: `
          class UserQueryService {
            async findUser() {
              return await this.repository.user.findUnique({ where: { id: '1' } });
            }
            async findUsers() {
              return await this.repository.user.findMany();
            }
            async countUsers() {
              return await this.repository.user.count();
            }
          }
        `,
        filename: 'src/modules/aggregates/user/query.service.ts',
      },
      // Valid: Command service using write methods
      {
        code: `
          class UserCommandService {
            async createUser() {
              return await this.repository.user.create({ data: {} });
            }
            async updateUser() {
              return await this.repository.user.update({ where: {}, data: {} });
            }
            async deleteUser() {
              return await this.repository.user.delete({ where: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
      },
      // Valid: Test importing only the matching Prisma model in command service
      {
        code: `
          import { User } from '@prisma/client';
          class UserCommandService {
            async createUser(userData: Partial<User>) {
              // Using imported model
              return await this.repository.user.create({ data: userData as any });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
      },
      // Valid: Importing Prisma namespace (common type) in command service
      {
        code: `
          import { User, Prisma } from '@prisma/client';
          class UserCommandService {
            async createUser(data: Prisma.UserCreateInput) {
              return await this.repository.user.create({ data });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
      },
      // Valid: Importing TransactionClient (common type) in command service
      {
        code: `
          import { User, TransactionClient } from '@prisma/client';
          class UserCommandService {
            async createUserInTransaction(tx: TransactionClient) {
              return await tx.user.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
      },
      // Valid: Importing matching model in admin-user aggregate
      {
        code: `
          import { AdminUser } from '@/generated/prisma';
          class AdminUserQueryService {
            async findAdmin(id: string): Promise<AdminUser | null> {
              return await this.repository.adminUser.findUnique({ where: { id } });
            }
          }
        `,
        filename: 'src/modules/aggregates/admin-user/query.service.ts',
      },

      // Valid: User auth token aggregate can access userAuthToken repository for writes
      {
        code: `
          class UserAuthTokenCommandService {
            async createToken(userId: string) {
              return await this.repository.userAuthToken.create({ data: { userId } });
            }
          }
        `,
        filename: 'src/modules/aggregates/user-auth-token/command.service.ts',
      },

      // Valid: PrismaClient import in repository/repository.service.ts
      {
        code: `
          import { PrismaClient } from '@/generated/prisma';
          export class RepositoryService extends PrismaClient {
            constructor() {
              super();
            }
          }
        `,
        filename: 'src/repository/repository.service.ts',
      },
      // Valid: Default import from Prisma in repository/repository.service.ts (covers non-ImportSpecifier case)
      {
        code: `
          import PrismaClient from '@/generated/prisma';
          export class RepositoryService extends PrismaClient {
            constructor() {
              super();
            }
          }
        `,
        filename: 'src/repository/repository.service.ts',
      },
      
    ],
    invalid: [
      // ===== Prisma Import Tests =====
      // Invalid: Prisma import in facade.service.ts
      {
        code: `
          import { User } from '@prisma/client';
          class UserFacadeService {
            async getUser() {}
          }
        `,
        filename: 'src/modules/aggregates/user/facade.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
            data: {
              allowedFiles: 'command.service.ts or query.service.ts within aggregates folder',
            },
          },
        ],
      },
      // Invalid: Prisma import in repository.service.ts
      {
        code: `
          import { User, Post } from '@/generated/prisma';
          class UserRepository {
            async findUser() {}
          }
        `,
        filename: 'src/modules/aggregates/user/repository.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
            data: {
              allowedFiles: 'command.service.ts or query.service.ts within aggregates folder',
            },
          },
        ],
      },
      // Invalid: Non-type import in constants.ts
      {
        code: `
          import { User, UserStatus } from '@prisma/client';
          export const UserModel = User;
        `,
        filename: 'src/modules/aggregates/user/constants.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
            data: {
              allowedFiles: 'command.service.ts or query.service.ts within aggregates folder',
            },
          },
        ],
      },
      // Invalid: adminUser repository access from user aggregate (kebab-case mismatch)
      {
        code: `
          class UserCommandService {
            async createAdmin() {
              return await this.repository.adminUser.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
        errors: [
          {
            messageId: 'invalidRepositoryAccess',
            data: {
              modelName: 'adminUser',
              aggregatePath: 'admin-user/**',
            },
          },
        ],
      },
      // Invalid: userAuthToken repository access from user aggregate
      {
        code: `
          class UserQueryService {
            async findToken() {
              return await this.repository.userAuthToken.findUnique({ where: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/query.service.ts',
        errors: [
          {
            messageId: 'invalidRepositoryAccess',
            data: {
              modelName: 'userAuthToken',
              aggregatePath: 'user-auth-token/**',
            },
          },
        ],
      },

      // ===== Repository Access Scope Tests =====
      // Invalid: Accessing post repository from user aggregate
      {
        code: `
          class UserCommandService {
            async createPost() {
              return await this.repository.post.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
        errors: [
          {
            messageId: 'invalidRepositoryAccess',
            data: {
              modelName: 'post',
              aggregatePath: 'post/**',
            },
          },
        ],
      },
      // Invalid: Accessing comment repository from user/profile aggregate
      {
        code: `
          class ProfileQueryService {
            async findComments() {
              return await this.repository.comment.findMany();
            }
          }
        `,
        filename: 'src/modules/aggregates/user/profile/query.service.ts',
        errors: [
          {
            messageId: 'invalidRepositoryAccess',
            data: {
              modelName: 'comment',
              aggregatePath: 'comment/**',
            },
          },
        ],
      },
      // Invalid: Prisma import outside aggregates (controller)
      {
        code: `
          import { User } from '@prisma/client';
          class UserController {
            async getUser() {
              return await this.service.findUser();
            }
          }
        `,
        filename: 'src/controllers/user.controller.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
            data: {
              allowedFiles: 'command.service.ts or query.service.ts within aggregates folder',
            },
          },
        ],
      },
      // Invalid: Repository access mismatch in controller
      {
        code: `
          class UserController {
            async getUser() {
              return await this.repository.post.findMany();
            }
          }
        `,
        filename: 'src/controllers/user.controller.ts',
        errors: [
          {
            messageId: 'invalidRepositoryAccess',
            data: {
              modelName: 'post',
              aggregatePath: 'post/**',
            },
          },
        ],
      },
      // Invalid: Importing wrong models in user aggregate
      {
        code: `
          import { User, Post, Comment } from '@prisma/client';
          class UserCommandService {
            async createUserWithRelations(user: User, posts: Post[]) {
              return await this.repository.user.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
        errors: [
          {
            messageId: 'invalidModelImport',
            data: {
              modelName: 'Post',
              expectedModel: 'User',
              aggregate: 'user',
            },
          },
          {
            messageId: 'invalidModelImport',
            data: {
              modelName: 'Comment',
              expectedModel: 'User',
              aggregate: 'user',
            },
          },
        ],
      },
      // Invalid: Importing wrong model in admin-user aggregate
      {
        code: `
          import { User, AdminUser } from '@/generated/prisma';
          class AdminUserQueryService {
            async findAdmin() {
              return await this.repository.adminUser.findUnique({ where: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/admin-user/query.service.ts',
        errors: [
          {
            messageId: 'invalidModelImport',
            data: {
              modelName: 'User',
              expectedModel: 'AdminUser',
              aggregate: 'admin-user',
            },
          },
        ],
      },
      // Invalid: Bracket notation with invalid access
      {
        code: `
          class UserCommandService {
            async createOther() {
              return await this.repository['post'].create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
        errors: [
          {
            messageId: 'invalidRepositoryAccess',
            data: {
              modelName: 'post',
              aggregatePath: 'post/**',
            },
          },
        ],
      },
      // Invalid: Testing repository access from empty aggregate path
      {
        code: `
          class SomeCommandService {
            async doSomething() {
              return await this.repository.user.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/command.service.ts',
        errors: [
          {
            messageId: 'invalidRepositoryAccess',
            data: {
              modelName: 'user',
              aggregatePath: 'user/**',
            },
          },
        ],
      },

      // ===== Query/Command Method Tests =====
      // Invalid: Query service using write methods
      {
        code: `
          class UserQueryService {
            async createUser() {
              return await this.repository.user.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/query.service.ts',
        errors: [
          {
            messageId: 'invalidQueryMethod',
            data: {
              method: 'create',
              allowedMethods:
                'findMany, findFirst, findFirstOrThrow, findUnique, findUniqueOrThrow, count, aggregate, groupBy',
            },
          },
        ],
      },
      // Invalid: Command service using read methods
      {
        code: `
          class UserCommandService {
            async findUser() {
              return await this.repository.user.findUnique({ where: { id: '1' } });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
        errors: [
          {
            messageId: 'invalidCommandMethod',
            data: {
              method: 'findUnique',
              allowedMethods: 'create, createMany, createManyAndReturn, update, updateMany, upsert, delete, deleteMany',
            },
          },
        ],
      },
      // Invalid: Multiple violations in query service
      {
        code: `
          class UserQueryService {
            async mixedMethods() {
              await this.repository.user.findMany();
              await this.repository.user.update({ where: {}, data: {} });
              await this.repository.user.delete({ where: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/query.service.ts',
        errors: [
          {
            messageId: 'invalidQueryMethod',
            data: {
              method: 'update',
              allowedMethods:
                'findMany, findFirst, findFirstOrThrow, findUnique, findUniqueOrThrow, count, aggregate, groupBy',
            },
          },
          {
            messageId: 'invalidQueryMethod',
            data: {
              method: 'delete',
              allowedMethods:
                'findMany, findFirst, findFirstOrThrow, findUnique, findUniqueOrThrow, count, aggregate, groupBy',
            },
          },
        ],
      },
      // Invalid: Multiple violations in command service
      {
        code: `
          class UserCommandService {
            async mixedMethods() {
              await this.repository.user.create({ data: {} });
              await this.repository.user.findFirst();
              await this.repository.user.count();
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
        errors: [
          {
            messageId: 'invalidCommandMethod',
            data: {
              method: 'findFirst',
              allowedMethods: 'create, createMany, createManyAndReturn, update, updateMany, upsert, delete, deleteMany',
            },
          },
          {
            messageId: 'invalidCommandMethod',
            data: {
              method: 'count',
              allowedMethods: 'create, createMany, createManyAndReturn, update, updateMany, upsert, delete, deleteMany',
            },
          },
        ],
      },
      // Invalid: Combined violations - wrong model import, wrong repository and wrong method
      {
        code: `
          import { Post } from '@prisma/client';
          class UserQueryService {
            async wrongEverything() {
              await this.repository.post.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/query.service.ts',
        errors: [
          {
            messageId: 'invalidModelImport',
            data: {
              modelName: 'Post',
              expectedModel: 'User',
              aggregate: 'user',
            },
          },
          {
            messageId: 'invalidQueryMethod',
            data: {
              method: 'create',
              allowedMethods:
                'findMany, findFirst, findFirstOrThrow, findUnique, findUniqueOrThrow, count, aggregate, groupBy',
            },
          },
          {
            messageId: 'invalidRepositoryAccess',
            data: {
              modelName: 'post',
              aggregatePath: 'post/**',
            },
          },
        ],
      },
      // Invalid: repository/service.ts importing models instead of just PrismaClient
      {
        code: `
          import { PrismaClient, User } from '@/generated/prisma';
          export class RepositoryService extends PrismaClient {
            someMethod(user: User) {}
          }
        `,
        filename: 'src/repository/service.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
            data: {
              allowedFiles: 'command.service.ts or query.service.ts within aggregates folder',
            },
          },
        ],
      },
      // Invalid: repository/service.ts with namespace import (not allowed)
      {
        code: `
          import * as Prisma from '@/generated/prisma';
          export class RepositoryService extends Prisma.PrismaClient {
            someMethod() {}
          }
        `,
        filename: 'src/repository/service.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
            data: {
              allowedFiles: 'command.service.ts or query.service.ts within aggregates folder',
            },
          },
        ],
      },
      // Invalid: Namespace import directly from @prisma/client in repository/repository.service.ts
      {
        code: `
          import * as Prisma from '@prisma/client';
          export class RepositoryService extends Prisma.PrismaClient {
            constructor() { super(); }
          }
        `,
        filename: 'src/repository/repository.service.ts',
        errors: [
          {
            messageId: 'invalidPrismaImport',
            data: {
              allowedFiles: 'command.service.ts or query.service.ts within aggregates folder',
            },
          },
        ],
      },
    ],
  });
});
