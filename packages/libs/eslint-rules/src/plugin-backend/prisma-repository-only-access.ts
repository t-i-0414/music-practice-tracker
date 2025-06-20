import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/music-practice-tracker/eslint-rules/blob/main/docs/${name}.md`,
);

const rule = createRule({
  name: 'prisma-repository-only-access',
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure Prisma models are only accessed from repository files',
    },
    messages: {
      invalidPrismaAccess:
        'Prisma models should only be accessed from repository files (*.repository.ts | *.repository.service.ts)',
      invalidPrismaImport:
        'PrismaClient should only be imported in repository files (*.repository.ts | *.repository.service.ts)',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename || context.getFilename();
    const isRepositoryFile =
      filename.endsWith('.repository.ts') ||
      filename.endsWith('.repository.service.ts') ||
      filename.endsWith('repository.ts') ||
      filename.endsWith('repository.service.ts');

    return {
      // Check imports
      ImportDeclaration(node) {
        // Skip if this is a repository file
        if (isRepositoryFile) return;

        // Check if importing from @prisma/client or similar
        const importSource = node.source.value;
        if (
          typeof importSource === 'string' &&
          (importSource === '@prisma/client' ||
            importSource.includes('prisma') ||
            importSource === '@/generated/prisma')
        ) {
          // Allow type-only imports
          if (node.importKind === 'type') return;

          // Check if all specifiers are type-only
          const hasNonTypeImport = node.specifiers.some((spec) => {
            // For default imports or namespace imports, they're considered non-type
            if (
              spec.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
              spec.type === AST_NODE_TYPES.ImportNamespaceSpecifier
            ) {
              return true;
            }
            // For named imports, check if they're type-only
            return spec.type === AST_NODE_TYPES.ImportSpecifier && spec.importKind !== 'type';
          });

          if (hasNonTypeImport) {
            context.report({
              node,
              messageId: 'invalidPrismaImport',
            });
          }
        }
      },

      // Check member expressions for Prisma model access
      MemberExpression(node) {
        // Skip if this is a repository file
        if (isRepositoryFile) return;

        // Check various Prisma access patterns
        // Pattern 1: this.repository.model.method()
        // Pattern 2: repository.model.method()
        // Pattern 3: prisma.model.method()
        // Pattern 4: prismaClient.model.method()

        // We'll check for Prisma patterns directly instead of using isPrismaMethodCall

        // Additional check for PrismaClient methods like $connect, $disconnect, $transaction
        if (node.property.type === AST_NODE_TYPES.Identifier && node.property.name.startsWith('$')) {
          // Check for direct identifier access: prisma.$connect()
          if (node.object.type === AST_NODE_TYPES.Identifier) {
            const objectName = node.object.name.toLowerCase();
            if (objectName === 'prisma' || objectName.includes('prisma') || objectName === 'repository') {
              context.report({
                node,
                messageId: 'invalidPrismaAccess',
              });
            }
          }
          // Check for this.repository.$connect()
          else if (
            node.object.type === AST_NODE_TYPES.MemberExpression &&
            node.object.object.type === AST_NODE_TYPES.ThisExpression &&
            node.object.property.type === AST_NODE_TYPES.Identifier &&
            node.object.property.name === 'repository'
          ) {
            context.report({
              node,
              messageId: 'invalidPrismaAccess',
            });
          }
        }

        // Check for repository.model pattern
        if (
          node.object.type === AST_NODE_TYPES.MemberExpression &&
          node.object.property.type === AST_NODE_TYPES.Identifier &&
          node.property.type === AST_NODE_TYPES.Identifier
        ) {
          const methodName = node.property.name;

          // Check if this looks like a Prisma model access
          const prismaMethodNames = [
            'findUnique',
            'findUniqueOrThrow',
            'findFirst',
            'findFirstOrThrow',
            'findMany',
            'create',
            'createMany',
            'createManyAndReturn',
            'update',
            'updateMany',
            'updateManyAndReturn',
            'upsert',
            'delete',
            'deleteMany',
            'count',
            'aggregate',
            'groupBy',
          ];

          if (prismaMethodNames.includes(methodName)) {
            // Check if the object looks like repository access
            if (
              node.object.object.type === AST_NODE_TYPES.Identifier &&
              (node.object.object.name === 'repository' || node.object.object.name.includes('repository'))
            ) {
              context.report({
                node,
                messageId: 'invalidPrismaAccess',
              });
            }
            // Check for this.repository pattern
            else if (
              node.object.object.type === AST_NODE_TYPES.MemberExpression &&
              node.object.object.object.type === AST_NODE_TYPES.ThisExpression &&
              node.object.object.property.type === AST_NODE_TYPES.Identifier &&
              node.object.object.property.name === 'repository'
            ) {
              context.report({
                node,
                messageId: 'invalidPrismaAccess',
              });
            }
          }
        }
      },
    };
  },
});

export default rule;
