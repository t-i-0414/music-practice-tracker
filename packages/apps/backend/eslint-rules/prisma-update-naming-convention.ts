import type { Rule } from 'eslint';
import type { CallExpression, Identifier, MemberExpression, Node, ObjectExpression } from 'estree';

type FunctionNode = Node & {
  id?: Identifier | null;
  parent?: Node;
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce naming convention for Prisma update functions based on deletedAt field',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    messages: {
      updateShouldBeDelete:
        'Function "{{functionName}}" calls Prisma update with deletedAt: Date. It should be named starting with "delete"',
      updateShouldBeRestore:
        'Function "{{functionName}}" calls Prisma update with deletedAt: null. It should be named starting with "restore"',
      updateShouldBeUpdate:
        'Function "{{functionName}}" calls Prisma update without deletedAt. It should be named starting with "update"',
      deleteShouldHaveDeletedAt:
        'Function "{{functionName}}" starts with "delete" but doesn\'t set deletedAt to a Date value',
      restoreShouldHaveDeletedAtNull:
        'Function "{{functionName}}" starts with "restore" but doesn\'t set deletedAt to null',
      updateShouldNotHaveDeletedAt: 'Function "{{functionName}}" starts with "update" but includes deletedAt field',
    },
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    // Stack to track current function names
    const functionStack: (string | null)[] = [];

    // Get the current function name
    function getCurrentFunctionName(): string | null {
      return functionStack[functionStack.length - 1] || null;
    }

    // Check if this is a Prisma update method call
    function isPrismaUpdateMethod(node: Node): node is MemberExpression {
      if (node.type !== 'MemberExpression') {
        return false;
      }

      const property = node.property;
      if (!property || property.type !== 'Identifier') {
        return false;
      }

      // Check for update method
      if (property.name !== 'update') {
        return false;
      }

      // Try to trace back to see if this is a Prisma model
      let current: Node = node.object;
      while (current) {
        // Check for patterns like prisma.user, this.user, repository.user, etc.
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
          // Check if the identifier looks like a Prisma model (e.g., userRepository)
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
          // this.something.update()
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

    // Analyze the data object to find deletedAt field
    function analyzeDataObject(node: Node): 'delete' | 'restore' | 'update' | null {
      if (node.type !== 'ObjectExpression') {
        return null;
      }

      const objectExp = node as ObjectExpression;

      for (const property of objectExp.properties) {
        if (property.type === 'Property' && property.key.type === 'Identifier' && property.key.name === 'deletedAt') {
          const value = property.value;

          // Check if deletedAt is null
          if (value.type === 'Literal' && value.value === null) {
            return 'restore';
          }

          // Check if deletedAt is a Date (new Date() or Date value)
          if (value.type === 'NewExpression' && value.callee.type === 'Identifier' && value.callee.name === 'Date') {
            return 'delete';
          }

          // Check if it's a variable/expression that might be a Date
          if (value.type === 'Identifier' || value.type === 'MemberExpression') {
            // Assume it's a Date value for delete operation
            return 'delete';
          }
        }

        // Check for spread properties that might contain deletedAt
        if (property.type === 'SpreadElement') {
          // For now, we'll skip analysis of spread elements
          // This could be enhanced to track variables
        }
      }

      // No deletedAt field found
      return 'update';
    }

    // Find the data parameter in update call
    function findDataParameter(node: CallExpression): Node | null {
      if (node.arguments.length === 0) {
        return null;
      }

      const firstArg = node.arguments[0];
      if (firstArg.type === 'ObjectExpression') {
        // Look for data property
        const objectExp = firstArg as ObjectExpression;
        for (const property of objectExp.properties) {
          if (property.type === 'Property' && property.key.type === 'Identifier' && property.key.name === 'data') {
            return property.value;
          }
        }
      }

      return null;
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

      // Check for Prisma update calls
      CallExpression(node: CallExpression) {
        if (node.callee && isPrismaUpdateMethod(node.callee)) {
          const functionName = getCurrentFunctionName();

          if (!functionName) {
            // Skip validation if we can't determine the function name
            return;
          }

          const dataParam = findDataParameter(node);
          if (!dataParam) {
            // Skip if we can't find the data parameter
            return;
          }

          const expectedPrefix = analyzeDataObject(dataParam);
          if (!expectedPrefix) {
            // Skip if we can't analyze the data object
            return;
          }

          const functionNameLower = functionName.toLowerCase();

          // Check naming convention based on deletedAt usage
          if (expectedPrefix === 'delete') {
            if (!functionNameLower.startsWith('delete')) {
              context.report({
                node: node.callee,
                messageId: 'updateShouldBeDelete',
                data: { functionName },
              });
            }
          } else if (expectedPrefix === 'restore') {
            if (!functionNameLower.startsWith('restore')) {
              context.report({
                node: node.callee,
                messageId: 'updateShouldBeRestore',
                data: { functionName },
              });
            }
          } else if (expectedPrefix === 'update') {
            if (!functionNameLower.startsWith('update')) {
              context.report({
                node: node.callee,
                messageId: 'updateShouldBeUpdate',
                data: { functionName },
              });
            }
          }

          // Also check the reverse: if function name suggests an operation, verify the data matches
          if (functionNameLower.startsWith('delete') && expectedPrefix !== 'delete') {
            context.report({
              node: node.callee,
              messageId: 'deleteShouldHaveDeletedAt',
              data: { functionName },
            });
          } else if (functionNameLower.startsWith('restore') && expectedPrefix !== 'restore') {
            context.report({
              node: node.callee,
              messageId: 'restoreShouldHaveDeletedAtNull',
              data: { functionName },
            });
          } else if (functionNameLower.startsWith('update') && expectedPrefix !== 'update') {
            context.report({
              node: node.callee,
              messageId: 'updateShouldNotHaveDeletedAt',
              data: { functionName },
            });
          }
        }
      },
    };
  },
};

export = rule;
