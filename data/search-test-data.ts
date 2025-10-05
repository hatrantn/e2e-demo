/**
 * Test data for search module testing scenarios
 */
export class SearchTestData {
  /**
   * Valid search values for different field types
   */
  static readonly validSearchData = {
    // Text Input values
    textInput: {
      exactValue: 'Admin',
      partialMatch: 'Adm',
      caseSensitive: 'admin',
      withSpaces: '  Admin  ',
      longText: 'A'.repeat(100),
      specialChars: 'Admin@123',
      numbers: '12345',
      alphanumeric: 'Admin123',
    },
    
    // Smart Text Input values
    smartTextInput: {
      oneChar: 'A',
      twoChars: 'Ad',
      threeChars: 'Adm',
      fullName: 'Admin User',
      partialName: 'Admin',
      withSpaces: '  Admin User  ',
      specialChars: 'Admin@User',
      copyPaste: 'Admin User',
    },
    
    // Dropdown options
    dropdownOptions: {
      userRole: ['Admin', 'ESS', 'Manager'],
      status: ['Enabled', 'Disabled'],
      employmentStatus: ['Full-Time Permanent', 'Part-Time Permanent', 'Full-Time Contract', 'Part-Time Contract'],
      leaveType: ['Annual Leave', 'Sick Leave', 'Personal Leave'],
      jobTitle: ['Software Engineer', 'QA Engineer', 'Project Manager'],
      subUnit: ['Engineering', 'QA', 'Management'],
    },
    
    // Date ranges
    dateRanges: {
      validRange: {
        from: '2024-01-01',
        to: '2024-12-31',
      },
      noRecordsRange: {
        from: '2025-01-01',
        to: '2025-12-31',
      },
      invalidRange: {
        from: '2024-12-31',
        to: '2024-01-01',
      },
      partialRange: {
        from: '2024-01-01',
        to: '',
      },
      invalidFormat: {
        from: '01/01/2024',
        to: '31/12/2024',
      },
    },
    
    // Radio button options
    radioOptions: {
      include: ['Current Employees Only', 'Past Employees Only', 'Current and Past Employees'],
      generateFor: ['Individual Employee', 'All Employees'],
    },
  };

  /**
   * Invalid search values for negative testing
   */
  static readonly invalidSearchData = {
    // Invalid text values
    invalidText: {
      empty: '',
      whitespaceOnly: '   ',
      sqlInjection: '\'; DROP TABLE users; --',
      xssAttempt: '<script>alert("xss")</script>',
      specialChars: '@#$%^&*()',
      unicodeChars: '🚀🎉💻',
      veryLongText: 'A'.repeat(1000),
    },
    
    // Invalid smart text values
    invalidSmartText: {
      empty: '',
      whitespaceOnly: '   ',
      invalidKeyword: 'xyz123nonexistent',
      specialChars: '@#$%^&*()',
      sqlInjection: '\'; DROP TABLE users; --',
      xssAttempt: '<script>alert("xss")</script>',
    },
    
    // Invalid dropdown selections
    invalidDropdown: {
      nonexistentOption: 'Nonexistent Option',
      emptySelection: '',
      invalidValue: 'Invalid Value',
    },
    
    // Invalid date values
    invalidDates: {
      invalidFormat: '32/13/2024',
      futureDate: '2030-01-01',
      pastDate: '1900-01-01',
      invalidRange: '2024-12-31 to 2024-01-01',
    },
  };

  /**
   * Security test data
   */
  static readonly securityTestData = {
    sqlInjection: [
      '\'; DROP TABLE users; --',
      '\' OR \'1\'=\'1',
      '\'; INSERT INTO users VALUES (\'hacker\', \'password\'); --',
      '\' UNION SELECT * FROM users --',
    ],
    
    xssAttempts: [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("xss")',
      '<svg onload="alert(1)">',
    ],
    
    specialCharacters: [
      '@#$%^&*()',
      '!@#$%^&*()_+',
      '[]{}|\\:";\'<>?,./',
      '🚀🎉💻🔥',
      'αβγδε',
      '中文测试',
    ],
  };

  /**
   * Edge case test data
   */
  static readonly edgeCaseData = {
    // Text input edge cases
    textInput: {
      singleChar: 'A',
      twoChars: 'AB',
      maxLength: 'A'.repeat(255),
      leadingSpaces: '  Admin',
      trailingSpaces: 'Admin  ',
      mixedSpaces: '  Admin User  ',
      onlyNumbers: '12345',
      onlySpecialChars: '@#$%',
      mixedCase: 'AdMiN',
      unicode: 'Admín',
      emoji: 'Admin 😊',
    },
    
    // Smart text edge cases
    smartTextInput: {
      singleChar: 'A',
      twoChars: 'AB',
      threeChars: 'ABC',
      fullMatch: 'Admin User',
      partialMatch: 'Adm',
      caseInsensitive: 'admin user',
      withNumbers: 'Admin123',
      withSpecialChars: 'Admin@User',
      copyPaste: 'Admin User',
    },
    
    // Date edge cases
    dateRange: {
      sameDate: {
        from: '2024-01-01',
        to: '2024-01-01',
      },
      oneDayRange: {
        from: '2024-01-01',
        to: '2024-01-02',
      },
      leapYear: {
        from: '2024-02-28',
        to: '2024-02-29',
      },
      yearBoundary: {
        from: '2023-12-31',
        to: '2024-01-01',
      },
    },
  };

