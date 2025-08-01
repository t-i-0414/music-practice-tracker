import { AST_NODE_TYPES, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

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
    // Parser services are only needed for update rule's type checking
    let services: ReturnType<typeof ESLintUtils.getParserServices> | null = null;
    let checker: ts.TypeChecker | null = null;

    try {
      services = ESLintUtils.getParserServices(context);
      checker = services.program.getTypeChecker();
    } catch {
      // Parser services not available, which is fine for non-update rules
    }

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

    // Check if a type has deletedAt property (for update rule)
    function typeHasDeletedAt(type: ts.Type): boolean {
      if (!checker) return false;
      if (type.isUnion()) {
        return type.types.some((t) => typeHasDeletedAt(t));
      }

      if (type.symbol?.declarations) {
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

    // Analyze the data object to find deletedAt or suspendedAt field (for update rule)
    function analyzeDataObject(
      node: TSESTree.Expression,
    ): 'delete' | 'restore' | 'update' | 'suspend' | 'unknown' | null {
      // Handle MemberExpression like params.data
      if (node.type === AST_NODE_TYPES.MemberExpression || node.type === AST_NODE_TYPES.Identifier) {
        // Get TypeScript node and check type
        if (services && checker) {
          const tsNode = services.esTreeNodeToTSNodeMap.get(node);
          if (tsNode) {
            const type = checker.getTypeAtLocation(tsNode);
            if (typeHasDeletedAt(type)) {
              return 'unknown'; // Can't determine exact usage without analyzing the value
            } else {
              return 'update'; // Type doesn't have deletedAt
            }
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
          const { value } = property;

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

        // Check for suspendedAt field
        if (
          property.type === AST_NODE_TYPES.Property &&
          property.key.type === AST_NODE_TYPES.Identifier &&
          property.key.name === 'suspendedAt'
        ) {
          const { value } = property;

          // Check if suspendedAt is a Date
          if (
            value.type === AST_NODE_TYPES.NewExpression &&
            value.callee.type === AST_NODE_TYPES.Identifier &&
            value.callee.name === 'Date'
          ) {
            return 'suspend';
          }

          // Check if it's a variable/expression that might be a Date
          if (value.type === AST_NODE_TYPES.Identifier || value.type === AST_NODE_TYPES.MemberExpression) {
            return 'suspend';
          }
        }

        // Check for spread properties that might contain deletedAt
        if (property.type === AST_NODE_TYPES.SpreadElement) {
          hasSpreadFromParam = true;

          // Get TypeScript node and check type
          if (services && checker) {
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
          if (!functionNameLower.startsWith('harddelete')) {
            context.report({
              node: node.callee,
              messageId: 'invalidDeleteMethodName',
              data: {
                functionName,
                method: deleteMethod,
                expectedPrefix: 'hardDelete',
              },
            });
          }
        } else if (deleteMethod === 'deleteMany') {
          if (!functionNameLower.startsWith('harddeletemany')) {
            context.report({
              node: node.callee,
              messageId: 'invalidDeleteMethodName',
              data: {
                functionName,
                method: deleteMethod,
                expectedPrefix: 'hardDeleteMany',
              },
            });
          }
        }
        return;
      }

      // Check for UPDATE methods
      const updateMethod = isPrismaUpdateMethod(node.callee);
      if (updateMethod) {
        const dataParam = findDataParameter(node);
        if (!dataParam) {
          return;
        }

        const expectedPrefix = analyzeDataObject(dataParam);
        if (!expectedPrefix) {
          return;
        }

        if (expectedPrefix === 'update') {
          // For update operation without deletedAt, we expect the method name as prefix
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
