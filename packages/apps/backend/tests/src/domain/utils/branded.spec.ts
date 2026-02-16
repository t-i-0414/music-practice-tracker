import { toUserPublicId, toAdminUserPublicId, toFirebaseUid, toCognitoSub } from '@/domain/utils/brand-constructors';
import { DomainError } from '@/domain/utils/domain.error';

describe('unit Brand Constructors', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';

  describe('toUserPublicId', () => {
    it('should return branded value for valid UUID', () => {
      expect.assertions(1);

      const result = toUserPublicId(validUuid);

      expect(result).toBe(validUuid);
    });

    it('should accept uppercase UUID', () => {
      expect.assertions(1);

      const result = toUserPublicId('123E4567-E89B-12D3-A456-426614174000');

      expect(result).toBe('123E4567-E89B-12D3-A456-426614174000');
    });

    it.each(['not-a-uuid', '', '123', 'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz'])(
      'should throw DomainError for invalid value: %s',
      (value) => {
        expect.assertions(1);

        expect(() => toUserPublicId(value)).toThrow(DomainError);
      },
    );
  });

  describe('toAdminUserPublicId', () => {
    it('should return branded value for valid UUID', () => {
      expect.assertions(1);

      const result = toAdminUserPublicId(validUuid);

      expect(result).toBe(validUuid);
    });

    it('should throw DomainError for invalid UUID', () => {
      expect.assertions(1);

      expect(() => toAdminUserPublicId('invalid')).toThrow(DomainError);
    });
  });

  describe('toFirebaseUid', () => {
    it('should return branded value for non-empty string', () => {
      expect.assertions(1);

      const result = toFirebaseUid('abc123');

      expect(result).toBe('abc123');
    });

    it('should throw DomainError for empty string', () => {
      expect.assertions(1);

      expect(() => toFirebaseUid('')).toThrow(DomainError);
    });

    it('should throw DomainError for whitespace-only string', () => {
      expect.assertions(1);

      expect(() => toFirebaseUid('   ')).toThrow(DomainError);
    });
  });

  describe('toCognitoSub', () => {
    it('should return branded value for non-empty string', () => {
      expect.assertions(1);

      const result = toCognitoSub('sub-123');

      expect(result).toBe('sub-123');
    });

    it('should throw DomainError for empty string', () => {
      expect.assertions(1);

      expect(() => toCognitoSub('')).toThrow(DomainError);
    });

    it('should throw DomainError for whitespace-only string', () => {
      expect.assertions(1);

      expect(() => toCognitoSub('   ')).toThrow(DomainError);
    });
  });
});
