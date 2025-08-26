import * as path from 'path';

import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/music-practice-tracker/eslint-plugins/blob/main/docs/${name}.md`,
);

// Read methods that should only be allowed in query.service.ts
const READ_METHODS = [
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'findUnique',
  'findUniqueOrThrow',
  'count',
  'aggregate',
  'groupBy',
];

// Write methods that should only be allowed in command.service.ts
const WRITE_METHODS = [
  'create',
  'createMany',
  'createManyAndReturn',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
];

const rule = createRule({
  name: 'repository-model-access-restriction',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce Prisma model import and repository access restrictions in aggregates',
    },
    messages: {
      invalidPrismaImport: 'Prisma models can only be imported in {{allowedFiles}} files within the aggregates folder',
      invalidRepositoryAccess:
        'Repository "{{modelName}}" can only be accessed from aggregates/{{aggregatePath}} folder',
      invalidQueryMethod:
        'Query service can only use read methods ({{allowedMethods}}). "{{method}}" is a write method',
      invalidCommandMethod:
        'Command service can only use write methods ({{allowedMethods}}). "{{method}}" is a read method',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filePath = context.filename || context.getFilename();
    const pathParts = filePath.split(path.sep);
    const aggregatesIndex = pathParts.indexOf('aggregates');
    const isInAggregates = aggregatesIndex !== -1;
    const fileName = pathParts[pathParts.length - 1];
    const isQueryService = fileName === 'query.service.ts';
    const isCommandService = fileName === 'command.service.ts';

    // Track imported Prisma models
    const importedPrismaModels: Set<string> = new Set();

    return {
      // Check Prisma model imports
      ImportDeclaration(node) {
        const source = node.source.value;

        // Check if this is a Prisma import
        if (source.includes('@prisma/client') || source.includes('@/generated/prisma')) {
          // Only check if we're in the aggregates folder
          if (isInAggregates) {
            // Only allow Prisma imports in command.service.ts or query.service.ts
            if (!isQueryService && !isCommandService) {
              context.report({
                node,
                messageId: 'invalidPrismaImport',
                data: {
                  allowedFiles: 'command.service.ts or query.service.ts',
                },
              });
            }
          }

          // Track imported models
          node.specifiers.forEach((specifier) => {
            if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
              const imported = specifier.imported;
              const importedName = imported.type === AST_NODE_TYPES.Identifier ? imported.name : imported.value;
              // Exclude Prisma client itself and common types
              if (importedName !== 'PrismaClient' && importedName !== 'Prisma') {
                importedPrismaModels.add(importedName);
              }
            }
          });
        }
      },

      // Check repository access and method calls
      MemberExpression(node) {
        // Pattern 1: Check repository model access (this.repository.user)
        const repositoryModelAccess = checkRepositoryModelAccess(node);
        if (repositoryModelAccess) {
          validateRepositoryScope({
            modelName: repositoryModelAccess.modelName,
            filePath,
            aggregatesIndex,
            pathParts,
            context,
            node,
          });
        }

        // Pattern 2: Check repository method calls (this.repository.user.findMany())
        const repositoryMethodCall = checkRepositoryMethodCall(node);
        if (repositoryMethodCall && (isQueryService || isCommandService)) {
          validateMethodCall(repositoryMethodCall.method, isQueryService, isCommandService, context, node);
        }
      },
    };
  },
});

// Helper function to check if this is a repository model access
function checkRepositoryModelAccess(node: TSESTree.MemberExpression): { modelName: string } | null {
  // Pattern: this.repository.model (where we're not yet accessing a method)
  // We need to check we're at the model level, not the method level
  if (
    node.object?.type === AST_NODE_TYPES.MemberExpression &&
    node.object.object?.type === AST_NODE_TYPES.ThisExpression &&
    node.object.property?.type === AST_NODE_TYPES.Identifier &&
    node.object.property.name === 'repository' &&
    node.property?.type === AST_NODE_TYPES.Identifier &&
    // Exclude if this is part of a method call (parent is another MemberExpression)
    node.parent?.type !== AST_NODE_TYPES.CallExpression
  ) {
    return { modelName: node.property.name };
  }

  // Pattern: this.repository['model'] (with bracket notation)
  if (
    node.computed && // This node uses bracket notation
    node.object?.type === AST_NODE_TYPES.MemberExpression &&
    node.object.object?.type === AST_NODE_TYPES.ThisExpression &&
    node.object.property?.type === AST_NODE_TYPES.Identifier &&
    node.object.property.name === 'repository' &&
    node.property?.type === AST_NODE_TYPES.Literal &&
    typeof node.property.value === 'string' &&
    // Exclude if this is part of a method call
    node.parent?.type !== AST_NODE_TYPES.CallExpression
  ) {
    return { modelName: node.property.value };
  }

  return null;
}

// Helper function to check repository method calls
function checkRepositoryMethodCall(node: TSESTree.MemberExpression): { method: string } | null {
  // Pattern: this.repository.model.method()
  if (
    node.object?.type === AST_NODE_TYPES.MemberExpression &&
    node.object.object?.type === AST_NODE_TYPES.MemberExpression &&
    node.object.object.object?.type === AST_NODE_TYPES.ThisExpression &&
    node.object.object.property?.type === AST_NODE_TYPES.Identifier &&
    node.object.object.property.name === 'repository' &&
    node.property?.type === AST_NODE_TYPES.Identifier
  ) {
    return { method: node.property.name };
  }

  return null;
}

// Validate repository access scope
type ValidateRepositoryScopeParams = {
  modelName: string;
  filePath: string;
  aggregatesIndex: number;
  pathParts: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any;
  node: TSESTree.MemberExpression;
};

function validateRepositoryScope(params: ValidateRepositoryScopeParams) {
  const { modelName, aggregatesIndex, pathParts, context, node } = params;
  // Only check files in aggregates folder
  if (aggregatesIndex === -1) return;

  // Get the aggregate path after 'aggregates'
  const aggregatePath = pathParts.slice(aggregatesIndex + 1, -1); // Remove filename

  // Repository access rules:
  // 1. Model can be accessed from aggregates/{modelName} folder
  // 2. Model can be accessed from aggregates/**/{modelName} parent folders

  let isValidAccess = false;

  // Check if we're in the correct aggregate folder
  if (aggregatePath.length > 0) {
    // Check if the model matches any folder in the current path
    isValidAccess = aggregatePath.some((folder) => folder === modelName);
  }

  if (!isValidAccess) {
    const allowedPath = aggregatePath.includes(modelName) ? aggregatePath.join('/') : `${modelName} or **/${modelName}`;

    context.report({
      node,
      messageId: 'invalidRepositoryAccess',
      data: {
        modelName,
        aggregatePath: allowedPath,
      },
    });
  }
}

// Validate method calls in query/command services
function validateMethodCall(
  method: string,
  isQueryService: boolean,
  isCommandService: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any,
  node: TSESTree.MemberExpression,
) {
  if (isQueryService && WRITE_METHODS.includes(method)) {
    context.report({
      node,
      messageId: 'invalidQueryMethod',
      data: {
        method,
        allowedMethods: READ_METHODS.join(', '),
      },
    });
  }

  if (isCommandService && READ_METHODS.includes(method)) {
    context.report({
      node,
      messageId: 'invalidCommandMethod',
      data: {
        method,
        allowedMethods: WRITE_METHODS.join(', '),
      },
    });
  }
}

export default rule;
