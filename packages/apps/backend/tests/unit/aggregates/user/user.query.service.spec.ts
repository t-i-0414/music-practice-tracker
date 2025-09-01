import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { toUserResponseDto, toUsersResponseDto } from '@/aggregates/user/dto';
import { UserQueryService } from '@/aggregates/user/query.service';
import { RepositoryService } from '@/repository/repository.service';
import { UserFactory } from '@/tests/factory';

describe('userQueryService', () => {
  let service: UserQueryService;
  let repository: {
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let userFactory: UserFactory;

  beforeEach(async () => {
    userFactory = new UserFactory();

    const mockRepository = {
      user: {
        findUnique: jest.fn(),
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

  describe('findUserByIdOrFail', () => {
    it('should return user when found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      repository.user.findUnique.mockResolvedValue({ ...mockUser, id: 1 });
      const dto = { publicId: mockUser.publicId };

      const result = await service.findUserByIdOrFail(dto);

      expect(repository.user.findUnique).toHaveBeenCalledWith({ where: dto });
      expect(result).toStrictEqual(toUserResponseDto(mockUser));
    });

    it('should throw NotFoundException when user not found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      repository.user.findUnique.mockResolvedValue(null);
      const dto = { publicId: mockUser.publicId };

      await expect(service.findUserByIdOrFail(dto)).rejects.toThrow(
        new NotFoundException(`User ${dto.publicId} not found`),
      );
      expect(repository.user.findUnique).toHaveBeenCalledWith({ where: dto });
    });
  });

  describe('findManyUsers', () => {
    it('should return users when found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const mockUsers = [mockUser];
      repository.user.findMany.mockResolvedValue([{ ...mockUser, id: 1 }]);
      const dto = { publicIds: [mockUser.publicId] };

      const result = await service.findManyUsers(dto);

      expect(repository.user.findMany).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toUsersResponseDto(mockUsers));
    });

    it('should return empty array when no users found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      repository.user.findMany.mockResolvedValue([]);
      const dto = { publicIds: [mockUser.publicId] };

      const result = await service.findManyUsers(dto);

      expect(repository.user.findMany).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toUsersResponseDto([]));
    });
  });
});
