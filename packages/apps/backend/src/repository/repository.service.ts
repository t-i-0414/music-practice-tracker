import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@/generated/prisma';

@Injectable()
export class RepositoryService extends PrismaClient implements OnModuleInit {
  public async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
