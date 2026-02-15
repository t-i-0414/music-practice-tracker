import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/no-prisma-raw-unsafe';

describe('no-prisma-raw-unsafe', () => {
  const ruleTester = new RuleTester();

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('no-prisma-raw-unsafe', rule, {
    valid: [
      // Safe tagged-template counterparts are allowed
      {
        code: `prisma.$queryRaw\`SELECT 1\``,
      },
      {
        code: `prisma.$executeRaw\`DELETE FROM users WHERE id = \${id}\``,
      },
      // Non-Prisma method calls are allowed
      {
        code: `obj.someMethod('SELECT 1')`,
      },
      // Standalone function calls are allowed
      {
        code: `$queryRawUnsafe('SELECT 1')`,
      },
    ],
    invalid: [
      {
        code: `prisma.$queryRawUnsafe('SELECT 1')`,
        errors: [
          {
            messageId: 'noRawUnsafe',
            data: { unsafe: '$queryRawUnsafe', safe: '$queryRaw' },
          },
        ],
      },
      {
        code: `prisma.$executeRawUnsafe('DELETE FROM users')`,
        errors: [
          {
            messageId: 'noRawUnsafe',
            data: { unsafe: '$executeRawUnsafe', safe: '$executeRaw' },
          },
        ],
      },
      // Works with any receiver object
      {
        code: `this.repository.$queryRawUnsafe(query)`,
        errors: [
          {
            messageId: 'noRawUnsafe',
            data: { unsafe: '$queryRawUnsafe', safe: '$queryRaw' },
          },
        ],
      },
    ],
  });
});
