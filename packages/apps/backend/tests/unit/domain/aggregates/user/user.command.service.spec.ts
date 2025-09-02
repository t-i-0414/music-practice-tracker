import { TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { toUserResponseDto, toUsersResponseDto } from '@/domain/aggregates/user/utils/dto';
import { RepositoryService } from '@/repository/repository.service';
import { UserFactory } from '@/tests/factory';
import { createMockUserQueryService, createMockUserRepository } from '@/tests/unit/domain/helpers/domain-service-mocks';

describe('unit UserCommandService', () => {
  let service: UserCommandService;
  let repository: ReturnType<typeof createMockUserRepository>;
  let _queryService: jest.Mocked<UserQueryService>;
  let userFactory: UserFactory;
  let module: TestingModule;

  beforeEach(async () => {
    userFactory = new UserFactory();

    repository = createMockUserRepository();
    const mockQueryService = createMockUserQueryService();

    const { Test } = await import('@nestjs/testing');
    module = await Test.createTestingModule({
      providers: [
        UserCommandService,
        {
          provide: RepositoryService,
          useValue: repository,
        },
        {
          provide: UserQueryService,
          useValue: mockQueryService,
        },
      ],
    }).compile();

    service = module.get<UserCommandService>(UserCommandService);
    _queryService = module.get(UserQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const createDto = {
        email: mockUser.email,
        name: mockUser.name,
      };

      repository.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser(createDto);

      expect(repository.user.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toStrictEqual(toUserResponseDto(mockUser));
    });

    it('should throw error on database failure', async () => {
      expect.assertions(2);

      const createDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const prismaError = new Error('Database error');
      repository.user.create.mockRejectedValue(prismaError);

      await expect(service.createUser(createDto)).rejects.toThrow(prismaError);
      expect(repository.user.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('should successfully create multiple users', async () => {
      expect.assertions(2);

      const mockUsers = userFactory.buildMany(3);
      const createDto = {
        users: mockUsers.map((user) => ({
          email: user.email,
          name: user.name,
        })),
      };

      repository.user.createManyAndReturn.mockResolvedValue(mockUsers);

      const result = await service.createManyAndReturnUsers(createDto);

      expect(repository.user.createManyAndReturn).toHaveBeenCalledWith({ data: createDto.users });
      expect(result).toStrictEqual(toUsersResponseDto(mockUsers));
    });
  });

  describe('updateUserById', () => {
    it('should successfully update a user', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const { publicId } = mockUser;
      const updateData = { name: 'Updated Name' };

      const updatedUser = { ...mockUser, ...updateData };
      repository.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUserById({ publicId, data: updateData });

      expect(repository.user.update).toHaveBeenCalledWith({
        where: { publicId },
        data: updateData,
      });
      expect(result).toStrictEqual(toUserResponseDto(updatedUser));
    });

    it('should throw error on database failure', async () => {
      expect.assertions(2);

      const publicId = 'test-id';
      const updateData = { name: 'Updated Name' };

      const prismaError = new Error('Database error');
      repository.user.update.mockRejectedValue(prismaError);

      await expect(service.updateUserById({ publicId, data: updateData })).rejects.toThrow(prismaError);
      expect(repository.user.update).toHaveBeenCalledWith({
        where: { publicId },
        data: updateData,
      });
    });
  });

  describe('deleteUserById', () => {
    it('should successfully delete a user', async () => {
      expect.assertions(1);

      const mockUser = userFactory.build();
      const { publicId } = mockUser;

      repository.user.delete.mockResolvedValue(mockUser);

      await service.deleteUserById({ publicId });

      expect(repository.user.delete).toHaveBeenCalledWith({ where: { publicId } });
    });

    it('should throw error on database failure', async () => {
      expect.assertions(2);

      const publicId = 'test-id';

      const prismaError = new Error('Database error');
      repository.user.delete.mockRejectedValue(prismaError);

      await expect(service.deleteUserById({ publicId })).rejects.toThrow(prismaError);
      expect(repository.user.delete).toHaveBeenCalledWith({ where: { publicId } });
    });
  });

  describe('deleteManyUsersById', () => {
    it('should successfully delete multiple users', async () => {
      expect.assertions(1);

      const publicIds = ['id1', 'id2', 'id3'];
      repository.user.deleteMany.mockResolvedValue({ count: publicIds.length });

      await service.deleteManyUsersById({ publicIds });

      expect(repository.user.deleteMany).toHaveBeenCalledWith({
        where: { publicId: { in: publicIds } },
      });
    });
  });
});
