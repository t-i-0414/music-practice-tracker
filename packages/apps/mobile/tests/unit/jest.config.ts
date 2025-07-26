import type { Config } from 'jest';

const ignorePatterns = ['/node_modules/', '/dist/', '/coverage/', '/generated/', 'scripts/'];

const config: Config = {
  preset: 'react-native',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  rootDir: '../..',
  testMatch: ['<rootDir>/tests/unit/**/*.test.{ts,tsx}'],
  setupFiles: ['<rootDir>/tests/unit/jest-env.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ignorePatterns,
  coverageDirectory: '<rootDir>/tests/unit/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '<rootDir>/!src/**/*.d.ts',
    '<rootDir>/!src/app/**/*.{ts,tsx}',
    '<rootDir>/!src/constants/**/*.ts',
  ],
  coveragePathIgnorePatterns: ignorePatterns,
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
  maxWorkers: 1,
};

export default config;
