/**
 * App API HttpApi definition. The single starter endpoint is GET /health.
 * Other endpoint groups (users, etc.) should be added as siblings here, then
 * implemented in src/http/handlers-app/.
 *
 * Why HttpApi (vs raw HttpRouter):
 * - Schemas declared here flow into auto-generated OpenAPI docs (/docs/openapi.json).
 * - The same HttpApi is consumed by `HttpApiClient` in admin/mobile to derive
 *   fully-typed clients without code generation.
 */
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';

export const HealthResponse = Schema.Struct({
  status: Schema.Literal('ok'),
  service: Schema.Literal('app-api'),
  db: Schema.Literal('reachable', 'unreachable'),
  timestamp: Schema.String,
});
export type HealthResponse = typeof HealthResponse.Type;

export const HealthGroup = HttpApiGroup.make('health').add(
  HttpApiEndpoint.get('check', '/health').addSuccess(HealthResponse),
);

export class AppApi extends HttpApi.make('AppApi').add(HealthGroup) {}
