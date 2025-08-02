import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { type UserStatus } from '@/generated/prisma';
import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import { toUserResponseDto, toUsersResponseDto } from '@/modules/aggregate/user/user.response.dto';

describe('userQueryService', () => {
  let service: UserQueryService;
  let repository: jest.Mocked<UserRepositoryService>;

  const mockUser = {
    id: 1,
    publicId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    status: 'ACTIVE' as UserStatus,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
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

      repository.findUniqueUser.mockResolvedValue(mockUser);
      const dto = { publicId: mockUser.publicId };

      const result = await service.findUserByIdOrFail(dto);

      expect(repository.findUniqueUser).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(toUserResponseDto(mockUser));
    });

    it('should throw NotFoundException when user not found', async () => {
      expect.assertions(2);

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

      const mockUsers = [mockUser];
      repository.findManyUsers.mockResolvedValue(mockUsers);
      const dto = { publicIds: [mockUser.publicId] };

      const result = await service.findManyUsers(dto);

      expect(repository.findManyUsers).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toUsersResponseDto(mockUsers));
    });

    it('should return empty array when no users found', async () => {
      expect.assertions(2);

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
