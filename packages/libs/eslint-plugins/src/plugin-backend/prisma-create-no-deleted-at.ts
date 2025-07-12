import { AST_NODE_TYPES, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

import { isPrismaMethodCall, PRISMA_CREATE_METHODS } from './utils/prisma-helpers';

type MessageIds = 'createShouldNotHaveDeletedAt';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/music-practice-tracker/rules/${name}`);

const rule = createRule<[], MessageIds>({
  name: 'prisma-create-no-deleted-at',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent deletedAt field in Prisma create operations',
    },
    messages: {
      createShouldNotHaveDeletedAt: 'Prisma create operations should not include deletedAt field',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    // Check if data contains deletedAt in object literal
    function checkObjectForDeletedAt(node: TSESTree.ObjectExpression): boolean {
      for (const property of node.properties) {
        if (
          property.type === AST_NODE_TYPES.Property &&
          property.key.type === AST_NODE_TYPES.Identifier &&
          property.key.name === 'deletedAt'
        ) {
          return true;
        }
      }
      return false;
    }

    // Check if array contains objects with deletedAt
    function checkArrayForDeletedAt(node: TSESTree.ArrayExpression): boolean {
      for (const element of node.elements) {
        if (element && element.type === AST_NODE_TYPES.ObjectExpression && checkObjectForDeletedAt(element)) {
          return true;
        }
      }
      return false;
    }

    // Find the data parameter in create call
    function findDataParameter(node: TSESTree.CallExpression): TSESTree.Expression | null {
      if (node.arguments.length === 0) {
        return null;
      }

      const firstArg = node.arguments[0];

      // Pattern: create({ data: ... })
      if (firstArg.type === AST_NODE_TYPES.ObjectExpression) {
        for (const property of firstArg.properties) {
          if (
            property.type === AST_NODE_TYPES.Property &&
            property.key.type === AST_NODE_TYPES.Identifier &&
            property.key.name === 'data'
          ) {
            return property.value as TSESTree.Expression;
          }
        }
      }

      return null;
    }

    return {
      // Check for Prisma create calls
      CallExpression(node) {
        if (
          node.callee.type === AST_NODE_TYPES.MemberExpression &&
          isPrismaMethodCall(node.callee, PRISMA_CREATE_METHODS)
        ) {
          const dataParam = findDataParameter(node);
          if (!dataParam) {
            return;
          }

          let hasDeletedAt = false;

          // Check object literal
          if (dataParam.type === AST_NODE_TYPES.ObjectExpression) {
            hasDeletedAt = checkObjectForDeletedAt(dataParam);
          }
          // Check array literal
          else if (dataParam.type === AST_NODE_TYPES.ArrayExpression) {
            hasDeletedAt = checkArrayForDeletedAt(dataParam);
          }

          if (hasDeletedAt) {
            context.report({
              node: node.callee,
              messageId: 'createShouldNotHaveDeletedAt',
            });
          }
        }
      },
    };
  },
});

export default rule;
