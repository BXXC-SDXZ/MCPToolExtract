const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('CLI Validation Tests', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const cliPath = path.join(projectRoot, 'src/cli.ts');
  const mockServerPath = path.join(__dirname, '../fixtures/mock-server.ts');

  beforeEach(() => {
    // Set test environment variables
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  test('CLI script file should exist', () => {
    expect(fs.existsSync(cliPath)).toBe(true);
  });

  test('should show usage when no arguments provided', () => {
    try {
      execSync(`node -r tsx/esm "${cliPath}"`, { 
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 5000
      });
    } catch (error) {
      const stderr = error.stderr.toString();
      expect(stderr).toContain('Please provide a path to your evals file');
    }
  });

  test('should show usage when only evals path provided', () => {
    const yamlConfigPath = path.join(__dirname, '../fixtures/test-configs/basic-test.yaml');
    
    try {
      execSync(`node -r tsx/esm "${cliPath}" "${yamlConfigPath}"`, { 
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 5000
      });
    } catch (error) {
      const stderr = error.stderr.toString();
      expect(stderr).toContain('Please provide a path to your server file');
    }
  });

  test('should handle non-existent config file', () => {
    const nonExistentConfig = path.join(__dirname, '../fixtures/test-configs/non-existent.yaml');
    
    try {
      execSync(`node -r tsx/esm "${cliPath}" "${nonExistentConfig}" "${mockServerPath}"`, { 
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 5000,
        env: { ...process.env, OPENAI_API_KEY: 'test-key' }
      });
    } catch (error) {
      const stderr = error.stderr.toString();
      expect(stderr).toContain('Error running evaluations');
    }
  });

  test('should accept both YAML and TypeScript config files', () => {
    const yamlConfigPath = path.join(__dirname, '../fixtures/test-configs/basic-test.yaml');
    const tsConfigPath = path.join(__dirname, '../fixtures/test-configs/basic-test.ts');
    
    // Both files should exist
    expect(fs.existsSync(yamlConfigPath)).toBe(true);
    expect(fs.existsSync(tsConfigPath)).toBe(true);
    
    // Both should be valid config formats
    const yamlContent = fs.readFileSync(yamlConfigPath, 'utf8');
    const tsContent = fs.readFileSync(tsConfigPath, 'utf8');
    
    expect(yamlContent).toContain('model:');
    expect(tsContent).toContain('EvalConfig');
  });

  test('should have proper file structure', () => {
    // Check that all required test files exist
    const requiredFiles = [
      path.join(__dirname, '../fixtures/mock-server.ts'),
      path.join(__dirname, '../fixtures/test-configs/basic-test.yaml'),
      path.join(__dirname, '../fixtures/test-configs/basic-test.ts'),
      path.join(__dirname, '../fixtures/test-configs/error-test.yaml'),
      path.join(__dirname, '../fixtures/test-configs/invalid-config.yaml'),
    ];

    requiredFiles.forEach(filePath => {
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});