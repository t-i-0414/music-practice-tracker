import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'invalidCreateMethodName';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/music-practice-tracker/rules/${name}`);

const rule = createRule<[], MessageIds>({
  name: 'prisma-create-naming-convention',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce naming convention for Prisma create operations',
    },
    messages: {
      invalidCreateMethodName:
        'Prisma {{method}} method must be in a function named "{{expectedPrefix}}{{suffix}}". Current function: "{{functionName}}"',
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

    // Check if this is a Prisma create method call
    function isPrismaCreateMethod(node: TSESTree.MemberExpression): string | null {
      if (node.property.type !== AST_NODE_TYPES.Identifier) {
        return null;
      }

      // Check for create, createMany, or createManyAndReturn methods
      const methodName = node.property.name;
      if (methodName !== 'create' && methodName !== 'createMany' && methodName !== 'createManyAndReturn') {
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
            name.includes('repository') ||
            name.includes('prisma') ||
            name.includes('model') ||
            name.includes('service')
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

    // Extract suffix from function name (e.g., "User" from "createUser")
    function extractSuffix(functionName: string): string {
      // Common prefixes to remove
      const prefixes = ['createmanyandreturn', 'createmany', 'create', 'add', 'insert', 'new', 'make'];

      let remainingName = functionName;
      const lowerName = functionName.toLowerCase();

      for (const prefix of prefixes) {
        if (lowerName.startsWith(prefix)) {
          remainingName = functionName.substring(prefix.length);
          break;
        }
      }

      // If we have something left after removing prefix, use it
      if (remainingName && remainingName !== functionName) {
        return remainingName;
      }

      // Otherwise, try to extract from the end (e.g., "User" from "myCreateUser")
      const match = functionName.match(/([A-Z][a-zA-Z]+)s?$/);
      if (match) {
        return match[1];
      }

      return 'Entity';
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

      // Check for Prisma create calls
      CallExpression(node) {
        if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
          const methodName = isPrismaCreateMethod(node.callee);
          if (!methodName) {
            return;
          }

          const functionName = getCurrentFunctionName();
          if (!functionName) {
            return;
          }

          const functionNameLower = functionName.toLowerCase();

          // Function name should start with the method name
          if (!functionNameLower.startsWith(methodName.toLowerCase())) {
            context.report({
              node: node.callee,
              messageId: 'invalidCreateMethodName',
              data: {
                functionName,
                method: methodName,
                expectedPrefix: methodName,
              },
            });
          }
        }
      },
    };
  },
});

export = rule;
