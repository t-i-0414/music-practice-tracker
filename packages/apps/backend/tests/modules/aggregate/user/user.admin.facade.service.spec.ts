import { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import { type UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { type UserQueryService } from '@/modules/aggregate/user/user.query.service';

describe('UserAdminFacadeService', () => {
  let service: UserAdminFacadeService;

  const mockQueryService: jest.Mocked<UserQueryService> = {
    findUserByIdOrFail: jest.fn(),
    findDeletedUserByIdOrFail: jest.fn(),
    findAnyUserByIdOrFail: jest.fn(),
    findManyUsers: jest.fn(),
    findManyDeletedUsers: jest.fn(),
    findManyAnyUsers: jest.fn(),
  } as any;

  const mockCommandService: jest.Mocked<UserCommandService> = {
    createUser: jest.fn(),
    createManyAndReturnUsers: jest.fn(),
    updateUserById: jest.fn(),
    deleteUserById: jest.fn(),
    deleteManyUsersById: jest.fn(),
    hardDeleteUserById: jest.fn(),
    hardDeleteManyUsersById: jest.fn(),
    restoreUserById: jest.fn(),
    restoreManyUsersById: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserAdminFacadeService(mockCommandService, mockQueryService);
  });

  describe.each([
    {
      label: 'findUserById',
      method: 'findUserById',
      dep: 'userQueryService',
      mockFn: 'findUserByIdOrFail',
      input: { id: 'u1' },
      result: { id: 'u1', name: 'Alice' },
    },
    {
      label: 'findDeletedUserById',
      method: 'findDeletedUserById',
      dep: 'userQueryService',
      mockFn: 'findDeletedUserByIdOrFail',
      input: { id: 'u2' },
      result: { id: 'u2', name: 'Deleted User' },
    },
    {
      label: 'findAnyUserById',
      method: 'findAnyUserById',
      dep: 'userQueryService',
      mockFn: 'findAnyUserByIdOrFail',
      input: { id: 'u3' },
      result: { id: 'u3', name: 'Any User' },
    },
    {
      label: 'findManyUsers',
      method: 'findManyUsers',
      dep: 'userQueryService',
      mockFn: 'findManyUsers',
      input: { ids: ['u1', 'u2'] },
      result: [{ id: 'u1' }, { id: 'u2' }],
    },
    {
      label: 'findManyDeletedUsers',
      method: 'findManyDeletedUsers',
      dep: 'userQueryService',
      mockFn: 'findManyDeletedUsers',
      input: { ids: ['u3', 'u4'] },
      result: [{ id: 'u3' }, { id: 'u4' }],
    },
    {
      label: 'findManyAnyUsers',
      method: 'findManyAnyUsers',
      dep: 'userQueryService',
      mockFn: 'findManyAnyUsers',
      input: { ids: ['u5', 'u6'] },
      result: [{ id: 'u5' }, { id: 'u6' }],
    },
    {
      label: 'createUser',
      method: 'createUser',
      dep: 'userCommandService',
      mockFn: 'createUser',
      input: { name: 'New', email: 'new@example.com' },
      result: { id: 'new', name: 'New' },
    },
    {
      label: 'createManyAndReturnUsers',
      method: 'createManyAndReturnUsers',
      dep: 'userCommandService',
      mockFn: 'createManyAndReturnUsers',
      input: { users: [{ name: 'A' }, { name: 'B' }] },
      result: [{ id: '1' }, { id: '2' }],
    },
    {
      label: 'updateUserById',
      method: 'updateUserById',
      dep: 'userCommandService',
      mockFn: 'updateUserById',
      input: { id: 'u1', name: 'Updated' },
      result: { id: 'u1', name: 'Updated' },
    },
    {
      label: 'deleteUserById',
      method: 'deleteUserById',
      dep: 'userCommandService',
      mockFn: 'deleteUserById',
      input: { id: 'u1' },
      result: undefined,
    },
    {
      label: 'deleteManyUsersById',
      method: 'deleteManyUsersById',
      dep: 'userCommandService',
      mockFn: 'deleteManyUsersById',
      input: { ids: ['u1', 'u2'] },
      result: undefined,
    },
    {
      label: 'hardDeleteUserById',
      method: 'hardDeleteUserById',
      dep: 'userCommandService',
      mockFn: 'hardDeleteUserById',
      input: { id: 'u3' },
      result: undefined,
    },
    {
      label: 'hardDeleteManyUsersById',
      method: 'hardDeleteManyUsersById',
      dep: 'userCommandService',
      mockFn: 'hardDeleteManyUsersById',
      input: { ids: ['u4', 'u5'] },
      result: undefined,
    },
    {
      label: 'restoreUserById',
      method: 'restoreUserById',
      dep: 'userCommandService',
      mockFn: 'restoreUserById',
      input: { id: 'u6' },
      result: { id: 'u6', name: 'Restored' },
    },
    {
      label: 'restoreManyUsersById',
      method: 'restoreManyUsersById',
      dep: 'userCommandService',
      mockFn: 'restoreManyUsersById',
      input: { ids: ['u7', 'u8'] },
      result: [{ id: 'u7' }, { id: 'u8' }],
    },
  ])('$label', ({ method, dep, mockFn, input, result }) => {
    it(`should delegate to ${dep}.${mockFn}`, async () => {
      const mockService = dep === 'userQueryService' ? mockQueryService : mockCommandService;
      mockService[mockFn].mockResolvedValue(result);

      const res = await (service as any)[method](input);

      expect(mockService[mockFn]).toHaveBeenCalledWith(input);
      expect(res).toEqual(result);
    });
  });
});
