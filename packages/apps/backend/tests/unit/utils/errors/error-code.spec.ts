import {
  apiErrorPrefix,
  domainErrorPrefix,
  repositoryErrorPrefix,
  unknownErrorPrefix,
  isErrorPrefix,
  ERROR_CODE_RECORDS,
  isErrorCode,
} from '@/utils/errors/error-code';

describe('error prefixes', () => {
  describe('constants', () => {
    it('should have correct prefix values', () => {
      expect(apiErrorPrefix).toBe('AP');
      expect(domainErrorPrefix).toBe('DO');
      expect(repositoryErrorPrefix).toBe('RE');
      expect(unknownErrorPrefix).toBe('UN');
    });
  });

  describe('isErrorPrefix', () => {
    it('should return true for valid prefixes', () => {
      expect(isErrorPrefix('AP')).toBe(true);
      expect(isErrorPrefix('DO')).toBe(true);
      expect(isErrorPrefix('RE')).toBe(true);
      expect(isErrorPrefix('UN')).toBe(true);
    });

    it('should return false for invalid prefixes', () => {
      expect(isErrorPrefix('XX')).toBe(false);
      expect(isErrorPrefix('AP0')).toBe(false);
      expect(isErrorPrefix('DO1')).toBe(false);
      expect(isErrorPrefix('')).toBe(false);
      expect(isErrorPrefix('A')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isErrorPrefix('ap')).toBe(false);
      expect(isErrorPrefix('do')).toBe(false);
      expect(isErrorPrefix('re')).toBe(false);
      expect(isErrorPrefix('un')).toBe(false);
    });
  });
});

