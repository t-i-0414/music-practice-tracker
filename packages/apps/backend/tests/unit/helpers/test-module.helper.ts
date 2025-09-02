import { DynamicModule, ForwardReference, Provider, Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

type ModuleImport = Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference;

interface CreateTestingModuleOptions {
  serviceClass: Type<unknown>;
  providers?: Provider[];
  imports?: ModuleImport[];
}

export async function createTestingModule(options: CreateTestingModuleOptions): Promise<TestingModule> {
  const { serviceClass, providers = [], imports = [] } = options;

  return Test.createTestingModule({
    imports,
    providers: [serviceClass, ...providers],
  }).compile();
}

interface CreateDomainTestingModuleOptions {
  commandServiceClass: Type<unknown>;
  queryServiceClass?: Type<unknown>;
  repositoryMock: Record<string, unknown>;
  queryServiceMock?: Record<string, unknown>;
  additionalProviders?: Provider[];
}

export async function createDomainTestingModule(options: CreateDomainTestingModuleOptions): Promise<TestingModule> {
  const {
    commandServiceClass,
    queryServiceClass,
    repositoryMock,
    queryServiceMock,
    additionalProviders = [],
  } = options;

  const providers: Provider[] = [
    commandServiceClass,
    {
      provide: 'RepositoryService',
      useValue: repositoryMock,
    },
    ...additionalProviders,
  ];

  if (queryServiceClass && queryServiceMock) {
    providers.push({
      provide: queryServiceClass,
      useValue: queryServiceMock,
    });
  }

  return Test.createTestingModule({ providers }).compile();
}

interface CreateControllerTestingModuleOptions {
  controllerClass: Type<unknown>;
  serviceMocks: {
    provide: Type<unknown> | string;
    useValue: Record<string, unknown>;
  }[];
  additionalProviders?: Provider[];
  imports?: ModuleImport[];
}

export async function createControllerTestingModule(
  options: CreateControllerTestingModuleOptions,
): Promise<TestingModule> {
  const { controllerClass, serviceMocks, additionalProviders = [], imports = [] } = options;

  return Test.createTestingModule({
    imports,
    controllers: [controllerClass],
    providers: [...serviceMocks, ...additionalProviders],
  }).compile();
}
