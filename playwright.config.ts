import { defineConfig } from '@playwright/test'
const port = process.env.PLAYWRIGHT_PORT ?? '5173'
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false, retries: 0,
  use: { baseURL: `http://127.0.0.1:${port}`, browserName: 'chromium', ...(process.env.CI ? {} : { channel: 'msedge' }) },
  webServer: { command: `npm run dev -- --port ${port}`, url: `http://127.0.0.1:${port}`, reuseExistingServer: !process.env.CI },
})
