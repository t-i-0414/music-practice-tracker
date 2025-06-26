import { PrismaClient } from '@/generated/prisma';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { JsPromise } from '@prisma/client/runtime/library';

@Injectable()
export class RepositoryService extends PrismaClient implements OnModuleInit {
  public async onModuleInit(): JsPromise<void> {
    await this.$connect();
  }
}
