type MockPrismaUser = {
  findUnique: jest.Mock;
  findMany: jest.Mock;
  create: jest.Mock;
  createMany: jest.Mock;
  createManyAndReturn: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
  updateManyAndReturn: jest.Mock;
  delete: jest.Mock;
  deleteMany: jest.Mock;
  count: jest.Mock;
  aggregate: jest.Mock;
  groupBy: jest.Mock;
  findFirst: jest.Mock;
  findFirstOrThrow: jest.Mock;
  findUniqueOrThrow: jest.Mock;
  upsert: jest.Mock;
};

type MockRepositoryService = {
  user: MockPrismaUser;
  $connect: jest.Mock;
  $disconnect: jest.Mock;
  $transaction: jest.Mock;
  $queryRaw: jest.Mock;
  $executeRaw: jest.Mock;
};

export function createMockRepositoryService(): MockRepositoryService {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      createManyAndReturn: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      updateManyAndReturn: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      upsert: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };
}

type MockUserQueryService = {
  findUserByIdOrFail: jest.Mock;
  findDeletedUserByIdOrFail: jest.Mock;
  findAnyUserByIdOrFail: jest.Mock;
  findManyUsers: jest.Mock;
  findManyDeletedUsers: jest.Mock;
  findManyAnyUsers: jest.Mock;
};

export function createMockUserQueryService(): MockUserQueryService {
  return {
    findUserByIdOrFail: jest.fn(),
    findDeletedUserByIdOrFail: jest.fn(),
    findAnyUserByIdOrFail: jest.fn(),
    findManyUsers: jest.fn(),
    findManyDeletedUsers: jest.fn(),
    findManyAnyUsers: jest.fn(),
  };
}

type MockUserCommandService = {
  createUser: jest.Mock;
  createManyAndReturnUsers: jest.Mock;
  updateUserById: jest.Mock;
  deleteUserById: jest.Mock;
  deleteManyUsersById: jest.Mock;
  hardDeleteUserById: jest.Mock;
  hardDeleteManyUsersById: jest.Mock;
  restoreUserById: jest.Mock;
  restoreManyUsersById: jest.Mock;
};

export function createMockUserCommandService(): MockUserCommandService {
  return {
    createUser: jest.fn(),
    createManyAndReturnUsers: jest.fn(),
    updateUserById: jest.fn(),
    deleteUserById: jest.fn(),
    deleteManyUsersById: jest.fn(),
    hardDeleteUserById: jest.fn(),
    hardDeleteManyUsersById: jest.fn(),
    restoreUserById: jest.fn(),
    restoreManyUsersById: jest.fn(),
  };
}

type MockUserAdminFacadeService = {
  findUserById: jest.Mock;
  findDeletedUserById: jest.Mock;
  findAnyUserById: jest.Mock;
  findManyUsers: jest.Mock;
  findManyDeletedUsers: jest.Mock;
  findManyAnyUsers: jest.Mock;
  createUser: jest.Mock;
  createManyAndReturnUsers: jest.Mock;
  updateUserById: jest.Mock;
  deleteUserById: jest.Mock;
  deleteManyUsersById: jest.Mock;
  hardDeleteUserById: jest.Mock;
  hardDeleteManyUsersById: jest.Mock;
  restoreUserById: jest.Mock;
  restoreManyUsersById: jest.Mock;
};

export function createMockUserAdminFacadeService(): MockUserAdminFacadeService {
  return {
    findUserById: jest.fn(),
    findDeletedUserById: jest.fn(),
    findAnyUserById: jest.fn(),
    findManyUsers: jest.fn(),
    findManyDeletedUsers: jest.fn(),
    findManyAnyUsers: jest.fn(),
    createUser: jest.fn(),
    createManyAndReturnUsers: jest.fn(),
    updateUserById: jest.fn(),
    deleteUserById: jest.fn(),
    deleteManyUsersById: jest.fn(),
    hardDeleteUserById: jest.fn(),
    hardDeleteManyUsersById: jest.fn(),
    restoreUserById: jest.fn(),
    restoreManyUsersById: jest.fn(),
  };
}

type MockUserAppFacadeService = {
  findUserById: jest.Mock;
  createUser: jest.Mock;
  updateUserById: jest.Mock;
  deleteUserById: jest.Mock;
};

export function createMockUserAppFacadeService(): MockUserAppFacadeService {
  return {
    findUserById: jest.fn(),
    createUser: jest.fn(),
    updateUserById: jest.fn(),
    deleteUserById: jest.fn(),
  };
}

type MockUserRepositoryService = {
  findUniqueActiveUser: jest.Mock;
  findUniqueDeletedUser: jest.Mock;
  findUniqueAnyUser: jest.Mock;
  findManyActiveUsers: jest.Mock;
  findManyDeletedUsers: jest.Mock;
  findManyAnyUsers: jest.Mock;
  createUser: jest.Mock;
  createManyAndReturnUsers: jest.Mock;
  updateActiveUserById: jest.Mock;
  updateAnyUserById: jest.Mock;
  deleteManyActiveUsersById: jest.Mock;
  updateManyActiveUsersToDeleted: jest.Mock;
  hardDeleteUserById: jest.Mock;
  hardDeleteManyUsersById: jest.Mock;
  restoreUserById: jest.Mock;
  updateManyDeletedUsersToActive: jest.Mock;
};

export function createMockUserRepositoryService(): MockUserRepositoryService {
  return {
    findUniqueActiveUser: jest.fn(),
    findUniqueDeletedUser: jest.fn(),
    findUniqueAnyUser: jest.fn(),
    findManyActiveUsers: jest.fn(),
    findManyDeletedUsers: jest.fn(),
    findManyAnyUsers: jest.fn(),
    createUser: jest.fn(),
    createManyAndReturnUsers: jest.fn(),
    updateActiveUserById: jest.fn(),
    updateAnyUserById: jest.fn(),
    deleteManyActiveUsersById: jest.fn(),
    updateManyActiveUsersToDeleted: jest.fn(),
    hardDeleteUserById: jest.fn(),
    hardDeleteManyUsersById: jest.fn(),
    restoreUserById: jest.fn(),
    updateManyDeletedUsersToActive: jest.fn(),
  };
}
