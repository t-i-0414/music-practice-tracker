import tracer from 'dd-trace';

// service, env, version are configured via DD_SERVICE, DD_ENV, DD_VERSION environment variables.
// Each app (App API / Admin API) sets DD_SERVICE to its own identifier.
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
