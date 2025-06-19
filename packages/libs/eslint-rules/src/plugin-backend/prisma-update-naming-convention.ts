import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';
import { getFunctionName, isPrismaUpdateMethod } from './utils/prisma-helpers';

type MessageIds =
  | 'invalidUpdateMethodName'
  | 'deleteShouldHaveDeletedAt'
  | 'restoreShouldHaveDeletedAtNull'
  | 'updateShouldNotHaveDeletedAt';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/music-practice-tracker/rules/${name}`);

const rule = createRule<[], MessageIds>({
  name: 'prisma-update-naming-convention',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce naming convention for Prisma update functions based on deletedAt field',
    },
    messages: {
      invalidUpdateMethodName:
        'Prisma {{method}} method {{operation}} must be in a function named "{{expectedPrefix}}*". Current function: "{{functionName}}"',
      deleteShouldHaveDeletedAt:
        'Function "{{functionName}}" starts with "delete" but doesn\'t set deletedAt to a Date value',
      restoreShouldHaveDeletedAtNull:
        'Function "{{functionName}}" starts with "restore" but doesn\'t set deletedAt to null',
      updateShouldNotHaveDeletedAt: 'Function "{{functionName}}" starts with "update" but includes deletedAt field',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    // Stack to track current function names
    const functionStack: string[] = [];

    // Get the current function name
    function getCurrentFunctionName(): string | null {
      return functionStack[functionStack.length - 1] || null;
    }

    // Check if a type has deletedAt property
    function typeHasDeletedAt(type: ts.Type): boolean {
      if (type.isUnion()) {
        return type.types.some((t) => typeHasDeletedAt(t));
      }

      if (type.symbol && type.symbol.declarations) {
        for (const declaration of type.symbol.declarations) {
          if (ts.isTypeLiteralNode(declaration) || ts.isInterfaceDeclaration(declaration)) {
            const members = ts.isTypeLiteralNode(declaration) ? declaration.members : declaration.members;
            for (const member of members) {
              if (
                ts.isPropertySignature(member) &&
                member.name &&
                ts.isIdentifier(member.name) &&
                member.name.text === 'deletedAt'
              ) {
                return true;
              }
            }
          }
        }
      }

      // Check for properties on the type
      const deletedAtSymbol = type.getProperty('deletedAt');
      return deletedAtSymbol !== undefined;
    }

    // Analyze the data object to find deletedAt field
    function analyzeDataObject(node: TSESTree.Expression): 'delete' | 'restore' | 'update' | 'unknown' | null {
      // Handle MemberExpression like params.data
      if (node.type === AST_NODE_TYPES.MemberExpression || node.type === AST_NODE_TYPES.Identifier) {
        // Get TypeScript node and check type
        const tsNode = services.esTreeNodeToTSNodeMap.get(node);
        if (tsNode) {
          const type = checker.getTypeAtLocation(tsNode);
          if (typeHasDeletedAt(type)) {
            return 'unknown'; // Can't determine exact usage without analyzing the value
          } else {
            return 'update'; // Type doesn't have deletedAt
          }
        }
        return 'unknown';
      }

      if (node.type !== AST_NODE_TYPES.ObjectExpression) {
        return null;
      }

      let hasSpreadFromParam = false;
      let spreadParamOmitsDeletedAt = false;

      for (const property of node.properties) {
        if (
          property.type === AST_NODE_TYPES.Property &&
          property.key.type === AST_NODE_TYPES.Identifier &&
          property.key.name === 'deletedAt'
        ) {
          const value = property.value;

          // Check if deletedAt is null
          if (value.type === AST_NODE_TYPES.Literal && value.value === null) {
            return 'restore';
          }

          // Check if deletedAt is a Date
          if (
            value.type === AST_NODE_TYPES.NewExpression &&
            value.callee.type === AST_NODE_TYPES.Identifier &&
            value.callee.name === 'Date'
          ) {
            return 'delete';
          }

          // Check if it's a variable/expression that might be a Date
          if (value.type === AST_NODE_TYPES.Identifier || value.type === AST_NODE_TYPES.MemberExpression) {
            return 'delete';
          }
        }

        // Check for spread properties that might contain deletedAt
        if (property.type === AST_NODE_TYPES.SpreadElement) {
          hasSpreadFromParam = true;

          // Get TypeScript node and check type
          const tsNode = services.esTreeNodeToTSNodeMap.get(property.argument);
          if (tsNode) {
            // Check if the type being spread explicitly omits deletedAt
            const type = checker.getTypeAtLocation(tsNode);
            if (!typeHasDeletedAt(type)) {
              spreadParamOmitsDeletedAt = true;
            } else {
              // Type has deletedAt, so it might be included
              return 'unknown';
            }
          }
        }
      }

      // If we have spread from params but they all omit deletedAt, it's safe
      if (hasSpreadFromParam && spreadParamOmitsDeletedAt) {
        return 'update';
      }

      // If we have spread but couldn't determine the type, return unknown
      if (hasSpreadFromParam) {
        return 'unknown';
      }

      // No deletedAt field found
      return 'update';
    }

    // Find the data parameter in update call
    function findDataParameter(node: TSESTree.CallExpression): TSESTree.Expression | null {
      if (node.arguments.length === 0) {
        return null;
      }

      const firstArg = node.arguments[0];
      if (firstArg.type === AST_NODE_TYPES.ObjectExpression) {
        // Look for data property in the first argument
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

      // For updateMany/updateManyAndReturn, check different patterns
      // Pattern 1: updateManyAndReturn({ where: ..., data: ... })
      // Already handled above

      // Pattern 2: updateMany({ where: ... }, { deletedAt: ... })
      if (node.arguments.length >= 2) {
        const secondArg = node.arguments[1];
        if (secondArg.type === AST_NODE_TYPES.ObjectExpression) {
          // Check if this is the data object directly
          return secondArg;
        }
      }

      // Pattern 3: updateManyAndReturn({ where: params.where, data: params.data })
      // Check if any data property references a variable
      if (firstArg.type === AST_NODE_TYPES.ObjectExpression) {
        for (const property of firstArg.properties) {
          if (
            property.type === AST_NODE_TYPES.Property &&
            property.key.type === AST_NODE_TYPES.Identifier &&
            property.key.name === 'data'
          ) {
            // Return the value even if it's a member expression like params.data
            return property.value as TSESTree.Expression;
          }
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

      // Check for Prisma update calls
      CallExpression(node) {
        if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
          const methodName = isPrismaUpdateMethod(node.callee);
          if (!methodName) {
            return;
          }

          const functionName = getCurrentFunctionName();

          if (!functionName) {
            return;
          }

          const dataParam = findDataParameter(node);
          if (!dataParam) {
            return;
          }

          const expectedPrefix = analyzeDataObject(dataParam);
          if (!expectedPrefix) {
            return;
          }

          const functionNameLower = functionName.toLowerCase();

          // If we detected that the data might contain deletedAt from parameters, report a warning
          if (expectedPrefix === 'unknown') {
            if (functionNameLower.startsWith('update')) {
              context.report({
                node: node.callee,
                messageId: 'updateShouldNotHaveDeletedAt',
                data: { functionName },
              });
            }
            return;
          }

          // Check naming convention based on deletedAt usage
          // For operations without deletedAt, expect function name to start with method name
          // For operations with deletedAt, expect delete/restore prefix regardless of method
          if (expectedPrefix === 'delete') {
            // For updateMany* methods with deletedAt, expect deleteManyX
            if (methodName.toLowerCase().includes('manyandreturn')) {
              if (!functionNameLower.startsWith('deletemanyandreturn')) {
                context.report({
                  node: node.callee,
                  messageId: 'invalidUpdateMethodName',
                  data: {
                    functionName,
                    method: methodName,
                    operation: 'with deletedAt: Date',
                    expectedPrefix: 'deleteManyAndReturn',
                  },
                });
              }
            } else if (methodName.toLowerCase().includes('many')) {
              if (!functionNameLower.startsWith('deletemany')) {
                context.report({
                  node: node.callee,
                  messageId: 'invalidUpdateMethodName',
                  data: {
                    functionName,
                    method: methodName,
                    operation: 'with deletedAt: Date',
                    expectedPrefix: 'deleteMany',
                  },
                });
              }
            } else {
              // For regular update with deletedAt, expect deleteX
              if (!functionNameLower.startsWith('delete')) {
                context.report({
                  node: node.callee,
                  messageId: 'invalidUpdateMethodName',
                  data: {
                    functionName,
                    method: methodName,
                    operation: 'with deletedAt: Date',
                    expectedPrefix: 'delete',
                  },
                });
              }
            }
          } else if (expectedPrefix === 'restore') {
            // For updateMany* methods with deletedAt: null, expect restoreManyX
            if (methodName.toLowerCase().includes('manyandreturn')) {
              if (!functionNameLower.startsWith('restoremanyandreturn')) {
                context.report({
                  node: node.callee,
                  messageId: 'invalidUpdateMethodName',
                  data: {
                    functionName,
                    method: methodName,
                    operation: 'with deletedAt: null',
                    expectedPrefix: 'restoreManyAndReturn',
                  },
                });
              }
            } else if (methodName.toLowerCase().includes('many')) {
              if (!functionNameLower.startsWith('restoremany')) {
                context.report({
                  node: node.callee,
                  messageId: 'invalidUpdateMethodName',
                  data: {
                    functionName,
                    method: methodName,
                    operation: 'with deletedAt: null',
                    expectedPrefix: 'restoreMany',
                  },
                });
              }
            } else {
              // For regular update with deletedAt: null, expect restoreX
              if (!functionNameLower.startsWith('restore')) {
                context.report({
                  node: node.callee,
                  messageId: 'invalidUpdateMethodName',
                  data: {
                    functionName,
                    method: methodName,
                    operation: 'with deletedAt: null',
                    expectedPrefix: 'restore',
                  },
                });
              }
            }
          } else if (expectedPrefix === 'update') {
            // For update operation without deletedAt, we expect the method name as prefix
            if (!functionNameLower.startsWith(methodName.toLowerCase())) {
              context.report({
                node: node.callee,
                messageId: 'invalidUpdateMethodName',
                data: {
                  functionName,
                  method: methodName,
                  operation: 'without deletedAt',
                  expectedPrefix: methodName,
                },
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
});

export default rule;
