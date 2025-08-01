import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/repository-model-access-restriction';

describe('repository-model-access-restriction', () => {
  const ruleTester = new RuleTester();

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('repository-model-access-restriction', rule, {
    valid: [
      // Repository accessing its own model
      {
        code: `
          class UserRepository {
            async findUser() {
              return await this.repository.user.findUnique({ where: { id: '1' } });
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
      },
      // Subdirectory repository accessing its own model
      {
        code: `
          class SettingRepository {
            async findSetting() {
              return await this.repository.setting.findFirst();
            }
          }
        `,
        filename: 'src/modules/aggregate/user/setting/setting.repository.ts',
      },
      // Top-level repository accessing subdirectory model
      {
        code: `
          class UserRepository {
            async findUserSetting() {
              return await this.repository.setting.findMany();
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
      },
      // Bracket notation with valid access
      {
        code: `
          class UserRepository {
            async findDynamic(modelName: string) {
              return await this.repository['user'].findMany();
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
      },
      // Non-repository files are ignored
      {
        code: `
          class UserService {
            async findUser() {
              return await this.repository.post.findUnique({ where: { id: '1' } });
            }
          }
        `,
        filename: 'src/services/user.service.ts',
      },
      // Files not in aggregate directory
      {
        code: `
          class DataService {
            async getData() {
              return await this.repository.data.findMany();
            }
          }
        `,
        filename: 'src/common/data.repository.ts',
      },
      // Non-repository member expressions
      {
        code: `
          class UserRepository {
            async findUser() {
              return await this.service.user.findUnique({ where: { id: '1' } });
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
      },
      // Repository without this context
      {
        code: `
          async function findUser(repository: any) {
            return await repository.user.findUnique({ where: { id: '1' } });
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
      },
      // Complex nested structures
      {
        code: `
          class UserRepository {
            async findUserProfile() {
              return await this.repository.profile.findUnique({ where: { userId: '1' } });
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
      },
      // Repository accessing model with matching case
      {
        code: `
          class UserRepository {
            async findUser() {
              return await this.repository.User.findUnique({ where: { id: '1' } });
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
      },
    ],
    invalid: [
      // Top-level repository accessing another top-level aggregate
      {
        code: `
          class UserRepository {
            async findPost() {
              return await this.repository.post.findUnique({ where: { id: '1' } });
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
        errors: [
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'user',
              modelName: 'post',
            },
          },
        ],
      },
      // Subdirectory repository accessing parent model
      {
        code: `
          class SettingRepository {
            async findUser() {
              return await this.repository.user.findUnique({ where: { id: '1' } });
            }
          }
        `,
        filename: 'src/modules/aggregate/user/setting/setting.repository.ts',
        errors: [
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'user/setting',
              modelName: 'user',
            },
          },
        ],
      },
      // Repository accessing unrelated model
      {
        code: `
          class UserRepository {
            async findComment() {
              return await this.repository.comment.findMany();
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
        errors: [
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'user',
              modelName: 'comment',
            },
          },
        ],
      },
      // Bracket notation with invalid access
      {
        code: `
          class UserRepository {
            async findOther() {
              return await this.repository['post'].findMany();
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
        errors: [
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'user',
              modelName: 'post',
            },
          },
        ],
      },
      // Deep nested repository accessing wrong model
      {
        code: `
          class ProfileRepository {
            async findPost() {
              return await this.repository.post.findMany();
            }
          }
        `,
        filename: 'src/modules/aggregate/user/profile/settings/profile.repository.ts',
        errors: [
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'user/profile/settings',
              modelName: 'post',
            },
          },
        ],
      },
      // Multiple violations in same file
      {
        code: `
          class UserRepository {
            async findPost() {
              return await this.repository.post.findUnique({ where: { id: '1' } });
            }
            
            async findComment() {
              return await this.repository.comment.findMany();
            }
            
            async findSession() {
              return await this.repository.session.findFirst();
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
        errors: [
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'user',
              modelName: 'post',
            },
          },
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'user',
              modelName: 'comment',
            },
          },
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'user',
              modelName: 'session',
            },
          },
        ],
      },
      // Case sensitivity check
      {
        code: `
          class UserRepository {
            async findPost() {
              return await this.repository.Post.findUnique({ where: { id: '1' } });
            }
          }
        `,
        filename: 'src/modules/aggregate/user/user.repository.ts',
        errors: [
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'user',
              modelName: 'Post',
            },
          },
        ],
      },
    ],
  });
});