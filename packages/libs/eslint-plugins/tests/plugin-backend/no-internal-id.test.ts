import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/no-internal-id';

describe('no-internal-id', () => {
  const ruleTester = new RuleTester({
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
  });

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('no-internal-id', rule, {
    valid: [
      {
        code: `
        class UserResponseDto {
          @Exclude()
          id: string;

          @Expose()
          publicId: string;
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.response.dto.ts',
      },
      {
        code: `
        class UserResponseDto {
          publicId: string;
          name: string;
          email: string;
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.response.dto.ts',
      },
      {
        code: `
        function findUserByPublicId(publicId) {
          return this.repository.user.findUnique({
            where: { publicId }
          });
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.query.service.ts',
      },
      {
        code: `
        const userPublicId = user.publicId;
        const name = user.name;
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
      {
        code: `
        function findUserById(id) {
          return this.repository.user.findUnique({
            where: { id }
          });
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.repository.service.ts',
      },
      {
        code: `
        interface UserResponseDto {
          publicId: string;
          name: string;
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.response.dto.ts',
      },
      {
        code: `
        class UserResponseDto {
          @ApiProperty()
          publicId: string;
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.response.dto.ts',
      },
      {
        code: `
        const obj = {
          publicId: '123',
          name: 'test'
        };
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
      {
        code: `
        findMany({ where: { publicId: '123' } });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
      {
        code: `
        db.user.update({
          where: { publicId: '123' },
          data: { name: 'test' }
        });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
      {
        code: `
        const condition = { publicId: '123' };
        db.where(condition);
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
      {
        code: `
        func({ id: '123' });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
      {
        code: `
        something()({ id: '123' });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
      {
        code: `
        db.user['findMany']({
          where: { publicId: '123' }
        });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
      {
        code: `
        db['findMany']({
          id: '123'
        });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
      {
        code: `
        obj[someVar]({
          id: '123'
        });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
      },
    ],
    invalid: [
      {
        code: `
        class UserResponseDto {
          id: string;
          name: string;
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.response.dto.ts',
        errors: [{ messageId: 'noIdInResponse' }],
      },
      {
        code: `
        interface UserResponseDto {
          id: string;
          name: string;
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.response.dto.ts',
        errors: [{ messageId: 'noIdInResponse' }],
      },
      {
        code: `
        function findUserById(id) {
          return this.repository.user.findUnique({
            where: { id }
          });
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.query.service.ts',
        errors: [{ messageId: 'noIdInQuery' }],
      },
      {
        code: `
        function updateUser(data) {
          return this.repository.user.update({
            where: { id: data.id },
            data: { name: data.name }
          });
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.command.service.ts',
        errors: [{ messageId: 'noIdInQuery' }, { messageId: 'noIdAccess' }],
      },
      {
        code: `
        const userId = user.id;
        console.log(userId);
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [{ messageId: 'noIdAccess' }],
      },
      {
        code: `
        if (user.id === targetId) {
          return true;
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [{ messageId: 'noIdAccess' }],
      },
      {
        code: `
        const users = this.repository.user.findMany({
          select: { id: true, name: true }
        });
      `,
        filename: '/project/src/modules/aggregate/user/user.query.service.ts',
        errors: [{ messageId: 'noIdInQuery' }],
      },
      {
        code: `
        const result = service.findUnique({
          where: { id: userId }
        });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [{ messageId: 'noIdInQuery' }],
      },
      {
        code: `
        const updated = db.update({
          where: { id: userId },
          data: { status: 'active' }
        });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [{ messageId: 'noIdInQuery' }],
      },
      {
        code: `
        const items = collection.updateMany({
          where: { id: { in: ids } }
        });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [{ messageId: 'noIdInQuery' }],
      },
      {
        code: `
        db.findUnique({
          id: '123'
        });
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [{ messageId: 'noIdInQuery' }],
      },
      {
        code: `
        class UserResponseDto {
          @ApiProperty()
          id: string;
        }
      `,
        filename: '/project/src/modules/aggregate/user/user.response.dto.ts',
        errors: [{ messageId: 'noIdInResponse' }],
      },
      {
        code: `
        const query = {
          data: { id: newId }
        };
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [{ messageId: 'noIdInQuery' }],
      },
      {
        code: `
        const userId = (user as any).id;
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [{ messageId: 'noIdAccess' }],
      },
      {
        code: `
        const userId = user!.id;
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [{ messageId: 'noIdAccess' }],
      },
      {
        code: `
        const nested = {
          query: {
            where: { id: '123' }
          }
        };
      `,
        filename: '/project/src/modules/aggregate/user/user.service.ts',
        errors: [{ messageId: 'noIdInQuery' }],
      },
    ],
  });
});
