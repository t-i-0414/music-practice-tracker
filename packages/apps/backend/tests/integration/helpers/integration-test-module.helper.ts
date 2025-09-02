import { Provider, Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

interface CreateIntegrationTestingModuleOptions {
  controllers?: Type<unknown>[];
  providers?: Type<unknown>[];
  databaseHelper: DatabaseHelper;
  additionalProviders?: Provider[];
}

export async function createIntegrationTestingModule(
  options: CreateIntegrationTestingModuleOptions,
): Promise<TestingModule> {
  const { controllers = [], providers = [], databaseHelper, additionalProviders = [] } = options;

  const repositoryProvider: Provider = {
    provide: RepositoryService,
    useValue: databaseHelper.client,
  };

  return Test.createTestingModule({
    controllers,
    providers: [...providers, repositoryProvider, ...additionalProviders],
  }).compile();
}

interface CreateDomainIntegrationModuleOptions {
  commandServiceClass?: Type<unknown>;
  queryServiceClass?: Type<unknown>;
  databaseHelper: DatabaseHelper;
  additionalProviders?: Provider[];
}

export async function createDomainIntegrationModule(
  options: CreateDomainIntegrationModuleOptions,
): Promise<TestingModule> {
  const { commandServiceClass, queryServiceClass, databaseHelper, additionalProviders = [] } = options;

  const providers: Type<unknown>[] = [];
  if (commandServiceClass) providers.push(commandServiceClass);
  if (queryServiceClass) providers.push(queryServiceClass);

  return createIntegrationTestingModule({
    providers,
    databaseHelper,
    additionalProviders,
  });
}

interface CreateApiIntegrationModuleOptions {
  controllerClass: Type<unknown>;
  serviceClasses: Type<unknown>[];
  databaseHelper: DatabaseHelper;
  additionalProviders?: Provider[];
}

export async function createApiIntegrationModule(options: CreateApiIntegrationModuleOptions): Promise<TestingModule> {
  const { controllerClass, serviceClasses, databaseHelper, additionalProviders = [] } = options;

  return createIntegrationTestingModule({
    controllers: [controllerClass],
    providers: serviceClasses,
    databaseHelper,
    additionalProviders,
  });
}
