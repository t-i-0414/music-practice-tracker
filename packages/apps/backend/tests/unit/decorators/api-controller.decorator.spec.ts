import { ApiController } from '@/apis/utils/controllers/api.controller';

describe('apiController Decorator', () => {
  describe('basic usage', () => {
    it('should apply Controller decorator with prefix', () => {
      @ApiController('test')
      class TestController {}

      const metadata = Reflect.getMetadata('path', TestController);

      expect(metadata).toBe('api/test');
    });

    it('should apply Controller decorator correctly', () => {
      @ApiController('users')
      class UsersController {}

      const metadata = Reflect.getMetadata('path', UsersController);

      expect(metadata).toBe('api/users');
    });
  });

  describe('path variations', () => {
    it('should handle nested paths', () => {
      @ApiController('admin/users')
      class AdminUsersController {}

      const metadata = Reflect.getMetadata('path', AdminUsersController);

      expect(metadata).toBe('api/admin/users');
    });

    it('should handle empty path', () => {
      @ApiController('')
      class RootController {}

      const metadata = Reflect.getMetadata('path', RootController);

      expect(metadata).toBe('api/');
    });

    it('should handle path with parameters', () => {
      @ApiController('users/:id/posts')
      class UserPostsController {}

      const metadata = Reflect.getMetadata('path', UserPostsController);

      expect(metadata).toBe('api/users/:id/posts');
    });
  });

  describe('decorator composition', () => {
    it('should work with additional decorators', () => {
      const customDecorator = (target: any) => {
        Reflect.defineMetadata('custom', true, target);
        return target;
      };

      @customDecorator
      @ApiController('test')
      class DecoratedController {}

      const pathMetadata = Reflect.getMetadata('path', DecoratedController);
      const customMetadata = Reflect.getMetadata('custom', DecoratedController);

      expect(pathMetadata).toBe('api/test');
      expect(customMetadata).toBe(true);
    });
  });

  describe('controller inheritance', () => {
    it('should work with class inheritance', () => {
      @ApiController('base')
      class BaseController {
        baseMethod() {
          return 'base';
        }
      }

      class ExtendedController extends BaseController {
        extendedMethod() {
          return 'extended';
        }
      }

      const controller = new ExtendedController();

      expect(controller.baseMethod()).toBe('base');
      expect(controller.extendedMethod()).toBe('extended');
    });
  });

  describe('multiple controllers', () => {
    it('should handle multiple controllers with different paths', () => {
      @ApiController('users')
      class UsersController {}

      @ApiController('posts')
      class PostsController {}

      const usersPath = Reflect.getMetadata('path', UsersController);
      const postsPath = Reflect.getMetadata('path', PostsController);

      expect(usersPath).toBe('api/users');
      expect(postsPath).toBe('api/posts');
    });
  });
});
