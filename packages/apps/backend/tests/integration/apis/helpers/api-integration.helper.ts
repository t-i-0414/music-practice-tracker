import { TestingModule } from '@nestjs/testing';

import { createApiIntegrationModule } from '../../helpers/integration-test-module.helper';

import { AdminApiUsersController } from '@/apis/admin/users/users.controller';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

interface AdminUsersControllerSetup {
  module: TestingModule;
  controller: AdminApiUsersController;
}

export async function setupAdminUsersControllerIntegration(
  databaseHelper: DatabaseHelper,
): Promise<AdminUsersControllerSetup> {
  const module = await createApiIntegrationModule({
    controllerClass: AdminApiUsersController,
    serviceClasses: [UserCommandService, UserQueryService],
    databaseHelper,
  });

  return {
    module,
    controller: module.get<AdminApiUsersController>(AdminApiUsersController),
  };
}
