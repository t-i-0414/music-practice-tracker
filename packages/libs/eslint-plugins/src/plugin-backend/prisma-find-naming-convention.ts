import { AST_NODE_TYPES, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

import { getFunctionNameExtended, isPrismaFindMethod } from './utils/prisma-helpers';

type MessageIds =
  | 'invalidFindMethodName'
  | 'missingDeletedAtFilter'
  | 'missingSuspendedAtFilter'
  | 'missingAnyIndicator'
  | 'deletedAtNotLastInWhere'
  | 'suspendedAtNotLastInWhere'
  | 'incorrectDeletedAtValue'
  | 'incorrectSuspendedAtValue';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/music-practice-tracker/rules/${name}`);

const rule = createRule<[], MessageIds>({
  name: 'prisma-find-naming-convention',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce naming convention for Prisma find operations',
    },
    messages: {
      invalidFindMethodName:
        'Prisma find method "{{method}}" must be in a function named "{{method}}(Active|Deleted|Suspended|Any)[suffix]". Current function: "{{functionName}}"',
      missingDeletedAtFilter:
        'Function "{{functionName}}" must include deletedAt filter. Use deletedAt: null for active, deletedAt: { not: null } for deleted',
      missingSuspendedAtFilter:
        'Function "{{functionName}}" must include suspendedAt filter. Use suspendedAt: { not: null } for suspended users',
      missingAnyIndicator:
        'Function "{{functionName}}" for "any" must include OR: [{ deletedAt: null }, { deletedAt: { not: null } }] as the last property in where clause',
      deletedAtNotLastInWhere: 'deletedAt or OR filter must be the last property in the where clause',
      suspendedAtNotLastInWhere: 'suspendedAt must be the last property in the where clause',
      incorrectDeletedAtValue:
        'Function "{{functionName}}" has incorrect deletedAt value. Expected {{expected}} but got {{actual}}',
      incorrectSuspendedAtValue:
        'Function "{{functionName}}" has incorrect suspendedAt value. Expected { not: null } but got {{actual}}',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    // Stack to track current function names
    const functionStack: (string | null)[] = [];

    // Get the current function name
    function getCurrentFunctionName(): string | null {
      return functionStack[functionStack.length - 1] || null;
    }

    // Check if function name follows the convention
    function validateFunctionName(
      functionName: string,
      method: string,
    ): 'active' | 'deleted' | 'suspended' | 'any' | null {
      // Case-insensitive check if function starts with the find method name
      if (!functionName.toLowerCase().startsWith(method.toLowerCase())) {
        return null;
      }

      const suffix = functionName.slice(method.length);

      // Check for Active, Deleted, or Any (case-insensitive)
      const suffixLower = suffix.toLowerCase();
      if (suffixLower.startsWith('active')) {
        return 'active';
      } else if (suffixLower.startsWith('deleted')) {
        return 'deleted';
      } else if (suffixLower.startsWith('suspended')) {
        return 'suspended';
      } else if (suffixLower.startsWith('any')) {
        return 'any';
      }

      return null;
    }

    // Check if where clause has correct deletedAt filter
    function checkWhereClause(
      node: TSESTree.CallExpression,
      expectedType: 'active' | 'deleted' | 'suspended' | 'any',
    ): boolean {
      if (!node.arguments[0] || node.arguments[0].type !== AST_NODE_TYPES.ObjectExpression) {
        // Any types need a where clause
        if (expectedType === 'any') {
          context.report({
            node,
            messageId: 'missingAnyIndicator',
            data: {
              functionName: getCurrentFunctionName() || 'unknown',
            },
          });
        }
        return false;
      }

      const arg = node.arguments[0];
      const whereProperty = arg.properties.find(
        (prop): prop is TSESTree.Property =>
          prop.type === AST_NODE_TYPES.Property &&
          prop.key.type === AST_NODE_TYPES.Identifier &&
          prop.key.name === 'where',
      );

      if (!whereProperty || whereProperty.value.type !== AST_NODE_TYPES.ObjectExpression) {
        if (expectedType === 'any') {
          context.report({
            node: arg,
            messageId: 'missingAnyIndicator',
            data: {
              functionName: getCurrentFunctionName() || 'unknown',
            },
          });
          return false;
        }
        return expectedType !== 'active' && expectedType !== 'deleted' && expectedType !== 'suspended';
      }

      const whereObject = whereProperty.value;

      if (expectedType === 'any') {
        // For 'any' type, check for OR clause
        const orIndex = whereObject.properties.findIndex(
          (prop): prop is TSESTree.Property =>
            prop.type === AST_NODE_TYPES.Property &&
            prop.key.type === AST_NODE_TYPES.Identifier &&
            prop.key.name === 'OR',
        );

        if (orIndex === -1) {
          context.report({
            node: whereObject,
            messageId: 'missingAnyIndicator',
            data: {
              functionName: getCurrentFunctionName() || 'unknown',
            },
          });
          return false;
        }

        // Check if OR is last
        if (orIndex !== whereObject.properties.length - 1) {
          context.report({
            node: whereObject.properties[orIndex],
            messageId: 'deletedAtNotLastInWhere',
          });
          return false;
        }

        // TODO: Could add more specific validation of OR array contents
        return true;
      }

      // For active/deleted/suspended types
      const deletedAtIndex = whereObject.properties.findIndex(
        (prop): prop is TSESTree.Property =>
          prop.type === AST_NODE_TYPES.Property &&
          prop.key.type === AST_NODE_TYPES.Identifier &&
          prop.key.name === 'deletedAt',
      );

      const suspendedAtIndex = whereObject.properties.findIndex(
        (prop): prop is TSESTree.Property =>
          prop.type === AST_NODE_TYPES.Property &&
          prop.key.type === AST_NODE_TYPES.Identifier &&
          prop.key.name === 'suspendedAt',
      );

      // Check if deletedAt exists and is last
      if (deletedAtIndex !== -1 && deletedAtIndex !== whereObject.properties.length - 1) {
        context.report({
          node: whereObject.properties[deletedAtIndex],
          messageId: 'deletedAtNotLastInWhere',
        });
        return false;
      }

      // Check if suspendedAt exists and is last
      if (suspendedAtIndex !== -1 && suspendedAtIndex !== whereObject.properties.length - 1) {
        context.report({
          node: whereObject.properties[suspendedAtIndex],
          messageId: 'suspendedAtNotLastInWhere',
        });
        return false;
      }

      switch (expectedType) {
        case 'active': {
          // Should have deletedAt: null
          if (deletedAtIndex === -1) {
            context.report({
              node: whereObject,
              messageId: 'missingDeletedAtFilter',
              data: {
                functionName: getCurrentFunctionName() || 'unknown',
              },
            });
            return false;
          }
          // Check if deletedAt value is null
          const deletedAtPropActive = whereObject.properties[deletedAtIndex] as TSESTree.Property;
          if (deletedAtPropActive.value.type !== AST_NODE_TYPES.Literal || deletedAtPropActive.value.value !== null) {
            context.report({
              node: deletedAtPropActive,
              messageId: 'incorrectDeletedAtValue',
              data: {
                functionName: getCurrentFunctionName() || 'unknown',
                expected: 'null',
                actual: 'not null',
              },
            });
            return false;
          }
          return true;
        }
        case 'deleted': {
          // Should have deletedAt: { not: null }
          if (deletedAtIndex === -1) {
            context.report({
              node: whereObject,
              messageId: 'missingDeletedAtFilter',
              data: {
                functionName: getCurrentFunctionName() || 'unknown',
              },
            });
            return false;
          }
          // Check if deletedAt value is { not: null }
          const deletedAtPropDeleted = whereObject.properties[deletedAtIndex] as TSESTree.Property;
          if (deletedAtPropDeleted.value.type !== AST_NODE_TYPES.ObjectExpression) {
            context.report({
              node: deletedAtPropDeleted,
              messageId: 'incorrectDeletedAtValue',
              data: {
                functionName: getCurrentFunctionName() || 'unknown',
                expected: '{ not: null }',
                actual: 'null',
              },
            });
            return false;
          }
          // Check if it has { not: null } structure
          const notProp = deletedAtPropDeleted.value.properties.find(
            (prop): prop is TSESTree.Property =>
              prop.type === AST_NODE_TYPES.Property &&
              prop.key.type === AST_NODE_TYPES.Identifier &&
              prop.key.name === 'not',
          );
          if (!notProp || notProp.value.type !== AST_NODE_TYPES.Literal || notProp.value.value !== null) {
            context.report({
              node: deletedAtPropDeleted,
              messageId: 'incorrectDeletedAtValue',
              data: {
                functionName: getCurrentFunctionName() || 'unknown',
                expected: '{ not: null }',
                actual: 'incorrect structure',
              },
            });
            return false;
          }
          return true;
        }
        case 'suspended': {
          // Should have suspendedAt: { not: null }
          if (suspendedAtIndex === -1) {
            context.report({
              node: whereObject,
              messageId: 'missingSuspendedAtFilter',
              data: {
                functionName: getCurrentFunctionName() || 'unknown',
              },
            });
            return false;
          }
          // Check if suspendedAt value is { not: null }
          const suspendedAtProp = whereObject.properties[suspendedAtIndex] as TSESTree.Property;
          if (suspendedAtProp.value.type !== AST_NODE_TYPES.ObjectExpression) {
            context.report({
              node: suspendedAtProp,
              messageId: 'incorrectSuspendedAtValue',
              data: {
                functionName: getCurrentFunctionName() || 'unknown',
                actual: 'null',
              },
            });
            return false;
          }
          // Check if it has { not: null } structure
          const notProp = suspendedAtProp.value.properties.find(
            (prop): prop is TSESTree.Property =>
              prop.type === AST_NODE_TYPES.Property &&
              prop.key.type === AST_NODE_TYPES.Identifier &&
              prop.key.name === 'not',
          );
          if (!notProp || notProp.value.type !== AST_NODE_TYPES.Literal || notProp.value.value !== null) {
            context.report({
              node: suspendedAtProp,
              messageId: 'incorrectSuspendedAtValue',
              data: {
                functionName: getCurrentFunctionName() || 'unknown',
                actual: 'incorrect structure',
              },
            });
            return false;
          }
          return true;
        }
        default:
          return false;
      }
    }

    return {
      // Track entering/exiting functions
      FunctionDeclaration(node) {
        functionStack.push(node.id?.name || null);
      },
      'FunctionDeclaration:exit'() {
        functionStack.pop();
      },
      FunctionExpression(node) {
        functionStack.push(getFunctionNameExtended(node));
      },
      'FunctionExpression:exit'() {
        functionStack.pop();
      },
      ArrowFunctionExpression(node) {
        functionStack.push(getFunctionNameExtended(node));
      },
      'ArrowFunctionExpression:exit'() {
        functionStack.pop();
      },

      // Check for Prisma find calls
      CallExpression(node) {
        if (node.callee && isPrismaFindMethod(node.callee)) {
          const functionName = getCurrentFunctionName();
          if (!functionName) return; // Skip if not in a function

          const memberExp = node.callee;
          const method = (memberExp.property as TSESTree.Identifier).name;

          // Validate function name
          const type = validateFunctionName(functionName, method);
          if (!type) {
            context.report({
              node: memberExp.property,
              messageId: 'invalidFindMethodName',
              data: {
                method,
                functionName,
              },
            });
            return;
          }

          // Check where clause
          checkWhereClause(node, type);
        }
      },
    };
  },
});

export default rule;
