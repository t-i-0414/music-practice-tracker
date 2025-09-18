import { ensurePublicIdsToArray } from '@/utils/ensure-public-ids-to-array';

describe('unit ensurePublicIdsToArray', () => {
  describe('null and undefined inputs', () => {
    it('should return empty array for null', () => {
      const result = ensurePublicIdsToArray(null);

      expect(result).toStrictEqual([]);
    });

    it('should return empty array for undefined', () => {
      const result = ensurePublicIdsToArray(undefined);

      expect(result).toStrictEqual([]);
    });
  });

  describe('string inputs', () => {
    it('should handle single string value', () => {
      const result = ensurePublicIdsToArray('id1');

      expect(result).toStrictEqual(['id1']);
    });

    it('should split comma-separated string', () => {
      const result = ensurePublicIdsToArray('id1,id2,id3');

      expect(result).toStrictEqual(['id1', 'id2', 'id3']);
    });

    it('should trim whitespace around values', () => {
      const result = ensurePublicIdsToArray('  id1  ,  id2  ,  id3  ');

      expect(result).toStrictEqual(['id1', 'id2', 'id3']);
    });

    it('should filter out empty strings', () => {
      const result = ensurePublicIdsToArray('id1,,id2,   ,id3');

      expect(result).toStrictEqual(['id1', 'id2', 'id3']);
    });

    it('should handle empty string', () => {
      const result = ensurePublicIdsToArray('');

      expect(result).toStrictEqual([]);
    });

    it('should handle string with only spaces', () => {
      const result = ensurePublicIdsToArray('   ');

      expect(result).toStrictEqual([]);
    });

    it('should handle string with only commas', () => {
      const result = ensurePublicIdsToArray(',,');

      expect(result).toStrictEqual([]);
    });

    it('should handle string with mixed spaces and commas', () => {
      const result = ensurePublicIdsToArray(' , , ');

      expect(result).toStrictEqual([]);
    });
  });

  describe('array inputs', () => {
    it('should handle array of strings', () => {
      const result = ensurePublicIdsToArray(['id1', 'id2', 'id3']);

      expect(result).toStrictEqual(['id1', 'id2', 'id3']);
    });

    it('should handle empty array', () => {
      const result = ensurePublicIdsToArray([]);

      expect(result).toStrictEqual([]);
    });

    it('should flatten and split array items with commas', () => {
      const result = ensurePublicIdsToArray(['id1,id2', 'id3', 'id4,id5']);

      expect(result).toStrictEqual(['id1', 'id2', 'id3', 'id4', 'id5']);
    });

    it('should handle array with empty strings', () => {
      const result = ensurePublicIdsToArray(['id1', '', 'id2']);

      expect(result).toStrictEqual(['id1', 'id2']);
    });

    it('should handle array with whitespace strings', () => {
      const result = ensurePublicIdsToArray(['id1', '   ', 'id2']);

      expect(result).toStrictEqual(['id1', 'id2']);
    });

    it('should handle array with comma-separated strings containing whitespace', () => {
      const result = ensurePublicIdsToArray(['  id1 , id2  ', 'id3,  id4  ']);

      expect(result).toStrictEqual(['id1', 'id2', 'id3', 'id4']);
    });
  });

  describe('complex scenarios', () => {
    it('should handle mix of single values and comma-separated values in array', () => {
      const result = ensurePublicIdsToArray(['id1', 'id2,id3,id4', 'id5']);

      expect(result).toStrictEqual(['id1', 'id2', 'id3', 'id4', 'id5']);
    });

    it('should maintain order of elements', () => {
      const result = ensurePublicIdsToArray('z,a,m,b');

      expect(result).toStrictEqual(['z', 'a', 'm', 'b']);
    });

    it('should handle UUID-like strings', () => {
      const result = ensurePublicIdsToArray(
        '123e4567-e89b-12d3-a456-426614174000,987fcdeb-51a2-43d7-8f9e-123456789abc',
      );

      expect(result).toStrictEqual(['123e4567-e89b-12d3-a456-426614174000', '987fcdeb-51a2-43d7-8f9e-123456789abc']);
    });
  });
});
