import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/types';

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

describe('prisma-helpers', () => {
  describe('constants', () => {
    it('should have correct PRISMA_CREATE_METHODS', () => {
      expect.assertions(1);
      expect(PRISMA_CREATE_METHODS).toStrictEqual(['create', 'createMany', 'createManyAndReturn']);
    });

    it('should have correct PRISMA_UPDATE_METHODS', () => {
      expect.assertions(1);
      expect(PRISMA_UPDATE_METHODS).toStrictEqual(['update', 'updateMany', 'updateManyAndReturn']);
    });

    it('should have correct PRISMA_DELETE_METHODS', () => {
      expect.assertions(1);
      expect(PRISMA_DELETE_METHODS).toStrictEqual(['delete', 'deleteMany']);
    });

    it('should have correct PRISMA_FIND_METHODS', () => {
      expect.assertions(1);
      expect(PRISMA_FIND_METHODS).toStrictEqual([
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
      expect.assertions(1);

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
      expect.assertions(1);

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

      expect(isPrismaUpdateMethod(node)).toBeNull();
    });

    it('should return null when property is not an identifier', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Literal,
          value: 'update',
        } as TSESTree.Literal,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'prisma',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBeNull();
    });

    it('should detect repository pattern', () => {
      expect.assertions(1);

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
      expect.assertions(1);

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
      expect.assertions(1);

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

    it('should handle other node types in object chain', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'update',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.CallExpression,
          callee: {
            type: AST_NODE_TYPES.Identifier,
            name: 'getService',
          } as TSESTree.Identifier,
          arguments: [],
        } as unknown as TSESTree.Expression,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBeNull();
    });

    it('should detect model pattern', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'update',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'userModel',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBe('update');
    });

    it('should continue traversing deeply nested member expressions', () => {
      expect.assertions(1);

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
            type: AST_NODE_TYPES.MemberExpression,
            property: {
              type: AST_NODE_TYPES.Identifier,
              name: 'notPrisma',
            } as TSESTree.Identifier,
            object: {
              type: AST_NODE_TYPES.MemberExpression,
              property: {
                type: AST_NODE_TYPES.Identifier,
                name: 'some',
              } as TSESTree.Identifier,
              object: {
                type: AST_NODE_TYPES.Identifier,
                name: 'this',
              } as TSESTree.Identifier,
            } as TSESTree.MemberExpression,
          } as TSESTree.MemberExpression,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBe('update');
    });

    it('should detect when object has nested member property with repository name', () => {
      expect.assertions(1);

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
            type: AST_NODE_TYPES.MemberExpression,
            property: {
              type: AST_NODE_TYPES.Identifier,
              name: 'repository',
            } as TSESTree.Identifier,
            object: {
              type: AST_NODE_TYPES.Identifier,
              name: 'db',
            } as TSESTree.Identifier,
          } as TSESTree.MemberExpression,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBe('update');
    });

    it('should handle complex nested member with non-identifier properties', () => {
      expect.assertions(1);

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
            type: AST_NODE_TYPES.MemberExpression,
            property: {
              type: AST_NODE_TYPES.Literal,
              value: 'db',
            } as TSESTree.Literal,
            object: {
              type: AST_NODE_TYPES.CallExpression,
              callee: {
                type: AST_NODE_TYPES.Identifier,
                name: 'getObj',
              } as TSESTree.Identifier,
              arguments: [],
            } as unknown as TSESTree.Expression,
          } as TSESTree.MemberExpression,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBeNull();
    });

    it('should return null when identifier has no prisma-related name', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'update',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'db',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaUpdateMethod(node)).toBeNull();
    });
  });

  describe('isPrismaMethodCall', () => {
    it('should return method name for valid Prisma method', () => {
      expect.assertions(1);

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
      expect.assertions(1);

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

      expect(isPrismaMethodCall(node, PRISMA_CREATE_METHODS)).toBeNull();
    });

    it('should return null when property is not an identifier', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Literal,
          value: 'create',
        } as TSESTree.Literal,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'prisma',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaMethodCall(node, PRISMA_CREATE_METHODS)).toBeNull();
    });

    it('should handle userRepository pattern', () => {
      expect.assertions(1);

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
      expect.assertions(1);

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

    it('should handle this expression pattern', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'create',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.ThisExpression,
        } as TSESTree.ThisExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaMethodCall(node, PRISMA_CREATE_METHODS)).toBe('create');
    });

    it('should handle other node types in object chain', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'delete',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.CallExpression,
          callee: {
            type: AST_NODE_TYPES.Identifier,
            name: 'getService',
          } as TSESTree.Identifier,
          arguments: [],
        } as unknown as TSESTree.Expression,
      } as TSESTree.MemberExpression;

      expect(isPrismaMethodCall(node, PRISMA_DELETE_METHODS)).toBeNull();
    });

    it('should detect when property name is prisma', () => {
      expect.assertions(1);

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
            name: 'prisma',
          } as TSESTree.Identifier,
          object: {
            type: AST_NODE_TYPES.Identifier,
            name: 'db',
          } as TSESTree.Identifier,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaMethodCall(node, PRISMA_CREATE_METHODS)).toBe('create');
    });

    it('should detect when object name in nested member expression', () => {
      expect.assertions(1);

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
            type: AST_NODE_TYPES.MemberExpression,
            property: {
              type: AST_NODE_TYPES.Identifier,
              name: 'prisma',
            } as TSESTree.Identifier,
            object: {
              type: AST_NODE_TYPES.Identifier,
              name: 'this',
            } as TSESTree.Identifier,
          } as TSESTree.MemberExpression,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaMethodCall(node, PRISMA_UPDATE_METHODS)).toBe('update');
    });

    it('should detect when object has nested member with undefined property name', () => {
      expect.assertions(1);

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
            type: AST_NODE_TYPES.MemberExpression,
            property: {
              type: AST_NODE_TYPES.Literal,
              value: 'repository',
            } as TSESTree.Literal,
            object: {
              type: AST_NODE_TYPES.ThisExpression,
            } as TSESTree.ThisExpression,
          } as TSESTree.MemberExpression,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaMethodCall(node, PRISMA_CREATE_METHODS)).toBe('create');
    });
  });

  describe('getFunctionName', () => {
    it('should get name from function declaration', () => {
      expect.assertions(1);

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
      expect.assertions(1);

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
      expect.assertions(1);

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
      expect.assertions(1);

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
      expect.assertions(1);

      const node: TSESTree.Node = {
        type: AST_NODE_TYPES.FunctionExpression,
      } as TSESTree.Node;

      expect(getFunctionName(node)).toBeNull();
    });
  });

  describe('isPrismaFindMethod', () => {
    it('should return true for valid Prisma find method', () => {
      expect.assertions(1);

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
      expect.assertions(1);

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
      expect.assertions(1);

      const node: TSESTree.Node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'findUnique',
      } as TSESTree.Identifier;

      expect(isPrismaFindMethod(node)).toBe(false);
    });

    it('should detect repository in property name', () => {
      expect.assertions(1);

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
      expect.assertions(1);

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

    it('should detect when object name includes prisma', () => {
      expect.assertions(1);

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
            name: 'prismaService',
          } as TSESTree.Identifier,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(true);
    });

    it('should handle other node types gracefully', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'findMany',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.CallExpression,
          callee: {
            type: AST_NODE_TYPES.Identifier,
            name: 'getPrisma',
          } as TSESTree.Identifier,
          arguments: [],
        } as unknown as TSESTree.Expression,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(false);
    });

    it('should detect this expression pattern', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'findUnique',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.ThisExpression,
        } as TSESTree.ThisExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(true);
    });

    it('should return false when property is not an identifier', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Literal,
          value: 'findUnique',
        } as TSESTree.Literal,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'prisma',
        } as TSESTree.Identifier,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(false);
    });

    it('should continue traversing object chain without prisma indicator', () => {
      expect.assertions(1);

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
            name: 'user',
          } as TSESTree.Identifier,
          object: {
            type: AST_NODE_TYPES.MemberExpression,
            property: {
              type: AST_NODE_TYPES.Identifier,
              name: 'db',
            } as TSESTree.Identifier,
            object: {
              type: AST_NODE_TYPES.Identifier,
              name: 'context',
            } as TSESTree.Identifier,
          } as TSESTree.MemberExpression,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(false);
    });

    it('should handle when objectName is undefined', () => {
      expect.assertions(1);

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
            type: AST_NODE_TYPES.Literal,
            value: 'something',
          } as TSESTree.Literal,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(false);
    });

    it('should handle when property is not an identifier in nested member', () => {
      expect.assertions(1);

      const node: TSESTree.MemberExpression = {
        type: AST_NODE_TYPES.MemberExpression,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'findMany',
        } as TSESTree.Identifier,
        object: {
          type: AST_NODE_TYPES.MemberExpression,
          property: {
            type: AST_NODE_TYPES.Literal,
            value: 'user',
          } as TSESTree.Literal,
          object: {
            type: AST_NODE_TYPES.MemberExpression,
            property: {
              type: AST_NODE_TYPES.Literal,
              value: 'prisma',
            } as TSESTree.Literal,
            object: {
              type: AST_NODE_TYPES.Identifier,
              name: 'db',
            } as TSESTree.Identifier,
          } as TSESTree.MemberExpression,
        } as TSESTree.MemberExpression,
      } as TSESTree.MemberExpression;

      expect(isPrismaFindMethod(node)).toBe(false);
    });
  });

  describe('getFunctionNameExtended', () => {
    it('should get name from node id', () => {
      expect.assertions(1);

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
      expect.assertions(1);

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
      expect.assertions(1);

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
      expect.assertions(1);

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
      expect.assertions(1);

      const node = {
        type: AST_NODE_TYPES.FunctionExpression,
      } as TSESTree.FunctionExpression;

      expect(getFunctionNameExtended(node)).toBeNull();
    });
  });
});
