import * as path from 'node:path';

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/music-practice-tracker/eslint-plugins/blob/main/docs/${name}.md`,
);

const rule = createRule({
  name: 'aggregate-import-restriction',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that aggregates cannot import from other aggregates',
    },
    messages: {
      crossAggregateImport:
        'Aggregate "{{currentAggregate}}" cannot import from aggregate "{{targetAggregate}}". Aggregates should be independent.',
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

    // Parse file path to determine if we're in an aggregate
    const pathParts = filePath.split(path.sep);
    const aggregatesIndex = pathParts.indexOf('aggregates');

    // If not in aggregates folder, no restrictions
    if (aggregatesIndex === -1) {
      return {};
    }

    // Get current aggregate folder name
    const currentAggregate = pathParts[aggregatesIndex + 1];

    // If no aggregate folder name found (e.g., directly in aggregates folder)
    if (!currentAggregate) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Skip external packages and non-relative imports
        if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
          return;
        }

        // Resolve the import path
        const rawResolvedPath = importPath.startsWith('@/')
          ? // Absolute import from project root
            importPath.replace('@/', '')
          : // Relative import
            (() => {
              const currentDir = path.dirname(filePath);
              return path.relative(process.cwd(), path.resolve(currentDir, importPath));
            })();

        // Normalize the resolved path
        const resolvedPath = rawResolvedPath.replace(/\\/gu, '/');

        // Check if the import is from another aggregate
        const resolvedPathParts = resolvedPath.split('/');
        const targetAggregatesIndex = resolvedPathParts.indexOf('aggregates');

        if (targetAggregatesIndex !== -1) {
          const targetAggregate = resolvedPathParts[targetAggregatesIndex + 1];

          // If importing from a different aggregate, report error
          if (targetAggregate && targetAggregate !== currentAggregate) {
            context.report({
              node,
              messageId: 'crossAggregateImport',
              data: {
                currentAggregate,
                targetAggregate,
              },
            });
          }
        }
      },
    };
  },
});

export default rule;
