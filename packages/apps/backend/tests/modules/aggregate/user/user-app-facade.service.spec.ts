import { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import { type UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { type UserQueryService } from '@/modules/aggregate/user/user.query.service';

describe('UserAppFacadeService', () => {
  let service: UserAppFacadeService;

  const mockCommandService: jest.Mocked<UserCommandService> = {
    createUser: jest.fn(),
    updateUserById: jest.fn(),
    deleteUserById: jest.fn(),
  } as any;

  const mockQueryService: jest.Mocked<UserQueryService> = {
    findUserByIdOrFail: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserAppFacadeService(mockCommandService, mockQueryService);
  });

  describe.each([
    {
      label: 'findUserById',
      method: 'findUserById',
      dep: 'userQueryService',
      mockFn: 'findUserByIdOrFail',
      input: { id: 'user-1' },
      result: { id: 'user-1', name: 'Test User' },
    },
    {
      label: 'createUser',
      method: 'createUser',
      dep: 'userCommandService',
      mockFn: 'createUser',
      input: { name: 'New', email: 'new@example.com' },
      result: { id: 'new-id', name: 'New' },
    },
    {
      label: 'updateUserById',
      method: 'updateUserById',
      dep: 'userCommandService',
      mockFn: 'updateUserById',
      input: { id: 'user-1', name: 'Updated' },
      result: { id: 'user-1', name: 'Updated' },
    },
    {
      label: 'deleteUserById',
      method: 'deleteUserById',
      dep: 'userCommandService',
      mockFn: 'deleteUserById',
      input: { id: 'user-1' },
      result: undefined,
    },
  ])('$label', ({ method, dep, mockFn, input, result }) => {
    it(`should delegate to ${dep}.${mockFn}`, async () => {
      const targetService = dep === 'userCommandService' ? mockCommandService : mockQueryService;
      targetService[mockFn].mockResolvedValue(result);

      const res = await (service as any)[method](input);

      expect(targetService[mockFn]).toHaveBeenCalledWith(input);
      expect(res).toEqual(result);
    });
  });
});
