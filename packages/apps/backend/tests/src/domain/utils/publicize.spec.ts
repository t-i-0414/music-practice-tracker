import type { Publicize } from '@/domain/utils/publicize';

describe('unit Publicize', () => {
  interface InternalUser {
    id: number;
    publicId: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }

  interface InternalPost {
    id: number;
    publicId: string;
    title: string;
    content: string;
    authorId: number;
    published: boolean;
  }

  describe('type transformation', () => {
    it('should remove id property from type', () => {
      type PublicUser = Publicize<InternalUser>;

      const publicUser: PublicUser = {
        publicId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(publicUser).toHaveProperty('publicId');
      expect(publicUser).toHaveProperty('email');
      expect(publicUser).toHaveProperty('name');
      expect(publicUser).toHaveProperty('createdAt');
      expect(publicUser).toHaveProperty('updatedAt');

      expect(publicUser).not.toHaveProperty('id');
    });

    it('should work with different object types', () => {
      type PublicPost = Publicize<InternalPost>;

      const publicPost: PublicPost = {
        publicId: 'post-456',
        title: 'Test Post',
        content: 'This is test content',
        authorId: 1,
        published: true,
      };

      expect(publicPost).toHaveProperty('publicId');
      expect(publicPost).toHaveProperty('title');
      expect(publicPost).toHaveProperty('content');
      expect(publicPost).toHaveProperty('authorId');
      expect(publicPost).toHaveProperty('published');
      expect(publicPost).not.toHaveProperty('id');
    });

    it('should preserve all other properties unchanged', () => {
      type PublicUser = Publicize<InternalUser>;

      const user: PublicUser = {
        publicId: 'user-789',
        email: 'user@test.com',
        name: 'Another User',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      expect(typeof user.publicId).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.name).toBe('string');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('practical usage scenarios', () => {
    it('should be usable for API response transformation', () => {
      const internalUser: InternalUser = {
        id: 1,
        publicId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const publicize = <T extends { id: any }>(internal: T): Publicize<T> => {
        const { id, ...publicData } = internal;
        return publicData;
      };

      const publicUser = publicize(internalUser);

      expect(publicUser).not.toHaveProperty('id');
      expect(publicUser).toHaveProperty('publicId');
      expect(publicUser.email).toBe(internalUser.email);
      expect(publicUser.name).toBe(internalUser.name);
    });

    it('should work with nested objects', () => {
      interface InternalUserWithProfile {
        id: number;
        publicId: string;
        email: string;
        profile: {
          bio: string;
          avatar: string;
        };
      }

      type PublicUserWithProfile = Publicize<InternalUserWithProfile>;

      const publicUser: PublicUserWithProfile = {
        publicId: 'user-with-profile',
        email: 'profile@test.com',
        profile: {
          bio: 'Test bio',
          avatar: 'avatar.png',
        },
      };

      expect(publicUser).not.toHaveProperty('id');
      expect(publicUser.profile).toStrictEqual({
        bio: 'Test bio',
        avatar: 'avatar.png',
      });
    });

    it('should work with array properties', () => {
      interface InternalUserWithTags {
        id: number;
        publicId: string;
        email: string;
        tags: string[];
      }

      type PublicUserWithTags = Publicize<InternalUserWithTags>;

      const publicUser: PublicUserWithTags = {
        publicId: 'user-with-tags',
        email: 'tags@test.com',
        tags: ['developer', 'typescript', 'testing'],
      };

      expect(publicUser).not.toHaveProperty('id');
      expect(Array.isArray(publicUser.tags)).toBe(true);
      expect(publicUser.tags).toHaveLength(3);
    });
  });

  describe('edge cases', () => {
    it('should handle objects without id property gracefully', () => {
      interface ObjectWithoutId {
        publicId: string;
        name: string;
      }

      type PublicObject = Publicize<ObjectWithoutId>;

      const obj: PublicObject = {
        publicId: 'obj-123',
        name: 'Test Object',
      };

      expect(obj).toHaveProperty('publicId');
      expect(obj).toHaveProperty('name');
    });

    it('should work with optional properties', () => {
      interface InternalUserOptional {
        id: number;
        publicId: string;
        email: string;
        name?: string;
        avatar?: string;
      }

      type PublicUserOptional = Publicize<InternalUserOptional>;

      const publicUser: PublicUserOptional = {
        publicId: 'user-optional',
        email: 'optional@test.com',
      };

      expect(publicUser).not.toHaveProperty('id');
      expect(publicUser).toHaveProperty('publicId');
      expect(publicUser).toHaveProperty('email');
    });

    it('should preserve readonly properties', () => {
      interface InternalReadonlyUser {
        id: number;
        readonly publicId: string;
        readonly createdAt: Date;
        email: string;
      }

      type PublicReadonlyUser = Publicize<InternalReadonlyUser>;

      const publicUser: PublicReadonlyUser = {
        publicId: 'readonly-user',
        createdAt: new Date(),
        email: 'readonly@test.com',
      };

      expect(publicUser).not.toHaveProperty('id');
      expect(publicUser).toHaveProperty('publicId');
      expect(publicUser).toHaveProperty('createdAt');
      expect(publicUser).toHaveProperty('email');
    });
  });

  describe('type utility validation', () => {
    it('should be a pure type transformation', () => {
      type TestType = Publicize<{ id: number; value: string }>;

      const test: TestType = { value: 'test' };

      expect(test).toHaveProperty('value');
      expect(test).not.toHaveProperty('id');
    });

    it('should work with union types', () => {
      interface TypeA {
        id: number;
        typeA: string;
      }

      interface TypeB {
        id: string;
        typeB: number;
      }

      type PublicUnion = Publicize<TypeA> | Publicize<TypeB>;

      const valueA: PublicUnion = { typeA: 'test' };
      const valueB: PublicUnion = { typeB: 42 };

      expect(valueA).toHaveProperty('typeA');
      expect(valueA).not.toHaveProperty('id');
      expect(valueB).toHaveProperty('typeB');
      expect(valueB).not.toHaveProperty('id');
    });
  });
});
