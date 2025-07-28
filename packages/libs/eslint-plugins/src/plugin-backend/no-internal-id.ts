import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/types';
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/music-practice-tracker/eslint-plugins/blob/main/docs/${name}.md`,
);

const rule = createRule({
  name: 'no-internal-id',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent direct usage of internal id field',
    },
    messages: {
      noInternalId: 'Use publicId instead of internal id field',
      noIdInResponse: 'Do not expose internal id in API responses',
      noIdInQuery: 'Use publicId for database queries instead of id',
      noIdAccess: 'Accessing .id property is forbidden. Use .publicId instead',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename;
    const isResponseDto = filename.includes('.response.dto.ts');
    const isInputDto = filename.includes('.input.dto.ts');
    const isRepositoryFile =
      filename.endsWith('.repository.ts') ||
      filename.endsWith('.repository.service.ts') ||
      filename.endsWith('repository.ts') ||
      filename.endsWith('repository.service.ts');

    return {
      PropertyDefinition(node) {
        if (!isResponseDto) return;

        if (
          node.key.type === AST_NODE_TYPES.Identifier &&
          node.key.name === 'id' &&
          !node.decorators?.some(
            (decorator) =>
              decorator.expression.type === AST_NODE_TYPES.CallExpression &&
              decorator.expression.callee.type === AST_NODE_TYPES.Identifier &&
              decorator.expression.callee.name === 'Exclude',
          )
        ) {
          context.report({
            node: node.key,
            messageId: 'noIdInResponse',
          });
        }
      },

      Property(node) {
        if (isRepositoryFile) return;

        if (
          node.key.type === AST_NODE_TYPES.Identifier &&
          node.key.name === 'id' &&
          node.parent?.type === AST_NODE_TYPES.ObjectExpression
        ) {
          // Check if this is part of a Prisma query
          let current: TSESTree.Node | undefined = node.parent;
          let foundPrismaContext = false;

          while (current && !foundPrismaContext) {
            if (current.type === AST_NODE_TYPES.CallExpression) {
              const callee = current.callee;
              if (callee.type === AST_NODE_TYPES.MemberExpression) {
                // Check for patterns like .where({ id }), .select({ id }), .data({ id })
                if (
                  callee.property.type === AST_NODE_TYPES.Identifier &&
                  (callee.property.name === 'where' ||
                    callee.property.name === 'select' ||
                    callee.property.name === 'data' ||
                    callee.property.name === 'findUnique' ||
                    callee.property.name === 'findMany' ||
                    callee.property.name === 'update' ||
                    callee.property.name === 'updateMany')
                ) {
                  foundPrismaContext = true;
                  context.report({
                    node: node.key,
                    messageId: 'noIdInQuery',
                  });
                }
              }
            } else if (current.type === AST_NODE_TYPES.Property && current.key.type === AST_NODE_TYPES.Identifier) {
              // Check if parent property is 'where', 'select', or 'data'
              if (current.key.name === 'where' || current.key.name === 'select' || current.key.name === 'data') {
                foundPrismaContext = true;
                context.report({
                  node: node.key,
                  messageId: 'noIdInQuery',
                });
              }
            }
            current = current.parent;
          }
        }
      },

      MemberExpression(node) {
        if (isRepositoryFile) return;

        if (node.property.type === AST_NODE_TYPES.Identifier && node.property.name === 'id') {
          const isTypeNode =
            node.parent?.type === AST_NODE_TYPES.TSAsExpression ||
            node.parent?.type === AST_NODE_TYPES.TSTypeAssertion ||
            node.parent?.type === AST_NODE_TYPES.TSNonNullExpression;

          if (!isTypeNode) {
            context.report({
              node: node.property,
              messageId: 'noIdAccess',
            });
          }
        }
      },

      TSPropertySignature(node) {
        if (!isInputDto && !isResponseDto) return;

        if (node.key.type === AST_NODE_TYPES.Identifier && node.key.name === 'id' && isResponseDto) {
          context.report({
            node: node.key,
            messageId: 'noIdInResponse',
          });
        }
      },
    };
  },
});

export default rule;
