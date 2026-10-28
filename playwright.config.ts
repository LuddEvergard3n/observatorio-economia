import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false, retries: 0,
  use: { baseURL: 'http://127.0.0.1:5173', browserName: 'chromium', ...(process.env.CI ? {} : { channel: 'msedge' }) },
  webServer: { command: 'npm run dev -- --port 5173', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
})
