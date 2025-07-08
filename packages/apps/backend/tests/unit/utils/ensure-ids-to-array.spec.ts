import { ensureIdsToArray } from '@/utils/ensure-ids-to-array';

describe('ensureIdsToArray', () => {
  describe('null or undefined inputs', () => {
    it('should return empty array for null', () => {
      expect(ensureIdsToArray(null)).toEqual([]);
    });

    it('should return empty array for undefined', () => {
      expect(ensureIdsToArray(undefined)).toEqual([]);
    });
  });

  describe('string inputs', () => {
    it('should return array with single ID', () => {
      expect(ensureIdsToArray('id1')).toEqual(['id1']);
    });

    it('should split comma-separated IDs', () => {
      expect(ensureIdsToArray('id1,id2,id3')).toEqual(['id1', 'id2', 'id3']);
    });

    it('should trim whitespace from IDs', () => {
      expect(ensureIdsToArray('id1, id2 , id3')).toEqual(['id1', 'id2', 'id3']);
    });

    it('should filter out empty strings', () => {
      expect(ensureIdsToArray('id1,,id2,,')).toEqual(['id1', 'id2']);
    });

    it('should handle string with only commas', () => {
      expect(ensureIdsToArray(',,,,')).toEqual([]);
    });

    it('should handle empty string', () => {
      expect(ensureIdsToArray('')).toEqual([]);
    });
  });

  describe('array inputs', () => {
    it('should return array as-is for simple array', () => {
      expect(ensureIdsToArray(['id1', 'id2', 'id3'])).toEqual(['id1', 'id2', 'id3']);
    });

    it('should split comma-separated values in array', () => {
      expect(ensureIdsToArray(['id1,id2', 'id3'])).toEqual(['id1', 'id2', 'id3']);
    });

    it('should handle mixed array with comma-separated values', () => {
      expect(ensureIdsToArray(['id1', 'id2,id3', 'id4'])).toEqual(['id1', 'id2', 'id3', 'id4']);
    });

    it('should trim whitespace from array elements', () => {
      expect(ensureIdsToArray([' id1 ', 'id2, id3 '])).toEqual(['id1', 'id2', 'id3']);
    });

    it('should filter out empty strings from array', () => {
      expect(ensureIdsToArray(['id1', '', 'id2', ','])).toEqual(['id1', 'id2']);
    });

    it('should handle empty array', () => {
      expect(ensureIdsToArray([])).toEqual([]);
    });

    it('should handle array with empty strings only', () => {
      expect(ensureIdsToArray(['', ',', ',,'])).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle complex nested comma-separated values', () => {
      expect(ensureIdsToArray(['id1,id2,id3', 'id4,id5', 'id6'])).toEqual(['id1', 'id2', 'id3', 'id4', 'id5', 'id6']);
    });

    it('should handle whitespace and empty values in complex array', () => {
      expect(ensureIdsToArray([' id1, id2 ', '', 'id3,  ,id4'])).toEqual(['id1', 'id2', 'id3', 'id4']);
    });
  });
});
