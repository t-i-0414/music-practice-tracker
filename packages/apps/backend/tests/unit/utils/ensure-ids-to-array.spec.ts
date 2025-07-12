import { ensureIdsToArray } from '@/utils/ensure-ids-to-array';

describe('ensureIdsToArray', () => {
  describe('with null or undefined input', () => {
    it('should return empty array for null', () => {
      expect.assertions(1);

      const result = ensureIdsToArray(null);

      expect(result).toStrictEqual([]);
    });

    it('should return empty array for undefined', () => {
      expect.assertions(1);

      const result = ensureIdsToArray(undefined);

      expect(result).toStrictEqual([]);
    });
  });

  describe('with string input', () => {
    it('should return array with single string', () => {
      expect.assertions(1);

      const result = ensureIdsToArray('id1');

      expect(result).toStrictEqual(['id1']);
    });

    it('should split comma-separated string', () => {
      expect.assertions(1);

      const result = ensureIdsToArray('id1,id2,id3');

      expect(result).toStrictEqual(['id1', 'id2', 'id3']);
    });

    it('should trim whitespace from comma-separated values', () => {
      expect.assertions(1);

      const result = ensureIdsToArray('id1 , id2,  id3  ');

      expect(result).toStrictEqual(['id1', 'id2', 'id3']);
    });

    it('should filter out empty strings', () => {
      expect.assertions(1);

      const result = ensureIdsToArray('id1,,id2,,,id3,');

      expect(result).toStrictEqual(['id1', 'id2', 'id3']);
    });

    it('should handle empty string', () => {
      expect.assertions(1);

      const result = ensureIdsToArray('');

      expect(result).toStrictEqual([]);
    });

    it('should handle string with only commas', () => {
      expect.assertions(1);

      const result = ensureIdsToArray(',,,');

      expect(result).toStrictEqual([]);
    });
  });

  describe('with array input', () => {
    it('should return same array for simple string array', () => {
      expect.assertions(1);

      const input = ['id1', 'id2', 'id3'];
      const result = ensureIdsToArray(input);

      expect(result).toStrictEqual(['id1', 'id2', 'id3']);
    });

    it('should flatten comma-separated strings in array', () => {
      expect.assertions(1);

      const input = ['id1,id2', 'id3', 'id4,id5'];
      const result = ensureIdsToArray(input);

      expect(result).toStrictEqual(['id1', 'id2', 'id3', 'id4', 'id5']);
    });

    it('should handle mixed array with empty values', () => {
      expect.assertions(1);

      const input = ['id1', '', 'id2,id3', ',,', 'id4'];
      const result = ensureIdsToArray(input);

      expect(result).toStrictEqual(['id1', 'id2', 'id3', 'id4']);
    });

    it('should trim whitespace in array values', () => {
      expect.assertions(1);

      const input = [' id1 ', 'id2, id3 ', '  id4  '];
      const result = ensureIdsToArray(input);

      expect(result).toStrictEqual(['id1', 'id2', 'id3', 'id4']);
    });

    it('should handle empty array', () => {
      expect.assertions(1);

      const result = ensureIdsToArray([]);

      expect(result).toStrictEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle array with empty strings', () => {
      expect.assertions(1);

      const input = ['', '', ''];
      const result = ensureIdsToArray(input);

      expect(result).toStrictEqual([]);
    });

    it('should handle complex nested comma-separated values', () => {
      expect.assertions(1);

      const input = ['a,b,c', 'd,e', 'f', 'g,h,i,j'];
      const result = ensureIdsToArray(input);

      expect(result).toStrictEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    });
  });
});
