/**
 * Constants for timeouts and configuration values
 */

// Timeout constants (in milliseconds)
export const TIMEOUTS = {
  // Element interaction timeouts
  ELEMENT_WAIT: 10000,
  ELEMENT_SHORT_WAIT: 3000,
  ELEMENT_QUICK_WAIT: 1000,
  ELEMENT_VERY_QUICK_WAIT: 500,
  
  // Navigation timeouts
  NAVIGATION: 30000,
  PAGE_LOAD: 10000,
  
  // Search and validation timeouts
  SEARCH_RESULTS: 3000,
  VALIDATION_WAIT: 1000,
  TOAST_MESSAGE: 3000,
  
  // Session and security timeouts
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Web server timeout
  WEB_SERVER: 120 * 1000, // 2 minutes
  
  // Firefox-specific timeouts (Firefox tends to be slower)
  FIREFOX_TEST_TIMEOUT: 50 * 1000, // 50 seconds
  FIREFOX_ACTION_TIMEOUT: 20 * 1000, // 20 seconds
  FIREFOX_NAVIGATION_TIMEOUT: 60 * 1000, // 60 seconds
} as const;

// Test data constants
export const TEST_DATA = {
  // String lengths for testing
  LONG_USERNAME_LENGTH: 1000,
  LONG_TEXT_LENGTH: 100,
  MAX_FIELD_LENGTH: 255,
  
  // Default test values
  DEFAULT_ADMIN_USERNAME: 'Admin',
  DEFAULT_ADMIN_PASSWORD: 'admin123',
  
  // Test patterns
  SPECIAL_CHARS: '@#$%^&*()',
  XSS_ATTEMPT: '<script>alert("xss")</script>',
  SQL_INJECTION_SUFFIX: '; DROP TABLE users; --',
} as const;

// UI constants
export const UI = {
  VIEWPORT: {
    WIDTH: 1280,
    HEIGHT: 720,
  },
  
  // Common CSS selectors
  SELECTORS: {
    ERROR_TOAST: '.oxd-toast-content--error',
    TOAST_MESSAGE: '.oxd-text--toast-message',
    TABLE_BODY: '.oxd-table-body',
    NO_RECORDS: '.oxd-table-cell:has-text("No Records Found")',
  },
} as const;

// URL patterns
export const URLS = {
  ADMIN_USER_MANAGEMENT: '/web/index.php/admin/viewSystemUsers',
  DASHBOARD: '/web/index.php/dashboard/index',
  LOGIN: '/web/index.php/auth/login',
} as const;
