import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { server } from '../mocks/http-request/node';

beforeAll(() => {
  server.listen();
  vi.useFakeTimers();
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllTimers();
});

afterAll(() => {
  server.close();
  vi.useRealTimers();
});
