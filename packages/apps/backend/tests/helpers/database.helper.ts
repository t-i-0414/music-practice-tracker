import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma';

export class DatabaseHelper {
  private readonly prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    this.prisma = new PrismaClient({ adapter });
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
