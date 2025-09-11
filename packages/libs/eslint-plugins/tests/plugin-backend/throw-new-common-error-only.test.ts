import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/throw-new-common-error-only';

describe('throw-new-common-error-only', () => {
  const ruleTester = new RuleTester();

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('throw-new-common-error-only', rule, {
    valid: [
      // Allowed default CommonError-derived classes
      {
        code: `
          function a() { throw new ApiError('AP0401', 'Invalid'); }
          function b() { throw new DomainError('DO0001', 'Oops'); }
          function c() { throw new RepositoryError('RE0208', 'DB'); }
          function d() { throw new UnknownError('UN0001', 'X'); }
          function e() { throw new CommonError('CO0001', 'Base') as any; }
        `,
      },
      // Local multi-level inheritance chain is allowed
      {
        code: `
          class BaseErr {}
          class MidError extends CommonError<'CO0003'> {
            constructor(code: 'CO0003', detail: string) { super(code, detail); }
          }
          class FinalError extends MidError {}
          function ok() { throw new FinalError('CO0003', 'nested'); }
        `,
      },
      // MemberExpression super class name (e.g., ns.CommonError)
      {
        code: `
          const ns = { CommonError } as any;
          class LocalX extends ns.CommonError {
            constructor() { super('CO0004', 'x'); }
          }
          function t() { throw new LocalX(); }
        `,
      },
      // allowSubclasses disabled but explicitly allow a class by name
      {
        code: `
          class LocalServiceError extends CommonError<'CO0042'> {
            constructor() { super('CO0042', 'detail'); }
          }
          function svc() { throw new LocalServiceError(); }
        `,
        options: [
          { allowSubclasses: false, allowedClassNames: ['LocalServiceError'] },
        ],
      },
      // Local subclass of CommonError is allowed
      {
        code: `
          class LocalServiceError extends CommonError<'CO0002'> {
            constructor(code: 'CO0002', detail: string) { super(code, detail); }
          }
          function svc() { throw new LocalServiceError('CO0002', 'detail'); }
        `,
      },
      // Re-throwing existing error variable is ignored (not a NewExpression)
      {
        code: `
          try {
            doWork();
          } catch (err) {
            throw err; // allowed
          }
        `,
      },
      // Test files are skipped
      {
        code: `
          function t() { throw new Error('skip in spec'); }
        `,
        filename: 'src/foo/bar.spec.ts',
      },
      // Allow via options.allowedClassNames
      {
        code: `
          function x() { throw new ServiceError('CO0420', 'ok'); }
        `,
        options: [
          {
            allowedClassNames: ['ServiceError'],
          },
        ],
      },
    ],
    invalid: [
      // Built-in Error classes are rejected
      {
        code: `function x() { throw new Error('nope'); }`,
        errors: [{ messageId: 'onlyCommonError', data: { thrown: 'Error' } }],
      },
      // Local subclass when allowSubclasses=false (not on allowlist)
      {
        code: `
          class LocalServiceError extends CommonError<'CO0042'> {
            constructor() { super('CO0042', 'detail'); }
          }
          function svc() { throw new LocalServiceError(); }
        `,
        options: [
          { allowSubclasses: false },
        ],
        errors: [{ messageId: 'onlyCommonError', data: { thrown: 'LocalServiceError' } }],
      },
      // Unknown callee pattern (e.g., new (getCtor())()) should report with 'unknown'
      {
        code: `
          declare function getCtor(): any;
          function z() { throw new (getCtor())('x'); }
        `,
        errors: [{ messageId: 'onlyCommonError', data: { thrown: 'unknown' } }],
      },
      // ClassExpression as callee
      {
        code: `
          function f() { throw new (class extends Error {})('bad'); }
        `,
        errors: [{ messageId: 'onlyCommonError', data: { thrown: 'unknown' } }],
      },
      // superClass is MemberExpression with non-Identifier property (e.g., ns['CommonError'])
      {
        code: `
          const ns: any = {};
          class A extends ns['CommonError'] {}
          class B extends A {}
          function g() { throw new B('bad'); }
        `,
        errors: [{ messageId: 'onlyCommonError', data: { thrown: 'B' } }],
      },
      // superClass is a CallExpression (e.g., extends getBase()) → else branch
      {
        code: `
          declare function getBase(): any;
          class A extends getBase() {}
          function g() { throw new A('bad'); }
        `,
        errors: [{ messageId: 'onlyCommonError', data: { thrown: 'A' } }],
      },
      {
        code: `function x() { throw new TypeError('nope'); }`,
        errors: [{ messageId: 'onlyCommonError', data: { thrown: 'TypeError' } }],
      },
      // Local class not extending CommonError is rejected
      {
        code: `
          class LocalCustomError extends Error {}
          function y() { throw new LocalCustomError('x'); }
        `,
        errors: [{ messageId: 'onlyCommonError', data: { thrown: 'LocalCustomError' } }],
      },
      // Unknown external error name is rejected
      {
        code: `function z() { throw new ExternalError('x'); }`,
        errors: [{ messageId: 'onlyCommonError', data: { thrown: 'ExternalError' } }],
      },
      // Member expression callee
      {
        code: `function m() { throw new Some.Errors.CustomError('x'); }`,
        errors: [{ messageId: 'onlyCommonError', data: { thrown: 'CustomError' } }],
      },
    ],
  });
});
