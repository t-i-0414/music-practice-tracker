import { TestingModule } from '@nestjs/testing';

import { createDomainIntegrationModule } from '../../helpers/integration-test-module.helper';

import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

interface UserServicesSetup {
  module: TestingModule;
  commandService: UserCommandService;
  queryService: UserQueryService;
}

export async function setupUserServicesIntegration(databaseHelper: DatabaseHelper): Promise<UserServicesSetup> {
  const module = await createDomainIntegrationModule({
    commandServiceClass: UserCommandService,
    queryServiceClass: UserQueryService,
    databaseHelper,
  });

  return {
    module,
    commandService: module.get<UserCommandService>(UserCommandService),
    queryService: module.get<UserQueryService>(UserQueryService),
  };
}
