import { defineConfig, devices } from '@playwright/test';
import { TIMEOUTS, UI } from './utils/constants';

/**
 * Playwright configuration for E2E test automation framework
 * Supports cross-browser testing, CI/CD integration, and comprehensive reporting
 */
export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Global test timeout
  timeout: TIMEOUTS.ELEMENT_WAIT * 3,
  
  // Expect timeout for assertions
  expect: {
    timeout: TIMEOUTS.ELEMENT_WAIT,
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : 4,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    
    // Browser context options
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Navigation timeout
    navigationTimeout: TIMEOUTS.NAVIGATION,
    
    // Action timeout
    actionTimeout: TIMEOUTS.ELEMENT_WAIT,
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Viewport
    viewport: { width: UI.VIEWPORT.WIDTH, height: UI.VIEWPORT.HEIGHT },
    
    // Force English language to prevent auto-translation
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
        // Force English language in Chromium
        launchOptions: {
          args: [
            '--lang=en-US',
            '--disable-translate',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
    },
    
    {
      name: 'firefox',
      timeout: TIMEOUTS.FIREFOX_TEST_TIMEOUT, // 50 seconds for Firefox
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox-specific timeout settings
        actionTimeout: TIMEOUTS.FIREFOX_ACTION_TIMEOUT, // 20 seconds for actions
        navigationTimeout: TIMEOUTS.FIREFOX_NAVIGATION_TIMEOUT, // 60 seconds for navigation
        
        // Firefox-specific performance optimizations
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--lang=en-US',
            '--disable-translate',
          ],
        },
        
        // Additional Firefox settings
        ignoreHTTPSErrors: true,
        acceptDownloads: true,
      },
    },
  ],
  
  // Web server configuration for local development
  ...(process.env.CI ? {} : {
    webServer: {
      command: 'echo "Using external OrangeHRM demo site"',
      url: 'https://opensource-demo.orangehrmlive.com',
      reuseExistingServer: !process.env.CI,
      timeout: TIMEOUTS.WEB_SERVER,
    },
  }),
  
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
