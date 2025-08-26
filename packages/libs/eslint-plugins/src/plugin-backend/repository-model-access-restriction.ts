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
      invalidPrismaImport: 'Prisma models can only be imported in {{allowedFiles}}',
      invalidModelImport:
        'Model "{{modelName}}" cannot be imported in {{aggregate}} aggregate. Only {{expectedModel}} model is allowed',
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

    // Skip test files
    if (filePath.includes('/tests/') || filePath.includes('.test.') || filePath.includes('.spec.')) {
      return {};
    }

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
        if (
          (source.includes('@prisma/client') && !source.includes('/runtime/')) ||
          source.includes('@/generated/prisma')
        ) {
          // Skip type-only imports
          if (node.importKind === 'type') return;

          // Check if all specifiers are type-only
          const hasNonTypeImport = node.specifiers.some((spec) => {
            if (spec.type === AST_NODE_TYPES.ImportSpecifier && spec.importKind === 'type') {
              return false;
            }
            return true;
          });

          // Only check non-type imports
          if (hasNonTypeImport) {
            // Special case: Allow PrismaClient import in repository/service.ts
            const isRepositoryService = filePath.endsWith('repository/service.ts');
            if (isRepositoryService) {
              // Only allow PrismaClient import, not model imports
              const importsOnlyPrismaClient = node.specifiers.every((spec) => {
                if (spec.type === AST_NODE_TYPES.ImportSpecifier) {
                  const imported = spec.imported;
                  const importedName = imported.type === AST_NODE_TYPES.Identifier ? imported.name : imported.value;
                  return importedName === 'PrismaClient' || importedName === 'Prisma';
                }
                return false;
              });
              if (importsOnlyPrismaClient) return;
            }

            // Prisma imports are only allowed in command.service.ts or query.service.ts within aggregates
            if (!isInAggregates || (!isQueryService && !isCommandService)) {
              context.report({
                node,
                messageId: 'invalidPrismaImport',
                data: {
                  allowedFiles: 'command.service.ts or query.service.ts within aggregates folder',
                },
              });
            }
          }

          // Track imported models and validate they match the aggregate
          if (hasNonTypeImport && isInAggregates && (isQueryService || isCommandService)) {
            node.specifiers.forEach((specifier) => {
              if (specifier.type === AST_NODE_TYPES.ImportSpecifier && specifier.importKind !== 'type') {
                const imported = specifier.imported;
                const importedName = imported.type === AST_NODE_TYPES.Identifier ? imported.name : imported.value;
                // Exclude Prisma client itself and common types
                if (importedName !== 'PrismaClient' && importedName !== 'Prisma') {
                  importedPrismaModels.add(importedName);

                  // Check if the imported model matches the current aggregate
                  const currentAggregate = pathParts[aggregatesIndex + 1];
                  // Convert aggregate folder name from kebab-case to camelCase
                  const camelCaseAggregate = currentAggregate.replace(/-(?<letter>[a-z])/gu, (_, letter: string) =>
                    letter.toUpperCase(),
                  );
                  // Capitalize first letter to match model naming convention
                  const expectedModelName = camelCaseAggregate.charAt(0).toUpperCase() + camelCaseAggregate.slice(1);

                  // Allow common Prisma types
                  const commonTypes = ['Prisma', 'TransactionClient'];
                  if (commonTypes.includes(importedName)) {
                    return;
                  }

                  // Allow the model that matches the aggregate name
                  if (importedName === expectedModelName) {
                    return;
                  }

                  // For parent aggregates, we allow importing specific child models
                  // Known parent-child relationships (would ideally be configurable)
                  const parentChildRelations: Record<string, string[]> = {
                    user: ['Profile', 'Setting'], // User aggregate can import Profile and Setting models
                    'user-auth-token': ['User'], // User auth token aggregate can import User model
                    // Add more parent-child relationships as needed
                  };

                  // Check if this aggregate has known child models it can import
                  const allowedChildModels = parentChildRelations[currentAggregate] || [];
                  if (allowedChildModels.includes(importedName)) {
                    return;
                  }

                  // If none of the above conditions are met, report an error
                  context.report({
                    node: specifier,
                    messageId: 'invalidModelImport',
                    data: {
                      modelName: importedName,
                      expectedModel: expectedModelName,
                      aggregate: currentAggregate,
                    },
                  });
                }
              }
            });
          }
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

  // Convert modelName from camelCase to kebab-case for folder comparison
  const kebabCaseModel = modelName
    .replace(/(?<upper>[A-Z])/gu, '-$1')
    .toLowerCase()
    .replace(/^-/u, '');

  // If outside aggregates folder, no repository access is allowed
  if (aggregatesIndex === -1) {
    context.report({
      node,
      messageId: 'invalidRepositoryAccess',
      data: {
        modelName,
        aggregatePath: `${kebabCaseModel}/**`,
      },
    });
    return;
  }

  // Get the aggregate path after 'aggregates'
  const aggregatePath = pathParts.slice(aggregatesIndex + 1, -1); // Remove filename

  // Repository access rules:
  // 1. Model can be accessed from its own aggregate folder (aggregates/{modelName}/)
  // 2. Parent aggregates can access child aggregate models (aggregates/user/ can access profile model)
  // This allows hierarchical aggregate management

  // Known parent-child relationships (would ideally be configurable)
  const parentChildRelations: Record<string, string[]> = {
    user: ['profile', 'setting'], // User aggregate can access profile and setting repositories
    'user-auth-token': ['user'], // User auth token aggregate can access user repository
    // Add more parent-child relationships as needed
  };

  let isValidAccess = false;

  if (aggregatePath.length > 0) {
    // Get the parent aggregate (first folder after 'aggregates')
    const parentAggregate = aggregatePath[0];
    const camelCaseParent = parentAggregate.replace(/-(?<letter>[a-z])/gu, (_, letter: string) => letter.toUpperCase());

    // Check if we're accessing the parent aggregate's model
    if (camelCaseParent === modelName) {
      isValidAccess = true;
    }
    // Check if this is a parent aggregate accessing a known child model
    else if (aggregatePath.length === 1) {
      const allowedChildModels = parentChildRelations[parentAggregate] || [];
      if (allowedChildModels.includes(modelName)) {
        isValidAccess = true;
      }
    }
    // For child aggregates in nested paths (e.g., aggregates/user/profile/)
    else if (aggregatePath.length > 1) {
      // Check if the model matches any folder in the path
      for (const folder of aggregatePath) {
        const camelCaseFolder = folder.replace(/-(?<letter>[a-z])/gu, (_, letter: string) => letter.toUpperCase());
        if (camelCaseFolder === modelName) {
          isValidAccess = true;
          break;
        }
      }
    }
  }

  if (!isValidAccess) {
    const allowedPath = `${kebabCaseModel}/**`;

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
