import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/repository-model-access-restriction';
const ruleTester = new RuleTester();

ruleTester.run('repository-model-access-restriction', rule, {
  valid: [
    // Valid: user repository accessing user model
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
    // Valid: user repository accessing setting model (subdirectory)
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
    // Valid: setting repository accessing setting model (own directory)
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
    // Valid: not a repository file
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
    // Valid: not accessing through repository pattern
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
    // Valid: user repository accessing user model with bracket notation
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
  ],
  invalid: [
    // Invalid: user repository accessing post model
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
    // Invalid: post repository accessing user model
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
    // Invalid: multiple wrong model accesses
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
    // Invalid: practice repository accessing user model (different aggregate)
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
    // Invalid: subdirectory repository accessing model from different aggregate
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
    // Invalid: subdirectory repository accessing parent directory model
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
    // Invalid: user repository accessing post model with bracket notation
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
