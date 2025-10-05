import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  timeout: 30000, // 30 seconds
  
  expect: {
    timeout: 10000, // 10 seconds
  },
  
  forbidOnly: !!process.env.CI,
  
  retries: process.env.CI ? 2 : 0,
  
  workers: process.env.CI ? 3 : 4,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    navigationTimeout: 30000, // 30 seconds
    
    actionTimeout: 10000, // 10 seconds
    
    ignoreHTTPSErrors: true,
    
    viewport: { width: 1280, height: 720 },
    
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Additional headers to prevent translation
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },
  
  // Configure projects for major browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    
    {
      name: 'firefox',
      timeout: 50000, // 50 seconds for Firefox
      use: { 
        ...devices['Desktop Firefox'],
      },
    },
    
    {
      name: 'webkit',
      timeout: 40000, // 40 seconds for WebKit
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
  
  // Output directory for test artifacts
  outputDir: 'test-results/',
  
  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
  ],
  
  // Test ignore patterns
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
  ],
});
