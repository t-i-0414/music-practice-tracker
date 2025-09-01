/* eslint-disable jest/unbound-method */
import { SetMetadata } from '@nestjs/common';

import { IS_PUBLIC_KEY, Public } from '@/apis/utils/decorators/public.decorator';

describe('public Decorator', () => {
  describe('basic functionality', () => {
    it('should set IS_PUBLIC_KEY metadata to true', () => {
      expect.assertions(2);

      class TestController {
        @Public()
        publicMethod() {
          return 'public';
        }

        privateMethod() {
          return 'private';
        }
      }

      const publicMetadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype.publicMethod);
      const privateMetadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype.privateMethod);

      expect(publicMetadata).toBe(true);
      expect(privateMetadata).toBeUndefined();
    });
  });

  describe('decorator composition', () => {
    it('should work with multiple decorators', () => {
      expect.assertions(2);

      const CustomDecorator = () => SetMetadata('custom', 'value');

      class TestController {
        @Public()
        @CustomDecorator()
        decoratedMethod() {
          return 'decorated';
        }
      }

      const publicMetadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype.decoratedMethod);
      const customMetadata = Reflect.getMetadata('custom', TestController.prototype.decoratedMethod);

      expect(publicMetadata).toBe(true);
      expect(customMetadata).toBe('value');
    });
  });

  describe('class-level usage', () => {
    it('should apply to class', () => {
      expect.assertions(1);

      @Public()
      class PublicController {
        method1() {
          return 'method1';
        }

        method2() {
          return 'method2';
        }
      }

      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, PublicController);

      expect(metadata).toBe(true);
    });
  });

  describe('inheritance', () => {
    it('should work with inherited methods', () => {
      expect.assertions(3);

      class BaseController {
        @Public()
        publicBase() {
          return 'public base';
        }
      }

      class ExtendedController extends BaseController {
        @Public()
        publicExtended() {
          return 'public extended';
        }

        privateExtended() {
          return 'private extended';
        }
      }

      const baseMetadata = Reflect.getMetadata(IS_PUBLIC_KEY, ExtendedController.prototype.publicBase);
      const extendedMetadata = Reflect.getMetadata(IS_PUBLIC_KEY, ExtendedController.prototype.publicExtended);
      const privateMetadata = Reflect.getMetadata(IS_PUBLIC_KEY, ExtendedController.prototype.privateExtended);

      expect(baseMetadata).toBe(true);
      expect(extendedMetadata).toBe(true);
      expect(privateMetadata).toBeUndefined();
    });
  });

  describe('route handler usage', () => {
    it('should mark GET routes as public', () => {
      expect.assertions(3);

      class AuthController {
        @Public()
        login() {
          return { token: 'jwt-token' };
        }

        @Public()
        register() {
          return { success: true };
        }

        profile() {
          return { user: 'data' };
        }
      }

      expect(Reflect.getMetadata(IS_PUBLIC_KEY, AuthController.prototype.login)).toBe(true);
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, AuthController.prototype.register)).toBe(true);
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, AuthController.prototype.profile)).toBeUndefined();
    });
  });
});
