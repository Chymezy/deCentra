/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
// jest.config.cjs
const nextJest = require('next/jest');
const path = require('path');

const createJestConfig = nextJest({
  dir: './', // your Next.js app folder
});

const customConfig = {
  // Tell Jest where to look for modules:
  moduleDirectories: [
    'node_modules', // if you ever install local deps here
    '<rootDir>/../../node_modules', // monorepo root node_modules
    '<rootDir>/src', // your absolute-imports folder
    '<rootDir>/node_modules', // local if it exists
    '<rootDir>/../node_modules', // src/node_modules
    '<rootDir>/../../node_modules', // repo-root node_modules
  ],

  testEnvironment: 'jest-environment-jsdom',

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpe?g|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // handle CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // stub static assets
    '\\.(png|jpe?g|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // resolve @/ imports to your src folder
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

module.exports = createJestConfig(customConfig);
