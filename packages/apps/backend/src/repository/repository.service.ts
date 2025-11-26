import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma';

@Injectable()
export class RepositoryService extends PrismaClient implements OnModuleInit {
  public constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  public async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
