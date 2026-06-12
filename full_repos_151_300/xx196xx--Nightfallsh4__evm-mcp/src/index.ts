import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Address, createPublicClient, createWalletClient, extractChain, formatEther, http, parseEther, parseUnits } from 'viem'
import { localhost, anvil } from 'viem/chains'
import { privateKeyToAccount } from "viem/accounts";


const chainId = process.env.CHAIN_ID

if (!chainId) {
    console.error("CHAIN ID not set");
    process.exit(1);
}

const privateKey = process.env.PRIVATE_KEY

if (!privateKey) {
    console.error("PRIVATE KEY not set");
    process.exit(1);
}

const chain = extractChain({
    chains: [anvil, localhost],
    id: Number(chainId) as any,
})

// Viem Setup
const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
})

const walletClient = createWalletClient({
    chain: chain,
    transport: http()
})


const account = privateKeyToAccount(privateKey as Address)

// Create server instance
const server = new McpServer({
    name: "EVM",
    version: "0.0.1",
    capabilities: {
        resources: {},
        tools: {},
    },
});


server.tool(
    "get-eth-balance",
    "Gets the ETH balance of a given wallet",
    { address: z.string().describe("The Address of the wallet to fetch the balance") },
    async ({ address }) => {
        const balance = await publicClient.getBalance({ address: address as Address })
        const formattedBalance = formatEther(balance)
        return {
            content: [
                {
                    type: "text",
                    text: `The Balance of the Address ${address} is ${formattedBalance} ETH`
                }
            ]
        }
    }
)


server.tool(
    "send-eth",
    "Sends a given amount of ETH to a given address",
    {
        toAddress: z.string().describe("Address to send the ETH to"),
        amount: z.string().describe("The amount of ETH to send in numerical form")
    },
    async ({ toAddress, amount }) => {
        const fromAddress = account.address
        const walletBalance = await publicClient.getBalance({ address: fromAddress })
        const amountInWei = parseEther(amount)
        if (amountInWei > walletBalance) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Not enough Balance available, The current Balance is ${formatEther(walletBalance)}`
                    }
                ]
            }
        }

        try {
            const tx = await walletClient.sendTransaction({
                account: account,
                to: toAddress as Address,
                value: amountInWei,
            })

            return {
                content: [
                    {
                        type: "text",
                        text: `Transaction of ${amount} ETH sent to ${toAddress}, the Transaction Hash is ${tx}`
                    }
                ]
            }
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Transaction of ${amount} ETH to ${toAddress} could not be sent due to an error, ${error}`
                    }
                ]
            }
        }


    }
)
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("EVM MCP Server running on stdio")
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
