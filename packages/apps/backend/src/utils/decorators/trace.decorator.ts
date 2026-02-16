import tracer from 'dd-trace';

export function Trace(operationName?: string) {
  return function traceDecorator(
    _target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- PropertyDescriptor.value is untyped
    const original = descriptor.value;
    // eslint-disable-next-line func-name-matching -- named for stack trace readability; assigned to descriptor.value
    descriptor.value = function traceWrapper(this: object, ...args: unknown[]): unknown {
      const name = operationName ?? `${this.constructor.name}.${String(propertyKey)}`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- decorator wraps original method
      return tracer.trace('domain.operation', { resource: name }, () => original.apply(this, args));
    };
    return descriptor;
  };
}
