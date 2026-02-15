import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { ESLintUtils } from '@typescript-eslint/utils';

type MessageIds = 'noRawUnsafe';

const BANNED_METHODS = new Set(['$queryRawUnsafe', '$executeRawUnsafe']);

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/music-practice-tracker/eslint-plugins/blob/main/docs/${name}.md`,
);

const rule = createRule<[], MessageIds>({
  name: 'no-prisma-raw-unsafe',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Prisma `$queryRawUnsafe` and `$executeRawUnsafe` in favor of their safe tagged-template counterparts (`$queryRaw`, `$executeRaw`)',
    },
    messages: {
      noRawUnsafe:
        'Use `{{ safe }}` (tagged template) instead of `{{ unsafe }}`. Raw unsafe methods bypass SQL injection protection.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;

        if (callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (callee.property.type !== AST_NODE_TYPES.Identifier) return;

        const methodName = callee.property.name;

        if (!BANNED_METHODS.has(methodName)) return;

        const safe = methodName.replace('Unsafe', '');

        context.report({
          node: callee.property,
          messageId: 'noRawUnsafe',
          data: { unsafe: methodName, safe },
        });
      },
    };
  },
});

export default rule;
