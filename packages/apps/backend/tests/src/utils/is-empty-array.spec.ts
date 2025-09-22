import { isEmptyArray } from '@/utils/is-empty-array';

describe('unit isEmptyArray', () => {
  it('returns true for an empty array literal', () => {
    expect(isEmptyArray([])).toBe(true);
  });

  it('returns false for arrays with elements, even if falsy', () => {
    expect(isEmptyArray([undefined])).toBe(false);
    expect(isEmptyArray([null])).toBe(false);
    expect(isEmptyArray([0])).toBe(false);
  });

  it('returns false for non-array values', () => {
    expect(isEmptyArray(undefined as unknown as unknown[])).toBe(false);
    expect(isEmptyArray(null as unknown as unknown[])).toBe(false);
    expect(isEmptyArray('not-an-array' as unknown as unknown[])).toBe(false);
    expect(isEmptyArray({ length: 0 } as unknown as unknown[])).toBe(false);
  });

  it('returns false for array-like objects', () => {
    const arrayLike = { 0: 'value', length: 0 } as unknown as unknown[];

    expect(isEmptyArray(arrayLike)).toBe(false);
  });
});
