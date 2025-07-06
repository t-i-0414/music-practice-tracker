import { PrismaClient } from '@/generated/prisma';

export class DatabaseTestUtils {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async cleanDatabase(): Promise<void> {
    const models = Object.keys(this.prisma).filter(
      (key) =>
        !key.startsWith('_') && !key.startsWith('$') && typeof (this.prisma as any)[key].deleteMany === 'function',
    );

    await this.prisma.$transaction(models.map((model) => (this.prisma as any)[model].deleteMany()));
  }

  async cleanModel(modelName: string): Promise<void> {
    const model = (this.prisma as any)[modelName];
    if (Boolean(model) && typeof model.deleteMany === 'function') {
      await model.deleteMany();
    }
  }

  async seed(data: {
    users?: {
      id?: string;
      name: string;
      email: string;
    }[];
  }): Promise<void> {
    if (data.users) {
      await this.prisma.user.createMany({
        data: data.users,
      });
    }
  }

  async runInTransaction<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.prisma
      .$transaction(async (tx) => {
        const result = await callback(tx as PrismaClient);
        throw new RollbackError(result);
      })
      .catch((error: unknown) => {
        if (error instanceof RollbackError) {
          return error.result as T;
        }
        throw error;
      });
  }

  getPrismaClient(): PrismaClient {
    return this.prisma;
  }
}

class RollbackError extends Error {
  constructor(public result: unknown) {
    super('Transaction rollback');
    this.name = 'RollbackError';
  }
}

export function createDatabaseTestUtils(): DatabaseTestUtils {
  return new DatabaseTestUtils();
}
