import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { EnvironmentVariables } from '@/config/env-validation';
import { PrismaClient } from '@/generated/prisma';

@Injectable()
export class RepositoryService extends PrismaClient implements OnModuleInit {
  public constructor(configService: ConfigService<EnvironmentVariables>) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
    });
    super({ adapter });
  }

  public async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
