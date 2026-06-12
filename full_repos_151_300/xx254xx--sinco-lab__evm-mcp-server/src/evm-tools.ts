import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
    parseEther, formatEther, Abi, erc20Abi, parseUnits, formatUnits, PublicClient, WalletClient, LocalAccount, Address, Chain, maxUint256
} from "viem";

// --- Constants ---
export const ERC20_ABI: Abi = erc20Abi;

// --- Tool Definition Interface ---
/**
 * Defines the structure for a custom tool, including its metadata and Zod schemas
 * for validating parameters and return values.
 */
export interface CustomToolDefinition {
    /** The unique name of the tool. */
    name: string;
    /** A description of what the tool does. */
    description: string;
    /** A Zod schema defining the expected input parameters for the tool. */
    parameters: z.ZodObject<any, any, any>;
    /** A Zod schema defining the expected return value structure of the tool. */
    returnValue: z.ZodObject<any, any, any>;
}

// --- Tool Logic Implementation ---

/**
 * Logic to retrieve the connected account's address.
 * @param clients Object containing the account client.
 * @returns An object containing the wallet address.
 */
async function getAddressLogic(clients: { account: LocalAccount<string> }) {
    return { address: clients.account.address };
}

/**
 * Logic to retrieve the chain ID and name the wallet is connected to.
 * @param clients Object containing the wallet client.
 * @returns An object containing the chain ID and name (if available).
 */
async function getChainLogic(clients: { walletClient: WalletClient }) {
    return { chainId: clients.walletClient.chain?.id, chainName: clients.walletClient.chain?.name };
}

/**
 * Logic to retrieve the native token balance for a given address or the connected account.
 * @param clients Object containing the public client and account.
 * @param params Parameters object, optionally containing the target address.
 * @returns An object containing the formatted native token balance.
 * @throws If fetching the balance fails.
 */
async function getBalanceLogic(clients: { publicClient: PublicClient, account: LocalAccount<string> }, { address }: { address?: string }) {
    const targetAddress = (address || clients.account.address) as Address;
    try {
        const balance = await clients.publicClient.getBalance({ address: targetAddress });
        const formattedBalance = formatEther(balance);
        // Get the native currency symbol from the chain config
        const nativeSymbol = clients.publicClient.chain?.nativeCurrency.symbol ?? 'Unknown';
        return { balance: formattedBalance, symbol: nativeSymbol }; // Return symbol along with balance
    } catch (error: any) {
        throw new Error(`Failed to get balance: ${error.message}`);
    }
}

/**
 * Logic to sign a message using the connected account.
 * @param clients Object containing the wallet client and account.
 * @param params Parameters object containing the message to sign.
 * @returns An object containing the signature.
 * @throws If signing the message fails.
 */
async function signMessageLogic(clients: { walletClient: WalletClient, account: LocalAccount<string> }, { message }: { message: string }) {
    try {
        // Pass account explicitly
        const signature = await clients.walletClient.signMessage({
             account: clients.account,
             message
        });
        return { signature };
    } catch (error: any) {
        throw new Error(`Failed to sign message: ${error.message}`);
    }
}

/**
 * Logic to send native tokens (e.g., ETH) from the connected account to a recipient.
 * @param clients Object containing the wallet client and account.
 * @param params Parameters object containing the recipient address and value to send.
 * @returns An object containing the transaction hash and explorer URL.
 * @throws If sending the transaction fails.
 */
async function sendNativeTokenLogic(clients: { walletClient: WalletClient, account: LocalAccount<string> }, { to, value }: { to: string; value: string }) {
    try {
        const chain = clients.walletClient.chain; // Get chain info
         // Pass account explicitly
        const hash = await clients.walletClient.sendTransaction({
            account: clients.account,
            to: to as Address,
            value: parseEther(value),
            chain: chain // Explicitly pass chain
        });
        // Construct explorer URL
        const explorerUrlBase = chain?.blockExplorers?.default?.url;
        const explorerUrl = explorerUrlBase ? `${explorerUrlBase}/tx/${hash}` : undefined;
        return { transactionHash: hash, explorerUrl: explorerUrl };
    } catch (error: any) {
        console.error(`Failed to send ETH:`, error, { to, value });
        throw new Error(`Failed to send ETH: ${error.message}`);
    }
}

/**
 * Logic to get the ERC20 token balance for a specified owner address.
 * @param clients Object containing the public client and account.
 * @param params Parameters object containing token address, optional owner address, and optional decimals.
 * @returns An object containing the formatted token balance.
 * @throws If fetching the token balance fails.
 */
