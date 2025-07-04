// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@/generated/(.*)$': '<rootDir>/generated/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/', '/generated/'],
};

export default config;
