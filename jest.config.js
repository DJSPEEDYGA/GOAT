'use strict';

/** @type {import('jest').Config} */
module.exports = {
  // Node 24 enforces package exports strictly; jest-config defaults to the
  // internal path "jest-circus/build/runner" which is no longer exported.
  // Override to use the public export "jest-circus/runner" instead.
  testRunner: 'jest-circus/runner',

  // Run tests in Node environment (not jsdom)
  testEnvironment: 'node',

  // Only pick up tests from the project's __tests__ folder and src/
  testMatch: ['<rootDir>/__tests__/**/*.test.js', '<rootDir>/src/**/*.test.js'],

  // Don't transform node_modules or the .tmp scratch directory
  transformIgnorePatterns: ['/node_modules/', '<rootDir>/\\.tmp/'],

  // Explicitly exclude the .tmp plugin directory and any infrastructure sub-packages
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/\\.tmp/'],

  // Verbose output for easier debugging
  verbose: true,

  // Collect coverage from source files
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
  ],
};
