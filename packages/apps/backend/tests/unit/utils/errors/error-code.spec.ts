import {
  apiErrorPrefix,
  domainErrorPrefix,
  repositoryErrorPrefix,
  unknownErrorPrefix,
  isErrorPrefix,
  ERROR_CODE_RECORDS,
  isErrorCode,
} from '@/utils/errors/error-code';

describe('unit ErrorPrefixes', () => {
  describe('constants', () => {
    it.each([
      ['apiErrorPrefix', apiErrorPrefix, 'AP'],
      ['domainErrorPrefix', domainErrorPrefix, 'DO'],
      ['repositoryErrorPrefix', repositoryErrorPrefix, 'RE'],
      ['unknownErrorPrefix', unknownErrorPrefix, 'UN'],
    ])('%s should be "%s"', (_name, actual, expected) => {
      expect(actual).toBe(expected);
    });
  });

  describe('isErrorPrefix', () => {
    it.each(['AP', 'DO', 'RE', 'UN'])('should return true for valid prefix "%s"', (prefix) => {
      expect(isErrorPrefix(prefix)).toBe(true);
    });

    it.each(['XX', 'AP0', 'DO1', '', 'A', 'ap', 'do', 're', 'un'])(
      'should return false for invalid prefix "%s"',
      (prefix) => {
        expect(isErrorPrefix(prefix)).toBe(false);
      },
    );
  });
});

