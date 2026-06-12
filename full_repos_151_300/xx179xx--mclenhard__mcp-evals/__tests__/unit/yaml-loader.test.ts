const path = require('path');
const fs = require('fs');

describe('YAML Configuration Tests', () => {
  const mockServerPath = path.join(__dirname, '../fixtures/mock-server.ts');

  test('should load basic YAML configuration without errors', () => {
    const yamlConfigPath = path.join(__dirname, '../fixtures/test-configs/basic-test.yaml');
    
    // Test that the YAML file exists and can be read
    expect(fs.existsSync(yamlConfigPath)).toBe(true);
    
    const yamlContent = fs.readFileSync(yamlConfigPath, 'utf8');
    expect(yamlContent).toContain('model:');
    expect(yamlContent).toContain('evals:');
    expect(yamlContent).toContain('basic_test_eval');
    expect(yamlContent).toContain('math_test_eval');
  });

  test('should have valid TypeScript configuration', () => {
    const tsConfigPath = path.join(__dirname, '../fixtures/test-configs/basic-test.ts');
    
    // Test that the TypeScript file exists and can be read
    expect(fs.existsSync(tsConfigPath)).toBe(true);
    
    const tsContent = fs.readFileSync(tsConfigPath, 'utf8');
    expect(tsContent).toContain('EvalConfig');
    expect(tsContent).toContain('typescript_basic_eval');
    expect(tsContent).toContain('typescript_math_eval');
    expect(tsContent).toContain('export default config');
  });

  test('should have mock server file', () => {
    expect(fs.existsSync(mockServerPath)).toBe(true);
    
    const serverContent = fs.readFileSync(mockServerPath, 'utf8');
    expect(serverContent).toContain('mock-test-server');
    expect(serverContent).toContain('test_tool');
    expect(serverContent).toContain('math_tool');
  });

  test('should validate YAML structure', () => {
    const yamlConfigPath = path.join(__dirname, '../fixtures/test-configs/basic-test.yaml');
    const yamlContent = fs.readFileSync(yamlConfigPath, 'utf8');
    
    // Basic YAML structure validation
    expect(yamlContent).toMatch(/model:\s*\n\s*provider:\s*openai/);
    expect(yamlContent).toMatch(/evals:\s*\n\s*-\s*name:/);
  });

  test('should have error test configuration', () => {
    const errorConfigPath = path.join(__dirname, '../fixtures/test-configs/error-test.yaml');
    expect(fs.existsSync(errorConfigPath)).toBe(true);
    
    const errorContent = fs.readFileSync(errorConfigPath, 'utf8');
    expect(errorContent).toContain('error_scenario_eval');
    expect(errorContent).toContain('partial_scenario_eval');
  });
});