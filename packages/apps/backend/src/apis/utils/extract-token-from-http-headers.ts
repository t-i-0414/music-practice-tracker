import { type IncomingHttpHeaders } from 'node:http';

export const extractTokenFromHttpHeaders = (headers: IncomingHttpHeaders): string | undefined => {
  const raw = headers.authorization;

  if (typeof raw !== 'string') return undefined;

  const m = /^Bearer\s+(?<token>.+)$/iu.exec(raw.trim());
  if (!m) return undefined;

  return m.groups?.token.trim();
};
