import { type RequestHandler } from 'msw';
import { type SetupWorker } from 'msw/browser';

import { handlers as defaultHandlers } from '../../msw/handlers';
import { worker } from '../../msw/worker';

type MswWindow = {
  msw?: {
    worker: SetupWorker;
    resetHandlers(): void;
    use(...handlers: RequestHandler[]): void;
  };
} & Window;

declare global {
  interface Window {
    // @ts-expect-error - MSW is not defined in the global scope by default
    msw?: MswWindow['msw'];
  }
}

export const setupMsw = async () => {
  await worker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    onUnhandledRequest: 'bypass',
  });

  window.msw = {
    worker,
    resetHandlers: () => {
      worker.resetHandlers(...defaultHandlers);
    },
    use: (...handlers: RequestHandler[]) => {
      worker.use(...handlers);
    },
  };

  return worker;
};

export const stopMsw = () => {
  if (window.msw?.worker) {
    window.msw.worker.stop();
    delete window.msw;
  }
};
