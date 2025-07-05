import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import * as ResponseDtoModule from '@/modules/aggregate/user/user.response.dto';

jest.mock('@/modules/aggregate/user/user.response.dto', () => ({
  toActiveUserDto: jest.fn(),
  toDeletedUserDto: jest.fn(),
  toAnyUserDto: jest.fn(),
  toActiveUsersDto: jest.fn(),
  toDeletedUsersDto: jest.fn(),
  toAnyUsersDto: jest.fn(),
}));

describe('UserQueryService', () => {
  let service: UserQueryService;
  let mockRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockRepository = {
      findUniqueActiveUser: jest.fn(),
      findUniqueDeletedUser: jest.fn(),
      findUniqueAnyUser: jest.fn(),
      findManyActiveUsers: jest.fn(),
      findManyDeletedUsers: jest.fn(),
      findManyAnyUsers: jest.fn(),
    };

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
  });

  const testCases = [
    {
      method: 'findUserByIdOrFail',
      repoMethod: 'findUniqueActiveUser',
      mapFnName: 'toActiveUserDto',
      notFoundMessage: (id: string) => `User ${id} not found`,
    },
    {
      method: 'findDeletedUserByIdOrFail',
      repoMethod: 'findUniqueDeletedUser',
      mapFnName: 'toDeletedUserDto',
      notFoundMessage: (id: string) => `Deleted user ${id} not found`,
    },
    {
      method: 'findAnyUserByIdOrFail',
      repoMethod: 'findUniqueAnyUser',
      mapFnName: 'toAnyUserDto',
      notFoundMessage: (id: string) => `User ${id} not found`,
    },
  ];

  testCases.forEach(({ method, repoMethod, mapFnName, notFoundMessage }) => {
    describe(method, () => {
      it('returns mapped user when found', async () => {
        const dto = { id: 'user-id' };
        const user = { id: 'user-id' };
        const mapped = { id: 'mapped-user' };

        mockRepository[repoMethod].mockResolvedValue(user);
        (ResponseDtoModule[mapFnName as keyof typeof ResponseDtoModule] as jest.Mock).mockReturnValue(mapped);

        const result = await (service as any)[method](dto);
        expect(result).toBe(mapped);
      });

      it('throws NotFoundException when user not found', async () => {
        const dto = { id: 'non-existent' };
        mockRepository[repoMethod].mockResolvedValue(null);

        await expect((service as any)[method](dto)).rejects.toThrow(NotFoundException);
        await expect((service as any)[method](dto)).rejects.toThrow(notFoundMessage(dto.id));
      });
    });
  });

  const manyTestCases = [
    {
      method: 'findManyUsers',
      repoMethod: 'findManyActiveUsers',
      mapFnName: 'toActiveUsersDto',
    },
    {
      method: 'findManyDeletedUsers',
      repoMethod: 'findManyDeletedUsers',
      mapFnName: 'toDeletedUsersDto',
    },
    {
      method: 'findManyAnyUsers',
      repoMethod: 'findManyAnyUsers',
      mapFnName: 'toAnyUsersDto',
    },
  ];

  manyTestCases.forEach(({ method, repoMethod, mapFnName }) => {
    describe(method, () => {
      it('returns mapped users when found', async () => {
        const dto = { ids: ['id1', 'id2'] };
        const users = [{ id: 'id1' }, { id: 'id2' }];
        const mapped = [{ id: 'mapped-1' }, { id: 'mapped-2' }];

        mockRepository[repoMethod].mockResolvedValue(users);
        (ResponseDtoModule[mapFnName as keyof typeof ResponseDtoModule] as jest.Mock).mockReturnValue(mapped);

        const result = await (service as any)[method](dto);
        expect(result).toBe(mapped);
      });

      it('returns empty array when no users found', async () => {
        const dto = { ids: [] };
        mockRepository[repoMethod].mockResolvedValue([]);
        (ResponseDtoModule[mapFnName as keyof typeof ResponseDtoModule] as jest.Mock).mockReturnValue([]);

        const result = await (service as any)[method](dto);
        expect(result).toEqual([]);
      });
    });
  });
});
