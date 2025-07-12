import { Test, TestingModule } from '@nestjs/testing';

import { RepositoryService } from '@/modules/repository/repository.service';

describe('repositoryService', () => {
  let service: RepositoryService;
  let mockConnect: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepositoryService],
    }).compile();

    service = module.get<RepositoryService>(RepositoryService);
    mockConnect = jest.spyOn(service, '$connect').mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect.assertions(1);

    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to database on module init', async () => {
      expect.assertions(1);

      await service.onModuleInit();

      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  it('should extend PrismaClient', () => {
    expect.assertions(1);

    expect(service).toHaveProperty('user');
  });
});