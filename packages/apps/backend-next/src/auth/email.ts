/**
 * Email sender for Magic Link / verification flows.
 *
 * Stub implementation: logs the URL and resolves. Replace with a real
 * provider integration before launch — Resend, AWS SES, or SendGrid.
 *
 * To wire Resend (recommended for low ops cost):
 *   1. Add `resend` to dependencies
 *   2. Read `cfg.resendApiKey` (already in AppConfig)
 *   3. Call `await resend.emails.send({ from, to: email, subject, html })`
 */
import { Effect } from 'effect';

export type SendMagicLinkParams = {
  email: string;
  url: string;
  token: string;
};

export type SendMagicLink = (params: SendMagicLinkParams) => Promise<void>;

export const makeStubSendMagicLink =
  (label: 'app' | 'admin'): SendMagicLink =>
  async (params) => {
    await Effect.runPromise(
      Effect.logInfo('[stub-email] magic-link sent', {
        label,
        to: params.email,
        url: params.url,
      }),
    );
  };
