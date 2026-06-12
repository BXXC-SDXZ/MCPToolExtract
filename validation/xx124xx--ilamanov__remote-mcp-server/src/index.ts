import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "Demo",
    version: "1.0.0",
  });

  async init() {
    this.server.tool(
      "getBalance",
      { address: z.string() },
      async ({ address }) => {
        const response = await fetch(
          `https://api.dune.com/api/echo/v1/balances/evm/${address}`,
          {
            headers: {
              "X-Dune-Api-Key": ECHO_API_KEY,
            },
          }
        );
        const data = await response.json();

        if (data.balances.length === 0) {
          return {
            content: [{ type: "text", text: "No balance found" }],
            isError: true,
          };
        }

        const firstBalance = data.balances[0];

        if (firstBalance.value_usd) {
          return {
            content: [
              {
                type: "text",
                text: `$${String(firstBalance.value_usd.toFixed(2))} USD`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `${String(
                (firstBalance.balance / 10 ** firstBalance.decimals).toFixed(2)
              )} (${firstBalance.chain})`,
            },
          ],
        };
      }
    );

    this.server.tool(
      "getLatestTransaction",
      { address: z.string() },
      async ({ address }) => {
        const response = await fetch(
          `https://api.dune.com/api/echo/v1/transactions/evm/${address}`,
          {
            headers: {
              "X-Dune-Api-Key": ECHO_API_KEY,
            },
          }
        );
        const data = await response.json();

        if (data.transactions.length === 0) {
          return {
            content: [{ type: "text", text: "No transactions found" }],
            isError: true,
          };
        }

        const firstTransaction = data.transactions[0];

        return {
          content: [
            {
              type: "text",
              text: `${firstTransaction.hash} (${firstTransaction.block_time})`,
            },
          ],
        };
      }
    );

    this.server.tool(
      "getTokenPrice",
      { contract_address: z.string() },
      async ({ contract_address }) => {
        const response = await fetch(
          `https://api.dune.com/api/echo/beta/tokens/evm/${contract_address}?chain_ids=all`,
          {
            headers: {
              "X-Dune-Api-Key": ECHO_API_KEY,
            },
          }
        );
        const data = await response.json();

        console.log(data);

        if (data.tokens.length === 0) {
          return {
            content: [{ type: "text", text: "No price found" }],
            isError: true,
          };
        }

        const firstToken = data.tokens[0];

        return {
          content: [
            {
              type: "text",
              text: `${firstToken.price_usd.toFixed(2)}`,
            },
          ],
        };
      }
    );

    this.server.tool(
      "getLatestActivity",
      { address: z.string() },
      async ({ address }) => {
        const response = await fetch(
          `https://api.dune.com/api/echo/beta/activity/evm/${address}`,
          {
            headers: {
              "X-Dune-Api-Key": ECHO_API_KEY,
            },
          }
        );
        const data = await response.json();

        if (data.activity.length === 0) {
          return {
            content: [{ type: "text", text: "No activity found" }],
            isError: true,
          };
        }

        const firstActivity = data.activity[0];

        console.log(firstActivity);

        let text = `${firstActivity.type} ${firstActivity.asset_type}`;

        if (firstActivity.token_metadata) {
          text += ` ${
            BigInt(firstActivity.value) /
            BigInt(10 ** firstActivity.token_metadata.decimals)
          } ${firstActivity.token_metadata.symbol}`;
        }

        text += ` (${firstActivity.block_time})`;

        return {
          content: [
            {
              type: "text",
              text,
            },
          ],
        };
      }
    );
  }
}

// Export the OAuth handler as the default
export default new OAuthProvider({
  apiRoute: "/sse",
  // TODO: fix these types
  // @ts-ignore
  apiHandler: MyMCP.mount("/sse"),
  // @ts-ignore
  defaultHandler: app,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});
