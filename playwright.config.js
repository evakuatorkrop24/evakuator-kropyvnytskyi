const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npx serve . -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 15000,
  },
});
