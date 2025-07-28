import { Test, TestingModule } from '@nestjs/testing';

import { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import {
  toActiveUserDto,
  toActiveUsersDto,
  toAnyUserDto,
  toDeletedUserDto,
  toDeletedUsersDto,
  toAnyUsersDto,
} from '@/modules/aggregate/user/user.response.dto';

describe('userAdminFacadeService', () => {
  let service: UserAdminFacadeService;
  let commandService: jest.Mocked<UserCommandService>;
  let queryService: jest.Mocked<UserQueryService>;

  const mockUser = {
    publicId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockDeletedUser = {
    ...mockUser,
    deletedAt: new Date('2024-01-02'),
  };

  beforeEach(async () => {
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

    const mockQueryService: jest.Mocked<UserQueryService> = {
      findUserByIdOrFail: jest.fn(),
      findDeletedUserByIdOrFail: jest.fn(),
      findAnyUserByIdOrFail: jest.fn(),
      findManyUsers: jest.fn(),
      findManyDeletedUsers: jest.fn(),
      findManyAnyUsers: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAdminFacadeService,
        {
          provide: UserCommandService,
          useValue: mockCommandService,
        },
        {
          provide: UserQueryService,
          useValue: mockQueryService,
        },
      ],
    }).compile();

    service = module.get<UserAdminFacadeService>(UserAdminFacadeService);
    commandService = module.get(UserCommandService);
    queryService = module.get(UserQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserById', () => {
    it('should delegate to query service', async () => {
      expect.assertions(2);

      const dto = { publicId: mockUser.publicId };
      const expectedResult = toActiveUserDto(mockUser);
      queryService.findUserByIdOrFail.mockResolvedValue(expectedResult);

      const result = await service.findUserById(dto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findDeletedUserById', () => {
    it('should delegate to query service', async () => {
      expect.assertions(2);

      const dto = { publicId: mockDeletedUser.publicId };
      const expectedResult = toDeletedUserDto(mockDeletedUser);
      queryService.findDeletedUserByIdOrFail.mockResolvedValue(expectedResult);

      const result = await service.findDeletedUserById(dto);

      expect(queryService.findDeletedUserByIdOrFail).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findAnyUserById', () => {
    it('should delegate to query service', async () => {
      expect.assertions(2);

      const dto = { publicId: mockUser.publicId };
      const expectedResult = toAnyUserDto(mockUser);
      queryService.findAnyUserByIdOrFail.mockResolvedValue(expectedResult);

      const result = await service.findAnyUserById(dto);

      expect(queryService.findAnyUserByIdOrFail).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findManyUsers', () => {
    it('should delegate to query service', async () => {
      expect.assertions(2);

      const dto = { publicIds: [mockUser.publicId] };
      const expectedResult = toActiveUsersDto([mockUser]);
      queryService.findManyUsers.mockResolvedValue(expectedResult);

      const result = await service.findManyUsers(dto);

      expect(queryService.findManyUsers).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findManyDeletedUsers', () => {
    it('should delegate to query service', async () => {
      expect.assertions(2);

      const dto = { publicIds: [mockDeletedUser.publicId] };
      const expectedResult = toDeletedUsersDto([mockDeletedUser]);
      queryService.findManyDeletedUsers.mockResolvedValue(expectedResult);

      const result = await service.findManyDeletedUsers(dto);

      expect(queryService.findManyDeletedUsers).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findManyAnyUsers', () => {
    it('should delegate to query service', async () => {
      expect.assertions(2);

      const dto = { publicIds: [mockUser.publicId, mockDeletedUser.publicId] };
      const expectedResult = toAnyUsersDto([mockUser, mockDeletedUser]);
      queryService.findManyAnyUsers.mockResolvedValue(expectedResult);

      const result = await service.findManyAnyUsers(dto);

      expect(queryService.findManyAnyUsers).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('createUser', () => {
    it('should delegate to command service', async () => {
      expect.assertions(2);

      const dto = { email: mockUser.email, name: mockUser.name };
      const expectedResult = toActiveUserDto(mockUser);
      commandService.createUser.mockResolvedValue(expectedResult);

      const result = await service.createUser(dto);

      expect(commandService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('should delegate to command service', async () => {
      expect.assertions(2);

      const dto = { users: [{ email: 'user1@example.com', name: 'User 1' }] };
      const expectedResult = toActiveUsersDto([mockUser]);
      commandService.createManyAndReturnUsers.mockResolvedValue(expectedResult);

      const result = await service.createManyAndReturnUsers(dto);

      expect(commandService.createManyAndReturnUsers).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('updateUserById', () => {
    it('should delegate to command service', async () => {
      expect.assertions(2);

      const dto = { publicId: mockUser.publicId, data: { name: 'Updated Name' } };
      const expectedResult = toActiveUserDto({ ...mockUser, name: 'Updated Name' });
      commandService.updateUserById.mockResolvedValue(expectedResult);

      const result = await service.updateUserById(dto);

      expect(commandService.updateUserById).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('deleteUserById', () => {
    it('should delegate to command service', async () => {
      expect.assertions(1);

      const dto = { publicId: mockUser.publicId };
      commandService.deleteUserById.mockResolvedValue();

      await service.deleteUserById(dto);

      expect(commandService.deleteUserById).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteManyUsersById', () => {
    it('should delegate to command service', async () => {
      expect.assertions(1);

      const dto = { publicIds: ['id1', 'id2'] };
      commandService.deleteManyUsersById.mockResolvedValue();

      await service.deleteManyUsersById(dto);

      expect(commandService.deleteManyUsersById).toHaveBeenCalledWith(dto);
    });
  });

  describe('hardDeleteUserById', () => {
    it('should delegate to command service', async () => {
      expect.assertions(1);

      const dto = { publicId: mockUser.publicId };
      commandService.hardDeleteUserById.mockResolvedValue();

      await service.hardDeleteUserById(dto);

      expect(commandService.hardDeleteUserById).toHaveBeenCalledWith(dto);
    });
  });

  describe('hardDeleteManyUsersById', () => {
    it('should delegate to command service', async () => {
      expect.assertions(1);

      const dto = { publicIds: ['id1', 'id2'] };
      commandService.hardDeleteManyUsersById.mockResolvedValue();

      await service.hardDeleteManyUsersById(dto);

      expect(commandService.hardDeleteManyUsersById).toHaveBeenCalledWith(dto);
    });
  });

  describe('restoreUserById', () => {
    it('should delegate to command service', async () => {
      expect.assertions(2);

      const dto = { publicId: mockDeletedUser.publicId };
      const expectedResult = toActiveUserDto({ ...mockDeletedUser, deletedAt: null });
      commandService.restoreUserById.mockResolvedValue(expectedResult);

      const result = await service.restoreUserById(dto);

      expect(commandService.restoreUserById).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('restoreManyUsersById', () => {
    it('should delegate to command service', async () => {
      expect.assertions(2);

      const dto = { publicIds: ['id1', 'id2'] };
      const expectedResult = toActiveUsersDto([{ ...mockDeletedUser, deletedAt: null }]);
      commandService.restoreManyUsersById.mockResolvedValue(expectedResult);

      const result = await service.restoreManyUsersById(dto);

      expect(commandService.restoreManyUsersById).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });
});
