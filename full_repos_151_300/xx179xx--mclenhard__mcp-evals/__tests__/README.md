# E2E Test Suite for MCP Evals

This directory contains comprehensive end-to-end and integration tests for the MCP evaluation tool.

## Test Structure

```
__tests__/
├── fixtures/              # Test fixtures and mock data
│   ├── mock-server.ts     # Mock MCP server for testing
│   └── test-configs/      # Sample configuration files
│       ├── basic-test.yaml
│       ├── basic-test.ts
│       ├── error-test.yaml
│       └── invalid-config.yaml
├── integration/           # Integration tests
│   └── basic-integration.test.ts
├── unit/                  # Unit tests
│   ├── cli-validation.test.ts
│   ├── mock-server.test.ts
│   └── yaml-loader.test.ts
├── test-env.js           # Test environment setup
└── README.md             # This file
```

## Test Categories

### Unit Tests
- **CLI Validation Tests**: Test CLI argument parsing and error handling
- **YAML Loader Tests**: Test configuration file loading and validation
- **Mock Server Tests**: Test mock MCP server functionality

### Integration Tests
- **Basic Integration Tests**: Test full CLI workflow with mock configurations
- Validates project structure and file dependencies
- Tests error handling scenarios

## Test Fixtures

### Mock MCP Server
The `mock-server.ts` provides a fully functional MCP server for testing with:
- `test_tool`: Supports different scenarios (success, partial, error, timeout)
- `math_tool`: Simple math operations for validation

### Test Configurations
- **basic-test.yaml**: Standard YAML configuration
- **basic-test.ts**: TypeScript configuration
- **error-test.yaml**: Configuration for error scenarios
- **invalid-config.yaml**: Invalid configuration for error testing

## Running Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Environment

Tests are configured to:
- Use mock API keys to avoid real API calls
- Set proper timeout values for integration tests
- Handle both YAML and TypeScript configurations
- Test error scenarios gracefully

## What's Tested

✅ CLI argument validation and error handling
✅ YAML configuration loading and structure
✅ TypeScript configuration loading and structure
✅ Mock MCP server functionality
✅ Project file structure validation
✅ Error scenario handling
✅ Configuration file format detection

## Adding New Tests

When adding new tests:
1. Place unit tests in `__tests__/unit/`
2. Place integration tests in `__tests__/integration/`
3. Add test fixtures to `__tests__/fixtures/` as needed
4. Use the existing mock server or extend it for new scenarios
5. Follow the existing naming pattern: `*.test.ts`

## Notes

- Tests use Jest with TypeScript support
- Mock server provides realistic MCP server behavior
- Environment variables are mocked to avoid requiring real API keys
- Tests are designed to be fast and reliable for CI/CD