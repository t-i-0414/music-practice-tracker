import { AdminAdminUsersModule } from '@/apis/admin/admin-users/admin-users.module';
import { AdminApiModule } from '@/apis/admin/admin.module';
import { AdminUsersModule } from '@/apis/admin/users/users.module';
import { AdminUserModule } from '@/domain/aggregates/admin-user/admin-user.module';

describe('unit Admin API modules', () => {
  it('exports AdminApiModule definition', () => {
    expect.assertions(2);

    expect(AdminApiModule).toBeDefined();
    expect(new AdminApiModule()).toBeInstanceOf(AdminApiModule);
  });

  it('exports AdminAdminUsersModule definition', () => {
    expect.assertions(2);

    expect(AdminAdminUsersModule).toBeDefined();
    expect(new AdminAdminUsersModule()).toBeInstanceOf(AdminAdminUsersModule);
  });

  it('exports AdminUsersModule definition', () => {
    expect.assertions(2);

    expect(AdminUsersModule).toBeDefined();
    expect(new AdminUsersModule()).toBeInstanceOf(AdminUsersModule);
  });

  it('exports AdminUserModule definition', () => {
    expect.assertions(2);

    expect(AdminUserModule).toBeDefined();
    expect(new AdminUserModule()).toBeInstanceOf(AdminUserModule);
  });
});
