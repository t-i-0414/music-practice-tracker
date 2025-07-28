import noInternalId from './no-internal-id';
import prismaCreateNamingConvention from './prisma-create-naming-convention';
import prismaCreateNoDeletedAt from './prisma-create-no-deleted-at';
import prismaDeleteNamingConvention from './prisma-delete-naming-convention';
import prismaFindNamingConvention from './prisma-find-naming-convention';
import prismaRepositoryOnlyAccess from './prisma-repository-only-access';
import prismaUpdateNamingConvention from './prisma-update-naming-convention';
import repositoryModelAccessRestriction from './repository-model-access-restriction';

const plugin = {
  meta: {
    name: '@music-practice-tracker/eslint-plugin-backend',
    version: '1.0.0',
  },
  rules: {
    'no-internal-id': noInternalId,
    'prisma-create-naming-convention': prismaCreateNamingConvention,
    'prisma-create-no-deleted-at': prismaCreateNoDeletedAt,
    'prisma-delete-naming-convention': prismaDeleteNamingConvention,
    'prisma-find-naming-convention': prismaFindNamingConvention,
    'prisma-repository-only-access': prismaRepositoryOnlyAccess,
    'prisma-update-naming-convention': prismaUpdateNamingConvention,
    'repository-model-access-restriction': repositoryModelAccessRestriction,
  },
};

export default plugin;
