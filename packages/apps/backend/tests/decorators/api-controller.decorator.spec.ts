import 'reflect-metadata';

import { ApiController } from '@/decorators/api-controller.decorator'; // パスを調整

describe('ApiController', () => {
  it('should set controller path as "api/:path"', () => {
    @ApiController('users')
    class DummyController {}

    const path = Reflect.getMetadata('path', DummyController);
    expect(path).toBe('api/users');
  });
});
