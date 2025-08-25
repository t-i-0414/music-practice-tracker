import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserQueryService } from '@/aggregates/user/user.query.service';
import { UserRepositoryService } from '@/aggregates/user/user.repository.service';
import { toUserResponseDto, toUsersResponseDto } from '@/aggregates/user/user.response.dto';
import { UserFactory } from '@/tests/factory';

describe('userQueryService', () => {
  let service: UserQueryService;
  let repository: jest.Mocked<UserRepositoryService>;
  let userFactory: UserFactory;

  beforeEach(async () => {
    userFactory = new UserFactory();

    const mockRepository: jest.Mocked<UserRepositoryService> = {
      findUniqueUser: jest.fn(),
      findManyUsers: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserQueryService,
        {
          provide: UserRepositoryService,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserQueryService>(UserQueryService);
    repository = module.get(UserRepositoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByIdOrFail', () => {
    it('should return user when found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      repository.findUniqueUser.mockResolvedValue({ ...mockUser, id: 1 });
      const dto = { publicId: mockUser.publicId };

      const result = await service.findUserByIdOrFail(dto);

      expect(repository.findUniqueUser).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(toUserResponseDto(mockUser));
    });

    it('should throw NotFoundException when user not found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      repository.findUniqueUser.mockResolvedValue(null);
      const dto = { publicId: mockUser.publicId };

      await expect(service.findUserByIdOrFail(dto)).rejects.toThrow(
        new NotFoundException(`User ${dto.publicId} not found`),
      );
      expect(repository.findUniqueUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('findManyUsers', () => {
    it('should return users when found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const mockUsers = [mockUser];
      repository.findManyUsers.mockResolvedValue([{ ...mockUser, id: 1 }]);
      const dto = { publicIds: [mockUser.publicId] };

      const result = await service.findManyUsers(dto);

      expect(repository.findManyUsers).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toUsersResponseDto(mockUsers));
    });

    it('should return empty array when no users found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      repository.findManyUsers.mockResolvedValue([]);
      const dto = { publicIds: [mockUser.publicId] };

      const result = await service.findManyUsers(dto);

      expect(repository.findManyUsers).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toUsersResponseDto([]));
    });
  });
});
