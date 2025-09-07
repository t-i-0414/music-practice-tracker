module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [0],
    'scope-enum': [
      2,
      'always',
      ['root', 'backend', 'mobile', 'admin', 'eslint-configs', 'eslint-plugins', 'tsconfig-base'],
    ],
  },
};
