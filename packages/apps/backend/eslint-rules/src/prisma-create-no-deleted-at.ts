import { ESLintUtils, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

type MessageIds = 'createShouldNotHaveDeletedAt';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/music-practice-tracker/rules/${name}`);

const rule = createRule<[], MessageIds>({
  name: 'prisma-create-no-deleted-at',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent deletedAt field in Prisma create operations',
    },
    messages: {
      createShouldNotHaveDeletedAt: 'Prisma create operations should not include deletedAt field',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    // Check if this is a Prisma create method call
    function isPrismaCreateMethod(node: TSESTree.MemberExpression): boolean {
      if (node.property.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }
      
      // Check for create, createMany, or createManyAndReturn methods
      const methodName = node.property.name;
      if (methodName !== 'create' && methodName !== 'createMany' && methodName !== 'createManyAndReturn') {
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

    // Check if data contains or might contain deletedAt
    function checkDataForDeletedAt(node: TSESTree.Expression): boolean {
      // Handle MemberExpression like params.data or Identifier
      if (node.type === AST_NODE_TYPES.MemberExpression || node.type === AST_NODE_TYPES.Identifier) {
        // Get TypeScript node and check type
        const tsNode = services.esTreeNodeToTSNodeMap.get(node);
        if (tsNode) {
          const type = checker.getTypeAtLocation(tsNode);
          return typeHasDeletedAt(type);
        }
        return false; // If we can't determine, assume it doesn't have deletedAt
      }
      
      if (node.type === AST_NODE_TYPES.ObjectExpression) {
        // Check for explicit deletedAt property
        for (const property of node.properties) {
          if (
            property.type === AST_NODE_TYPES.Property &&
            property.key.type === AST_NODE_TYPES.Identifier &&
            property.key.name === 'deletedAt'
          ) {
            return true;
          }

          // Check for spread properties that might contain deletedAt
          if (property.type === AST_NODE_TYPES.SpreadElement) {
            // Get TypeScript node and check type
            const tsNode = services.esTreeNodeToTSNodeMap.get(property.argument);
            if (tsNode) {
              const type = checker.getTypeAtLocation(tsNode);
              if (typeHasDeletedAt(type)) {
                return true;
              }
            }
          }
        }
      }

      return false;
    }

    // Find the data parameter in create call
    function findDataParameter(node: TSESTree.CallExpression): TSESTree.Expression | null {
      if (node.arguments.length === 0) {
        return null;
      }

      const firstArg = node.arguments[0];
      
      // Pattern 1: create({ data: ... })
      if (firstArg.type === AST_NODE_TYPES.ObjectExpression) {
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

      // Pattern 2: createMany({ data: ... }) or direct data object
      // For createMany/createManyAndReturn, data might be passed directly
      if (firstArg.type === AST_NODE_TYPES.ObjectExpression) {
        // Check if this looks like data object (has properties but no 'data' key)
        let hasDataKey = false;
        for (const property of firstArg.properties) {
          if (
            property.type === AST_NODE_TYPES.Property &&
            property.key.type === AST_NODE_TYPES.Identifier &&
            property.key.name === 'data'
          ) {
            hasDataKey = true;
            break;
          }
        }
        if (!hasDataKey) {
          // This might be the data object itself
          return firstArg;
        }
      }

      // Pattern 3: create(params) where params is a variable
      if (firstArg.type !== AST_NODE_TYPES.SpreadElement) {
        return firstArg as TSESTree.Expression;
      }
      
      return null;
    }

    return {
      // Check for Prisma create calls
      CallExpression(node) {
        if (node.callee.type === AST_NODE_TYPES.MemberExpression && isPrismaCreateMethod(node.callee)) {
          const dataParam = findDataParameter(node);
          if (!dataParam) {
            return;
          }

          if (checkDataForDeletedAt(dataParam)) {
            context.report({
              node: node.callee,
              messageId: 'createShouldNotHaveDeletedAt',
            });
          }
        }
      },
    };
  },
});

export = rule;