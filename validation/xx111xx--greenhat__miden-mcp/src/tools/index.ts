import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Get the directory path for data/docs
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const docsDir = resolve(__dirname, "../../data/docs");

/**
 * Searches Miden documentation with the given query
 * @param prompt The search query for Miden documentation
 * @returns The formatted response or error message
 */
export async function searchMidenDocs(prompt: string) {
  try {
    console.error(`[miden-docs] Searching local markdown files for: ${prompt}`);

    // Ensure docs directory exists
    if (!existsSync(docsDir)) {
      throw new Error(`Documentation directory not found: ${docsDir}`);
    }

    // Get list of markdown files
    const files = readdirSync(docsDir).filter(file => file.endsWith('.md'));

    if (files.length === 0) {
      throw new Error("No documentation files found");
    }

    // Simple keyword-based search (convert to lowercase for case-insensitive matching)
    const keywords = prompt.toLowerCase().split(/\s+/);

    // Track matched files and their scores
    const matchedFiles = [];

    for (const file of files) {
      const filePath = join(docsDir, file);
      const content = readFileSync(filePath, 'utf8');

      // Count keyword matches in content
      let score = 0;
      const lowerContent = content.toLowerCase();

      for (const keyword of keywords) {
        // Skip very short keywords (less than 3 chars)
        if (keyword.length < 3) continue;

        const matches = lowerContent.split(keyword).length - 1;
        score += matches;

        // Bonus points if keyword is in filename
        if (file.toLowerCase().includes(keyword)) {
          score += 3;
        }
      }

      // If there are matches, add to results
      if (score > 0) {
        matchedFiles.push({
          filename: file,
          score,
          content: content
        });
      }
    }

    // Sort by score (highest first)
    matchedFiles.sort((a, b) => b.score - a.score);

    // Limit to top 3 results
    const topResults = matchedFiles.slice(0, 3);

    if (topResults.length === 0) {
      return {
        success: true,
        formattedText: `No documentation found for query: "${prompt}". Available topics: ${files.map(f => f.replace('.md', '')).join(', ')}`
      };
    }

    // Format results
    const formattedResults = topResults.map(result => {
      return {
        filename: result.filename,
        score: (result.score / 10).toFixed(2),
        content: result.content
      };
    });

    // Return as formatted JSON
    return {
      success: true,
      formattedText: JSON.stringify(formattedResults, null, 2)
    };
  } catch (error) {
    console.error(
      `[miden-docs] Error searching documentation: ${error}`
    );

    return {
      success: false,
      formattedText: `Error searching documentation: ${error instanceof Error ? error.message : String(error)
        }`,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function midenTools(server: McpServer) {
  server.tool(
    "search_dev_docs",
    `This tool will take in the user prompt, search miden developer documentation, and return relevant documentation that will help answer the user's question.

    It takes one argument: prompt, which is the search query for Miden documentation.`,
    {
      prompt: z.string().describe("The search query for Miden documentation"),
    },
    async ({ prompt }, extra) => {
      const result = await searchMidenDocs(prompt);

      return {
        content: [
          {
            type: "text" as const,
            text: result.formattedText,
          },
        ],
      };
    }
  );
}
