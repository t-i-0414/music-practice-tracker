import { HttpStatus, ValidationPipe, type INestApplication } from '@nestjs/common';
import { type TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

export async function setupTestApp(module: TestingModule): Promise<INestApplication> {
  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(false);
  await app.init();
  return app;
}

export function setupIntegrationTest(): {
  getApp(): INestApplication | undefined;
  setApp(app: INestApplication): void;
} {
  let appInstance: INestApplication | undefined;

  afterEach(async () => {
    if (appInstance) {
      await appInstance.close();
      appInstance = undefined;
    }
  });

  return {
    getApp(): INestApplication | undefined {
      return appInstance;
    },
    setApp(newApp: INestApplication): void {
      appInstance = newApp;
    },
  };
}

type HttpTester = {
  get(url: string): request.Test;
  post(url: string): request.Test;
  put(url: string): request.Test;
  delete(url: string): request.Test;
  patch(url: string): request.Test;
};

export function createHttpTester(app: INestApplication): HttpTester {
  const server = app.getHttpServer();

  return {
    get(url: string): request.Test {
      return request(server).get(url);
    },
    post(url: string): request.Test {
      return request(server).post(url);
    },
    put(url: string): request.Test {
      return request(server).put(url);
    },
    delete(url: string): request.Test {
      return request(server).delete(url);
    },
    patch(url: string): request.Test {
      return request(server).patch(url);
    },
  };
}

export const expectNotFoundError = async (responsePromise: request.Test, message = 'Not Found'): Promise<void> => {
  const response = await responsePromise.expect(HttpStatus.NOT_FOUND);
  const body = response.body as { message: string };
  expect(body).toHaveProperty('message');
  expect(body.message).toContain(message);
};

export const expectBadRequestError = async (responsePromise: request.Test, message?: string): Promise<void> => {
  const response = await responsePromise.expect(HttpStatus.BAD_REQUEST);
  const body = response.body as { message: string };
  expect(body).toHaveProperty('message');
  if (message !== undefined) {
    expect(body.message).toContain(message);
  }
};

export const expectInternalServerError = async (responsePromise: request.Test): Promise<void> => {
  const response = await responsePromise.expect(HttpStatus.INTERNAL_SERVER_ERROR);
  const body = response.body as { message: string };
  expect(body).toHaveProperty('message');
  expect(body.message).toBe('Internal server error');
};

export const expectUuidValidationError = async (responsePromise: request.Test): Promise<void> => {
  await expectBadRequestError(responsePromise, 'Validation failed');
};

export const expectJsonResponse = async (
  responsePromise: request.Test,
  expectedBody: unknown,
  statusCode = HttpStatus.OK,
): Promise<void> => {
  const response = await responsePromise.expect('Content-Type', /json/u).expect(statusCode);
  expect(response.body).toEqual(expectedBody);
};

export const expectNoContentResponse = async (responsePromise: request.Test): Promise<void> => {
  const response = await responsePromise.expect(HttpStatus.NO_CONTENT);
  expect(response.body).toEqual({});
};

const DEFAULT_CONCURRENT_COUNT = 3;

export async function testConcurrentRequests<T>(
  requestFactory: (index: number) => request.Test,
  count = DEFAULT_CONCURRENT_COUNT,
  expectedStatus = HttpStatus.OK,
): Promise<T[]> {
  const promises = Array.from({ length: count }, (_, i) => requestFactory(i));
  const results = await Promise.all(promises);

  results.forEach((result) => {
    expect(result.status).toBe(expectedStatus);
  });

  return results.map((r) => r.body) as T[];
}
