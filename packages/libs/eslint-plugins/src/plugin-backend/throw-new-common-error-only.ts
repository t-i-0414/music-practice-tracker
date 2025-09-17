import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/types';
import { ESLintUtils } from '@typescript-eslint/utils';

type Options = [
  {
    baseClassName?: string;
    allowSubclasses?: boolean;
    allowedClassNames?: string[];
  }?,
];

type MessageIds = 'onlyCommonError';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/music-practice-tracker/eslint-plugins/blob/main/docs/${name}.md`,
);

const DEFAULT_ALLOWED = new Set(['CommonError', 'ApiError', 'DomainError', 'RepositoryError', 'UnknownError']);

const rule = createRule<Options, MessageIds>({
  name: 'throw-new-common-error-only',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that `throw new` constructs only CommonError or its subclasses',
    },
    messages: {
      onlyCommonError:
        'Thrown value must be CommonError or its subclass. Use CommonError-derived class instead of "{{thrown}}".',
    },
    schema: [
      {
        type: 'object',
        properties: {
          baseClassName: { type: 'string' },
          allowSubclasses: { type: 'boolean' },
          allowedClassNames: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const filename = context.filename || context.getFilename();

    // Skip test/spec files
    if (filename.includes('/tests/') || filename.includes('.test.') || filename.includes('.spec.')) {
      return {};
    }

    const baseClassName = options?.baseClassName ?? 'CommonError';
    const allowSubclasses = options?.allowSubclasses ?? true;
    const allowList = new Set([...(options?.allowedClassNames ?? []), ...DEFAULT_ALLOWED]);

    // Track local class inheritance (className -> superClassName)
    const extendsMap: Map<string, string | null> = new Map();
    // Collect throw-new nodes to evaluate after we scan classes
    const pendingThrows: { node: TSESTree.ThrowStatement; thrownName: string | null }[] = [];

    const isAllowedByLocalInheritance = (name: string): boolean => {
      if (!allowSubclasses) return false;

      // Follow the inheritance chain within this file
      let current: string | undefined = name;
      const visited: Set<string> = new Set();
      while (current && !visited.has(current)) {
        visited.add(current);
        // @ts-expect-error NOTE: Map.get can return undefined, but we want to distinguish "not found" and "found null"
        const superName = extendsMap.get(current) ?? null;
        if (superName === baseClassName) return true;
        current = superName ?? undefined;
      }
      return false;
    };

    const extractCalleeName = (expr: TSESTree.NewExpression): string | null => {
      const callee = expr.callee;
      if (callee.type === AST_NODE_TYPES.Identifier) return callee.name;
      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        if (callee.property.type === AST_NODE_TYPES.Identifier) return callee.property.name;
      }
      return null;
    };

    const checkAndReport = (node: TSESTree.ThrowStatement, thrownName: string | null) => {
      if (!thrownName) {
        // Unknown callee pattern; conservatively report
        context.report({ node, messageId: 'onlyCommonError', data: { thrown: 'unknown' } });
        return;
      }

      if (thrownName === baseClassName || allowList.has(thrownName) || isAllowedByLocalInheritance(thrownName)) {
        return; // allowed
      }

      context.report({ node, messageId: 'onlyCommonError', data: { thrown: thrownName } });
    };

    return {
      // Build inheritance map for local classes
      ClassDeclaration(node) {
        if (!node.id) return; // anonymous class
        const className = node.id.name;
        const superClass = node.superClass;
        if (!superClass) {
          extendsMap.set(className, null);
          return;
        }
        if (superClass.type === AST_NODE_TYPES.Identifier) {
          extendsMap.set(className, superClass.name);
        } else if (superClass.type === AST_NODE_TYPES.MemberExpression) {
          // e.g., Something.CommonError -> take property name
          if (superClass.property.type === AST_NODE_TYPES.Identifier) {
            extendsMap.set(className, superClass.property.name);
          } else {
            extendsMap.set(className, null);
          }
        } else {
          extendsMap.set(className, null);
        }
      },

      ThrowStatement(node) {
        if (node.argument?.type === AST_NODE_TYPES.NewExpression) {
          const thrownName = extractCalleeName(node.argument);
          pendingThrows.push({ node, thrownName });
        }
      },

      'Program:exit'() {
        for (const item of pendingThrows) {
          checkAndReport(item.node, item.thrownName);
        }
      },
    };
  },
});

export default rule;
