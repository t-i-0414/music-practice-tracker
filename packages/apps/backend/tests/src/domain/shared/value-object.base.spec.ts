import { ValueObject } from '@/domain/shared/value-object.base';

class TestVO extends ValueObject<{ value: string }> {
  public constructor(value: string) {
    super({ value });
  }

  public getProps(): Readonly<{ value: string }> {
    return this.props;
  }

  public toValue(): string {
    return this.props.value;
  }
}

class OtherVO extends ValueObject<{ value: string }> {
  public constructor(value: string) {
    super({ value });
  }

  public toValue(): string {
    return this.props.value;
  }
}

describe('unit ValueObject', () => {
  describe('equals', () => {
    it('should return true for VOs with same props and same type', () => {
      expect.assertions(1);

      const vo1 = new TestVO('hello');
      const vo2 = new TestVO('hello');

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for VOs with different props', () => {
      expect.assertions(1);

      const vo1 = new TestVO('hello');
      const vo2 = new TestVO('world');

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false for VOs of different types with same props', () => {
      expect.assertions(1);

      const vo1 = new TestVO('hello');
      const vo2 = new OtherVO('hello');

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false when compared with undefined', () => {
      expect.assertions(1);

      const vo = new TestVO('hello');

      expect(vo.equals(undefined)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should freeze props', () => {
      expect.assertions(1);

      const vo = new TestVO('hello');

      expect(Object.isFrozen(vo.getProps())).toBe(true);
    });
  });

  describe('toValue', () => {
    it('should return the unwrapped value', () => {
      expect.assertions(1);

      const vo = new TestVO('hello');

      expect(vo.toValue()).toBe('hello');
    });
  });
});
