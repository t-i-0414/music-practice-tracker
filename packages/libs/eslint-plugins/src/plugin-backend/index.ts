import aggregateImportRestriction from './aggregate-import-restriction';
import noInternalId from './no-internal-id';
import noPrismaRawUnsafe from './no-prisma-raw-unsafe';
import prismaNamingConvention from './prisma-naming-convention';
import repositoryModelAccessRestriction from './repository-model-access-restriction';
import throwNewCommonErrorOnly from './throw-new-common-error-only';

const plugin = {
  meta: {
    name: '@music-practice-tracker/eslint-plugin-backend',
    version: '1.0.0',
  },
  rules: {
    'aggregate-import-restriction': aggregateImportRestriction,
    'no-internal-id': noInternalId,
    'no-prisma-raw-unsafe': noPrismaRawUnsafe,
    'prisma-naming-convention': prismaNamingConvention,
    'repository-model-access-restriction': repositoryModelAccessRestriction,
    'throw-new-common-error-only': throwNewCommonErrorOnly,
  },
};

export default plugin;
