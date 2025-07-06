import { mockDeep, type DeepMockProxy } from 'jest-mock-extended';

import type { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import type { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import type { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import type { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import type { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';

export function createMockUserQueryService(): DeepMockProxy<UserQueryService> {
  return mockDeep<UserQueryService>();
}

export function createMockUserCommandService(): DeepMockProxy<UserCommandService> {
  return mockDeep<UserCommandService>();
}

export function createMockUserAdminFacadeService(): DeepMockProxy<UserAdminFacadeService> {
  return mockDeep<UserAdminFacadeService>();
}

export function createMockUserAppFacadeService(): DeepMockProxy<UserAppFacadeService> {
  return mockDeep<UserAppFacadeService>();
}

export function createMockUserRepositoryService(): DeepMockProxy<UserRepositoryService> {
  return mockDeep<UserRepositoryService>();
}
