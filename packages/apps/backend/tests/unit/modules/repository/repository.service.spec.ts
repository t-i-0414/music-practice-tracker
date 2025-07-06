import { type TestingModule } from '@nestjs/testing';

import { createTestModule } from '../../helpers';

import { RepositoryService } from '@/modules/repository/repository.service';

describe('RepositoryService', () => {
  let service: RepositoryService;
  let connectSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await createTestModule({
      providers: [RepositoryService],
    });

    service = module.get<RepositoryService>(RepositoryService);
    connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();
  });

  describe('Constructor and inheritance', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should extend PrismaClient', () => {
      expect(service).toHaveProperty('user');
      expect(service).toHaveProperty('$connect');
      expect(service).toHaveProperty('$disconnect');
      expect(service).toHaveProperty('$transaction');
    });
  });

  describe('onModuleInit', () => {
    it('should connect to database on module initialization', async () => {
      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(connectSpy).toHaveBeenCalledWith();
    });

    it('should handle connection errors', async () => {
      const connectionError = new Error('Database connection failed');
      connectSpy.mockRejectedValueOnce(connectionError);

      await expect(service.onModuleInit()).rejects.toThrow('Database connection failed');
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it('should only connect once even if called multiple times', async () => {
      await service.onModuleInit();
      await service.onModuleInit();
      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Prisma client methods', () => {
    it('should have access to Prisma models', () => {
      expect(service.user).toBeDefined();
      expect(typeof service.user.findUnique).toBe('function');
      expect(typeof service.user.findMany).toBe('function');
      expect(typeof service.user.create).toBe('function');
      expect(typeof service.user.update).toBe('function');
      expect(typeof service.user.delete).toBe('function');
    });

    it('should have access to Prisma utilities', () => {
      expect(typeof service.$transaction).toBe('function');
      expect(typeof service.$queryRaw).toBe('function');
      expect(typeof service.$executeRaw).toBe('function');
    });
  });

  describe('Integration scenarios', () => {
    it('should be injectable into other services', async () => {
      const InjectedService = class {
        constructor(public repository: RepositoryService) {}
      };

      const testModule = await createTestModule({
        providers: [
          RepositoryService,
          {
            provide: InjectedService,
            useFactory: (repo: RepositoryService) => new InjectedService(repo),
            inject: [RepositoryService],
          },
        ],
      });

      expect(testModule).toBeDefined();
    });
  });
});
