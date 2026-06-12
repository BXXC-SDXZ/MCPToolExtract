import { exampleTool } from '../src/tools/example-tool.js';

describe('Calculator Tool', () => {
  // Test addition
  test('should correctly add two numbers', () => {
    const result = exampleTool.handler({
      operation: 'add',
      a: 5,
      b: 3,
    });
    
    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toBe('8');
  });

  // Test subtraction
  test('should correctly subtract two numbers', () => {
    const result = exampleTool.handler({
      operation: 'subtract',
      a: 10,
      b: 4,
    });
    
    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toBe('6');
  });

  // Test multiplication
  test('should correctly multiply two numbers', () => {
    const result = exampleTool.handler({
      operation: 'multiply',
      a: 7,
      b: 6,
    });
    
    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toBe('42');
  });

  // Test division
  test('should correctly divide two numbers', () => {
    const result = exampleTool.handler({
      operation: 'divide',
      a: 20,
      b: 5,
    });
    
    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toBe('4');
  });

  // Test division by zero
  test('should return error for division by zero', () => {
    const result = exampleTool.handler({
      operation: 'divide',
      a: 10,
      b: 0,
    });
    
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Division by zero');
  });

  // Test invalid operation
  test('should return error for invalid operation', () => {
    const result = exampleTool.handler({
      operation: 'power',
      a: 2,
      b: 3,
    });
    
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('Unknown operation');
  });

  // Test invalid input types
  test('should return error for non-number inputs', () => {
    const result = exampleTool.handler({
      operation: 'add',
      a: 'five',
      b: 3,
    });
    
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain('must be numbers');
  });
});
