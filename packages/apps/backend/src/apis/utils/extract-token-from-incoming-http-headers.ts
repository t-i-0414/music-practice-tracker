import { type IncomingHttpHeaders } from 'node:http';

export const extractTokenFromIncomingHttpHeaders = (headers: IncomingHttpHeaders): string | undefined => {
  const raw = headers.authorization;

  if (typeof raw !== 'string') return undefined;

  const m = /^Bearer\s+(?<token>.+)$/iu.exec(raw.trim());
  if (!m) return undefined;

  const token = m.groups?.token.trim();
  return token !== '' ? token : undefined;
};
