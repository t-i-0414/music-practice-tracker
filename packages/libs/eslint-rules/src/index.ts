import prismaCreateNamingConvention from './prisma-create-naming-convention';
import prismaCreateNoDeletedAt from './prisma-create-no-deleted-at';
import prismaDeleteNamingConvention from './prisma-delete-naming-convention';
import prismaFindNamingConvention from './prisma-find-naming-convention';
import prismaUpdateNamingConvention from './prisma-update-naming-convention';

// Export rules object for ESLint plugin
const rules = {
  'prisma-create-naming-convention': prismaCreateNamingConvention,
  'prisma-create-no-deleted-at': prismaCreateNoDeletedAt,
  'prisma-delete-naming-convention': prismaDeleteNamingConvention,
  'prisma-find-naming-convention': prismaFindNamingConvention,
  'prisma-update-naming-convention': prismaUpdateNamingConvention,
};

export default { rules };

// Also export individual rules for testing
export {
  prismaCreateNamingConvention,
  prismaCreateNoDeletedAt,
  prismaDeleteNamingConvention,
  prismaFindNamingConvention,
  prismaUpdateNamingConvention,
};
