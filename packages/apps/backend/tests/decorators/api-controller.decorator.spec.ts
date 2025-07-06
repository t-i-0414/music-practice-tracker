import { Controller } from '@nestjs/common';
import 'reflect-metadata';

import { ApiController } from '@/decorators/api-controller.decorator';
import { cleanupMocks } from '@/tests/helpers';

describe('ApiController Decorator', () => {
  afterEach(() => {
    cleanupMocks();
  });
  describe('Basic functionality', () => {
    it('should set controller path with "api/" prefix', () => {
      @ApiController('users')
      class UsersController {}

      const path = Reflect.getMetadata('path', UsersController);
      expect(path).toBe('api/users');
    });

    it('should work with empty path', () => {
      @ApiController('')
      class RootController {}

      const path = Reflect.getMetadata('path', RootController);
      expect(path).toBe('api/');
    });

    it('should work with nested paths', () => {
      @ApiController('admin/users')
      class AdminUsersController {}

      const path = Reflect.getMetadata('path', AdminUsersController);
      expect(path).toBe('api/admin/users');
    });

    it('should preserve path with slashes', () => {
      @ApiController('/users/')
      class UsersWithSlashesController {}

      const path = Reflect.getMetadata('path', UsersWithSlashesController);
      expect(path).toBe('api//users/');
    });

    it('should work with path parameters', () => {
      @ApiController('users/:id/posts')
      class UserPostsController {}

      const path = Reflect.getMetadata('path', UserPostsController);
      expect(path).toBe('api/users/:id/posts');
    });
  });

  describe('Metadata preservation', () => {
    it('should preserve Controller decorator metadata', () => {
      @ApiController('test')
      class TestController {}

      const path = Reflect.getMetadata('path', TestController);
      expect(path).toBe('api/test');
    });

    it('should allow method decorators to work correctly', () => {
      @ApiController('test')
      class TestController {
        @Reflect.metadata('custom', 'value')
        testMethod() {}
      }

      const controller = new TestController();
      const metadata = Reflect.getMetadata('custom', controller, 'testMethod');
      expect(metadata).toBe('value');
    });
  });

  describe('Comparison with native Controller decorator', () => {
    it('should have same metadata structure as native Controller', () => {
      @Controller('api/native')
      class NativeController {}

      @ApiController('custom')
      class CustomController {}

      const nativePath = Reflect.getMetadata('path', NativeController);
      const customPath = Reflect.getMetadata('path', CustomController);

      expect(nativePath).toBe('api/native');
      expect(customPath).toBe('api/custom');
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in path', () => {
      @ApiController('users-list')
      class UsersListController {}

      const path = Reflect.getMetadata('path', UsersListController);
      expect(path).toBe('api/users-list');
    });

    it('should handle underscores in path', () => {
      @ApiController('user_profile')
      class UserProfileController {}

      const path = Reflect.getMetadata('path', UserProfileController);
      expect(path).toBe('api/user_profile');
    });

    it('should handle numbers in path', () => {
      @ApiController('v2/users')
      class V2UsersController {}

      const path = Reflect.getMetadata('path', V2UsersController);
      expect(path).toBe('api/v2/users');
    });

    it('should handle complex nested paths', () => {
      @ApiController('admin/v1/users/:userId/posts/:postId/comments')
      class ComplexPathController {}

      const path = Reflect.getMetadata('path', ComplexPathController);
      expect(path).toBe('api/admin/v1/users/:userId/posts/:postId/comments');
    });
  });

  describe('Type safety', () => {
    it('should work with string literal types', () => {
      type UserPath = 'users';
      const userPath: UserPath = 'users';

      @ApiController(userPath)
      class TypedController {}

      const path = Reflect.getMetadata('path', TypedController);
      expect(path).toBe('api/users');
    });

    it('should work with template literal types', () => {
      const entity = 'users';
      const version = 'v1';

      @ApiController(`${version}/${entity}`)
      class TemplateController {}

      const path = Reflect.getMetadata('path', TemplateController);
      expect(path).toBe('api/v1/users');
    });
  });

  describe('Multiple decorators interaction', () => {
    it('should work with multiple class decorators', () => {
      const CustomDecorator: ClassDecorator = (target) => {
        Reflect.defineMetadata('custom', true, target);
      };

      @CustomDecorator
      @ApiController('multi')
      class MultiDecoratedController {}

      const path = Reflect.getMetadata('path', MultiDecoratedController);
      const custom = Reflect.getMetadata('custom', MultiDecoratedController);

      expect(path).toBe('api/multi');
      expect(custom).toBe(true);
    });
  });

  describe('Inheritance', () => {
    it('should work with class inheritance', () => {
      @ApiController('base')
      class BaseController {}

      class ExtendedController extends BaseController {}

      const basePath = Reflect.getMetadata('path', BaseController);
      const extendedPath = Reflect.getMetadata('path', ExtendedController);

      expect(basePath).toBe('api/base');
      expect(extendedPath).toBe('api/base');
    });

    it('should allow applying decorator to extended class', () => {
      @ApiController('base')
      class BaseController {}

      @ApiController('extended')
      class ExtendedController extends BaseController {}

      const basePath = Reflect.getMetadata('path', BaseController);
      const extendedPath = Reflect.getMetadata('path', ExtendedController);

      expect(basePath).toBe('api/base');
      expect(extendedPath).toBe('api/extended');
    });
  });
});
