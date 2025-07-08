import type { Config } from 'jest';

const ignorePatterns = ['/node_modules/', '/dist/', '/coverage/', '/generated/', 'scripts/'];

const config: Config = {
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@/generated/(.*)$': '<rootDir>/generated/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  rootDir: '..',
  setupFiles: ['<rootDir>/tests/jest-env.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testPathIgnorePatterns: ignorePatterns,
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: [...ignorePatterns, 'main.ts', '.*\\.module\\.ts$'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  maxWorkers: 1,
};

export default config;
