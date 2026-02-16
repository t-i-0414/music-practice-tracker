import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import tracer from 'dd-trace';
import { type Observable, from } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const resource = `${controller}.${handler}`;

    return from(tracer.trace('nestjs.handler', { resource }, () => firstValueFrom(next.handle())));
  }
}
