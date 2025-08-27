import aggregateImportRestriction from './aggregate-import-restriction';
import noInternalId from './no-internal-id';
import prismaNamingConvention from './prisma-naming-convention';
import repositoryModelAccessRestriction from './repository-model-access-restriction';

const plugin = {
  meta: {
    name: '@music-practice-tracker/eslint-plugin-backend',
    version: '1.0.0',
  },
  rules: {
    'aggregate-import-restriction': aggregateImportRestriction,
    'no-internal-id': noInternalId,
    'prisma-naming-convention': prismaNamingConvention,
    'repository-model-access-restriction': repositoryModelAccessRestriction,
  },
};

export default plugin;