async function getTokenBalanceLogic(clients: { publicClient: PublicClient, account: LocalAccount<string> }, { tokenAddress, ownerAddress, decimals }: { tokenAddress: string; ownerAddress?: string, decimals?: number }) {
    // tokenAddress is now required
    const targetTokenAddress = tokenAddress as Address;
    const targetOwnerAddress = (ownerAddress || clients.account.address) as Address;

    // Attempt to infer decimals if not provided (best effort, might need a registry)
    // For now, just default to 6 if not provided, or remove this logic
    const effectiveDecimals = decimals ?? 6;
    try {
        const balance = await clients.publicClient.readContract({
            address: targetTokenAddress,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [targetOwnerAddress],
        });
        const formattedBalance = formatUnits(balance as bigint, effectiveDecimals);
        return { balance: formattedBalance };
    } catch (error: any) {
        console.error({ err: error, tokenAddress: targetTokenAddress, ownerAddress: targetOwnerAddress }, `Failed to get ERC20 balance`);
        throw new Error(`Failed to get ERC20 balance: ${error.message}`);
    }
}

/**
 * Logic to transfer a specified amount of an ERC20 token to a recipient.
 * @param clients Object containing the wallet client and account.
 * @param params Parameters object containing token address, recipient address, amount, and optional decimals.
 * @returns An object containing the transaction hash and explorer URL.
 * @throws If the token transfer fails.
 */
async function transferTokenLogic(clients: { walletClient: WalletClient, account: LocalAccount<string> }, { tokenAddress, to, amount, decimals }: { tokenAddress: string; to: string; amount: string, decimals?: number }) {
    // tokenAddress is now required
    const targetTokenAddress = tokenAddress as Address;
    const effectiveDecimals = decimals ?? 6;
    try {
        const chain = clients.walletClient.chain; // Get chain info
        // Pass account and chain explicitly
        const hash = await clients.walletClient.writeContract({
            account: clients.account,
            chain: chain,
            address: targetTokenAddress,
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [to as Address, parseUnits(amount, effectiveDecimals)],
        });
         // Construct explorer URL
         const explorerUrlBase = chain?.blockExplorers?.default?.url;
         const explorerUrl = explorerUrlBase ? `${explorerUrlBase}/tx/${hash}` : undefined;
        return { transactionHash: hash, explorerUrl: explorerUrl };
    } catch (error: any) {
        console.error({ err: error, tokenAddress: targetTokenAddress, to, amount }, `Failed to transfer ERC20 token`);
        throw new Error(`Failed to transfer ERC20 token: ${error.message}`);
    }
}

/**
 * Logic to get the total supply of an ERC20 token.
 * @param clients Object containing the public client.
 * @param params Parameters object containing token address and optional decimals.
 * @returns An object containing the formatted total supply.
 * @throws If fetching the total supply fails.
 */
async function getTokenTotalSupplyLogic(clients: { publicClient: PublicClient }, { tokenAddress, decimals }: { tokenAddress: string, decimals?: number }) {
     // tokenAddress is now required
     const targetTokenAddress = tokenAddress as Address;
    const effectiveDecimals = decimals ?? 6;
    try {
        const totalSupply = await clients.publicClient.readContract({
            address: targetTokenAddress,
            abi: ERC20_ABI,
            functionName: 'totalSupply',
        });
        const formattedTotalSupply = formatUnits(totalSupply as bigint, effectiveDecimals);
        return { totalSupply: formattedTotalSupply };
    } catch (error: any) {
        console.error({ err: error, tokenAddress: targetTokenAddress }, `Failed to get token total supply`);
        throw new Error(`Failed to get token total supply: ${error.message}`);
    }
}

/**
 * Logic to get the allowance an owner has granted to a spender for an ERC20 token.
 * @param clients Object containing the public client and account.
 * @param params Parameters object containing token address, optional owner address, spender address, and optional decimals.
 * @returns An object containing the formatted allowance amount.
 * @throws If fetching the allowance fails.
 */
