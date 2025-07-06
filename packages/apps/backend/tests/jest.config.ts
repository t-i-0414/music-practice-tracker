import type { Config } from 'jest';

const ignorePatterns = [
  '/node_modules/',
  '/dist/',
  '/coverage/',
  '/generated/',
  'eslint.config.ts',
  'jest.config.ts',
  'jest.setup.ts',
];

const config: Config = {
  collectCoverageFrom: ['**/*.ts'],
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
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [...ignorePatterns, 'main.ts', '\\.module\\.ts$', '/tests/'],
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
