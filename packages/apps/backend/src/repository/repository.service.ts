import { PrismaClient } from '@/generated/prisma';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RepositoryService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
