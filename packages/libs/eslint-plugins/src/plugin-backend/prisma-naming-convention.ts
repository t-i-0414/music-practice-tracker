import { AST_NODE_TYPES, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

import {
  getFunctionNameExtended,
  isPrismaMethodCall,
  isPrismaFindMethod,
  isPrismaUpdateMethod,
  PRISMA_CREATE_METHODS,
  PRISMA_DELETE_METHODS,
} from './utils/prisma-helpers';

type MessageIds =
  | 'invalidCreateMethodName'
  | 'invalidFindMethodName'
  | 'invalidUpdateMethodName'
  | 'invalidDeleteMethodName';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/music-practice-tracker/rules/${name}`);

const rule = createRule<[], MessageIds>({
  name: 'prisma-naming-convention',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce naming conventions for all Prisma operations',
    },
    messages: {
      invalidCreateMethodName:
        'Prisma {{method}} method must be in a function that starts with "{{expectedPrefix}}". Current function: "{{functionName}}"',
      invalidFindMethodName:
        'Prisma {{method}} method must be in a function that starts with "{{expectedPrefix}}". Current function: "{{functionName}}"',
      invalidUpdateMethodName:
        'Prisma {{method}} method must be in a function that starts with "{{expectedPrefix}}". Current function: "{{functionName}}"',
      invalidDeleteMethodName:
        'Prisma {{method}} method must be in a function that starts with "{{expectedPrefix}}". Current function: "{{functionName}}"',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    // Stack to track current function names
    const functionStack: (string | null)[] = [];

    // Get the current function name
    const getCurrentFunctionName = (): string | null => functionStack[functionStack.length - 1] ?? null;

    // Helper functions for stack management
    const enterFunction = (name: string | null): void => {
      functionStack.push(name);
    };

    const exitFunction = (): void => {
      functionStack.pop();
    };

    // Extract function name from node
    const getFunctionNameFromNode = (
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression,
    ): string | null => {
      if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
        return node.id?.name || null;
      }
      return getFunctionNameExtended(node);
    };

    // Validate Prisma method call based on type
    const validatePrismaCall = (node: TSESTree.CallExpression): void => {
      if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
        return;
      }

      const functionName = getCurrentFunctionName();
      if (!functionName) {
        return;
      }

      const functionNameLower = functionName.toLowerCase();

      // Check for CREATE methods
      const createMethod = isPrismaMethodCall(node.callee, PRISMA_CREATE_METHODS);
      if (createMethod) {
        if (!functionNameLower.startsWith(createMethod.toLowerCase())) {
          context.report({
            node: node.callee,
            messageId: 'invalidCreateMethodName',
            data: {
              functionName,
              method: createMethod,
              expectedPrefix: createMethod,
            },
          });
        }
        return;
      }

      // Check for FIND methods
      if (isPrismaFindMethod(node.callee)) {
        const memberExp = node.callee;
        const method = (memberExp.property as TSESTree.Identifier).name;

        if (!functionNameLower.startsWith(method.toLowerCase())) {
          context.report({
            node: memberExp.property,
            messageId: 'invalidFindMethodName',
            data: {
              method,
              functionName,
              expectedPrefix: method,
            },
          });
        }
        return;
      }

      // Check for DELETE methods
      const deleteMethod = isPrismaMethodCall(node.callee, PRISMA_DELETE_METHODS);
      if (deleteMethod) {
        if (deleteMethod === 'delete') {
          if (!functionNameLower.startsWith('delete')) {
            context.report({
              node: node.callee,
              messageId: 'invalidDeleteMethodName',
              data: {
                functionName,
                method: deleteMethod,
                expectedPrefix: 'delete',
              },
            });
          }
        } else if (deleteMethod === 'deleteMany') {
          if (!functionNameLower.startsWith('deletemany')) {
            context.report({
              node: node.callee,
              messageId: 'invalidDeleteMethodName',
              data: {
                functionName,
                method: deleteMethod,
                expectedPrefix: 'deleteMany',
              },
            });
          }
        }
        return;
      }

      // Check for UPDATE methods
      const updateMethod = isPrismaUpdateMethod(node.callee);
      if (updateMethod) {
        if (!functionNameLower.startsWith(updateMethod.toLowerCase())) {
          context.report({
            node: node.callee,
            messageId: 'invalidUpdateMethodName',
            data: {
              functionName,
              method: updateMethod,
              expectedPrefix: updateMethod,
            },
          });
        }
      }
    };

    // Return visitor object
    return {
      // Track entering/exiting functions
      FunctionDeclaration: (node) => {
        enterFunction(getFunctionNameFromNode(node));
      },
      'FunctionDeclaration:exit': exitFunction,

      FunctionExpression: (node) => {
        enterFunction(getFunctionNameFromNode(node));
      },
      'FunctionExpression:exit': exitFunction,

      ArrowFunctionExpression: (node) => {
        enterFunction(getFunctionNameFromNode(node));
      },
      'ArrowFunctionExpression:exit': exitFunction,

      // Check for Prisma calls
      CallExpression: validatePrismaCall,
    };
  },
});

export default rule;
