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
  'main.ts',
  'app.module.ts',
];

const config: Config = {
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@/generated/(.*)$': '<rootDir>/generated/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testPathIgnorePatterns: ignorePatterns,
  coveragePathIgnorePatterns: ignorePatterns,
};

export default config;
