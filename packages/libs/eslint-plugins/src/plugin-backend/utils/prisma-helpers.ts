import { type TSESTree, AST_NODE_TYPES } from '@typescript-eslint/types';

export const PRISMA_CREATE_METHODS = ['create', 'createMany', 'createManyAndReturn'] as const;
export const PRISMA_UPDATE_METHODS = ['update', 'updateMany', 'updateManyAndReturn'] as const;

/**
 * Extended version for update methods that includes more checking
 */
export function isPrismaUpdateMethod(node: TSESTree.MemberExpression): string | null {
  if (node.property.type !== AST_NODE_TYPES.Identifier) {
    return null;
  }

  const methodName = node.property.name;
  if (!(PRISMA_UPDATE_METHODS as readonly string[]).includes(methodName)) {
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
export const PRISMA_DELETE_METHODS = ['delete', 'deleteMany'] as const;
export const PRISMA_FIND_METHODS = [
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
] as const;

/**
 * Check if a node is a Prisma method call
 */
export function isPrismaMethodCall(node: TSESTree.MemberExpression, methodNames: readonly string[]): string | null {
  if (node.property.type !== AST_NODE_TYPES.Identifier) {
    return null;
  }

  const methodName = node.property.name;
  if (!methodNames.includes(methodName)) {
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
      if (name === 'repository' || name === 'prisma' || name.endsWith('repository') || name.endsWith('model')) {
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

/**
 * Get function name from a function node
 */
export function getFunctionName(node: TSESTree.Node): string | null {
  if (node.type === AST_NODE_TYPES.FunctionDeclaration && node.id) {
    return node.id.name;
  }

  if (node.parent) {
    if (node.parent.type === AST_NODE_TYPES.VariableDeclarator && node.parent.id?.type === AST_NODE_TYPES.Identifier) {
      return node.parent.id.name;
    } else if (node.parent.type === AST_NODE_TYPES.Property && node.parent.key?.type === AST_NODE_TYPES.Identifier) {
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

/**
 * Extended version of isPrismaMethodCall for find methods that need more detailed checking
 */
export function isPrismaFindMethod(node: TSESTree.Node): node is TSESTree.MemberExpression {
  if (node.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  const { property } = node;
  if (!property || property.type !== AST_NODE_TYPES.Identifier) {
    return false;
  }

  if (!(PRISMA_FIND_METHODS as readonly string[]).includes(property.name)) {
    return false;
  }

  // Try to trace back to see if this is a Prisma model
  let current: TSESTree.Node = node.object;
  let foundPrismaIndicator = false;

  while (current) {
    if (current.type === AST_NODE_TYPES.MemberExpression) {
      const memberExp = current as TSESTree.MemberExpression;
      const objectName =
        memberExp.object.type === AST_NODE_TYPES.Identifier
          ? memberExp.object.name
          : memberExp.object.type === AST_NODE_TYPES.MemberExpression &&
              memberExp.object.property?.type === AST_NODE_TYPES.Identifier
            ? memberExp.object.property.name
            : undefined;
      const propertyName = memberExp.property?.type === AST_NODE_TYPES.Identifier ? memberExp.property.name : undefined;

      // Common Prisma patterns
      if (
        objectName === 'prisma' ||
        objectName === 'repository' ||
        objectName === 'this' ||
        propertyName === 'prisma' ||
        propertyName === 'repository'
      ) {
        foundPrismaIndicator = true;
        break;
      }

      // Check if it's explicitly NOT a Prisma service
      if (objectName && objectName !== 'this') {
        const lowerName = objectName.toLowerCase();
        if (lowerName.includes('prisma') || lowerName.includes('repository') || lowerName.includes('model')) {
          foundPrismaIndicator = true;
          break;
        }
      }
      current = memberExp.object;
    } else if (current.type === AST_NODE_TYPES.Identifier) {
      const name = current.name.toLowerCase();
      if (
        name === 'prisma' ||
        name === 'repository' ||
        name.includes('prisma') ||
        name.includes('repository') ||
        name.includes('model')
      ) {
        foundPrismaIndicator = true;
      }
      break;
    } else if (current.type === AST_NODE_TYPES.ThisExpression) {
      foundPrismaIndicator = true;
      break;
    } else {
      break;
    }
  }

  return foundPrismaIndicator;
}

/**
 * Get function name from a node with support for various function types
 */
export function getFunctionNameExtended(
  node: TSESTree.Node & { id?: TSESTree.Identifier | null; parent?: TSESTree.Node },
): string | null {
  let name = node.id?.name || null;

  if (!name && node.parent) {
    if (node.parent.type === AST_NODE_TYPES.VariableDeclarator && node.parent.id?.type === AST_NODE_TYPES.Identifier) {
      name = node.parent.id.name;
    } else if (node.parent.type === AST_NODE_TYPES.Property && node.parent.key?.type === AST_NODE_TYPES.Identifier) {
      name = node.parent.key.name;
    } else if (
      node.parent.type === AST_NODE_TYPES.MethodDefinition &&
      node.parent.key?.type === AST_NODE_TYPES.Identifier
    ) {
      name = node.parent.key.name;
    }
  }

  return name;
}