  /**
   * Module-specific search criteria
   */
  static readonly moduleSearchCriteria = {
    admin: {
      userManagement: {
        employeeName: 'Admin User',
        username: 'admin',
        userRole: 'Admin',
        status: 'Enabled',
      },
    },
    
    pim: {
      employeeList: {
        employeeId: '001',
        employeeName: 'John Doe',
        supervisorName: 'Jane Smith',
        employmentStatus: 'Full-Time Permanent',
        include: 'Current Employees Only',
        jobTitle: 'Software Engineer',
        subUnit: 'Engineering',
      },
      employeeReports: {
        reportName: 'Employee Report',
      },
    },
    
    leave: {
      leaveList: {
        employeeName: 'John Doe',
        leaveType: 'Annual Leave',
        showLeaveWithStatus: 'All',
        subUnit: 'Engineering',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        includePastEmployees: true,
      },
      employeeEntitlements: {
        employeeName: 'John Doe',
        leaveType: 'Annual Leave',
        leavePeriod: '2024-01-01',
      },
    },
    
    time: {
      employeeTimesheets: {
        employeeName: 'John Doe',
      },
      myAttendance: {
        date: '2024-01-01',
      },
      employeeAttendance: {
        employeeName: 'John Doe',
        date: '2024-01-01',
      },
      projectReports: {
        projectName: 'Project Alpha',
        projectDateRange: '2024-01-01 to 2024-12-31',
        onlyIncludeApprovedTimesheets: true,
      },
    },
    
    recruitment: {
      candidates: {
        candidateName: 'John Candidate',
        keywords: 'Software Engineer',
        jobTitle: 'Software Engineer',
        vacancy: 'Software Engineer Position',
        hiringManager: 'Jane Manager',
        status: 'Application Initiated',
        methodOfApplication: 'Online',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      },
      vacancies: {
        jobTitle: 'Software Engineer',
        vacancy: 'Software Engineer Position',
        hiringManager: 'Jane Manager',
        status: 'Active',
      },
    },
    
    performance: {
      employeeReviews: {
        employeeName: 'John Doe',
        reviewPeriod: '2024-01-01 to 2024-12-31',
        jobTitle: 'Software Engineer',
        subUnit: 'Engineering',
        reviewStatus: 'In Progress',
        include: 'Current Employees Only',
      },
    },
    
    directory: {
      employeeDirectory: {
        employeeName: 'John Doe',
        jobTitle: 'Software Engineer',
        location: 'New York',
      },
    },
    
    maintenance: {
      purgeEmployeeRecords: {
        pastEmployee: 'John Past',
      },
      purgeCandidateRecords: {
        vacancy: 'Software Engineer Position',
      },
      accessRecords: {
        employeeName: 'John Doe',
      },
    },
    
    claim: {
      employeeClaim: {
        employeeName: 'John Doe',
        referenceId: 'REF001',
        eventName: 'Training Event',
        status: 'Submitted',
        include: 'Current Employees Only',
        dateRange: '2024-01-01 to 2024-12-31',
      },
    },
  };

  /**
   * Get random valid search data
   */
  static getRandomValidSearchData(fieldType: string): string | string[] | undefined {
    const data = this.validSearchData[fieldType as keyof typeof this.validSearchData];
    if (data && typeof data === 'object') {
      const values = Object.values(data);
      return values[Math.floor(Math.random() * values.length)];
    }
    return data;
  }

  /**
   * Get random invalid search data
   */
  static getRandomInvalidSearchData(fieldType: string): string | string[] | undefined {
    const data = this.invalidSearchData[fieldType as keyof typeof this.invalidSearchData];
    if (data && typeof data === 'object') {
      const values = Object.values(data);
      return values[Math.floor(Math.random() * values.length)];
    }
    return data;
  }

  /**
   * Get module search criteria
   */
  static getModuleSearchCriteria(module: string, section: string): Record<string, string | string[]> {
    const moduleData = this.moduleSearchCriteria[module as keyof typeof this.moduleSearchCriteria];
    if (moduleData) {
      return moduleData[section as keyof typeof moduleData] || {};
    }
    return {};
  }

  /**
   * Generate test scenarios for search testing
   */
  static getSearchTestScenarios(): Array<{
    group: string;
    scenario: string;
    testData: string | string[] | Record<string, string>;
    expectedResult: string;
  }> {
    return [
      // Toggle scenarios
      {
        group: 'Toggle',
        scenario: 'Check toggle search panel',
        testData: { action: 'toggle' },
        expectedResult: 'Panel visibility toggled',
      },
      
      // Text Input scenarios
      {
        group: 'Text Input',
        scenario: 'Check search by valid exact value',
        testData: { field: 'username', value: 'Admin' },
        expectedResult: 'Search results returned',
      },
      {
        group: 'Text Input',
        scenario: 'Check invalid value',
        testData: { field: 'username', value: 'invalid' },
        expectedResult: 'No results or error message',
      },
      
      // Smart Text Input scenarios
      {
        group: 'Smart Text Input',
        scenario: 'Check search by name/value with 1 character',
        testData: { field: 'employeeName', value: 'A' },
        expectedResult: 'Autocomplete suggestions shown',
      },
      {
        group: 'Smart Text Input',
        scenario: 'Check search by name/value with 2 characters',
        testData: { field: 'employeeName', value: 'Ad' },
        expectedResult: 'Autocomplete suggestions shown',
      },
      
      // Security scenarios
      {
        group: 'Security',
        scenario: 'Check SQL injection attempt',
        testData: { field: 'username', value: '\'; DROP TABLE users; --' },
        expectedResult: 'Input sanitized, no SQL execution',
      },
      {
        group: 'Security',
        scenario: 'Check XSS injection attempt',
        testData: { field: 'username', value: '<script>alert("xss")</script>' },
        expectedResult: 'Input sanitized, no script execution',
      },
    ];
  }
}
