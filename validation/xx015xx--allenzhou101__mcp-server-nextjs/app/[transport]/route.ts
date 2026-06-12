import { createMcpHandler, experimental_withMcpAuth as withMcpAuth, AuthInfo } from "@vercel/mcp-adapter";
import { z } from "zod";
import DescopeClient from "@descope/node-sdk";

async function verifyToken(
  req: Request,
  token: string,
): Promise<AuthInfo> {
    const descope = DescopeClient({
    projectId: process.env.DESCOPE_PROJECT_ID!,
    baseUrl: process.env.DESCOPE_BASE_URL!,
  });

  // First validate the token with Descope
  const authInfo = await descope.validateSession(token).catch((e) => {
    throw new Error("Failed to validate token");
  });

  // Extract scopes from token
  const scope = authInfo.token.scope as string | undefined;
  const scopes = scope ? scope.split(" ").filter(Boolean) : [];

  const clientId = authInfo.token.azp as string;

  return {
    token: authInfo.jwt,
    clientId,
    scopes,
    expiresAt: authInfo.token.exp,
  };
}

const mcpHandler = async (req: Request) => {
  return createMcpHandler(
    (server) => {
      server.tool(
        "echo",
        "Echo a message",
        { message: z.string() },
        async ({ message }, { authInfo }) => ({
          content: [{ type: "text", text: `Tool echo: ${message} \n Token: ${authInfo?.token}` }],
        })
      );
    },
    {
      capabilities: {
        tools: {
          echo: {
            description: "Echo a message",
          },
        },
      },
    },
    {
      redisUrl: process.env.REDIS_URL,
      basePath: "",
      verboseLogs: true,
      maxDuration: 60,
    }
  )(req);
};

const handler = withMcpAuth(mcpHandler, verifyToken);

export { handler as GET, handler as POST, handler as DELETE };
