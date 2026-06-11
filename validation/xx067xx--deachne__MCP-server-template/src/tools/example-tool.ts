import { createToolError } from "../utils/error-handling.js";

/**
 * Example calculator tool definition
 */
export const exampleTool = {
  // Tool definition that will be exposed to clients
  definition: {
    name: "calculator",
    description: "Perform basic arithmetic operations",
    inputSchema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["add", "subtract", "multiply", "divide"],
          description: "The arithmetic operation to perform",
        },
        a: {
          type: "number",
          description: "First operand",
        },
        b: {
          type: "number",
          description: "Second operand",
        },
      },
      required: ["operation", "a", "b"],
    },
  },

  /**
   * Tool handler implementation
   * @param args Tool arguments
   * @returns Tool execution result
   */
  handler: (args: any) => {
    // Extract arguments
    const { operation, a, b } = args;

    // Validate input types
    if (typeof a !== "number" || typeof b !== "number") {
      return createToolError("Both operands must be numbers");
    }

    // Perform the requested operation
    let result: number;
    switch (operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        // Check for division by zero
        if (b === 0) {
          return createToolError("Division by zero is not allowed");
        }
        result = a / b;
        break;
      default:
        return createToolError(
          `Unknown operation: ${operation}. Supported operations are: add, subtract, multiply, divide`
        );
    }

    // Return the result
    return {
      content: [
        {
          type: "text",
          text: String(result),
        },
      ],
    };
  },
};
