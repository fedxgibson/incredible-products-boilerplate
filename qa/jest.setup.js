// tests/e2e/jest.setup.js
const path = require('path');
const { setupDebugListeners } = require('./utils/debugHelper');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
global.SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');

jest.setTimeout(30000);


beforeAll(async () => {
  if (process.env.DEBUG) {
    await setupDebugListeners(page);
  }
});