async function getTokenAllowanceLogic(clients: { publicClient: PublicClient, account: LocalAccount<string> }, { tokenAddress, owner, spender, decimals }: { tokenAddress: string; owner?: string, spender: string, decimals?: number }) {
    // tokenAddress is now required
    const targetTokenAddress = tokenAddress as Address;
    const targetOwner = (owner || clients.account.address) as Address;
    const effectiveDecimals = decimals ?? 6;
    try {
        const allowance = await clients.publicClient.readContract({
            address: targetTokenAddress,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [targetOwner, spender as Address],
        });
        const formattedAllowance = formatUnits(allowance as bigint, effectiveDecimals);
        return { allowance: formattedAllowance };
    } catch (error: any) {
        console.error({ err: error, tokenAddress: targetTokenAddress, owner, spender }, `Failed to get token allowance`);
        throw new Error(`Failed to get token allowance: ${error.message}`);
    }
}

/**
 * Logic to approve a spender to withdraw an amount of an ERC20 token from the connected account.
 * Supports approving the maximum amount using "max".
 * @param clients Object containing the wallet client and account.
 * @param params Parameters object containing token address, spender address, amount ('max' or numeric string), and optional decimals.
 * @returns An object containing the transaction hash.
 * @throws If approving the token fails.
 */
async function approveTokenLogic(clients: { walletClient: WalletClient, account: LocalAccount<string> }, { tokenAddress, spender, amount, decimals }: { tokenAddress: string; spender: string; amount: string, decimals?: number }) {
    // tokenAddress is now required
    const targetTokenAddress = tokenAddress as Address;
    const effectiveDecimals = decimals ?? 6;
    const amountInBaseUnits = amount.toLowerCase() === "max" ? maxUint256 : parseUnits(amount, effectiveDecimals);
    try {
        // Pass account and chain explicitly
        const hash = await clients.walletClient.writeContract({
            account: clients.account,
            chain: clients.walletClient.chain,
            address: targetTokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [spender as Address, amountInBaseUnits],
        });
        return { transactionHash: hash };
    } catch (error: any) {
        console.error({ err: error, tokenAddress: targetTokenAddress, spender, amount }, `Failed to approve token`);
        throw new Error(`Failed to approve token: ${error.message}`);
    }
}

/**
 * Logic to revoke (set to 0) a spender's allowance for an ERC20 token from the connected account.
 * @param clients Object containing the wallet client and account.
 * @param params Parameters object containing token address and spender address.
 * @returns An object containing the transaction hash.
 * @throws If revoking the approval fails.
 */
async function revokeApprovalLogic(clients: { walletClient: WalletClient, account: LocalAccount<string> }, { tokenAddress, spender }: { tokenAddress: string; spender: string }) {
     // tokenAddress is now required
     const targetTokenAddress = tokenAddress as Address;
    try {
         // Revoke by approving 0
         // Pass account and chain explicitly
        const hash = await clients.walletClient.writeContract({
            account: clients.account,
            chain: clients.walletClient.chain,
            address: targetTokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [spender as Address, BigInt(0)],
        });
        return { transactionHash: hash };
    } catch (error: any) {
        console.error({ err: error, tokenAddress: targetTokenAddress, spender }, `Failed to revoke token approval`);
        throw new Error(`Failed to revoke token approval: ${error.message}`);
    }
}

/**
 * Logic to transfer an amount of an ERC20 token from one address to another, using the connected account's allowance.
 * Requires prior approval (`approveTokenLogic`) for the connected account to spend tokens on behalf of the `from` address.
 * @param clients Object containing the wallet client and account.
 * @param params Parameters object containing token address, sender address (`from`), recipient address (`to`), amount, and optional decimals.
 * @returns An object containing the transaction hash.
 * @throws If the transferFrom operation fails.
 */
async function transferTokenFromLogic(clients: { walletClient: WalletClient, account: LocalAccount<string> }, { tokenAddress, from, to, amount, decimals }: { tokenAddress: string; from: string; to: string; amount: string, decimals?: number }) {
    // tokenAddress is now required
    const targetTokenAddress = tokenAddress as Address;
    const effectiveDecimals = decimals ?? 6;
    try {
         // Pass account and chain explicitly
        const hash = await clients.walletClient.writeContract({
            account: clients.account,
            chain: clients.walletClient.chain,
            address: targetTokenAddress,
            abi: ERC20_ABI,
            functionName: 'transferFrom',
            args: [from as Address, to as Address, parseUnits(amount, effectiveDecimals)],
        });
        return { transactionHash: hash };
    } catch (error: any) {
        console.error({ err: error, tokenAddress: targetTokenAddress, from, to, amount }, `Failed to transferFrom token`);
        throw new Error(`Failed to transferFrom token: ${error.message}`);
    }
}

/**
 * Logic to convert a decimal token amount (e.g., 1.23) to its base unit representation (e.g., 123000000 for 6 decimals).
 * @param clients Unused client object (can be empty).
 * @param params Parameters object containing the amount and decimals.
 * @returns An object containing the amount in its base unit as a string.
 * @throws If the conversion fails.
 */
