import { TestingModule } from '@nestjs/testing';

import { createApiIntegrationModule } from '../../helpers/integration-test-module.helper';

import { AdminApiAdminUsersController } from '@/apis/admin/admin-users/admin-users.controller';
import { AdminApiUsersController } from '@/apis/admin/users/users.controller';
import { AppApiUsersController } from '@/apis/app/users/users.controller';
import { AdminUserCommandService } from '@/domain/aggregates/admin-user/admin-user.command.service';
import { AdminUserQueryService } from '@/domain/aggregates/admin-user/admin-user.query.service';
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

interface AdminAdminUsersControllerSetup {
  module: TestingModule;
  controller: AdminApiAdminUsersController;
}

export async function setupAdminAdminUsersControllerIntegration(
  databaseHelper: DatabaseHelper,
): Promise<AdminAdminUsersControllerSetup> {
  const module = await createApiIntegrationModule({
    controllerClass: AdminApiAdminUsersController,
    serviceClasses: [AdminUserCommandService, AdminUserQueryService],
    databaseHelper,
  });

  return {
    module,
    controller: module.get<AdminApiAdminUsersController>(AdminApiAdminUsersController),
  };
}

interface AppUsersControllerSetup {
  module: TestingModule;
  controller: AppApiUsersController;
}

export async function setupAppUsersControllerIntegration(
  databaseHelper: DatabaseHelper,
): Promise<AppUsersControllerSetup> {
  const module = await createApiIntegrationModule({
    controllerClass: AppApiUsersController,
    serviceClasses: [UserCommandService, UserQueryService],
    databaseHelper,
  });

  return {
    module,
    controller: module.get<AppApiUsersController>(AppApiUsersController),
  };
}
