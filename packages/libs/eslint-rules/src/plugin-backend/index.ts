import prismaCreateNamingConvention from './prisma-create-naming-convention';
import prismaCreateNoDeletedAt from './prisma-create-no-deleted-at';
import prismaDeleteNamingConvention from './prisma-delete-naming-convention';
import prismaFindNamingConvention from './prisma-find-naming-convention';
import prismaUpdateNamingConvention from './prisma-update-naming-convention';

const plugin = {
  meta: {
    name: '@music-practice-tracker/eslint-plugin-backend',
    version: '1.0.0',
  },
  rules: {
    'prisma-create-naming-convention': prismaCreateNamingConvention,
    'prisma-create-no-deleted-at': prismaCreateNoDeletedAt,
    'prisma-delete-naming-convention': prismaDeleteNamingConvention,
    'prisma-find-naming-convention': prismaFindNamingConvention,
    'prisma-update-naming-convention': prismaUpdateNamingConvention,
  },
};

export default plugin;
