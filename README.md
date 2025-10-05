# 🚀 E2E Test Automation Framework

A modern, comprehensive E2E test automation framework built with Playwright and TypeScript, designed for scalability, maintainability, and CI/CD integration.

## ✨ Features

- **Cross-browser/platform support** - Chrome, Firefox, Safari, Edge, and mobile devices
- **Modular design** - Page Object Model with reusable components
- **CI/CD ready** - GitHub Actions integration
- **Comprehensive testing** - UI and regression testing
- **Data generation** - Automated test data creation
- **Configuration management** - Environment-specific configurations

## 🏗️ Project Structure

```
e2e-demo/
├── pages/                  # Page Object Models
│   ├── base-page.ts        # Base page class
│   ├── login-page.ts       # Login page
│   ├── dashboard-page.ts   # Dashboard page
│   ├── base-search-page.ts # Base search page class
│   └── admin-user-search-page.ts # Admin user search page
├── data/                   # Test data
│   ├── test-data.ts        # Test data definitions
│   └── search-test-data.ts # Search test data
├── utils/                  # Utilities and helpers
│   └── config.ts           # Configuration utilities
├── tests/                  # Test files
│   ├── login/              # Login tests
│   │   ├── login-positive.spec.ts
│   │   └── login-negative.spec.ts
│   └── search/             # Search tests
│       └── admin-user-search.spec.ts
├── .github/workflows/      # CI/CD pipelines
│   └── e2e-tests.yml       # Main test pipeline
├── report/                 # Sample test reports
│   └── index.html          # Sample Playwright HTML report
├── playwright.config.ts    # Playwright configuration
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hatrantn/e2e-demo.git
   cd e2e-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npm run install:browsers
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

### Running Tests

#### Basic Commands

```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with UI
npm run test:ui
```

#### Test Types

```bash
# Smoke tests
npm run test:smoke

# Regression tests
npm run test:regression

```

#### Browser-Specific Tests

```bash
# Chrome/Chromium
npm run test:chrome

# Firefox
npm run test:firefox



#### Test Execution

## 📊 Test Reports

### Sample Report
A sample Playwright test report is available in the `report/` folder:

- **📁 [report/index.html](report/index.html)** - Interactive HTML test report

This report includes:
- ✅ Test execution results and status
- 📈 Performance metrics and timing
- 🖼️ Screenshots and videos of test runs
- 🔍 Detailed test steps and assertions
- 📋 Test summary and statistics

### Viewing Reports

```bash
# Open the report in your browser
open report/index.html

# Or serve it locally
npx playwright show-report report/
```

### Report Features
- **Interactive UI** - Click through test results
- **Screenshots** - Visual evidence of test execution
- **Videos** - Recorded test runs for debugging
- **Traces** - Step-by-step execution details
- **Filtering** - Search and filter by test status, tags, etc.

## 🌐 Test Environment

This framework is configured to test the **OrangeHRM Demo Site** at [https://opensource-demo.orangehrmlive.com](https://opensource-demo.orangehrmlive.com).

### Default Credentials
- **Admin**: `Admin` / `admin123` (configurable via `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables)

### Environment Configuration
The framework uses the OrangeHRM demo site as the default test environment. You can override this by setting the `BASE_URL` environment variable:

```bash
export BASE_URL="https://your-custom-site.com"
npm test
```