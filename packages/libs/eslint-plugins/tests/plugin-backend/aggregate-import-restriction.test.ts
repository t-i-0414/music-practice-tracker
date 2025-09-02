import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/aggregate-import-restriction';

describe('aggregate-import-restriction', () => {
  const ruleTester = new RuleTester();

  ruleTester.run('aggregate-import-restriction', rule, {
    valid: [
      // Valid: Import from own aggregate's child folder
      {
        code: `
          import { UserRepositoryService } from './repository.service';
          import { UserDto } from './dtos/user.dto';
        `,
        filename: 'src/modules/aggregates/user/query.service.ts',
      },
      // Valid: Import from own aggregate's nested folder
      {
        code: `
          import { validateUser } from './utils/validation';
          import { formatUser } from './formatters/user.formatter';
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
      },
      // Valid: Import from parent directories outside aggregates
      {
        code: `
          import { Injectable } from '@nestjs/common';
          import { DatabaseService } from '@/modules/database/database.service';
        `,
        filename: 'src/modules/aggregates/user/facade.service.ts',
      },
      // Valid: Import from common/shared folders
      {
        code: `
          import { CommonUtil } from '@/common/utils';
          import { SharedService } from '@/shared/services/shared.service';
        `,
        filename: 'src/modules/aggregates/practice-session/command.service.ts',
      },
      // Valid: External package imports
      {
        code: `
          import { Injectable } from '@nestjs/common';
          import { PrismaClient } from '@prisma/client';
          import * as bcrypt from 'bcrypt';
        `,
        filename: 'src/modules/aggregates/user/repository.service.ts',
      },
      // Valid: Import within the same aggregate (different file)
      {
        code: `
          import { UserRepositoryService } from '@/modules/aggregates/user/repository.service';
        `,
        filename: 'src/modules/aggregates/user/query.service.ts',
      },
      // Valid: Not in aggregates folder
      {
        code: `
          import { UserFacadeService } from '@/modules/aggregates/user/facade.service';
          import { PracticeSessionFacadeService } from '@/modules/aggregates/practice-session/facade.service';
        `,
        filename: 'src/modules/api/app/users.controller.ts',
      },
      // Valid: Test files are skipped
      {
        code: `
          import { UserFacadeService } from '@/modules/aggregates/user/facade.service';
          import { PracticeSessionFacadeService } from '@/modules/aggregates/practice-session/facade.service';
        `,
        filename: 'src/modules/aggregates/goal/tests/goal.service.test.ts',
      },
      // Valid: Spec files are skipped
      {
        code: `
          import { UserService } from '@/modules/aggregates/user/facade.service';
          import { GoalService } from '@/modules/aggregates/goal/facade.service';
        `,
        filename: 'src/modules/aggregates/practice-session/practice.spec.ts',
      },
      // Valid: File directly in aggregates folder (no specific aggregate)
      {
        code: `
          import { Injectable } from '@nestjs/common';
        `,
        filename: 'src/modules/aggregates/index.ts',
      },
    ],
    invalid: [
      // Invalid: Direct import from another aggregate
      {
        code: `
          import { PracticeSessionService } from '../practice-session/facade.service';
        `,
        filename: 'src/modules/aggregates/user/command.service.ts',
        errors: [
          {
            messageId: 'crossAggregateImport',
            data: {
              currentAggregate: 'user',
              targetAggregate: 'practice-session',
            },
          },
        ],
      },
      // Invalid: Absolute import from another aggregate
      {
        code: `
          import { GoalRepositoryService } from '@/modules/aggregates/goal/repository.service';
        `,
        filename: 'src/modules/aggregates/user/query.service.ts',
        errors: [
          {
            messageId: 'crossAggregateImport',
            data: {
              currentAggregate: 'user',
              targetAggregate: 'goal',
            },
          },
        ],
      },
      // Invalid: Import from another aggregate's nested folder
      {
        code: `
          import { PracticeSessionDto } from '@/modules/aggregates/practice-session/dtos/session.dto';
        `,
        filename: 'src/modules/aggregates/user/facade.service.ts',
        errors: [
          {
            messageId: 'crossAggregateImport',
            data: {
              currentAggregate: 'user',
              targetAggregate: 'practice-session',
            },
          },
        ],
      },
      // Invalid: Relative import crossing aggregate boundaries
      {
        code: `
          import { GoalCommandService } from '../../goal/command.service';
        `,
        filename: 'src/modules/aggregates/practice-session/services/session.service.ts',
        errors: [
          {
            messageId: 'crossAggregateImport',
            data: {
              currentAggregate: 'practice-session',
              targetAggregate: 'goal',
            },
          },
        ],
      },
      // Invalid: Multiple cross-aggregate imports
      {
        code: `
          import { UserService } from '@/modules/aggregates/user/facade.service';
          import { GoalService } from '@/modules/aggregates/goal/facade.service';
        `,
        filename: 'src/modules/aggregates/practice-session/command.service.ts',
        errors: [
          {
            messageId: 'crossAggregateImport',
            data: {
              currentAggregate: 'practice-session',
              targetAggregate: 'user',
            },
          },
          {
            messageId: 'crossAggregateImport',
            data: {
              currentAggregate: 'practice-session',
              targetAggregate: 'goal',
            },
          },
        ],
      },
    ],
  });
});
