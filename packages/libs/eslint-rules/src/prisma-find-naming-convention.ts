import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

type MessageIds =
  | 'invalidFindMethodName'
  | 'missingDeletedAtFilter'
  | 'missingAnyIndicator'
  | 'deletedAtNotLastInWhere'
  | 'incorrectDeletedAtValue';

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
        'Prisma find method "{{method}}" must be in a function named "{{method}}(Active|Deleted|Any)[suffix]". Current function: "{{functionName}}"',
      missingDeletedAtFilter:
        'Function "{{functionName}}" must include deletedAt filter. Use deletedAt: null for active, deletedAt: { not: null } for deleted',
      missingAnyIndicator:
        'Function "{{functionName}}" for "any" must include OR: [{ deletedAt: null }, { deletedAt: { not: null } }] as the last property in where clause',
      deletedAtNotLastInWhere: 'deletedAt or OR filter must be the last property in the where clause',
      incorrectDeletedAtValue:
        'Function "{{functionName}}" has incorrect deletedAt value. Expected {{expected}} but got {{actual}}',
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

    // Check if this is a Prisma find method call
    function isPrismaFindMethod(node: TSESTree.Node): node is TSESTree.MemberExpression {
      if (node.type !== AST_NODE_TYPES.MemberExpression) {
        return false;
      }

      const property = node.property;
      if (!property || property.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }

      // Check for find methods
      const findMethodNames = ['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany'];

      if (!findMethodNames.includes(property.name)) {
        return false;
      }

      // Try to trace back to see if this is a Prisma model
      let current: TSESTree.Node = node.object;
      let foundPrismaIndicator = false;

      while (current) {
        if (current.type === AST_NODE_TYPES.MemberExpression) {
          const memberExp = current as TSESTree.MemberExpression;
          const objectName =
            memberExp.object.type === AST_NODE_TYPES.Identifier
              ? memberExp.object.name
              : memberExp.object.type === AST_NODE_TYPES.MemberExpression && memberExp.object.property?.type === AST_NODE_TYPES.Identifier
                ? memberExp.object.property.name
                : undefined;
          const propertyName = memberExp.property?.type === AST_NODE_TYPES.Identifier ? memberExp.property.name : undefined;

          // Common Prisma patterns
          if (
            objectName === 'prisma' ||
            objectName === 'repository' ||
            objectName === 'this' ||
            propertyName === 'prisma' ||
            propertyName === 'repository'
          ) {
            foundPrismaIndicator = true;
            break;
          }

          // Check if it's explicitly NOT a Prisma service
          if (objectName && objectName !== 'this') {
            const lowerName = objectName.toLowerCase();
            if (lowerName.includes('prisma') || lowerName.includes('repository') || lowerName.includes('model')) {
              foundPrismaIndicator = true;
              break;
            }
          }
          current = memberExp.object;
        } else if (current.type === AST_NODE_TYPES.Identifier) {
          const name = current.name.toLowerCase();
          if (
            name === 'prisma' ||
            name === 'repository' ||
            name.includes('prisma') ||
            name.includes('repository') ||
            name.includes('model')
          ) {
            foundPrismaIndicator = true;
          }
          break;
        } else if (current.type === AST_NODE_TYPES.ThisExpression) {
          foundPrismaIndicator = true;
          break;
        } else {
          break;
        }
      }

      return foundPrismaIndicator;
    }

    // Helper to get function name from parent nodes
    function getFunctionName(node: TSESTree.Node & { id?: TSESTree.Identifier | null; parent?: TSESTree.Node }): string | null {
      let name = node.id?.name || null;

      if (!name && node.parent) {
        if (node.parent.type === AST_NODE_TYPES.VariableDeclarator && node.parent.id?.type === AST_NODE_TYPES.Identifier) {
          name = node.parent.id.name;
        } else if (node.parent.type === AST_NODE_TYPES.Property && node.parent.key?.type === AST_NODE_TYPES.Identifier) {
          name = node.parent.key.name;
        } else if (node.parent.type === AST_NODE_TYPES.MethodDefinition && node.parent.key?.type === AST_NODE_TYPES.Identifier) {
          name = node.parent.key.name;
        }
      }

      return name;
    }

    // Check if function name follows the convention
    function validateFunctionName(functionName: string, method: string): 'active' | 'deleted' | 'any' | null {
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
      } else if (suffixLower.startsWith('any')) {
        return 'any';
      }

      return null;
    }

    // Check if where clause has correct deletedAt filter
    function checkWhereClause(node: TSESTree.CallExpression, expectedType: 'active' | 'deleted' | 'any'): boolean {
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

      const arg = node.arguments[0] as TSESTree.ObjectExpression;
      const whereProperty = arg.properties.find(
        (prop): prop is TSESTree.Property =>
          prop.type === AST_NODE_TYPES.Property && prop.key.type === AST_NODE_TYPES.Identifier && prop.key.name === 'where',
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
        return expectedType !== 'active' && expectedType !== 'deleted';
      }

      const whereObject = whereProperty.value as TSESTree.ObjectExpression;

      if (expectedType === 'any') {
        // For 'any' type, check for OR clause
        const orIndex = whereObject.properties.findIndex(
          (prop): prop is TSESTree.Property =>
            prop.type === AST_NODE_TYPES.Property && prop.key.type === AST_NODE_TYPES.Identifier && prop.key.name === 'OR',
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

      // For active/deleted types
      const deletedAtIndex = whereObject.properties.findIndex(
        (prop): prop is TSESTree.Property =>
          prop.type === AST_NODE_TYPES.Property && prop.key.type === AST_NODE_TYPES.Identifier && prop.key.name === 'deletedAt',
      );

      // Check if deletedAt exists and is last
      if (deletedAtIndex !== -1 && deletedAtIndex !== whereObject.properties.length - 1) {
        context.report({
          node: whereObject.properties[deletedAtIndex],
          messageId: 'deletedAtNotLastInWhere',
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
          const notProp = (deletedAtPropDeleted.value as TSESTree.ObjectExpression).properties.find(
            (prop): prop is TSESTree.Property =>
              prop.type === AST_NODE_TYPES.Property && prop.key.type === AST_NODE_TYPES.Identifier && prop.key.name === 'not',
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
        functionStack.push(getFunctionName(node));
      },
      'FunctionExpression:exit'() {
        functionStack.pop();
      },
      ArrowFunctionExpression(node) {
        functionStack.push(getFunctionName(node));
      },
      'ArrowFunctionExpression:exit'() {
        functionStack.pop();
      },

      // Check for Prisma find calls
      CallExpression(node) {
        if (node.callee && isPrismaFindMethod(node.callee)) {
          const functionName = getCurrentFunctionName();
          if (!functionName) return; // Skip if not in a function

          const memberExp = node.callee as TSESTree.MemberExpression;
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
