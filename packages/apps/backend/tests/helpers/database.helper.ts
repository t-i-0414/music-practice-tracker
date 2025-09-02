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
    await this.deleteManyAllRecords();
  }

  private async deleteManyAllRecords(): Promise<void> {
    await this.prisma.$transaction([this.prisma.adminUser.deleteMany({}), this.prisma.user.deleteMany({})]);
  }

  get client(): PrismaClient {
    return this.prisma;
  }
}
