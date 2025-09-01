import { PrismaClient } from '@/generated/prisma';

export class DatabaseHelper {
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
    const tables = ['User', 'AdminUser'];

    await Promise.all(tables.map((table) => this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`)));
  }

  get client(): PrismaClient {
    return this.prisma;
  }
}
