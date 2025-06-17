import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'invalidDeleteMethodName';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/music-practice-tracker/rules/${name}`);

const rule = createRule<[], MessageIds>({
  name: 'prisma-delete-naming-convention',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce naming convention for Prisma delete operations',
    },
    messages: {
      invalidDeleteMethodName:
        'Prisma {{method}} method must be in a function named "{{expectedPrefix}}*". Current function: "{{functionName}}"',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    // Stack to track current function names
    const functionStack: string[] = [];

    // Get the current function name
    function getCurrentFunctionName(): string | null {
      return functionStack[functionStack.length - 1] || null;
    }

    // Check if this is a Prisma delete method call
    function isPrismaDeleteMethod(node: TSESTree.MemberExpression): string | null {
      if (node.property.type !== AST_NODE_TYPES.Identifier) {
        return null;
      }

      // Check for delete or deleteMany methods
      const methodName = node.property.name;
      if (methodName !== 'delete' && methodName !== 'deleteMany') {
        return null;
      }

      // Try to trace back to see if this is a Prisma model
      let current: TSESTree.Node = node.object;
      while (current) {
        if (current.type === AST_NODE_TYPES.MemberExpression) {
          const objectName =
            current.object.type === AST_NODE_TYPES.Identifier
              ? current.object.name
              : current.object.type === AST_NODE_TYPES.MemberExpression &&
                  current.object.property.type === AST_NODE_TYPES.Identifier
                ? current.object.property.name
                : undefined;
          const propertyName = current.property.type === AST_NODE_TYPES.Identifier ? current.property.name : undefined;

          // Common Prisma patterns
          if (
            objectName === 'prisma' ||
            objectName === 'repository' ||
            objectName === 'this' ||
            propertyName === 'prisma' ||
            propertyName === 'repository'
          ) {
            return methodName;
          }
          current = current.object;
        } else if (current.type === AST_NODE_TYPES.Identifier) {
          const name = current.name.toLowerCase();
          if (
            name === 'repository' ||
            name === 'prisma' ||
            name.endsWith('repository') ||
            name.endsWith('model')
          ) {
            return methodName;
          }
          break;
        } else if (current.type === AST_NODE_TYPES.ThisExpression) {
          return methodName;
        } else {
          break;
        }
      }

      return null;
    }

    // Helper to get function name from parent nodes
    function getFunctionName(node: TSESTree.Node): string | null {
      if (node.type === AST_NODE_TYPES.FunctionDeclaration && node.id) {
        return node.id.name;
      }

      if (node.parent) {
        if (
          node.parent.type === AST_NODE_TYPES.VariableDeclarator &&
          node.parent.id?.type === AST_NODE_TYPES.Identifier
        ) {
          return node.parent.id.name;
        } else if (
          node.parent.type === AST_NODE_TYPES.Property &&
          node.parent.key?.type === AST_NODE_TYPES.Identifier
        ) {
          return node.parent.key.name;
        } else if (
          node.parent.type === AST_NODE_TYPES.MethodDefinition &&
          node.parent.key?.type === AST_NODE_TYPES.Identifier
        ) {
          return node.parent.key.name;
        }
      }

      return null;
    }

    return {
      // Track entering/exiting functions
      FunctionDeclaration(node) {
        const name = getFunctionName(node);
        if (name) functionStack.push(name);
      },
      'FunctionDeclaration:exit'() {
        functionStack.pop();
      },
      FunctionExpression(node) {
        const name = getFunctionName(node);
        if (name) functionStack.push(name);
      },
      'FunctionExpression:exit'() {
        functionStack.pop();
      },
      ArrowFunctionExpression(node) {
        const name = getFunctionName(node);
        if (name) functionStack.push(name);
      },
      'ArrowFunctionExpression:exit'() {
        functionStack.pop();
      },

      // Check for Prisma delete calls
      CallExpression(node) {
        if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
          const methodName = isPrismaDeleteMethod(node.callee);
          if (!methodName) {
            return;
          }

          const functionName = getCurrentFunctionName();
          if (!functionName) {
            return;
          }

          const functionNameLower = functionName.toLowerCase();

          // For Prisma's delete/deleteMany, function should start with "hardDelete"
          if (methodName === 'delete') {
            if (!functionNameLower.startsWith('harddelete')) {
              context.report({
                node: node.callee,
                messageId: 'invalidDeleteMethodName',
                data: {
                  functionName,
                  method: methodName,
                  expectedPrefix: 'hardDelete',
                },
              });
            }
          }

          if (methodName === 'deleteMany') {
            if (!functionNameLower.startsWith('harddeletemany')) {
              context.report({
                node: node.callee,
                messageId: 'invalidDeleteMethodName',
                data: {
                  functionName,
                  method: methodName,
                  expectedPrefix: 'hardDeleteMany',
                },
              });
            }
          }
        }
      },
    };
  },
});

export default rule;
