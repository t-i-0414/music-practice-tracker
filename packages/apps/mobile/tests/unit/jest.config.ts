import type { Config } from 'jest';

const ignorePatterns = ['/node_modules/', '/dist/', '/coverage/', '/generated/', 'scripts/'];

const config: Config = {
  preset: 'react-native',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  rootDir: '../..',
  testMatch: ['<rootDir>/tests/unit/**/*.spec.{ts,tsx}'],
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
    '<rootDir>/!src/app/_layout.tsx',
    '<rootDir>/!src/app/+not-found.tsx',
  ],
  coveragePathIgnorePatterns: ignorePatterns,
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
  },
  maxWorkers: 1,
};

export default config;
