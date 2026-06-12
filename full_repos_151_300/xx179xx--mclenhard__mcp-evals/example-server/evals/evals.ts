import { EvalConfig } from '../../src/types';
import { openai } from "@ai-sdk/openai";
import { grade } from '../../src';
import * as dotenv from 'dotenv';
import { weatherEval } from './weatherTool';
// import other evals here

dotenv.config();

const config: EvalConfig = {
  model: openai("gpt-4"),
  evals: [weatherEval]
};

export default config;

export const evals = [
  weatherEval,
  // add other evals here
]; 