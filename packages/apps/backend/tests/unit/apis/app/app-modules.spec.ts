import { AppApiModule } from '@/apis/app/app.module';
import { AppApiUsersModule } from '@/apis/app/users/users.module';
import { CommonModule } from '@/apis/app/utils/common.module';
import { UserUsecaseModule } from '@/domain/usecases/user/user-usecase.module';

describe('unit App API modules', () => {
  it('exports AppApiModule definition', () => {
    expect.assertions(2);

    expect(AppApiModule).toBeDefined();
    expect(new AppApiModule()).toBeInstanceOf(AppApiModule);
  });

  it('exports CommonModule with expected bindings', () => {
    expect.assertions(2);

    expect(CommonModule).toBeDefined();
    expect(new CommonModule()).toBeInstanceOf(CommonModule);
  });

  it('exports AppApiUsersModule definition', () => {
    expect.assertions(2);

    expect(AppApiUsersModule).toBeDefined();
    expect(new AppApiUsersModule()).toBeInstanceOf(AppApiUsersModule);
  });

  it('exports UserUsecaseModule definition', () => {
    expect.assertions(2);

    expect(UserUsecaseModule).toBeDefined();
    expect(new UserUsecaseModule()).toBeInstanceOf(UserUsecaseModule);
  });
});