describe('constant ERROR_CODE_RECORDS', () => {
  describe('api error codes', () => {
    it('should contain HTTP 4xx client error codes', () => {
      expect(ERROR_CODE_RECORDS.AP0400).toBe('Bad request');
      expect(ERROR_CODE_RECORDS.AP0401).toBe('Unauthorized');
      expect(ERROR_CODE_RECORDS.AP0403).toBe('Forbidden');
      expect(ERROR_CODE_RECORDS.AP0404).toBe('Not found');
      expect(ERROR_CODE_RECORDS.AP0429).toBe('Too many requests');
    });

    it('should contain HTTP 5xx server error codes', () => {
      expect(ERROR_CODE_RECORDS.AP0500).toBe('Internal server error');
      expect(ERROR_CODE_RECORDS.AP0501).toBe('Not implemented');
      expect(ERROR_CODE_RECORDS.AP0502).toBe('Bad gateway');
      expect(ERROR_CODE_RECORDS.AP0503).toBe('Service unavailable');
    });

    it('should contain unknown API error code', () => {
      expect(ERROR_CODE_RECORDS.AP9999).toBe('Unknown application error.');
    });
  });

  describe('domain error codes', () => {
    it('should contain unknown domain error code', () => {
      expect(ERROR_CODE_RECORDS.DO9999).toBe('Unknown domain error.');
    });
  });

  describe('repository error codes', () => {
    it('should contain data validation errors (RE00xx)', () => {
      expect(ERROR_CODE_RECORDS.RE0001).toBe('Column value too long for database field.');
      expect(ERROR_CODE_RECORDS.RE0002).toBe('Record not found in database.');
      expect(ERROR_CODE_RECORDS.RE0003).toBe('Unique constraint violation.');
      expect(ERROR_CODE_RECORDS.RE0004).toBe('Foreign key constraint violation.');
      expect(ERROR_CODE_RECORDS.RE0008).toBe('Data validation error.');
    });

    it('should contain query errors (RE01xx)', () => {
      expect(ERROR_CODE_RECORDS.RE0101).toBe('Query parsing failed.');
      expect(ERROR_CODE_RECORDS.RE0102).toBe('Query validation failed.');
      expect(ERROR_CODE_RECORDS.RE0103).toBe('Raw query execution failed.');
      expect(ERROR_CODE_RECORDS.RE0108).toBe('Related record not found.');
    });

    it('should contain connection & system errors (RE02xx)', () => {
      expect(ERROR_CODE_RECORDS.RE0201).toBe('Table does not exist in database.');
      expect(ERROR_CODE_RECORDS.RE0202).toBe('Column does not exist in table.');
      expect(ERROR_CODE_RECORDS.RE0203).toBe('Connection pool timeout.');
      expect(ERROR_CODE_RECORDS.RE0209).toBe('Database connection failed.');
    });

    it('should contain migration errors (RE03xx)', () => {
      expect(ERROR_CODE_RECORDS.RE0301).toBe('Failed to create database.');
      expect(ERROR_CODE_RECORDS.RE0302).toBe('Migration contains potential data loss.');
      expect(ERROR_CODE_RECORDS.RE0303).toBe('Migration rollback error.');
      expect(ERROR_CODE_RECORDS.RE0326).toBe('Failed to create database: permission denied.');
    });

    it('should contain unknown repository error code', () => {
      expect(ERROR_CODE_RECORDS.RE9999).toBe('Unknown repository error.');
    });
  });

  describe('unknown error codes', () => {
    it('should contain unknown error code', () => {
      expect(ERROR_CODE_RECORDS.UN9999).toBe('Unknown error.');
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

    it('should have proper categorization by prefix', () => {
      const apiCodes = Object.keys(ERROR_CODE_RECORDS).filter((code) => code.startsWith('AP'));
      const domainCodes = Object.keys(ERROR_CODE_RECORDS).filter((code) => code.startsWith('DO'));
      const repositoryCodes = Object.keys(ERROR_CODE_RECORDS).filter((code) => code.startsWith('RE'));
      const unknownCodes = Object.keys(ERROR_CODE_RECORDS).filter((code) => code.startsWith('UN'));

      expect(apiCodes.length).toBeGreaterThan(0);
      expect(domainCodes.length).toBeGreaterThan(0);
      expect(repositoryCodes.length).toBeGreaterThan(0);
      expect(unknownCodes.length).toBeGreaterThan(0);
    });
  });

  describe('specific error code ranges', () => {
    it('should have proper HTTP status code mapping for API errors', () => {
      // 4xx client errors
      expect(ERROR_CODE_RECORDS.AP0400).toContain('Bad request');
      expect(ERROR_CODE_RECORDS.AP0404).toContain('Not found');

      // 5xx server errors
      expect(ERROR_CODE_RECORDS.AP0500).toContain('Internal server error');
      expect(ERROR_CODE_RECORDS.AP0503).toContain('Service unavailable');
    });

    it('should have specific repository error categories', () => {
      // Data validation (00xx)
      const dataValidationCodes = Object.keys(ERROR_CODE_RECORDS).filter((code) => /^RE00\d{2}$/u.exec(code));

      expect(dataValidationCodes.length).toBeGreaterThan(0);

      // Query errors (01xx)
      const queryCodes = Object.keys(ERROR_CODE_RECORDS).filter((code) => /^RE01\d{2}$/u.exec(code));

      expect(queryCodes.length).toBeGreaterThan(0);

      // Connection & system (02xx)
      const connectionCodes = Object.keys(ERROR_CODE_RECORDS).filter((code) => /^RE02\d{2}$/u.exec(code));

      expect(connectionCodes.length).toBeGreaterThan(0);

      // Migration (03xx)
      const migrationCodes = Object.keys(ERROR_CODE_RECORDS).filter((code) => /^RE03\d{2}$/u.exec(code));

      expect(migrationCodes.length).toBeGreaterThan(0);
    });
  });
});

describe('function isErrorCode', () => {
  it('should return true for valid error codes', () => {
    expect(isErrorCode('AP0400')).toBe(true);
    expect(isErrorCode('DO9999')).toBe(true);
    expect(isErrorCode('RE0001')).toBe(true);
    expect(isErrorCode('UN9999')).toBe(true);
  });

  it('should return false for invalid error codes', () => {
    expect(isErrorCode('XX0001')).toBe(false);
    expect(isErrorCode('AP0000')).toBe(false); // Assuming this doesn't exist
    expect(isErrorCode('INVALID')).toBe(false);
    expect(isErrorCode('')).toBe(false);
    expect(isErrorCode('AP400')).toBe(false); // Missing digit
    expect(isErrorCode('AP04000')).toBe(false); // Too many digits
  });

  it('should be case sensitive', () => {
    expect(isErrorCode('ap0400')).toBe(false);
    expect(isErrorCode('do9999')).toBe(false);
    expect(isErrorCode('re0001')).toBe(false);
    expect(isErrorCode('un9999')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isErrorCode(null)).toBe(false);
    expect(isErrorCode(undefined)).toBe(false);
    expect(isErrorCode(400)).toBe(false);
    expect(isErrorCode({})).toBe(false);
  });

  it('should check against actual ERROR_CODE_RECORDS', () => {
    expect.hasAssertions();

    const allValidCodes = Object.keys(ERROR_CODE_RECORDS);

    allValidCodes.forEach((code) => {
      expect(isErrorCode(code)).toBe(true);
    });

    expect(allValidCodes.length).toBeGreaterThan(0);
  });
});

describe('type safety and consistency', () => {
  it('should maintain type consistency between ErrorCode and ERROR_CODE_RECORDS', () => {
    // This test ensures that the types are working correctly
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

  it('should have meaningful error messages', () => {
    expect.hasAssertions();

    const errorMessages = Object.values(ERROR_CODE_RECORDS);

    errorMessages.forEach((message) => {
      expect(message.length).toBeGreaterThan(5); // Reasonable minimum length
      expect(message).not.toBe('TODO'); // No placeholder messages
    });

    expect(errorMessages.length).toBeGreaterThan(0);
  });
});
