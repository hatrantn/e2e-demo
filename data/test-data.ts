/**
 * Test data for various test scenarios
 */

import { TIMEOUTS, TEST_DATA } from '../utils/constants';

/**
 * Get admin username from environment or default
 */
function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || TEST_DATA.DEFAULT_ADMIN_USERNAME;
}

/**
 * Get admin password from environment or default
 */
function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || TEST_DATA.DEFAULT_ADMIN_PASSWORD;
}

export class TestData {
  /**
   * Valid login credentials for demo
   */
  static readonly validCredentials = {
    admin: {
      username: getAdminUsername(),
      password: getAdminPassword(),
      expectedRole: 'Admin',
    },
    adminLowercase: {
      username: getAdminUsername().toLowerCase(),
      password: getAdminPassword(),
      expectedRole: 'Admin',
    },
  };

  /**
   * Invalid login credentials for negative testing
   */
  static readonly invalidCredentials = {
    wrongUsername: {
      username: 'wronguser',
      password: getAdminPassword(),
      expectedError: 'Invalid credentials',
    },
    wrongPassword: {
      username: getAdminUsername(),
      password: 'wrongpassword',
      expectedError: 'Invalid credentials',
    },
    emptyUsername: {
      username: '',
      password: getAdminPassword(),
      expectedError: 'Required',
    },
    emptyPassword: {
      username: getAdminUsername(),
      password: '',
      expectedError: 'Required',
    },
    bothEmpty: {
      username: '',
      password: '',
      expectedError: 'Required',
    },
    excessivelyLongUsername: {
      username: 'a'.repeat(TEST_DATA.LONG_USERNAME_LENGTH),
      password: getAdminPassword(),
      expectedError: 'Invalid credentials',
    },
    whitespaceOnly: {
      username: '   ',
      password: getAdminPassword(),
      expectedError: 'Required',
    },
    xssAttempt: {
      username: TEST_DATA.XSS_ATTEMPT,
      password: getAdminPassword(),
      expectedError: 'Invalid credentials',
    },
    sqlInjection: {
      username: `${getAdminUsername()}${TEST_DATA.SQL_INJECTION_SUFFIX}`,
      password: getAdminPassword(),
      expectedError: 'Invalid credentials',
    },
    specialCharsUsername: {
      username: `${getAdminUsername()}${TEST_DATA.SPECIAL_CHARS}`,
      password: getAdminPassword(),
      expectedError: 'Invalid credentials',
    },
  };

  /**
   * Session and security test scenarios
   */
  static readonly sessionTestData = {
    rememberSession: {
      username: getAdminUsername(),
      password: getAdminPassword(),
      rememberMe: true,
    },
    sessionTimeout: {
      timeoutDuration: TIMEOUTS.SESSION_TIMEOUT,
      username: getAdminUsername(),
      password: getAdminPassword(),
    },
    tooManyAttempts: {
      maxAttempts: 5,
      username: getAdminUsername(),
      password: 'wrongpassword',
      lockoutDuration: TIMEOUTS.LOCKOUT_DURATION, // 15 minutes
    },
    urlAccessRestriction: {
      protectedUrls: [
        '/web/index.php/dashboard/index',
        '/web/index.php/admin/viewSystemUsers',
        '/web/index.php/pim/viewEmployeeList',
        '/web/index.php/leave/viewLeaveList',
        '/web/index.php/time/viewEmployeeTimesheet',
        '/web/index.php/recruitment/viewCandidates',
        '/web/index.php/performance/searchEvaluatePerformanceReview',
        '/web/index.php/directory/viewDirectory',
        '/web/index.php/claim/viewAssignClaim',
        '/web/index.php/buzz/viewBuzz',
      ],
    },
  };

  /**
   * Password security test data
   */
  static readonly passwordSecurityData = {
    passwordMasking: {
      username: getAdminUsername(),
      password: getAdminPassword(),
      expectedType: 'password',
    },
    copyPastePassword: {
      username: getAdminUsername(),
      password: getAdminPassword(),
      testClipboard: true,
    },
  };

  /**
   * Expected dashboard elements after successful login
   */
  static readonly dashboardElements = {
    quickLaunchCards: [
      'Assign Leave',
      'Leave List',
      'Timesheets',
      'Apply Leave',
      'My Leave',
      'My Timesheet',
    ],
    charts: [
      'Employee Distribution by Subunit',
      'Employee Distribution by Location',
    ],
    widgets: [
      'Pending Leave Requests',
      'Time at Work',
      'My Actions',
      'Buzz Latest Posts',
    ],
  };

  /**
   * Error messages for validation
   */
  static readonly errorMessages = {
    invalidCredentials: 'Invalid credentials',
    required: 'Required',
    usernameRequired: 'Username is required',
    passwordRequired: 'Password is required',
    accountDisabled: 'Account disabled',
    tooManyAttempts: 'Too many login attempts',
    sessionExpired: 'Session expired',
  };

  /**
   * Success messages
   */
  static readonly successMessages = {
    loginSuccess: 'Welcome',
    logoutSuccess: 'Login',
    passwordChanged: 'Password changed successfully',
  };

  /**
   * Get random valid credentials
   */
  static getRandomValidCredentials() {
    const credentials = Object.values(this.validCredentials);
    return credentials[Math.floor(Math.random() * credentials.length)];
  }

  /**
   * Get random invalid credentials
   */
  static getRandomInvalidCredentials() {
    const credentials = Object.values(this.invalidCredentials);
    return credentials[Math.floor(Math.random() * credentials.length)];
  }

  /**
   * Get random edge case credentials
   */
  static getRandomEdgeCaseCredentials() {
    const credentials = Object.values(this.invalidCredentials);
    return credentials[Math.floor(Math.random() * credentials.length)];
  }

  /**
   * Generate test user data
   */
  static generateTestUser() {
    return {
      username: `testuser_${Date.now()}`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      email: `testuser_${Date.now()}@example.com`,
    };
  }

  /**
   * Get test scenarios for comprehensive testing
   */
  static getTestScenarios() {
    return {
      positive: Object.values(this.validCredentials),
      negative: Object.values(this.invalidCredentials),
      edgeCases: Object.values(this.invalidCredentials),
    };
  }
}
