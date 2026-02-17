import { DomainError } from '@/domain/utils/domain.error';
import { UserStatus } from '@/domain/utils/value-objects/user-status.vo';

describe('unit UserStatus', () => {
  describe('create', () => {
    it.each(['ACTIVE', 'PENDING', 'SUSPENDED', 'BANNED'])(
      'should create a UserStatus with valid value: %s',
      (status) => {
        expect.assertions(1);

        const result = UserStatus.create(status);

        expect(result.value).toBe(status);
      },
    );

    it('should throw DomainError for invalid status', () => {
      expect.assertions(1);

      expect(() => UserStatus.create('INVALID')).toThrow(DomainError);
    });

    it('should throw DomainError for empty string', () => {
      expect.assertions(1);

      expect(() => UserStatus.create('')).toThrow(DomainError);
    });

    it('should throw DomainError for lowercase valid value', () => {
      expect.assertions(1);

      expect(() => UserStatus.create('active')).toThrow(DomainError);
    });
  });

  describe('fromPersistence', () => {
    it('should create without validation', () => {
      expect.assertions(1);

      const result = UserStatus.fromPersistence('ACTIVE');

      expect(result.value).toBe('ACTIVE');
    });
  });

  describe('toValue', () => {
    it('should return the raw status string', () => {
      expect.assertions(1);

      const status = UserStatus.create('ACTIVE');

      expect(status.toValue()).toBe('ACTIVE');
    });
  });

  describe('equals', () => {
    it('should return true for same status', () => {
      expect.assertions(1);

      const status1 = UserStatus.create('ACTIVE');
      const status2 = UserStatus.create('ACTIVE');

      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different status', () => {
      expect.assertions(1);

      const status1 = UserStatus.create('ACTIVE');
      const status2 = UserStatus.create('BANNED');

      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should return true for ACTIVE', () => {
      expect.assertions(1);

      const status = UserStatus.create('ACTIVE');

      expect(status.isActive()).toBe(true);
    });

    it('should return false for non-ACTIVE', () => {
      expect.assertions(1);

      const status = UserStatus.create('BANNED');

      expect(status.isActive()).toBe(false);
    });
  });

  describe('isBanned', () => {
    it('should return true for BANNED', () => {
      expect.assertions(1);

      const status = UserStatus.create('BANNED');

      expect(status.isBanned()).toBe(true);
    });

    it('should return false for non-BANNED', () => {
      expect.assertions(1);

      const status = UserStatus.create('ACTIVE');

      expect(status.isBanned()).toBe(false);
    });
  });
});
