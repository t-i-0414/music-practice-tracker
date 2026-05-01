import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';

export const HealthResponse = Schema.Struct({
  status: Schema.Literal('ok'),
  service: Schema.Literal('admin-api'),
  db: Schema.Literal('reachable', 'unreachable'),
  timestamp: Schema.String,
});
export type HealthResponse = typeof HealthResponse.Type;

export const HealthGroup = HttpApiGroup.make('health').add(
  HttpApiEndpoint.get('check', '/health').addSuccess(HealthResponse),
);

export class AdminApi extends HttpApi.make('AdminApi').add(HealthGroup) {}