describe('unit ERROR_CODE_RECORDS', () => {
  describe('api error codes', () => {
    describe('http 4xx client error codes', () => {
      it.each([
        ['AP0400', 'Bad request'],
        ['AP0401', 'Unauthorized'],
        ['AP0403', 'Forbidden'],
        ['AP0404', 'Not found'],
        ['AP0429', 'Too many requests'],
      ])('%s should be "%s"', (code, message) => {
        expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toBe(message);
      });
    });

    describe('http 5xx server error codes', () => {
      it.each([
        ['AP0500', 'Internal server error'],
        ['AP0501', 'Not implemented'],
        ['AP0502', 'Bad gateway'],
        ['AP0503', 'Service unavailable'],
      ])('%s should be "%s"', (code, message) => {
        expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toBe(message);
      });
    });

    it.each([['AP9999', 'Unknown application error.']])('%s should be "%s"', (code, message) => {
      expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toBe(message);
    });
  });

  describe('domain error codes', () => {
    it.each([['DO9999', 'Unknown domain error.']])('%s should be "%s"', (code, message) => {
      expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toBe(message);
    });
  });

  describe('repository error codes', () => {
    describe('data validation errors (RE00xx)', () => {
      it.each([
        ['RE0001', 'Column value too long for database field.'],
        ['RE0002', 'Record not found in database.'],
        ['RE0003', 'Unique constraint violation.'],
        ['RE0004', 'Foreign key constraint violation.'],
        ['RE0008', 'Data validation error.'],
      ])('%s should be "%s"', (code, message) => {
        expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toBe(message);
      });
    });

    describe('query errors (RE01xx)', () => {
      it.each([
        ['RE0101', 'Query parsing failed.'],
        ['RE0102', 'Query validation failed.'],
        ['RE0103', 'Raw query execution failed.'],
        ['RE0108', 'Related record not found.'],
      ])('%s should be "%s"', (code, message) => {
        expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toBe(message);
      });
    });

    describe('connection & system errors (RE02xx)', () => {
      it.each([
        ['RE0201', 'Table does not exist in database.'],
        ['RE0202', 'Column does not exist in table.'],
        ['RE0203', 'Connection pool timeout.'],
        ['RE0209', 'Database connection failed.'],
      ])('%s should be "%s"', (code, message) => {
        expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toBe(message);
      });
    });

    describe('migration errors (RE03xx)', () => {
      it.each([
        ['RE0301', 'Failed to create database.'],
        ['RE0302', 'Migration contains potential data loss.'],
        ['RE0303', 'Migration rollback error.'],
        ['RE0326', 'Failed to create database: permission denied.'],
      ])('%s should be "%s"', (code, message) => {
        expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toBe(message);
      });
    });

    it.each([['RE9999', 'Unknown repository error.']])('%s should be "%s"', (code, message) => {
      expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toBe(message);
    });
  });

  describe('unknown error codes', () => {
    it.each([['UN9999', 'Unknown error.']])('%s should be "%s"', (code, message) => {
      expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toBe(message);
    });
  });

  describe('error code format validation', () => {
    it('should have consistent format for all error codes', () => {
      expect.hasAssertions();

      const errorCodes = Object.keys(ERROR_CODE_RECORDS);

      errorCodes.forEach((code) => {
        expect(code).toMatch(/^(?:AP|DO|RE|UN)\d{4}$/u);
      });

      expect(errorCodes.length).toBeGreaterThan(0);
    });

    it('should have non-empty messages for all error codes', () => {
      expect.hasAssertions();

      const errorMessages = Object.values(ERROR_CODE_RECORDS);

      errorMessages.forEach((message) => {
        expect(message).toBeDefined();
        expect(message.length).toBeGreaterThan(0);
        expect(typeof message).toBe('string');
      });

      expect(errorMessages.length).toBeGreaterThan(0);
    });

    describe('error code categorization', () => {
      it.each([
        ['API', 'AP'],
        ['Domain', 'DO'],
        ['Repository', 'RE'],
        ['Unknown', 'UN'],
      ])('should have %s codes (prefix: %s)', (_category, prefix) => {
        const codes = Object.keys(ERROR_CODE_RECORDS).filter((code) => code.startsWith(prefix));

        expect(codes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('specific error code ranges', () => {
    describe('api error HTTP status mapping', () => {
      it.each([
        ['AP0400', 'Bad request'],
        ['AP0404', 'Not found'],
        ['AP0500', 'Internal server error'],
        ['AP0503', 'Service unavailable'],
      ])('%s should contain "%s"', (code, expectedSubstring) => {
        expect(ERROR_CODE_RECORDS[code as keyof typeof ERROR_CODE_RECORDS]).toContain(expectedSubstring);
      });
    });

    describe('repository error categories', () => {
      it.each([
        ['Data validation', /^RE00\d{2}$/u],
        ['Query', /^RE01\d{2}$/u],
        ['Connection & system', /^RE02\d{2}$/u],
        ['Migration', /^RE03\d{2}$/u],
      ])('should have %s codes', (_category, pattern) => {
        const codes = Object.keys(ERROR_CODE_RECORDS).filter((code) => pattern.exec(code));

        expect(codes.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('unit isErrorCode', () => {
  describe('valid error codes', () => {
    it.each(['AP0400', 'DO9999', 'RE0001', 'UN9999'])('should return true for "%s"', (code) => {
      expect(isErrorCode(code)).toBe(true);
    });

    it('should return true for all ERROR_CODE_RECORDS keys', () => {
      expect.hasAssertions();

      const allValidCodes = Object.keys(ERROR_CODE_RECORDS);

      allValidCodes.forEach((code) => {
        expect(isErrorCode(code)).toBe(true);
      });

      expect(allValidCodes.length).toBeGreaterThan(0);
    });
  });

  describe('invalid error codes', () => {
    it.each([
      ['XX0001', 'invalid prefix'],
      ['AP0000', 'non-existent code'],
      ['INVALID', 'invalid format'],
      ['', 'empty string'],
      ['AP400', 'missing digit'],
      ['AP04000', 'too many digits'],
      ['ap0400', 'lowercase AP'],
      ['do9999', 'lowercase DO'],
      ['re0001', 'lowercase RE'],
      ['un9999', 'lowercase UN'],
    ])('should return false for %s (%s)', (code, _reason) => {
      expect(isErrorCode(code)).toBe(false);
    });

    it.each([
      [null, 'null'],
      [undefined, 'undefined'],
      [400, 'number'],
      [{}, 'object'],
    ])('should return false for %s (%s)', (value, _type) => {
      expect(isErrorCode(value)).toBe(false);
    });
  });
});

describe('type safety and consistency', () => {
  it('should maintain type consistency between ErrorCode and ERROR_CODE_RECORDS', () => {
    const errorCodes = Object.keys(ERROR_CODE_RECORDS);
    const errorMessages = Object.values(ERROR_CODE_RECORDS);

    expect(errorCodes).toHaveLength(errorMessages.length);
    expect(errorCodes.length).toBeGreaterThan(0);
  });

  it('should have unique error codes', () => {
    const errorCodes = Object.keys(ERROR_CODE_RECORDS);
    const uniqueCodes = new Set(errorCodes);

    expect(errorCodes).toHaveLength(uniqueCodes.size);
  });

  describe('error message validation', () => {
    const errorMessages = Object.values(ERROR_CODE_RECORDS);

    it.each(errorMessages)('message "%s" should be meaningful', (message) => {
      expect(message.length).toBeGreaterThan(5);
      expect(message).not.toBe('TODO');
    });
  });
});
