import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/repository-model-access-restriction';

describe('repository-model-access-restriction', () => {
  const ruleTester = new RuleTester();

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('repository-model-access-restriction', rule, {
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
        class UserRepository {
          async findUserSetting() {
            return this.repository.setting.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.repository.ts',
      },
      {
        code: `
        class SettingRepository {
          async findSetting() {
            return this.repository.setting.findMany();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/user/setting/setting.repository.ts',
      },
      {
        code: `
        class UserService {
          async getUser() {
            return this.repository.post.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
      {
        code: `
        class UserRepository {
          async findUser() {
            return this.userModel.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.repository.ts',
      },
      {
        code: `
        class UserRepository {
          async findUser() {
            return this.repository['user'].findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.repository.ts',
      },
      {
        code: `
        class UserRepository {
          async findUser() {
            return this.repository.user.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/user.repository.ts',
      },
      {
        code: `
        class UserRepository {
          async findUser() {
            return this.repository.user.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate',
      },
      {
        code: `
        class UserRepository {
          async findUser() {
            return this.repository.user.findUnique();
          }
        }
      `,
        filename: undefined,
        // This will trigger context.getFilename() fallback
      },
    ],
    invalid: [
      {
        code: `
        class UserRepository {
          async findPost() {
            return this.repository.post.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.repository.ts',
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
      {
        code: `
        class PostRepository {
          async findUser() {
            return this.repository.user.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/post/post.repository.ts',
        errors: [
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'post',
              modelName: 'user',
            },
          },
        ],
      },
      {
        code: `
        class UserRepository {
          async findData() {
            const post = await this.repository.post.findUnique();
            const comment = await this.repository.comment.findMany();
            return { post, comment };
          }
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.repository.ts',
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
        ],
      },
      {
        code: `
        class PracticeRepository {
          async findUserForPractice() {
            return this.repository.user.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/practice/practice.repository.ts',
        errors: [
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'practice',
              modelName: 'user',
            },
          },
        ],
      },
      {
        code: `
        class SettingRepository {
          async findPractice() {
            return this.repository.practice.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/user/setting/setting.repository.ts',
        errors: [
          {
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: 'user/setting',
              modelName: 'practice',
            },
          },
        ],
      },
      {
        code: `
        class SettingRepository {
          async findUserForSetting() {
            return this.repository.user.findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/user/setting/setting.repository.ts',
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
      {
        code: `
        class UserRepository {
          async findPost() {
            return this.repository['post'].findUnique();
          }
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.repository.ts',
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
    ],
  });
});
