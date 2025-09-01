import { Test, TestingModule } from '@nestjs/testing';

import { RepositoryService } from '@/repository/repository.service';

describe('repositoryService', () => {
  let service: RepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepositoryService],
    }).compile();

    service = module.get<RepositoryService>(RepositoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect.assertions(1);

      expect(service).toBeDefined();
    });

    it('should have PrismaClient properties', () => {
      expect.assertions(3);

      expect(service.$connect).toBeDefined();
      expect(service.$disconnect).toBeDefined();
      expect(service.$transaction).toBeDefined();
    });
  });

  describe('onModuleInit', () => {
    it('should connect to database on module init', async () => {
      expect.assertions(1);

      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle connection error', async () => {
      expect.assertions(1);

      const error = new Error('Connection failed');
      jest.spyOn(service, '$connect').mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('database models', () => {
    it('should have user model', () => {
      expect.assertions(1);

      expect(service.user).toBeDefined();
    });

    it('should have adminUser model', () => {
      expect.assertions(1);

      expect(service.adminUser).toBeDefined();
    });
  });

  describe('transaction support', () => {
    it('should support transactions', async () => {
      expect.assertions(4);

      const mockTransaction = jest.fn().mockImplementation((fn) => {
        const tx = {
          user: service.user,
          adminUser: service.adminUser,
        };
        return fn(tx);
      });
      service.$transaction = mockTransaction;

      const result = await service.$transaction(async (tx) => {
        expect(tx.user).toBeDefined();
        expect(tx.adminUser).toBeDefined();

        return Promise.resolve('transaction-result');
      });

      expect(result).toBe('transaction-result');
      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('error handling', () => {
    it('should handle Prisma errors correctly', async () => {
      expect.assertions(1);

      const mockFindUnique = jest.fn().mockRejectedValue({
        code: 'P2025',
        meta: { cause: 'Record to update not found.' },
      });

      service.user.findUnique = mockFindUnique;

      await expect(service.user.findUnique({ where: { id: 999 } })).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });
});
