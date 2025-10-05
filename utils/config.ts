/**
 * Configuration utility to get Playwright configuration values
 */

/**
 * Get the base URL from Playwright configuration
 * This reads from the same source as playwright.config.ts
 */
export function getBaseUrl(): string {
  return process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
}

/**
 * Get headless mode setting
 */
export function getHeadlessMode(): boolean {
  return process.env.HEADLESS === 'true';
}

/**
 * Get slow motion setting
 */
export function getSlowMo(): number {
  return parseInt(process.env.SLOW_MO || '0');
}

/**
 * Get debug mode setting
 */
export function getDebugMode(): boolean {
  return process.env.DEBUG_MODE === 'true';
}

/**
 * Get configuration values that match playwright.config.ts
 */
export const config = {
  baseUrl: getBaseUrl(),
  headless: getHeadlessMode(),
  slowMo: getSlowMo(),
  debugMode: getDebugMode(),
  timeout: parseInt(process.env.TIMEOUT || '30000'), // 30 seconds (matches playwright.config.ts)
  retries: parseInt(process.env.RETRIES || '0'), // 0 retries by default (matches playwright.config.ts)
  workers: parseInt(process.env.WORKERS || '4'), // 4 workers by default (matches playwright.config.ts)
  expectTimeout: parseInt(process.env.EXPECT_TIMEOUT || '10000'), // 10 seconds (matches playwright.config.ts)
  navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'), // 30 seconds (matches playwright.config.ts)
  actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '10000'), // 10 seconds (matches playwright.config.ts)
};
