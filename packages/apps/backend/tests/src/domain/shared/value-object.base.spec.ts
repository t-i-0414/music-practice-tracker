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

class MultiPropVO extends ValueObject<{ name: string; age: number }> {
  public constructor(name: string, age: number) {
    super({ name, age });
  }

  public toValue(): { name: string; age: number } {
    return { name: this.props.name, age: this.props.age };
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

    it('should correctly compare VOs with multiple properties', () => {
      expect.assertions(2);

      const vo1 = new MultiPropVO('Alice', 30);
      const vo2 = new MultiPropVO('Alice', 30);
      const vo3 = new MultiPropVO('Alice', 31);

      expect(vo1.equals(vo2)).toBe(true);
      expect(vo1.equals(vo3)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should freeze props', () => {
      expect.assertions(1);

      const vo = new TestVO('hello');

      expect(Object.isFrozen(vo.getProps())).toBe(true);
    });

    it('should throw when attempting to mutate props', () => {
      expect.assertions(1);

      const vo = new TestVO('hello');
      const props = vo.getProps();

      expect(() => {
        // @ts-expect-error -- intentionally testing runtime immutability
        props.value = 'mutated';
      }).toThrow(TypeError);
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
