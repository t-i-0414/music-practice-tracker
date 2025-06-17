import { ESLintUtils, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

type MessageIds =
  | 'updateShouldBeDelete'
  | 'updateShouldBeRestore'
  | 'updateShouldBeUpdate'
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

    // Check if this is a Prisma update method call
    function isPrismaUpdateMethod(node: TSESTree.MemberExpression): boolean {
      if (node.property.type !== AST_NODE_TYPES.Identifier || node.property.name !== 'update') {
        return false;
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
            return true;
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
            return true;
          }
          break;
        } else if (current.type === AST_NODE_TYPES.ThisExpression) {
          return true;
        } else {
          break;
        }
      }

      return false;
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
        // Look for data property
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
        if (node.callee.type === AST_NODE_TYPES.MemberExpression && isPrismaUpdateMethod(node.callee)) {
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
});

export = rule;
