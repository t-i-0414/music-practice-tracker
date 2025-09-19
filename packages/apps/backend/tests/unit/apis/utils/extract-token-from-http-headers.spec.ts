import { IncomingHttpHeaders } from 'node:http';

import { extractTokenFromHttpHeaders } from '@/apis/utils/extract-token-from-http-headers';

describe('unit extractTokenFromHttpHeaders', () => {
  it('returns undefined when the authorization header is missing', () => {
    expect.assertions(1);

    expect(extractTokenFromHttpHeaders({})).toBeUndefined();
  });

  it('returns undefined when the authorization header is not a string', () => {
    expect.assertions(1);

    expect(
      extractTokenFromHttpHeaders({
        authorization: 123 as unknown as string,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the authorization header does not contain a bearer token', () => {
    expect.assertions(1);

    expect(
      extractTokenFromHttpHeaders({
        authorization: 'Basic abc123',
      }),
    ).toBeUndefined();
  });

  it('returns the bearer token when authorization header is valid', () => {
    expect.assertions(1);

    expect(
      extractTokenFromHttpHeaders({
        authorization: '   Bearer   token-value   ',
      }),
    ).toBe('token-value');
  });

  it('returns undefined when the bearer token is blank after trimming', () => {
    expect.assertions(1);

    expect(
      extractTokenFromHttpHeaders({
        authorization: 'Bearer   ',
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the bearer token only contains whitespace characters', () => {
    expect.assertions(1);

    expect(
      extractTokenFromHttpHeaders({
        authorization: 'Bearer \t   \t',
      }),
    ).toBeUndefined();
  });

  it('returns undefined when only the scheme is provided without token', () => {
    expect.assertions(1);

    expect(
      extractTokenFromHttpHeaders({
        authorization: 'Bearer',
      }),
    ).toBeUndefined();
  });

  it('returns undefined when authorization header is an array of values', () => {
    expect.assertions(1);

    expect(
      extractTokenFromHttpHeaders({
        authorization: ['Bearer token-value', 'Bearer another'],
      } as unknown as IncomingHttpHeaders),
    ).toBeUndefined();
  });

  it('supports case-insensitive bearer token parsing', () => {
    expect.assertions(1);

    expect(
      extractTokenFromHttpHeaders({
        authorization: 'bearer AnotherToken',
      }),
    ).toBe('AnotherToken');
  });

  it('returns undefined when regex groups are unavailable', () => {
    expect.assertions(2);

    const execSpy = jest.spyOn(RegExp.prototype, 'exec').mockReturnValue({
      0: 'Bearer token-without-groups',
      index: 0,
      input: 'Bearer token-without-groups',
      length: 1,
      groups: undefined,
    } as unknown as RegExpExecArray);

    const result = extractTokenFromHttpHeaders({
      authorization: 'Bearer token-without-groups',
    });

    const calls = execSpy.mock.calls.slice();
    execSpy.mockRestore();

    expect(result).toBeUndefined();
    expect(calls[0]?.[0]).toBe('Bearer token-without-groups');
  });
});
