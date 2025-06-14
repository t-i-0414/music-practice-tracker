import { Controller, applyDecorators } from '@nestjs/common';

export function ApiController(path: string): ClassDecorator {
  return applyDecorators(Controller(`api/${path}`));
}
