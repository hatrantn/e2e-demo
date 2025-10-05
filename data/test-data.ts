/**
 * Test data for various test scenarios
 */


/**
 * Get admin username from environment or default
 */
function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || 'Admin';
}

/**
 * Get admin password from environment or default
 */
function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'admin123';
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
      username: 'a'.repeat(1000),
      password: getAdminPassword(),
      expectedError: 'Invalid credentials',
    },
    whitespaceOnly: {
      username: '   ',
      password: getAdminPassword(),
      expectedError: 'Required',
    },
    xssAttempt: {
      username: '<script>alert("xss")</script>',
      password: getAdminPassword(),
      expectedError: 'Invalid credentials',
    },
    sqlInjection: {
      username: `${getAdminUsername()}; DROP TABLE users; --`,
      password: getAdminPassword(),
      expectedError: 'Invalid credentials',
    },
    specialCharsUsername: {
      username: `${getAdminUsername()}@#$%^&*()`,
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
    tooManyAttempts: {
      maxAttempts: 5,
      username: getAdminUsername(),
      password: 'wrongpassword',
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
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

}
