/**
 * Effect Logger backed by pino. Replaces nestjs-pino.
 *
 * Effect's logger captures `correlationId`, `userId` etc. as fiber-local
 * annotations via `Effect.annotateLogs(...)`. The annotations are exposed
 * here as a HashMap iterated into pino's structured output.
 *
 * Switch to JSON in non-development environments. The OTel logger
 * (src/observability/otel.ts — TODO) sits on top of this for trace correlation.
 */
import { HashMap, Logger } from 'effect';
import pino from 'pino';

const pinoLogger = pino({
  level: process.env['LOG_LEVEL'] ?? (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),
  redact: { paths: ['req.headers.authorization'], remove: false },
  ...(process.env['NODE_ENV'] === 'development'
    ? { transport: { target: 'pino-pretty', options: { colorize: true, singleLine: true } } }
    : {}),
});

export const PinoLoggerLive = Logger.replace(
  Logger.defaultLogger,
  Logger.make(({ logLevel, message, annotations, cause }) => {
    const merged: Record<string, unknown> = {};
    HashMap.forEach(annotations, (value, key) => {
      merged[key] = value;
    });
    if (cause._tag !== 'Empty') {
      merged['cause'] = cause;
    }
    const text = Array.isArray(message) ? message.join(' ') : String(message);

    switch (logLevel._tag) {
      case 'Trace':
      case 'Debug':
        pinoLogger.debug(merged, text);
        break;
      case 'Info':
        pinoLogger.info(merged, text);
        break;
      case 'Warning':
        pinoLogger.warn(merged, text);
        break;
      case 'Error':
        pinoLogger.error(merged, text);
        break;
      case 'Fatal':
        pinoLogger.fatal(merged, text);
        break;
      default:
        pinoLogger.info(merged, text);
    }
  }),
);
