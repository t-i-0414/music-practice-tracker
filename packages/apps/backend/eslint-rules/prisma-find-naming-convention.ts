import type { Rule } from 'eslint';
import type { CallExpression, Identifier, MemberExpression, Node, ObjectExpression, Property } from 'estree';

type FunctionNode = Node & {
  id?: Identifier | null;
  parent?: Node;
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce naming convention for Prisma find operations',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    messages: {
      invalidFindMethodName:
        'Prisma find method "{{method}}" must be in a function named "{{method}}(Active|Deleted|Any){{suffix}}". Current function: "{{functionName}}"',
      missingDeletedAtFilter:
        'Function "{{functionName}}" must include deletedAt filter. Use deletedAt: null for active, deletedAt: { not: null } for deleted',
      missingAnyIndicator:
        'Function "{{functionName}}" for "any" must include OR: [{ deletedAt: null }, { deletedAt: { not: null } }] as the last property in where clause',
      deletedAtNotLastInWhere: 'deletedAt or OR filter must be the last property in the where clause',
      incorrectDeletedAtValue:
        'Function "{{functionName}}" has incorrect deletedAt value. Expected {{expected}} but got {{actual}}',
    },
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    // Stack to track current function names
    const functionStack: (string | null)[] = [];

    // Get the current function name
    function getCurrentFunctionName(): string | null {
      return functionStack[functionStack.length - 1] || null;
    }

    // Check if this is a Prisma find method call
    function isPrismaFindMethod(node: Node): node is MemberExpression {
      if (node.type !== 'MemberExpression') {
        return false;
      }

      const property = node.property;
      if (!property || property.type !== 'Identifier') {
        return false;
      }

      // Check for find methods
      const findMethodNames = ['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany'];

      if (!findMethodNames.includes(property.name)) {
        return false;
      }

      // Try to trace back to see if this is a Prisma model
      let current: Node = node.object;
      while (current) {
        if (current.type === 'MemberExpression') {
          const memberExp = current as MemberExpression;
          const objectName =
            memberExp.object.type === 'Identifier'
              ? memberExp.object.name
              : memberExp.object.type === 'MemberExpression' && memberExp.object.property?.type === 'Identifier'
                ? memberExp.object.property.name
                : undefined;
          const propertyName = memberExp.property?.type === 'Identifier' ? memberExp.property.name : undefined;

          // Common Prisma patterns
          if (
            objectName === 'prisma' ||
            objectName === 'repository' ||
            objectName === 'this' ||
            propertyName === 'prisma' ||
            propertyName === 'repository'
          ) {
            return true;
          }
          current = memberExp.object;
        } else if (current.type === 'Identifier') {
          const name = current.name.toLowerCase();
          if (
            name.includes('repository') ||
            name.includes('prisma') ||
            name.includes('model') ||
            name.includes('service')
          ) {
            return true;
          }
          break;
        } else if (current.type === 'ThisExpression') {
          return true;
        } else {
          break;
        }
      }

      return false;
    }

    // Helper to get function name from parent nodes
    function getFunctionName(node: FunctionNode): string | null {
      let name = node.id?.name || null;

      if (!name && node.parent) {
        if (node.parent.type === 'VariableDeclarator' && node.parent.id?.type === 'Identifier') {
          name = node.parent.id.name;
        } else if (node.parent.type === 'Property' && node.parent.key?.type === 'Identifier') {
          name = node.parent.key.name;
        } else if (node.parent.type === 'MethodDefinition' && node.parent.key?.type === 'Identifier') {
          name = node.parent.key.name;
        }
      }

      return name;
    }

    // Check if function name follows the convention
    function validateFunctionName(functionName: string, method: string): 'active' | 'deleted' | 'any' | null {
      // Check if function starts with the find method name
      if (!functionName.startsWith(method)) {
        return null;
      }

      const suffix = functionName.slice(method.length);

      // Check for Active, Deleted, or Any
      if (suffix.startsWith('Active')) {
        return 'active';
      } else if (suffix.startsWith('Deleted')) {
        return 'deleted';
      } else if (suffix.startsWith('Any')) {
        return 'any';
      }

      return null;
    }

    // Check if where clause has correct deletedAt filter
    function checkWhereClause(node: CallExpression, expectedType: 'active' | 'deleted' | 'any'): boolean {
      if (!node.arguments[0] || node.arguments[0].type !== 'ObjectExpression') {
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

      const arg = node.arguments[0] as ObjectExpression;
      const whereProperty = arg.properties.find(
        (prop): prop is Property =>
          prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'where',
      );

      if (!whereProperty || whereProperty.value.type !== 'ObjectExpression') {
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

      const whereObject = whereProperty.value as ObjectExpression;

      if (expectedType === 'any') {
        // For 'any' type, check for OR clause
        const orIndex = whereObject.properties.findIndex(
          (prop): prop is Property =>
            prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'OR',
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
        (prop): prop is Property =>
          prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'deletedAt',
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
        case 'active':
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
          const deletedAtPropActive = whereObject.properties[deletedAtIndex] as Property;
          if (deletedAtPropActive.value.type !== 'Literal' || deletedAtPropActive.value.value !== null) {
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
        case 'deleted':
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
          const deletedAtPropDeleted = whereObject.properties[deletedAtIndex] as Property;
          if (deletedAtPropDeleted.value.type !== 'ObjectExpression') {
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
          const notProp = (deletedAtPropDeleted.value as ObjectExpression).properties.find(
            (prop): prop is Property =>
              prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'not',
          );
          if (!notProp || notProp.value.type !== 'Literal' || notProp.value.value !== null) {
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
        default:
          return false;
      }
    }

    return {
      // Track entering/exiting functions
      FunctionDeclaration(node: FunctionNode) {
        functionStack.push(node.id?.name || null);
      },
      'FunctionDeclaration:exit'() {
        functionStack.pop();
      },
      FunctionExpression(node: FunctionNode) {
        functionStack.push(getFunctionName(node));
      },
      'FunctionExpression:exit'() {
        functionStack.pop();
      },
      ArrowFunctionExpression(node: FunctionNode) {
        functionStack.push(getFunctionName(node));
      },
      'ArrowFunctionExpression:exit'() {
        functionStack.pop();
      },

      // Check for Prisma find calls
      CallExpression(node: CallExpression) {
        if (node.callee && isPrismaFindMethod(node.callee)) {
          const functionName = getCurrentFunctionName();
          if (!functionName) return; // Skip if not in a function

          const memberExp = node.callee as MemberExpression;
          const method = (memberExp.property as any).name;

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
};

export = rule;
