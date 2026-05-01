/**
 * Correlation ID propagation via Effect FiberRef. Replaces the legacy
 * `nestjs-cls` (AsyncLocalStorage)-based ClsService.
 *
 * Reading: `yield* CorrelationId`
 * Setting at request boundary: HttpLayerRouter middleware (see middleware/correlation-id.middleware.ts)
 *
 * Background fibers automatically inherit the FiberRef value per Effect's
 * structured concurrency model.
 */
import { FiberRef } from 'effect';

const EMPTY_CORRELATION_ID = '';

export const CorrelationId = FiberRef.unsafeMake<string>(EMPTY_CORRELATION_ID);

/**
 * The user id (when authenticated). Mirrors the legacy `cls.set('userId', ...)`
 * pattern in user-auth.guard.ts.
 */
export const CurrentUserId = FiberRef.unsafeMake<string | undefined>(undefined);
