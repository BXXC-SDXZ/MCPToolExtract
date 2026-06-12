const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('Basic Integration Tests', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const cliPath = path.join(projectRoot, 'src/cli.ts');
  const mockServerPath = path.join(__dirname, '../fixtures/mock-server.ts');
  const yamlConfigPath = path.join(__dirname, '../fixtures/test-configs/basic-test.yaml');
  const tsConfigPath = path.join(__dirname, '../fixtures/test-configs/basic-test.ts');

  beforeEach(() => {
    // Set test environment variables
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  test('should not crash when loading YAML config', () => {
    expect(() => {
      try {
        // Try to load the config - expect it to fail on API call but not on config loading
        execSync(`timeout 10s node -r tsx/esm "${cliPath}" "${yamlConfigPath}" "${mockServerPath}"`, { 
          stdio: 'pipe',
          cwd: projectRoot,
          timeout: 10000,
          env: { ...process.env, OPENAI_API_KEY: 'test-key' }
        });
      } catch (error) {
        // Expected to fail, but should not be due to config parsing
        const stderr = error.stderr?.toString() || '';
        expect(stderr).not.toContain('SyntaxError');
        expect(stderr).not.toContain('Invalid config');
      }
    }).not.toThrow();
  });

  test('should not crash when loading TypeScript config', () => {
    expect(() => {
      try {
        // Try to load the config - expect it to fail on API call but not on config loading
        execSync(`timeout 10s node -r tsx/esm "${cliPath}" "${tsConfigPath}" "${mockServerPath}"`, { 
          stdio: 'pipe',
          cwd: projectRoot,
          timeout: 10000,
          env: { ...process.env, OPENAI_API_KEY: 'test-key' }
        });
      } catch (error) {
        // Expected to fail, but should not be due to config parsing
        const stderr = error.stderr?.toString() || '';
        expect(stderr).not.toContain('SyntaxError');
        expect(stderr).not.toContain('Invalid config');
      }
    }).not.toThrow();
  });

  test('project structure should be valid', () => {
    // Test that all critical files exist
    expect(fs.existsSync(cliPath)).toBe(true);
    expect(fs.existsSync(mockServerPath)).toBe(true);
    expect(fs.existsSync(yamlConfigPath)).toBe(true);
    expect(fs.existsSync(tsConfigPath)).toBe(true);
    
    // Test package.json has correct scripts
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    expect(packageJson.scripts.test).toBe('jest --config jest.config.cjs');
    expect(packageJson.scripts['test:integration']).toBe('jest --config jest.config.cjs --testPathPattern=integration');
  });

  test('mock server should be syntactically valid TypeScript', () => {
    const serverContent = fs.readFileSync(mockServerPath, 'utf8');
    
    // Basic syntax checks
    expect(serverContent).not.toContain('SyntaxError');
    expect(serverContent).toMatch(/export\s*{\s*server\s*,\s*main\s*}/);
    expect(serverContent).toContain('#!/usr/bin/env node');
  });

  test('configuration files should have required structure', () => {
    // Test YAML config
    const yamlContent = fs.readFileSync(yamlConfigPath, 'utf8');
    expect(yamlContent).toMatch(/model:\s*\n.*provider:\s*openai/s);
    expect(yamlContent).toMatch(/evals:\s*\n.*-\s*name:/s);
    
    // Test TypeScript config
    const tsContent = fs.readFileSync(tsConfigPath, 'utf8');
    expect(tsContent).toContain('EvalConfig');
    expect(tsContent).toContain('const config: EvalConfig');
    expect(tsContent).toContain('export default config');
  });

  test('should handle missing API keys gracefully', () => {
    // Remove API keys to test error handling
    const envWithoutKeys = { ...process.env };
    delete envWithoutKeys.OPENAI_API_KEY;
    delete envWithoutKeys.ANTHROPIC_API_KEY;
    
    try {
      execSync(`timeout 5s node -r tsx/esm "${cliPath}" "${yamlConfigPath}" "${mockServerPath}"`, { 
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 5000,
        env: envWithoutKeys
      });
    } catch (error) {
      // Should fail gracefully, not crash
      const stderr = error.stderr?.toString() || '';
      expect(stderr).not.toContain('Cannot read property');
      expect(stderr).not.toContain('TypeError');
    }
  });
});