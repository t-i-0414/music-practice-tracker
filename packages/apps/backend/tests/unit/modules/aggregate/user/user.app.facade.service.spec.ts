import { Test, TestingModule } from '@nestjs/testing';

import { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { toUserResponseDto } from '@/modules/aggregate/user/user.response.dto';
import { buildUserResponseDto } from '@/tests/factory/user.factory';

describe('userAppFacadeService', () => {
  let service: UserAppFacadeService;
  let commandService: jest.Mocked<UserCommandService>;
  let queryService: jest.Mocked<UserQueryService>;

  beforeEach(async () => {
    const mockCommandService: jest.Mocked<UserCommandService> = {
      createUser: jest.fn(),
      updateUserById: jest.fn(),
    } as any;

    const mockQueryService: jest.Mocked<UserQueryService> = {
      findUserByIdOrFail: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAppFacadeService,
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

    service = module.get<UserAppFacadeService>(UserAppFacadeService);
    commandService = module.get(UserCommandService);
    queryService = module.get(UserQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserById', () => {
    it('should delegate to query service', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const dto = { publicId: mockUser.publicId };
      const expectedResult = toUserResponseDto(mockUser);
      queryService.findUserByIdOrFail.mockResolvedValue(expectedResult);

      const result = await service.findUserById(dto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('createUser', () => {
    it('should delegate to command service', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const dto = { email: mockUser.email, name: mockUser.name };
      const expectedResult = toUserResponseDto(mockUser);
      commandService.createUser.mockResolvedValue(expectedResult);

      const result = await service.createUser(dto);

      expect(commandService.createUser).toHaveBeenCalledWith(dto);
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
});
