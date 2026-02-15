import tracer from 'dd-trace';

try {
  tracer.init({
    logInjection: true,
    runtimeMetrics: true,
  });
} catch (error: unknown) {
  // eslint-disable-next-line no-console -- tracer initializes before NestJS logger is available
  console.error('dd-trace initialization failed', error);
}

export default tracer;
