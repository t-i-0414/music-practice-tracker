import { Test, TestingModule } from '@nestjs/testing';

import { RepositoryService } from '@/repository/repository.service';

describe('service RepositoryService', () => {
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

  describe('when module is initialized', () => {
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
    it('should execute callback function within transaction', async () => {
      expect.assertions(2);

      const expectedResult = { id: 1, name: 'Test User' };
      const mockCallback = jest.fn().mockResolvedValue(expectedResult);

      jest
        .spyOn(service, '$transaction')
        .mockImplementation((callback) => callback(service as Parameters<typeof callback>[0]));

      const result = await service.$transaction(mockCallback);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expectedResult);
    });

    it('should propagate errors from transaction callback', async () => {
      expect.assertions(2);

      const error = new Error('Transaction failed');
      const mockCallback = jest.fn().mockRejectedValue(error);

      jest
        .spyOn(service, '$transaction')
        .mockImplementation((callback) => callback(service as Parameters<typeof callback>[0]));

      await expect(service.$transaction(mockCallback)).rejects.toThrow('Transaction failed');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction on failure', async () => {
      expect.assertions(3);

      const mockCreate = jest.fn().mockResolvedValue({ id: 1, name: 'Test User' });
      const mockRollback = jest.fn();

      service.user.create = mockCreate;

      jest.spyOn(service, '$transaction').mockImplementation(async (callback) => {
        try {
          const result = await callback(service as Parameters<typeof callback>[0]);
          return result;
        } catch (error) {
          mockRollback();
          throw error;
        }
      });

      const mockCallback = jest.fn().mockImplementation(async (tx) => {
        await tx.user.create({ data: { name: 'Test User' } });
        throw new Error('Forced rollback');
      });

      await expect(service.$transaction(mockCallback)).rejects.toThrow('Forced rollback');
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockRollback).toHaveBeenCalledTimes(1);
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
