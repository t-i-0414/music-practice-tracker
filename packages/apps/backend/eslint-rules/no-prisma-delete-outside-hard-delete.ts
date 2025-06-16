import type { Rule } from 'eslint';
import type { CallExpression, MemberExpression, Node, Identifier } from 'estree';

type FunctionNode = Node & {
  id?: Identifier | null;
  parent?: Node;
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Restrict Prisma delete operations to functions starting with "hardDelete"',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    messages: {
      noPrismaDeleteOutsideHardDelete:
        'Prisma delete operations ({{method}}) are only allowed within functions starting with "hardDelete". Current function: "{{functionName}}"',
      noPrismaDeleteAtTopLevel:
        'Prisma delete operations ({{method}}) are only allowed within functions starting with "hardDelete". Found at top level.',
    },
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    // Stack to track current function names
    const functionStack: (string | null)[] = [];

    // Check if we're inside a function that starts with "hardDelete"
    function isInsideHardDeleteFunction(): boolean {
      return functionStack.some((name) => name && name.startsWith('hardDelete'));
    }

    // Get the current function name
    function getCurrentFunctionName(): string | null {
      return functionStack[functionStack.length - 1] || null;
    }

    // Check if this is a Prisma delete method call
    function isPrismaDeleteMethod(node: Node): node is MemberExpression {
      if (node.type !== 'MemberExpression') {
        return false;
      }

      const property = node.property;
      if (!property || property.type !== 'Identifier') {
        return false;
      }

      // Check for delete or deleteMany methods
      const deleteMethodNames = ['delete', 'deleteMany'];
      if (!deleteMethodNames.includes(property.name)) {
        return false;
      }

      // Try to trace back to see if this is a Prisma model
      let current: Node = node.object;
      while (current) {
        // Check for patterns like prisma.user, this.user, repository.user, etc.
        if (current.type === 'MemberExpression') {
          const memberExp = current as MemberExpression;
          const objectName = memberExp.object.type === 'Identifier' 
            ? memberExp.object.name 
            : memberExp.object.type === 'MemberExpression' && memberExp.object.property?.type === 'Identifier'
              ? memberExp.object.property.name
              : undefined;
          const propertyName = memberExp.property?.type === 'Identifier' 
            ? memberExp.property.name 
            : undefined;

          // Common Prisma patterns
          if (objectName === 'prisma' || 
              objectName === 'repository' || 
              objectName === 'this' ||
              propertyName === 'prisma' ||
              propertyName === 'repository') {
            return true;
          }
          current = memberExp.object;
        } else if (current.type === 'Identifier') {
          // Check if the identifier looks like a Prisma model (e.g., userRepository)
          const name = current.name.toLowerCase();
          if (name.includes('repository') || 
              name.includes('prisma') || 
              name.includes('model') ||
              name.includes('service')) {
            return true;
          }
          break;
        } else if (current.type === 'ThisExpression') {
          // this.something.delete()
          return true;
        } else {
          break;
        }
      }

      return false;
    }

    // Helper to get function name from parent nodes
    function getFunctionName(node: FunctionNode): string | null {
      let name = node.id?.name || null;
      
      if (!name && node.parent) {
        if (node.parent.type === 'VariableDeclarator' && node.parent.id?.type === 'Identifier') {
          name = node.parent.id.name;
        } else if (node.parent.type === 'Property' && node.parent.key?.type === 'Identifier') {
          name = node.parent.key.name;
        } else if (node.parent.type === 'MethodDefinition' && node.parent.key?.type === 'Identifier') {
          name = node.parent.key.name;
        }
      }
      
      return name;
    }

    return {
      // Track entering/exiting functions
      FunctionDeclaration(node: FunctionNode) {
        functionStack.push(node.id?.name || null);
      },
      'FunctionDeclaration:exit'() {
        functionStack.pop();
      },
      FunctionExpression(node: FunctionNode) {
        functionStack.push(getFunctionName(node));
      },
      'FunctionExpression:exit'() {
        functionStack.pop();
      },
      ArrowFunctionExpression(node: FunctionNode) {
        functionStack.push(getFunctionName(node));
      },
      'ArrowFunctionExpression:exit'() {
        functionStack.pop();
      },

      // Check for Prisma delete calls
      CallExpression(node: CallExpression) {
        if (node.callee && isPrismaDeleteMethod(node.callee)) {
          if (!isInsideHardDeleteFunction()) {
            const memberExp = node.callee as MemberExpression;
            const method = (memberExp.property as any).name;
            const functionName = getCurrentFunctionName();

            if (functionName) {
              context.report({
                node: memberExp.property,
                messageId: 'noPrismaDeleteOutsideHardDelete',
                data: {
                  method,
                  functionName,
                },
              });
            } else {
              context.report({
                node: memberExp.property,
                messageId: 'noPrismaDeleteAtTopLevel',
                data: {
                  method,
                },
              });
            }
          }
        }
      },
    };
  },
};

export = rule;