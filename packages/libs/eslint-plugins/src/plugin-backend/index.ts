import noInternalId from './no-internal-id';
import prismaNamingConvention from './prisma-naming-convention';
import prismaRepositoryOnlyAccess from './prisma-repository-only-access';
import repositoryModelAccessRestriction from './repository-model-access-restriction';

const plugin = {
  meta: {
    name: '@music-practice-tracker/eslint-plugin-backend',
    version: '1.0.0',
  },
  rules: {
    'no-internal-id': noInternalId,
    'prisma-naming-convention': prismaNamingConvention,
    'prisma-repository-only-access': prismaRepositoryOnlyAccess,
    'repository-model-access-restriction': repositoryModelAccessRestriction,
  },
};

export default plugin;
