import { Entity } from '@/domain/shared/entity.base';

class TestEntity extends Entity<{ name: string }> {
  public constructor(publicId: string, name: string) {
    super(publicId, { name });
  }

  public get name(): string {
    return this.props.name;
  }
}

class OtherEntity extends Entity<{ name: string }> {
  public constructor(publicId: string, name: string) {
    super(publicId, { name });
  }
}

describe('unit Entity', () => {
  describe('publicId', () => {
    it('should expose publicId via getter', () => {
      expect.assertions(1);

      const entity = new TestEntity('abc-123', 'Test');

      expect(entity.publicId).toBe('abc-123');
    });
  });

  describe('equals', () => {
    it('should return true for entities with same publicId and same type', () => {
      expect.assertions(1);

      const entity1 = new TestEntity('abc-123', 'Alice');
      const entity2 = new TestEntity('abc-123', 'Bob');

      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return false for entities with different publicId', () => {
      expect.assertions(1);

      const entity1 = new TestEntity('abc-123', 'Alice');
      const entity2 = new TestEntity('def-456', 'Alice');

      expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return false for entities of different types with same publicId', () => {
      expect.assertions(1);

      const entity1 = new TestEntity('abc-123', 'Alice');
      const entity2 = new OtherEntity('abc-123', 'Alice');

      expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return false when compared with undefined', () => {
      expect.assertions(1);

      const entity = new TestEntity('abc-123', 'Alice');

      expect(entity.equals(undefined)).toBe(false);
    });
  });
});
