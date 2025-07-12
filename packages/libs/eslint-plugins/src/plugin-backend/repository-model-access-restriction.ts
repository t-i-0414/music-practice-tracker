import * as path from 'path';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/music-practice-tracker/eslint_plugins/blob/main/docs/${name}.md`,
);

const rule = createRule({
  name: 'repository-model-access-restriction',
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure repository files only access models from their own directory or subdirectories',
    },
    messages: {
      invalidModelAccess:
        'Repository "{{repositoryName}}" should not access model "{{modelName}}". Repositories can only access models from their own directory or subdirectories.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      MemberExpression(node) {
        // Check if this is accessing a model through repository
        // Pattern 1: this.repository.user.<method> (dot notation)
        // Pattern 2: this.repository['user'].<method> (bracket notation)

        let isRepositoryAccess = false;
        let modelName: string | null = null;

        // Check for dot notation: this.repository.model
        if (
          node.object?.type === AST_NODE_TYPES.MemberExpression &&
          node.object.object?.type === AST_NODE_TYPES.MemberExpression &&
          node.object.object.object?.type === AST_NODE_TYPES.ThisExpression &&
          node.object.object.property?.type === AST_NODE_TYPES.Identifier &&
          node.object.object.property.name === 'repository' &&
          node.object.property?.type === AST_NODE_TYPES.Identifier
        ) {
          isRepositoryAccess = true;
          modelName = node.object.property.name;
        }
        // Check for bracket notation: this.repository['model']
        else if (
          node.object?.type === AST_NODE_TYPES.MemberExpression &&
          node.object.computed && // This indicates bracket notation
          node.object.object?.type === AST_NODE_TYPES.MemberExpression &&
          node.object.object.object?.type === AST_NODE_TYPES.ThisExpression &&
          node.object.object.property?.type === AST_NODE_TYPES.Identifier &&
          node.object.object.property.name === 'repository' &&
          node.object.property?.type === AST_NODE_TYPES.Literal &&
          typeof node.object.property.value === 'string'
        ) {
          isRepositoryAccess = true;
          modelName = node.object.property.value;
        }

        if (!isRepositoryAccess || !modelName) {
          return;
        }

        // Get the current file path
        const filePath = context.filename || context.getFilename();

        // Check if this is a repository file
        if (!filePath.includes('.repository.ts')) {
          return;
        }

        // Extract the repository directory and name
        const pathParts = filePath.split(path.sep);
        const aggregateIndex = pathParts.indexOf('aggregate');

        if (aggregateIndex === -1 || aggregateIndex + 1 >= pathParts.length) {
          return;
        }

        // Extract the repository's directory path relative to aggregate
        // For example: "aggregate/user/setting/setting.repository.ts" -> ["user", "setting"]
        const repositoryPath = pathParts.slice(aggregateIndex + 1);
        // Remove the filename to get just the directory path
        const repositoryDir = repositoryPath.slice(0, -1);

        // Get the top-level aggregate (first directory after 'aggregate')
        const topLevelAggregate = repositoryDir[0];

        // Model name is already extracted above from either dot or bracket notation

        // Rules for model access:
        // 1. Repositories can only access models that match their own directory name
        //    - user/user.repository.ts can access 'user' model
        //    - user/setting/setting.repository.ts can only access 'setting' model (NOT 'user')
        // 2. Top-level repositories (directly under aggregate/) can also access subdirectory models
        //    - user/user.repository.ts can access 'setting' model (assumed subdirectory)
        //    - But cannot access other top-level aggregates

        // Get the repository's own directory name (last element in the path)
        const repositoryOwnDir = repositoryDir[repositoryDir.length - 1];

        // Check if model matches the repository's own directory
        if (modelName === repositoryOwnDir) {
          return; // Valid: accessing own model
        }

        // For top-level repositories, we need to be more permissive
        // since they should be able to access their subdirectory models
        const isTopLevelRepository = repositoryDir.length === 1;

        if (isTopLevelRepository) {
          // Top-level repositories can access subdirectory models
          // We need a list of known top-level aggregates to properly validate
          // For now, let's define some common patterns for other aggregates

          // List of known top-level aggregates (this could be configured or auto-discovered)
          const knownTopLevelAggregates = ['user', 'post', 'practice', 'comment', 'track', 'session', 'goal'];

          // Check if the model is another top-level aggregate (not the same as current aggregate)
          if (
            knownTopLevelAggregates.includes(modelName.toLowerCase()) &&
            modelName.toLowerCase() !== topLevelAggregate.toLowerCase()
          ) {
            context.report({
              node,
              messageId: 'invalidModelAccess',
              data: {
                repositoryName: topLevelAggregate,
                modelName,
              },
            });
          }
          // Otherwise, assume it's a valid subdirectory model
        } else {
          // Subdirectory repositories have already been checked above
          // If we're here, it means the model doesn't match any directory in the path
          context.report({
            node,
            messageId: 'invalidModelAccess',
            data: {
              repositoryName: repositoryDir.join('/'),
              modelName,
            },
          });
        }
      },
    };
  },
});

export default rule;
