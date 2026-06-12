import { startServer } from "./server.mjs";

startServer().catch((error) => {
  console.error("Failed to start MCP server.");
  console.error(error);
  process.exitCode = 1;
});
