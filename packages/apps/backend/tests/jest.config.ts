import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['<rootDir>/../src/**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/generated/(.*)$': '<rootDir>/../generated/$1',
    '^@/tests/(.*)$': '<rootDir>/$1',
    '^@/(.*)$': '<rootDir>/../src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFiles: ['<rootDir>/jest-env.setup.ts'],
  maxWorkers: 1,
};

export default config;