async function convertToBaseUnitLogic(clients: {}, { amount, decimals }: { amount: number; decimals: number }) {
    try {
        const baseUnitAmount = parseUnits(amount.toString(), decimals);
        return { baseUnitAmount: baseUnitAmount.toString() };
    } catch (error: any) {
        throw new Error(`Failed to convert to base unit: ${error.message}`);
    }
}

/**
 * Logic to convert a token amount from its base unit representation (e.g., '123000000') to a decimal string (e.g., '1.23' for 6 decimals).
 * @param clients Unused client object (can be empty).
 * @param params Parameters object containing the base unit amount (as string) and decimals.
 * @returns An object containing the amount in its decimal representation as a string.
 * @throws If the conversion fails.
 */
async function convertFromBaseUnitLogic(clients: {}, { amount, decimals }: { amount: string; decimals: number }) {
    try {
        const decimalAmount = formatUnits(BigInt(amount), decimals);
        return { decimalAmount: decimalAmount };
    } catch (error: any) {
        throw new Error(`Failed to convert from base unit: ${error.message}`);
    }
}


// --- Tool Definitions (Zod Schemas) ---

const getAddressTool: CustomToolDefinition = {
    name: "getAddress",
    description: "Get the connected wallet address.",
    parameters: z.object({}),
    returnValue: z.object({
        address: z.string().describe("The wallet address (0x...)."),
    }),
};

const getChainTool: CustomToolDefinition = {
    name: "getChain",
    description: "Get the chain ID and name the wallet is connected to.",
    parameters: z.object({}),
    returnValue: z.object({
        chainId: z.number().optional().describe("The ID of the connected chain."),
        chainName: z.string().optional().describe("The name of the connected chain."),
    }),
};

const getBalanceTool: CustomToolDefinition = {
    name: "getBalance",
    description: "Get the native token (e.g., ETH) balance for a given address or the connected wallet.",
    parameters: z.object({
        address: z.string().optional().describe("The address to check the balance for (0x...). Defaults to the connected wallet address."),
    }),
    returnValue: z.object({
        balance: z.string().describe("The native token balance (in human-readable format, e.g., '1.23')."),
        symbol: z.string().describe("The symbol of the native token (e.g., 'ETH').")
    }),
};

const signMessageTool: CustomToolDefinition = {
    name: "signMessage",
    description: "Sign a message using the connected wallet.",
    parameters: z.object({
        message: z.string().describe("The message to sign."),
    }),
    returnValue: z.object({
        signature: z.string().describe("The resulting signature (0x...)."),
    }),
};

const sendNativeTokenTool: CustomToolDefinition = {
    name: "sendNativeToken",
    description: "Sends native tokens (e.g., ETH) from the wallet to a specified address.",
    parameters: z.object({
        to: z.string().describe("The recipient's blockchain address (0x...)."),
        value: z.string().describe("The amount of native tokens to send (e.g., '0.1')."),
    }),
    returnValue: z.object({
        transactionHash: z.string().describe("The hash of the submitted transaction."),
        explorerUrl: z.string().url().optional().describe("URL to view the transaction on the blockchain explorer."),
    }),
};

const getTokenBalanceTool: CustomToolDefinition = {
    name: "getTokenBalance",
    description: "Gets the ERC20 token balance for a specified owner address.",
    parameters: z.object({
        tokenAddress: z.string().describe("The contract address of the ERC20 token (0x...)."), // Now required
        ownerAddress: z.string().optional().describe("The blockchain address of the owner (0x...). Defaults to the wallet's own address if not provided."),
        decimals: z.number().optional().describe("The number of decimals the token uses. Defaults to 6 if not provided.")
    }),
    returnValue: z.object({
        balance: z.string().describe("The token balance (in human-readable format)."),
    }),
};

const transferTokenTool: CustomToolDefinition = {
    name: "transferToken",
    description: "Sends a specified amount of an ERC20 token to a recipient address.",
    parameters: z.object({
        tokenAddress: z.string().describe("The contract address of the ERC20 token (0x...)."), // Now required
        to: z.string().describe("The recipient's blockchain address (0x...)."),
        amount: z.string().describe("The amount of tokens to send (in human-readable format, e.g., '100.5')."),
        decimals: z.number().optional().describe("The number of decimals the token uses. Defaults to 6 if not provided.")
    }),
    returnValue: z.object({
        transactionHash: z.string().describe("The hash of the submitted transaction."),
        explorerUrl: z.string().url().optional().describe("URL to view the transaction on the blockchain explorer."),
    }),
};

