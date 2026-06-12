import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define configuration schema with validation
const ConfigSchema = z.object({
  // Server information
  SERVER_NAME: z.string().default('mcp-server-template'),
  SERVER_VERSION: z.string().default('1.0.0'),
  
  // Feature flags
  ENABLE_RESOURCES: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().default(true)
  ),
  ENABLE_TOOLS: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().default(true)
  ),
  ENABLE_PROMPTS: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().default(false)
  ),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Custom configuration
  CUSTOM_API_KEY: z.string().optional(),
  CUSTOM_API_URL: z.string().optional(),
});

// Parse and validate environment variables
export const config = ConfigSchema.parse(process.env);

// Export configuration type
export type Config = z.infer<typeof ConfigSchema>;
