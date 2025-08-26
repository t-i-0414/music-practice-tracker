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
      // Valid: Accessing setting repository from user/setting aggregate
      {
        code: `
          class SettingCommandService {
            async createSetting() {
              return await this.repository.setting.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/setting/command.service.ts',
      },
      // Valid: Accessing user repository from nested user aggregate
      {
        code: `
          class ProfileCommandService {
            async updateProfile() {
              return await this.repository.user.update({ where: {}, data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/profile/command.service.ts',
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
      // Valid: Non-service files are ignored for method checks
      {
        code: `
          class UserRepository {
            async mixedMethods() {
              await this.repository.user.findMany();
              await this.repository.user.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/repository.service.ts',
      },
      // Valid: Files outside aggregates are ignored
      {
        code: `
          import { User } from '@prisma/client';
          class UserController {
            async getUser() {
              return await this.repository.post.findMany();
            }
          }
        `,
        filename: 'src/controllers/user.controller.ts',
      },
      // Valid: Test importing Prisma models (non-PrismaClient/Prisma types) in command service
      {
        code: `
          import { User, Post, Comment } from '@prisma/client';
          class UserCommandService {
            async createUserWithRelations(user: User, posts: Post[]) {
              // Using imported models
              return await this.repository.user.create({ data: {} });
            }
          }
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
      },
      // Valid: Test importing from @/generated/prisma with models in query service
      {
        code: `
          import { User, Post, Comment, Prisma } from '@/generated/prisma';
          class UserQueryService {
            async findUsersWithPosts() {
              // Using imported models
              return await this.repository.user.findMany();
            }
          }
        `,
        filename: 'src/modules/aggregates/user/query.service.ts',
      },
      // Valid: Repository access from aggregate path that includes model name
      {
        code: `
          class UserSettingQueryService {
            async findUserSettings() {
              return await this.repository.user.findMany();
            }
          }
        `,
        filename: 'src/modules/aggregates/user/settings/query.service.ts',
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
              allowedFiles: 'command.service.ts or query.service.ts',
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
              allowedFiles: 'command.service.ts or query.service.ts',
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
              aggregatePath: 'post or **/post',
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
              aggregatePath: 'comment or **/comment',
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
              aggregatePath: 'post or **/post',
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
              aggregatePath: 'user or **/user',
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
      // Invalid: Combined violations - wrong repository and wrong method
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
              aggregatePath: 'post or **/post',
            },
          },
        ],
      },
    ],
  });
});
