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
