import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

const PRODUCTS = [
  { id: "sleep-reset", name: "The Sleep Reset System", category: "sleep", price: 27, url: "https://buy.hypnoticmeditations.ai/l/sleepreset?wanted=true", keywords: ["sleep","insomnia","tired","fatigue","can't sleep","rest","racing mind","exhausted"] },
  { id: "atm-in-your-mind", name: "ATM In Your Mind", category: "money", price: 27, url: "https://buy.hypnoticmeditations.ai/l/atminyourmind?wanted=true", keywords: ["money","wealth","rich","cash flow","abundance","financial","scarcity","broke"] },
  { id: "obstacle-destroyer", name: "Obstacle Destroyer", category: "mindset", price: 27, url: "https://buy.hypnoticmeditations.ai/l/xzthmk?wanted=true", keywords: ["self-sabotage","blocks","stuck","procrastination","resistance","freeze","obstacles"] },
  { id: "superior-health", name: "Superior Health Reset", category: "health", price: 27, url: "https://buy.hypnoticmeditations.ai/l/tebeod?wanted=true", keywords: ["health","nervous system","healing","energy","vitality","recovery","burnout"] },
  { id: "vault-of-infinite-wealth", name: "Vault of Infinite Wealth", category: "money", price: 27, url: "https://buy.hypnoticmeditations.ai/l/mfolzd?wanted=true", keywords: ["wealth identity","poverty","scarcity","abundance","overnight","deep sleep money"] },
  { id: "seven-minute-script", name: "The 7-Minute Script", category: "ritual", price: 27, url: "https://buy.hypnoticmeditations.ai/l/bqjzup?wanted=true", keywords: ["scripting","quick","7 minutes","bedtime","overnight","fast results"] },
  { id: "bundle-library", name: "The Complete Library", category: "bundle", price: 97, url: "https://seanmillionaire.gumroad.com/l/bundle-library", keywords: ["everything","all","complete","best deal","lifetime","bundle"] },
  { id: "bundle-sleep", name: "The Sleep Stack", category: "bundle", price: 47, url: "https://seanmillionaire.gumroad.com/l/bundle-sleep", keywords: ["sleep bundle","sleep system","complete sleep"] },
  { id: "bundle-money", name: "The Money Mind Stack", category: "bundle", price: 57, url: "https://seanmillionaire.gumroad.com/l/bundle-money", keywords: ["money bundle","wealth system","complete money"] },
];

function recommend(goal) {
  const q = goal.toLowerCase();
  const scored = PRODUCTS.map(p => ({
    p, score: p.keywords.filter(k => q.includes(k)).length
  })).sort((a,b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].p : PRODUCTS.find(p => p.id === "bundle-library");
}

app.post("/", async (req, res) => {
  const server = new McpServer({ name: "hypnotic-meditations", version: "1.0.0" });

  server.tool("get_recommendation", { goal: z.string() }, async ({ goal }) => {
    const p = recommend(goal);
    return { content: [{ type: "text", text: `${p.name} — $${p.price}\n${p.url}\n30-day guarantee · Instant access` }] };
  });

  server.tool("list_products", { category: z.string().optional() }, async ({ category }) => {
    const list = category && category !== "all" ? PRODUCTS.filter(p => p.category === category) : PRODUCTS;
    return { content: [{ type: "text", text: list.map(p => `${p.name} — $${p.price}\n${p.url}`).join("\n\n") }] };
  });

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`MCP HTTP server on port ${PORT}`));
