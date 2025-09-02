import { type Type } from '@nestjs/common';
import { Test, TestingModule, type TestingModuleBuilder } from '@nestjs/testing';

export interface MockService {
  [key: string]: jest.Mock | MockService;
}

export interface TestModuleConfig {
  controller?: Type;
  service?: Type;
  providers: {
    provide: Type;
    useValue: MockService;
  }[];
}

export async function createTestModule(config: TestModuleConfig): Promise<TestingModule> {
  const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
    controllers: config.controller ? [config.controller] : [],
    providers: config.service ? [config.service, ...config.providers] : config.providers,
  });

  return moduleBuilder.compile();
}

export function getServicesFromModule<T extends Record<string, Type>>(
  module: TestingModule,
  services: T,
): { [K in keyof T]: T[K] extends Type<infer U> ? U : never } {
  const result = {} as { [K in keyof T]: T[K] extends Type<infer U> ? U : never };

  for (const [key, ServiceClass] of Object.entries(services) as [keyof T, Type][]) {
    result[key] = module.get(ServiceClass);
  }

  return result;
}