const getTokenTotalSupplyTool: CustomToolDefinition = {
    name: "getTokenTotalSupply",
    description: "Get the total supply of an ERC20 token.",
    parameters: z.object({
        tokenAddress: z.string().describe("The contract address of the ERC20 token (0x...)."), // Now required
        decimals: z.number().optional().describe("The number of decimals the token uses. Defaults to 6 if not provided.")
    }),
    returnValue: z.object({
        totalSupply: z.string().describe("The total token supply (in human-readable format)."),
    }),
};

const getTokenAllowanceTool: CustomToolDefinition = {
    name: "getTokenAllowance",
    description: "Get the allowance an owner has granted to a spender for an ERC20 token.",
    parameters: z.object({
        tokenAddress: z.string().describe("The contract address of the ERC20 token (0x...)."), // Now required
        owner: z.string().optional().describe("The address of the token owner (0x...). Defaults to the connected wallet address."),
        spender: z.string().describe("The address of the spender (0x...)."),
        decimals: z.number().optional().describe("The number of decimals the token uses. Defaults to 6 if not provided.")
    }),
    returnValue: z.object({
        allowance: z.string().describe("The allowance amount (in human-readable format)."),
    }),
};

const approveTokenTool: CustomToolDefinition = {
    name: "approveToken",
    description: "Approve a spender to withdraw an amount of an ERC20 token from the connected wallet. Use 'max' for amount to approve maximum.",
    parameters: z.object({
        tokenAddress: z.string().describe("The contract address of the ERC20 token (0x...)."), // Now required
        spender: z.string().describe("The address of the spender to approve (0x...)."),
        amount: z.string().describe("The amount of tokens to approve (in human-readable format, e.g., '100.5', or 'max')."),
        decimals: z.number().optional().describe("The number of decimals the token uses. Defaults to 6 if not provided.")
    }),
    returnValue: z.object({
        transactionHash: z.string().describe("The hash of the submitted transaction."),
    }),
};

const revokeApprovalTool: CustomToolDefinition = {
    name: "revokeApproval",
    description: "Revoke (set to 0) a spender's allowance for an ERC20 token from the connected wallet.",
    parameters: z.object({
        tokenAddress: z.string().describe("The contract address of the ERC20 token (0x...)."), // Now required
        spender: z.string().describe("The address of the spender whose approval to revoke (0x...)."),
    }),
    returnValue: z.object({
        transactionHash: z.string().describe("The hash of the submitted transaction."),
    }),
};

const transferTokenFromTool: CustomToolDefinition = {
    name: "transferTokenFrom",
    description: "Transfer an amount of an ERC20 token from one address to another, requires prior approval.",
    parameters: z.object({
        tokenAddress: z.string().describe("The contract address of the ERC20 token (0x...)."), // Now required
        from: z.string().describe("The address to transfer tokens from (0x...)."),
        to: z.string().describe("The address to transfer tokens to (0x...)."),
        amount: z.string().describe("The amount of tokens to transfer (in human-readable format, e.g., '100.5')."),
        decimals: z.number().optional().describe("The number of decimals the token uses. Defaults to 6 if not provided.")
    }),
    returnValue: z.object({
        transactionHash: z.string().describe("The hash of the submitted transaction."),
    }),
};

const convertToBaseUnitTool: CustomToolDefinition = {
    name: "convertToBaseUnit",
    description: "Convert a decimal token amount to its base unit representation.",
    parameters: z.object({
        amount: z.number().describe("The decimal amount to convert (e.g., 1.23)."),
        decimals: z.number().describe("The number of decimals the token uses (e.g., 6 or 18)."),
    }),
    returnValue: z.object({
        baseUnitAmount: z.string().describe("The amount in its base unit (as a string)."),
    }),
};

const convertFromBaseUnitTool: CustomToolDefinition = {
    name: "convertFromBaseUnit",
    description: "Convert a token amount from its base unit representation to a decimal string.",
    parameters: z.object({
        amount: z.string().describe("The base unit amount to convert (as a string, e.g., '123000000')."),
        decimals: z.number().describe("The number of decimals the token uses (e.g., 6 or 18)."),
    }),
    returnValue: z.object({
        decimalAmount: z.string().describe("The amount in its decimal representation (as a string)."),
    }),
};


