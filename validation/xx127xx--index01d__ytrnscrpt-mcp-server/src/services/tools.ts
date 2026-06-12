import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchTranscript } from './youtube.js';

export function registerTools(server: McpServer): void {
  server.tool(
    'get-transcript',
    'Get the transcript of a youtube video by providing the video url',
    {
      videoUrl: z.string().describe('The url of the youtube video'),
    },
    async ({ videoUrl }) => {
      const transcript = await fetchTranscript(videoUrl);

      return {
        content: [
          {
            type: 'text',
            text: transcript,
          },
        ],
      };
    }
  );
} 