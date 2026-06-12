import express from "express";
import { createPublicClient, formatUnits, http } from "viem";
import { monadTestnet } from "viem/chains";

// Create a public client to interact with Monad Testnet
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

const app = express();
const PORT = 3000;

app.use(express.json());

// Route: Get MON balance for an address
app.post("/balance", async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }
    const balance = await publicClient.getBalance({ address });
    const formatted = formatUnits(balance, 18);
    return res.json({ address, balance: formatted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// Route: Get the latest block number
app.get("/block", async (_req, res) => {
  try {
    const blockNumber = await publicClient.getBlockNumber();
    return res.json({ blockNumber: blockNumber.toString() });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch block number" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ MCP Express Server running at http://localhost:${PORT}`);
});
