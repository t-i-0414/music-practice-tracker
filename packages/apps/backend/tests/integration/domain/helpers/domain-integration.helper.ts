import { TestingModule } from '@nestjs/testing';

import { createDomainIntegrationModule } from '../../helpers/integration-test-module.helper';

import { AdminUserCommandService } from '@/domain/aggregates/admin-user/admin-user.command.service';
import { AdminUserQueryService } from '@/domain/aggregates/admin-user/admin-user.query.service';
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

interface AdminUserServicesSetup {
  module: TestingModule;
  commandService: AdminUserCommandService;
  queryService: AdminUserQueryService;
}

export async function setupAdminUserServicesIntegration(
  databaseHelper: DatabaseHelper,
): Promise<AdminUserServicesSetup> {
  const module = await createDomainIntegrationModule({
    commandServiceClass: AdminUserCommandService,
    queryServiceClass: AdminUserQueryService,
    databaseHelper,
  });

  return {
    module,
    commandService: module.get<AdminUserCommandService>(AdminUserCommandService),
    queryService: module.get<AdminUserQueryService>(AdminUserQueryService),
  };
}

interface SingleServiceSetup<T> {
  module: TestingModule;
  service: T;
}

export async function setupUserQueryServiceIntegration(
  databaseHelper: DatabaseHelper,
): Promise<SingleServiceSetup<UserQueryService>> {
  const module = await createDomainIntegrationModule({
    queryServiceClass: UserQueryService,
    databaseHelper,
  });

  return {
    module,
    service: module.get<UserQueryService>(UserQueryService),
  };
}

export async function setupAdminUserQueryServiceIntegration(
  databaseHelper: DatabaseHelper,
): Promise<SingleServiceSetup<AdminUserQueryService>> {
  const module = await createDomainIntegrationModule({
    queryServiceClass: AdminUserQueryService,
    databaseHelper,
  });

  return {
    module,
    service: module.get<AdminUserQueryService>(AdminUserQueryService),
  };
}
