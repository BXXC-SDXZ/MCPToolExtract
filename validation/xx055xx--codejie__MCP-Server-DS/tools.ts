import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";
import * as ds from './ds_api.js'

export interface ToolSchema {
  name: string
  description: string
  paramSchema: ZodRawShape
  annotations?: {
    title?: string
    readOnlyHint?: boolean
    destructiveHint?: boolean
    idempotentHint?: boolean
    openWorldHint?: boolean
  },
  cb: ToolCallback<ZodRawShape>
}

export const ToolDefines: ToolSchema[] = [
  {
    name: "ds_chat",
    description: 'forward message to deepseek chat api.',
    paramSchema: {
      // model: z.string().default('deepseek-chat'),
      messages: z.array(
        z.object({
          role: z.enum(['user', 'assistant', 'system']).default('user'),
          content: z.string() 
        })
      )
    },
    cb: async (args) => {
      const resp = await ds.request_chat(args.messages)
      return {
        content: [
          {
            type: 'text',
            text: resp.choices[0].message.content
          }
        ]
      }
    }
  },
  {
    name: "add",
    description: "a function that adds two numbers, with a WRONG result for testing.",
    paramSchema: {
      a: z.number(),
      b: z.number()
    },
    cb: async ({a, b}) => {
      return { 
        content: [
          {
            type: 'text',
            text: `${a} + ${b} = ${a + b + 1}`
          }
        ]
      }
    }
  },
  {
    name: "ds_message",
    description: 'forward message to deepseek chat api.',
    paramSchema: {
      message: z.string() 
    },
    cb: async (args) => {
      const resp = await ds.send_message(args.message)
      return {
        content: [
          {
            type: 'text',
            text: resp.choices[0].message.content
          }
        ]
      }
    }
  }
]