import { UserName } from '@/domain/shared/value-objects/user-name.vo';
import { DomainError } from '@/domain/utils/domain.error';

describe('unit UserName', () => {
  describe('create', () => {
    it('should create a UserName with valid input', () => {
      expect.assertions(1);

      const name = UserName.create('Takuya');

      expect(name.value).toBe('Takuya');
    });

    it('should trim whitespace', () => {
      expect.assertions(1);

      const name = UserName.create('  Takuya  ');

      expect(name.value).toBe('Takuya');
    });

    it('should throw DomainError for empty string', () => {
      expect.assertions(1);

      expect(() => UserName.create('')).toThrow(DomainError);
    });

    it('should throw DomainError for whitespace-only string', () => {
      expect.assertions(1);

      expect(() => UserName.create('   ')).toThrow(DomainError);
    });

    it('should throw DomainError for string exceeding max length', () => {
      expect.assertions(1);

      const longName = 'a'.repeat(51);

      expect(() => UserName.create(longName)).toThrow(DomainError);
    });

    it('should accept string at exact max length', () => {
      expect.assertions(1);

      const maxName = 'a'.repeat(50);
      const name = UserName.create(maxName);

      expect(name.value).toBe(maxName);
    });
  });

  describe('fromPersistence', () => {
    it('should create without validation', () => {
      expect.assertions(1);

      const name = UserName.fromPersistence('any value');

      expect(name.value).toBe('any value');
    });
  });

  describe('toValue', () => {
    it('should return the raw string value', () => {
      expect.assertions(1);

      const name = UserName.create('Takuya');

      expect(name.toValue()).toBe('Takuya');
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      expect.assertions(1);

      const name1 = UserName.create('Takuya');
      const name2 = UserName.create('Takuya');

      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different values', () => {
      expect.assertions(1);

      const name1 = UserName.create('Takuya');
      const name2 = UserName.create('Alice');

      expect(name1.equals(name2)).toBe(false);
    });
  });
});