// --- Tool List ---
const customTools: CustomToolDefinition[] = [
    getAddressTool,
    getChainTool,
    getBalanceTool,
    signMessageTool,
    sendNativeTokenTool,
    getTokenBalanceTool,
    transferTokenTool,
    getTokenTotalSupplyTool,
    getTokenAllowanceTool,
    approveTokenTool,
    revokeApprovalTool,
    transferTokenFromTool,
    convertToBaseUnitTool,
    convertFromBaseUnitTool,
];

// --- Tool Handling Logic ---

/**
 * Prepares the list of custom tools for use with the MCP Server.
 * Converts the Zod schemas defined in `CustomToolDefinition` to JSON Schema (OpenAPI 3 format).
 * @returns An array of tool definitions compatible with MCP Server, including name, description, input schema, and output schema.
 */
export function getMcpToolsList(): { name: string; description: string; inputSchema: any; outputSchema: any }[] {
    return customTools.map(tool => {
        // Convert Zod schemas to JSON Schema
        const inputSchema = zodToJsonSchema(tool.parameters, { target: 'openApi3' });
        const outputSchema = zodToJsonSchema(tool.returnValue, { target: 'openApi3' });

        return {
            name: tool.name,
            description: tool.description,
            inputSchema: inputSchema,
            outputSchema: outputSchema
        };
    });
}

/**
 * Main handler function to execute a specific custom tool based on its name.
 * It validates the input arguments against the tool's schema and calls the corresponding logic function.
 * @param clients An object containing initialized viem clients (WalletClient, PublicClient) and the account.
 * @param name The name of the tool to execute.
 * @param args The arguments object for the tool call.
 * @returns The result of the tool execution, validated against the tool's return value schema.
 * @throws If the tool is not found, arguments are invalid, or the tool logic encounters an error.
 */
export async function handleCustomToolCall(
    clients: { walletClient: WalletClient, publicClient: PublicClient, account: LocalAccount<string> },
    name: string,
    args: any
): Promise<any> {
    const toolDefinition = customTools.find(t => t.name === name);
    if (!toolDefinition) {
        throw new Error(`Tool '${name}' not found.`);
    }

    let result: any; // Variable to store result
    try {
        const validatedArgs = toolDefinition.parameters.parse(args);

        // Pass clients object to logic functions
        switch (name) {
            case getAddressTool.name:
                result = await getAddressLogic(clients);
                break;
            case getChainTool.name:
                result = await getChainLogic(clients);
                break;
            case getBalanceTool.name:
                result = await getBalanceLogic(clients, validatedArgs as any);
                break;
            case signMessageTool.name:
                result = await signMessageLogic(clients, validatedArgs as any);
                break;
            case sendNativeTokenTool.name:
                result = await sendNativeTokenLogic(clients, validatedArgs as any);
                break;
            case getTokenBalanceTool.name:
                 result = await getTokenBalanceLogic(clients, validatedArgs as any);
                 break;
            case transferTokenTool.name:
                 result = await transferTokenLogic(clients, validatedArgs as any);
                 break;
            case getTokenTotalSupplyTool.name:
                 result = await getTokenTotalSupplyLogic(clients, validatedArgs as any);
                 break;
            case getTokenAllowanceTool.name:
                 result = await getTokenAllowanceLogic(clients, validatedArgs as any);
                 break;
            case approveTokenTool.name:
                 result = await approveTokenLogic(clients, validatedArgs as any);
                 break;
            case revokeApprovalTool.name:
                 result = await revokeApprovalLogic(clients, validatedArgs as any);
                 break;
            case transferTokenFromTool.name:
                 result = await transferTokenFromLogic(clients, validatedArgs as any);
                 break;
            case convertToBaseUnitTool.name:
                 result = await convertToBaseUnitLogic(clients, validatedArgs as any);
                 break;
            case convertFromBaseUnitTool.name:
                 result = await convertFromBaseUnitLogic(clients, validatedArgs as any);
                 break;
            default: // Added default case
                // Should not happen if toolDefinition was found
                throw new Error(`Tool '${name}' logic not implemented in switch.`);
        }
        return result; // Return the stored result

    } catch (error: any) {
         console.error({ err: error, tool: name, args }, `Error during tool call`); // Keep error log
         if (error instanceof z.ZodError) {
             throw new Error(`Invalid arguments for tool ${name}: ${error.errors.map(e => `${e.path.join('.')} (${e.message})`).join(', ')}`);
         }
         throw new Error(`Tool ${name} failed: ${error.message || error}`);
    }
} 