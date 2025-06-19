import {
  PRISMA_CREATE_METHODS,
  PRISMA_DELETE_METHODS,
  PRISMA_FIND_METHODS,
  PRISMA_UPDATE_METHODS,
  getFunctionName,
  getFunctionNameExtended,
  isPrismaFindMethod,
  isPrismaMethodCall,
  isPrismaUpdateMethod,
} from '@/plugin-backend/utils/prisma-helpers';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';

describe('prisma-helpers', () => {
  describe('constants', () => {
    it('should have correct PRISMA_CREATE_METHODS', () => {
      expect(PRISMA_CREATE_METHODS).toEqual(['create', 'createMany', 'createManyAndReturn']);
    });

    it('should have correct PRISMA_UPDATE_METHODS', () => {
      expect(PRISMA_UPDATE_METHODS).toEqual(['update', 'updateMany', 'updateManyAndReturn']);
    });

    it('should have correct PRISMA_DELETE_METHODS', () => {
      expect(PRISMA_DELETE_METHODS).toEqual(['delete', 'deleteMany']);
    });

    it('should have correct PRISMA_FIND_METHODS', () => {
      expect(PRISMA_FIND_METHODS).toEqual([
        'findUnique',
        'findUniqueOrThrow',
        'findFirst',
        'findFirstOrThrow',
        'findMany',
      ]);
    });
  });

  describe('isPrismaUpdateMethod', () => {
    it('should return method name for valid Prisma update method', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'update',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.MemberExpression,
          property: {
            type: AST_NODE_TYPES.Identifier,
            name: 'user',
          } as TSESTree.Identifier,
          object: {
            type: AST_NODE_TYPES.Identifier,
            name: 'prisma',
          } as TSESTree.Identifier,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBe('update');
    });

    it('should return null for non-update method', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'find',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'prisma',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBe(null);
    });

    it('should detect repository pattern', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'updateMany',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.MemberExpression,
          property: {
            type: AST_NODE_TYPES.Identifier,
            name: 'user',
          } as TSESTree.Identifier,
          object: {
            type: AST_NODE_TYPES.Identifier,
            name: 'repository',
          } as TSESTree.Identifier,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBe('updateMany');
    });

    it('should detect this pattern', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'update',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.ThisExpression,
        } as TSESTree.ThisExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBe('update');
    });

    it('should detect service pattern', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'update',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'userService',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBe('update');
    });
  });

  describe('isPrismaMethodCall', () => {
    it('should return method name for valid Prisma method', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'create',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.MemberExpression,
          property: {
            type: AST_NODE_TYPES.Identifier,
            name: 'user',
          } as TSESTree.Identifier,
          object: {
            type: AST_NODE_TYPES.Identifier,
            name: 'prisma',
          } as TSESTree.Identifier,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaMethodCall(node, PRISMA_CREATE_METHODS)).toBe('create');
    });

    it('should return null for method not in list', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'update',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'prisma',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaMethodCall(node, PRISMA_CREATE_METHODS)).toBe(null);
    });

    it('should handle userRepository pattern', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'delete',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'userRepository',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaMethodCall(node, PRISMA_DELETE_METHODS)).toBe('delete');
    });

    it('should handle model pattern', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'findUnique',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'userModel',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaMethodCall(node, PRISMA_FIND_METHODS)).toBe('findUnique');
    });
  });

  describe('getFunctionName', () => {
    it('should get name from function declaration', () => {
      const node: TSESTree.FunctionDeclaration = {
        type: AST_NODE_TYPES.FunctionDeclaration,
        id: {
          type: AST_NODE_TYPES.Identifier,
          name: 'myFunction',
        } as TSESTree.Identifier,
      } as TSESTree.FunctionDeclaration;

      expect(getFunctionName(node)).toBe('myFunction');
    });

    it('should get name from variable declarator', () => {
      const node: TSESTree.Node = {
        type: AST_NODE_TYPES.FunctionExpression,
        parent: {
          type: AST_NODE_TYPES.VariableDeclarator,
          id: {
            type: AST_NODE_TYPES.Identifier,
            name: 'myFunction',
          } as TSESTree.Identifier,
        } as TSESTree.VariableDeclarator,
      } as TSESTree.Node;

      expect(getFunctionName(node)).toBe('myFunction');
    });

    it('should get name from property', () => {
      const node: TSESTree.Node = {
        type: AST_NODE_TYPES.FunctionExpression,
        parent: {
          type: AST_NODE_TYPES.Property,
          key: {
            type: AST_NODE_TYPES.Identifier,
            name: 'myMethod',
          } as TSESTree.Identifier,
        } as TSESTree.Property,
      } as TSESTree.Node;

      expect(getFunctionName(node)).toBe('myMethod');
    });

    it('should get name from method definition', () => {
      const node: TSESTree.Node = {
        type: AST_NODE_TYPES.FunctionExpression,
        parent: {
          type: AST_NODE_TYPES.MethodDefinition,
          key: {
            type: AST_NODE_TYPES.Identifier,
            name: 'myMethod',
          } as TSESTree.Identifier,
        } as TSESTree.MethodDefinition,
      } as TSESTree.Node;

      expect(getFunctionName(node)).toBe('myMethod');
    });

    it('should return null for anonymous function', () => {
      const node: TSESTree.Node = {
        type: AST_NODE_TYPES.FunctionExpression,
      } as TSESTree.Node;

      expect(getFunctionName(node)).toBe(null);
    });
  });

  describe('isPrismaFindMethod', () => {
    it('should return true for valid Prisma find method', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'findUnique',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.MemberExpression,
          property: {
            type: AST_NODE_TYPES.Identifier,
            name: 'user',
          } as TSESTree.Identifier,
          object: {
            type: AST_NODE_TYPES.Identifier,
            name: 'prisma',
          } as TSESTree.Identifier,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(true);
    });

    it('should return false for non-find method', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'create',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'prisma',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(false);
    });

    it('should return false for non-member expression', () => {
      const node: TSESTree.Node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'findUnique',
      } as TSESTree.Identifier;

      expect(isPrismaFindMethod(node)).toBe(false);
    });

    it('should detect repository in property name', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'findMany',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.MemberExpression,
          property: {
            type: AST_NODE_TYPES.Identifier,
            name: 'repository',
          } as TSESTree.Identifier,
          object: {
            type: AST_NODE_TYPES.ThisExpression,
          } as TSESTree.ThisExpression,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(true);
    });

    it('should detect model pattern', () => {
      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'findFirst',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'userModel',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(true);
    });
  });

  describe('getFunctionNameExtended', () => {
    it('should get name from node id', () => {
      const node = {
        type: AST_NODE_TYPES.FunctionDeclaration,
        id: {
          type: AST_NODE_TYPES.Identifier,
          name: 'myFunction',
        } as TSESTree.Identifier,
      } as TSESTree.FunctionDeclaration;

      expect(getFunctionNameExtended(node)).toBe('myFunction');
    });

    it('should get name from parent variable declarator', () => {
      const node = {
        type: AST_NODE_TYPES.FunctionExpression,
        parent: {
          type: AST_NODE_TYPES.VariableDeclarator,
          id: {
            type: AST_NODE_TYPES.Identifier,
            name: 'myFunction',
          } as TSESTree.Identifier,
        } as TSESTree.VariableDeclarator,
      } as TSESTree.FunctionExpression & { parent?: TSESTree.Node };

      expect(getFunctionNameExtended(node)).toBe('myFunction');
    });

    it('should get name from parent property', () => {
      const node = {
        type: AST_NODE_TYPES.FunctionExpression,
        parent: {
          type: AST_NODE_TYPES.Property,
          key: {
            type: AST_NODE_TYPES.Identifier,
            name: 'myMethod',
          } as TSESTree.Identifier,
        } as TSESTree.Property,
      } as TSESTree.FunctionExpression & { parent?: TSESTree.Node };

      expect(getFunctionNameExtended(node)).toBe('myMethod');
    });

    it('should get name from parent method definition', () => {
      const node = {
        type: AST_NODE_TYPES.FunctionExpression,
        parent: {
          type: AST_NODE_TYPES.MethodDefinition,
          key: {
            type: AST_NODE_TYPES.Identifier,
            name: 'myMethod',
          } as TSESTree.Identifier,
        } as TSESTree.MethodDefinition,
      } as TSESTree.FunctionExpression & { parent?: TSESTree.Node };

      expect(getFunctionNameExtended(node)).toBe('myMethod');
    });

    it('should return null when no name is found', () => {
      const node = {
        type: AST_NODE_TYPES.FunctionExpression,
      } as TSESTree.FunctionExpression;

      expect(getFunctionNameExtended(node)).toBe(null);
    });
  });
});
