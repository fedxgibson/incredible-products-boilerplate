// tests/e2e/jest.config.js
module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/specs/**/*.spec.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 30000,
  verbose: true
};