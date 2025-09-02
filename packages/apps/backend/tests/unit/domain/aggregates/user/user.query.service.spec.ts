import { Test, TestingModule } from '@nestjs/testing';

import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { toUserResponseDto, toUsersResponseDto } from '@/domain/aggregates/user/utils/dto';
import { RepositoryService } from '@/repository/repository.service';
import { UserFactory } from '@/tests/factory';

describe('unit UserQueryService', () => {
  let service: UserQueryService;
  let repository: {
    user: {
      findUniqueOrThrow: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let userFactory: UserFactory;

  beforeEach(async () => {
    userFactory = new UserFactory();

    const mockRepository = {
      user: {
        findUniqueOrThrow: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserQueryService,
        {
          provide: RepositoryService,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserQueryService>(UserQueryService);
    repository = module.get(RepositoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUniqueOrThrowUserById', () => {
    it('should return user when found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      repository.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      const dto = { publicId: mockUser.publicId };

      const result = await service.findUniqueOrThrowUserById(dto);

      expect(repository.user.findUniqueOrThrow).toHaveBeenCalledWith({ where: { publicId: dto.publicId } });
      expect(result).toStrictEqual(toUserResponseDto(mockUser));
    });

    it('should throw error when user not found', async () => {
      expect.assertions(2);

      const dto = { publicId: 'non-existent-id' };
      const error = new Error('No User found');
      repository.user.findUniqueOrThrow.mockRejectedValue(error);

      await expect(service.findUniqueOrThrowUserById(dto)).rejects.toThrow(error);
      expect(repository.user.findUniqueOrThrow).toHaveBeenCalledWith({ where: { publicId: dto.publicId } });
    });
  });

  describe('findManyUsersById', () => {
    it('should return users when found', async () => {
      expect.assertions(2);

      const mockUsers = userFactory.buildMany(3);
      repository.user.findMany.mockResolvedValue(mockUsers);
      const dto = { publicIds: mockUsers.map((u) => u.publicId) };

      const result = await service.findManyUsersById(dto);

      expect(repository.user.findMany).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toUsersResponseDto(mockUsers));
    });

    it('should return empty array when no users found', async () => {
      expect.assertions(2);

      repository.user.findMany.mockResolvedValue([]);
      const dto = { publicIds: ['non-existent-id'] };

      const result = await service.findManyUsersById(dto);

      expect(repository.user.findMany).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toUsersResponseDto([]));
    });
  });
});
