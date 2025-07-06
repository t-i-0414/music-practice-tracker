// jest.config.ts
import type { Config } from 'jest';

const ignorePatterns = [
  '/node_modules/',
  '/dist/',
  '/coverage/',
  '/generated/',
  'eslint.config.ts',
  'jest.config.ts',
  'jest.e2e.config.ts',
  'jest.setup.ts',
  'main.ts',
  '\\.module\\.ts$',
];

const config: Config = {
  collectCoverageFrom: ['**/*.(t|j)s'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@/generated/(.*)$': '<rootDir>/generated/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testPathIgnorePatterns: ignorePatterns,
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [...ignorePatterns, '/tests/'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};

export default config;
