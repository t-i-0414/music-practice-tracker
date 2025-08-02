import { Test, TestingModule } from '@nestjs/testing';

import { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { toUserResponseDto, toUsersResponseDto } from '@/modules/aggregate/user/user.response.dto';
import { buildUserResponseDto } from '@/tests/factory/user.factory';

describe('userAdminFacadeService', () => {
  let service: UserAdminFacadeService;
  let commandService: jest.Mocked<UserCommandService>;
  let queryService: jest.Mocked<UserQueryService>;

  beforeEach(async () => {
    const mockCommandService: jest.Mocked<UserCommandService> = {
      createUser: jest.fn(),
      createManyAndReturnUsers: jest.fn(),
      updateUserById: jest.fn(),
      deleteUserById: jest.fn(),
      deleteManyUsersById: jest.fn(),
    } as any;

    const mockQueryService: jest.Mocked<UserQueryService> = {
      findUserByIdOrFail: jest.fn(),
      findManyUsers: jest.fn(),
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

      const expectedResult = buildUserResponseDto();
      const dto = { publicId: expectedResult.publicId };
      queryService.findUserByIdOrFail.mockResolvedValue(expectedResult);

      const result = await service.findUserById(dto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findManyUsers', () => {
    it('should delegate to query service', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const expectedResult = toUsersResponseDto([mockUser]);
      const dto = { publicIds: [mockUser.publicId] };
      queryService.findManyUsers.mockResolvedValue(expectedResult);

      const result = await service.findManyUsers(dto);

      expect(queryService.findManyUsers).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('createUser', () => {
    it('should delegate to command service', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const dto = { email: mockUser.email, name: mockUser.name };
      commandService.createUser.mockResolvedValue(mockUser);

      const result = await service.createUser(dto);

      expect(commandService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(mockUser);
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('should delegate to command service', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const dto = { users: [{ email: mockUser.email, name: mockUser.name }] };
      const expectedResult = toUsersResponseDto([mockUser]);
      commandService.createManyAndReturnUsers.mockResolvedValue(expectedResult);

      const result = await service.createManyAndReturnUsers(dto);

      expect(commandService.createManyAndReturnUsers).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('updateUserById', () => {
    it('should delegate to command service', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const dto = { publicId: mockUser.publicId, data: { name: 'Updated Name' } };
      const expectedResult = toUserResponseDto({ ...mockUser, name: 'Updated Name' });
      commandService.updateUserById.mockResolvedValue(expectedResult);

      const result = await service.updateUserById(dto);

      expect(commandService.updateUserById).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('deleteUserById', () => {
    it('should delegate to command service', async () => {
      expect.assertions(1);

      const mockUser = buildUserResponseDto();
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
});
