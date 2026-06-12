import { EvalConfig, EvalFunction, EvalResult } from '../../../src/types.js';
import { runEvals, grade } from '../../../src/index.js';

// Create actual EvalFunction objects that match the interface
const evalFunction1: EvalFunction = {
  name: 'typescript_basic_eval',
  description: 'Test basic functionality with TypeScript config',
  run: async (model) => {
    const prompt = 'Use the test_tool with query "typescript test" and scenario "success"';
    const result = await runEvals(model, prompt, process.argv[3] || '');
    const gradeResult = await grade(model, prompt, process.argv[3] || '');
    
    // Parse the grading result
    try {
      return JSON.parse(gradeResult);
    } catch {
      return {
        accuracy: 3,
        completeness: 3,
        relevance: 3,
        clarity: 3,
        reasoning: 3,
        overall_comments: 'Test evaluation completed'
      };
    }
  }
};

const evalFunction2: EvalFunction = {
  name: 'typescript_math_eval',
  description: 'Test math functionality with TypeScript config',
  run: async (model) => {
    const prompt = 'Use the math_tool to multiply 4 and 7';
    const result = await runEvals(model, prompt, process.argv[3] || '');
    const gradeResult = await grade(model, prompt, process.argv[3] || '');
    
    // Parse the grading result
    try {
      return JSON.parse(gradeResult);
    } catch {
      return {
        accuracy: 4,
        completeness: 4,
        relevance: 4,
        clarity: 4,
        reasoning: 4,
        overall_comments: 'Math test evaluation completed'
      };
    }
  }
};

const config: EvalConfig = {
  model: {
    modelId: 'gpt-4o',
    doGenerate: async () => ({ text: 'mock' }),
    doStream: async () => ({ stream: [] })
  } as any,
  evals: [evalFunction1, evalFunction2],
};

export default config;