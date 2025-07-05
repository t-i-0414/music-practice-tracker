import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { type UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { type UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import * as responseMapper from '@/modules/aggregate/user/user.response.dto';
import { createMockUser } from '@/tests/helper/create-mock-user';

jest.mock('@/modules/aggregate/user/user.response.dto', () => ({
  toActiveUserDto: jest.fn(),
  toActiveUsersDto: jest.fn(),
}));

describe('UserCommandService', () => {
  let service: UserCommandService;
  let repository: jest.Mocked<UserRepositoryService>;
  let queryService: jest.Mocked<UserQueryService>;

  beforeEach(() => {
    repository = {
      createUser: jest.fn(),
      createManyAndReturnUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      deleteManyUsers: jest.fn(),
      hardDeleteUser: jest.fn(),
      hardDeleteManyUsers: jest.fn(),
      restoreUser: jest.fn(),
      restoreManyAndReturnUsers: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryService>;

    queryService = {
      findUserByIdOrFail: jest.fn(),
    } as unknown as jest.Mocked<UserQueryService>;

    service = new UserCommandService(repository, queryService);
  });

  describe('createUser', () => {
    it('returns mapped user', async () => {
      const input = { name: 'Takuya', email: 'takuya@example.com' };
      const user = createMockUser(input);
      const mapped = { id: 'mapped-user' };

      repository.createUser.mockResolvedValue(user);
      (responseMapper.toActiveUserDto as jest.Mock).mockReturnValue(mapped);

      const result = await service.createUser(input);

      expect(result).toBe(mapped);
      expect(repository.createUser).toHaveBeenCalledWith(input);
      expect(responseMapper.toActiveUserDto).toHaveBeenCalledWith(user);
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('returns mapped users', async () => {
      const users = [createMockUser({ id: '1' }), createMockUser({ id: '2' })];
      const input = { users: users.map(({ name, email }) => ({ name, email })) };
      const mapped = { users: [{ id: '1' }, { id: '2' }] };

      repository.createManyAndReturnUsers.mockResolvedValue(users);
      (responseMapper.toActiveUsersDto as jest.Mock).mockReturnValue(mapped);

      const result = await service.createManyAndReturnUsers(input);

      expect(result).toBe(mapped);
      expect(repository.createManyAndReturnUsers).toHaveBeenCalledWith(input.users);
      expect(responseMapper.toActiveUsersDto).toHaveBeenCalledWith(users);
    });
  });

  describe('updateUserById', () => {
    it('updates after checking existence and returns mapped user', async () => {
      const id = 'user-id';
      const user = createMockUser({ id });
      const data = { name: 'Updated' };
      const input = { id, data };
      const mapped = { id: 'mapped-updated' };

      queryService.findUserByIdOrFail.mockResolvedValue(user);
      repository.updateUser.mockResolvedValue(user);
      (responseMapper.toActiveUserDto as jest.Mock).mockReturnValue(mapped);

      const result = await service.updateUserById(input);

      expect(result).toBe(mapped);
      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ id });
      expect(repository.updateUser).toHaveBeenCalledWith({ where: { id }, data });
      expect(responseMapper.toActiveUserDto).toHaveBeenCalledWith(user);
    });
  });

  describe('deleteUserById', () => {
    it('calls repository.deleteUser', async () => {
      const id = 'user-id';
      await service.deleteUserById({ id });
      expect(repository.deleteUser).toHaveBeenCalledWith({ id });
    });
  });

  describe('deleteManyUsersById', () => {
    it('calls repository.deleteManyUsers', async () => {
      const ids = ['1', '2'];
      await service.deleteManyUsersById({ ids });
      expect(repository.deleteManyUsers).toHaveBeenCalledWith({ id: { in: ids } });
    });
  });

  describe('hardDeleteUserById', () => {
    it('calls repository.hardDeleteUser', async () => {
      const id = 'user-id';
      await service.hardDeleteUserById({ id });
      expect(repository.hardDeleteUser).toHaveBeenCalledWith({ id });
    });
  });

  describe('hardDeleteManyUsersById', () => {
    it('calls repository.hardDeleteManyUsers', async () => {
      const ids = ['1', '2'];
      await service.hardDeleteManyUsersById({ ids });
      expect(repository.hardDeleteManyUsers).toHaveBeenCalledWith({ id: { in: ids } });
    });
  });

  describe('restoreUserById', () => {
    it('returns mapped restored user', async () => {
      const id = 'user-id';
      const user = createMockUser({ id });
      const mapped = { id: 'restored' };

      repository.restoreUser.mockResolvedValue(user);
      (responseMapper.toActiveUserDto as jest.Mock).mockReturnValue(mapped);

      const result = await service.restoreUserById({ id });

      expect(result).toBe(mapped);
      expect(repository.restoreUser).toHaveBeenCalledWith({ id });
      expect(responseMapper.toActiveUserDto).toHaveBeenCalledWith(user);
    });
  });

  describe('restoreManyUsersById', () => {
    it('returns mapped restored users', async () => {
      const ids = ['1', '2'];
      const users = ids.map((id) => createMockUser({ id }));
      const mapped = { users: [{ id: '1' }, { id: '2' }] };

      repository.restoreManyAndReturnUsers.mockResolvedValue(users);
      (responseMapper.toActiveUsersDto as jest.Mock).mockReturnValue(mapped);

      const result = await service.restoreManyUsersById({ ids });

      expect(result).toBe(mapped);
      expect(repository.restoreManyAndReturnUsers).toHaveBeenCalledWith({ id: { in: ids } });
      expect(responseMapper.toActiveUsersDto).toHaveBeenCalledWith(users);
    });
  });
});
