import { Controller } from '@nestjs/common';

import { ApiController } from '@/decorators/api-controller.decorator';

describe('apiController decorator', () => {
  it('should return a function decorator', () => {
    expect.assertions(1);

    const path = 'users';
    const decorator = ApiController(path);

    expect(typeof decorator).toBe('function');
  });

  it('should be applicable to class with path metadata', () => {
    expect.assertions(1);

    @ApiController('test')
    class TestController {}

    const path = Reflect.getMetadata('path', TestController);

    expect(path).toBe('api/test');
  });

  it('should handle nested paths', () => {
    expect.assertions(1);

    @ApiController('admin/users')
    class AdminUsersController {}

    const path = Reflect.getMetadata('path', AdminUsersController);

    expect(path).toBe('api/admin/users');
  });

  it('should handle empty path', () => {
    expect.assertions(1);

    @ApiController('')
    class RootController {}

    const path = Reflect.getMetadata('path', RootController);

    expect(path).toBe('api/');
  });

  it('should work the same as Controller decorator with prefix', () => {
    expect.assertions(2);

    @ApiController('test')
    class ApiTestController {}

    @Controller('api/test')
    class StandardController {}

    const apiPath = Reflect.getMetadata('path', ApiTestController);
    const standardPath = Reflect.getMetadata('path', StandardController);

    expect(apiPath).toBe(standardPath);
    expect(apiPath).toBe('api/test');
  });
});