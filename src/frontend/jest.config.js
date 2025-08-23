export const preset = 'ts-jest';
export const testEnvironment = 'jsdom';
export const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node'];
export const setupFilesAfterEnv = ['<rootDir>/jest.setup.js'];
export const moduleNameMapper = {
  // Handle CSS imports (with CSS modules)
  '^.+\\.(css|scss|sass)$': 'identity-obj-proxy',
  // Handle static assets
  '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  // Handle module aliases (if any)
  '^@/(.*)$': '<rootDir>/src/$1',
  // Mock next/link
  '^next/link$': '<rootDir>/__mocks__/next/link.js',
};
export const testPathIgnorePatterns = ['/node_modules/', '/.next/'];
export const testMatch = ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'];
export const transformIgnorePatterns = ['/node_modules/'];
export const transform = {
  '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
};
