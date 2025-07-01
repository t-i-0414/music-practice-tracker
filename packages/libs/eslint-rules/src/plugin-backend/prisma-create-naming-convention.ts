import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

import { getFunctionName, isPrismaMethodCall, PRISMA_CREATE_METHODS } from './utils/prisma-helpers';

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
          const methodName = isPrismaMethodCall(node.callee, PRISMA_CREATE_METHODS);
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

export default rule;
